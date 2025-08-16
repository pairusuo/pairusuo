// R2-only storage implementation

// R2 (S3-compatible)
let S3Client: typeof import('@aws-sdk/client-s3').S3Client | undefined;
let PutObjectCommand: typeof import('@aws-sdk/client-s3').PutObjectCommand | undefined;
let GetObjectCommand: typeof import('@aws-sdk/client-s3').GetObjectCommand | undefined;
let HeadObjectCommand: typeof import('@aws-sdk/client-s3').HeadObjectCommand | undefined;
let ListObjectsV2Command: typeof import('@aws-sdk/client-s3').ListObjectsV2Command | undefined;
let DeleteObjectCommand: typeof import('@aws-sdk/client-s3').DeleteObjectCommand | undefined;
type ListObjectsV2CommandOutput = import('@aws-sdk/client-s3').ListObjectsV2CommandOutput;

async function initAWS() {
  if (S3Client && PutObjectCommand && GetObjectCommand && HeadObjectCommand && ListObjectsV2Command && DeleteObjectCommand) return;
  const aws = await import('@aws-sdk/client-s3');
  S3Client = aws.S3Client;
  PutObjectCommand = aws.PutObjectCommand;
  GetObjectCommand = aws.GetObjectCommand;
  HeadObjectCommand = aws.HeadObjectCommand;
  ListObjectsV2Command = aws.ListObjectsV2Command;
  DeleteObjectCommand = aws.DeleteObjectCommand;
}

// Ensure AWS constructors are available with non-optional types
async function getAWS(): Promise<{
  S3Client: typeof import('@aws-sdk/client-s3').S3Client;
  PutObjectCommand: typeof import('@aws-sdk/client-s3').PutObjectCommand;
  GetObjectCommand: typeof import('@aws-sdk/client-s3').GetObjectCommand;
  HeadObjectCommand: typeof import('@aws-sdk/client-s3').HeadObjectCommand;
  ListObjectsV2Command: typeof import('@aws-sdk/client-s3').ListObjectsV2Command;
  DeleteObjectCommand: typeof import('@aws-sdk/client-s3').DeleteObjectCommand;
}> {
  await initAWS();
  if (!S3Client || !PutObjectCommand || !GetObjectCommand || !HeadObjectCommand || !ListObjectsV2Command || !DeleteObjectCommand) {
    throw new Error('Failed to load @aws-sdk/client-s3');
  }
  return {
    S3Client: S3Client!,
    PutObjectCommand: PutObjectCommand!,
    GetObjectCommand: GetObjectCommand!,
    HeadObjectCommand: HeadObjectCommand!,
    ListObjectsV2Command: ListObjectsV2Command!,
    DeleteObjectCommand: DeleteObjectCommand!,
  };
}

export interface Storage {
  list(prefix: string): Promise<string[]>; // returns keys under prefix
  read(key: string): Promise<string | null>;
  write(key: string, content: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}

function isR2Enabled() {
  return Boolean(
    process.env.R2_BUCKET &&
    (process.env.R2_ACCOUNT_ID || process.env.CF_ACCOUNT_ID) &&
    (process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) &&
    (process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)
  );
}

let cachedS3: import('@aws-sdk/client-s3').S3Client | null = null;
async function r2Client() {
  const { S3Client } = await getAWS();
  if (!cachedS3) {
    const accountId = process.env.R2_ACCOUNT_ID || process.env.CF_ACCOUNT_ID!;
    const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
    cachedS3 = new S3Client({
      region: 'auto',
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  const bucket = process.env.R2_BUCKET!;
  return { client: cachedS3, bucket };
}

const r2Storage: Storage = {
  async list(prefix: string) {
    const { client, bucket } = await r2Client();
    const { ListObjectsV2Command } = await getAWS();
    const keys: string[] = [];
    let ContinuationToken: string | undefined = undefined;
    do {
      const cmd = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken });
      const res: ListObjectsV2CommandOutput = await client.send(cmd);
      (res.Contents || []).forEach((o: { Key?: string | undefined }) => {
        if (o && o.Key) keys.push(o.Key);
      });
      ContinuationToken = res.IsTruncated ? (res.NextContinuationToken ?? undefined) : undefined;
    } while (ContinuationToken);
    return keys;
  },
  async read(key: string) {
    const { client, bucket } = await r2Client();
    const { GetObjectCommand } = await getAWS();
    try {
      const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
      const res = await client.send(cmd);
      // Node.js runtime: Body is Readable. SDK v3 provides helper to string on Web streams;
      // in Node 18+, use transformToString when available, otherwise buffer manually.
      const body: string = typeof (res.Body as any)?.transformToString === 'function'
        ? await (res.Body as any).transformToString('utf-8')
        : Buffer.from(await (res.Body as any).arrayBuffer()).toString('utf-8');
      return body as string;
    } catch {
      return null;
    }
  },
  async write(key: string, content: string) {
    const { client, bucket } = await r2Client();
    const { PutObjectCommand } = await getAWS();
    const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, Body: content, ContentType: 'text/markdown' });
    await client.send(cmd);
  },
  async exists(key: string) {
    const { client, bucket } = await r2Client();
    try {
      const { HeadObjectCommand } = await getAWS();
      const cmd = new HeadObjectCommand({ Bucket: bucket, Key: key });
      await client.send(cmd);
      return true;
    } catch {
      return false;
    }
  },
  async delete(key: string) {
    const { client, bucket } = await r2Client();
    const { DeleteObjectCommand } = await getAWS();
    const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await client.send(cmd);
  },
};

export function getStorage(): Storage {
  if (!isR2Enabled()) {
    throw new Error(
      'R2 is not configured. Please set R2_ACCOUNT_ID/CF_ACCOUNT_ID, R2_ACCESS_KEY_ID/AWS_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY/AWS_SECRET_ACCESS_KEY, and R2_BUCKET.'
    );
  }
  return r2Storage;
}

export function postKey(locale: 'zh' | 'en', slug: string) {
  // slug may already include yyyy/mm/... keep as-is
  return `posts/${locale}/${slug}.mdx`;
}

export function localePrefix(locale: 'zh' | 'en') {
  return `posts/${locale}/`;
}

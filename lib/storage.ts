import { promises as fs } from 'node:fs';
import path from 'node:path';

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

// Prefix root for posts when using FS
const CONTENT_ROOT = path.join(process.cwd(), 'content', 'posts');

function fsKeyToPath(key: string) {
  // posts/zh/2025/08/slug.mdx -> content/posts/zh/2025/08/slug.mdx
  const rel = key.replace(/^posts\//, '');
  return path.join(CONTENT_ROOT, rel);
}

const fsStorage: Storage = {
  async list(prefix: string) {
    // prefix like 'posts/zh/' or 'posts/en/'
    const base = fsKeyToPath(prefix);
    const out: string[] = [];
    async function walk(dir: string) {
      let entries: import('node:fs').Dirent[] = [];
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) await walk(full);
        else if (e.isFile()) {
          const rel = path.relative(fsKeyToPath(''), full).split(path.sep).join('/');
          out.push(`posts/${rel}`);
        }
      }
    }
    await walk(base);
    return out.filter((k) => k.startsWith(prefix));
  },
  async read(key: string) {
    try {
      const p = fsKeyToPath(key);
      const data = await fs.readFile(p, 'utf8');
      return data;
    } catch {
      return null;
    }
  },
  async write(key: string, content: string) {
    const p = fsKeyToPath(key);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, content, 'utf8');
  },
  async exists(key: string) {
    try {
      const p = fsKeyToPath(key);
      await fs.access(p);
      return true;
    } catch {
      return false;
    }
  },
  async delete(key: string) {
    try {
      const p = fsKeyToPath(key);
      await fs.unlink(p);
    } catch {
      // ignore if not exists
    }
  },
};

async function r2Client() {
  const { S3Client } = await getAWS();
  const accountId = process.env.R2_ACCOUNT_ID || process.env.CF_ACCOUNT_ID!;
  const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
  const client = new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  const bucket = process.env.R2_BUCKET!;
  return { client, bucket };
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
    // 无 R2 配置时，默认使用本地文件系统存储（开发态）
    return fsStorage;
  }
  // 配置了 R2 时，使用 R2（生产态）
  return r2Storage;
}

export function postKey(locale: 'zh' | 'en', slug: string) {
  // slug may already include yyyy/mm/... keep as-is
  return `posts/${locale}/${slug}.mdx`;
}

export function localePrefix(locale: 'zh' | 'en') {
  return `posts/${locale}/`;
}

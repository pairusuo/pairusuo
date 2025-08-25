// Native Cloudflare R2 binding storage implementation

export interface Storage {
  list(prefix: string): Promise<string[]>; // returns keys under prefix
  read(key: string): Promise<string | null>;
  write(key: string, content: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}

// Cloudflare R2Bucket interface
interface R2Bucket {
  list(options?: { prefix?: string; cursor?: string; delimiter?: string; include?: string[] }): Promise<R2Objects>;
  get(key: string, options?: { onlyIf?: R2Conditional; range?: R2Range | R2RangeHeader }): Promise<R2ObjectBody | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions): Promise<R2Object | null>;
  head(key: string, options?: { onlyIf?: R2Conditional }): Promise<R2Object | null>;
  delete(keys: string | string[]): Promise<void>;
}

interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}

interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  range?: R2Range;
}

interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T = unknown>(): Promise<T>;
  blob(): Promise<Blob>;
}

interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

interface R2Conditional {
  etagMatches?: string;
  etagDoesNotMatch?: string;
  uploadedBefore?: Date;
  uploadedAfter?: Date;
}

interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

interface R2RangeHeader {
  range: string;
}

interface R2PutOptions {
  httpMetadata?: R2HTTPMetadata | Headers;
  customMetadata?: Record<string, string>;
  md5?: ArrayBuffer | string;
  sha1?: ArrayBuffer | string;
  sha256?: ArrayBuffer | string;
  sha384?: ArrayBuffer | string;
  sha512?: ArrayBuffer | string;
  onlyIf?: R2Conditional;
}

// Check if we're in Cloudflare runtime with R2 binding
function isR2BindingAvailable(): boolean {
  // Check if we're in Cloudflare Workers/Pages environment
  try {
    return typeof globalThis !== 'undefined' && 
           'R2_BUCKET' in globalThis &&
           (globalThis as any).R2_BUCKET != null;
  } catch {
    return false;
  }
}

function getR2Bucket(): R2Bucket {
  if (!isR2BindingAvailable()) {
    throw new Error('R2_BUCKET binding is not available. Make sure R2 binding is configured in wrangler.toml');
  }
  return (globalThis as any).R2_BUCKET;
}

const r2Storage: Storage = {
  async list(prefix: string) {
    const bucket = getR2Bucket();
    const keys: string[] = [];
    let cursor: string | undefined = undefined;
    
    do {
      const result = await bucket.list({ prefix, cursor });
      result.objects.forEach(obj => keys.push(obj.key));
      cursor = result.truncated ? result.cursor : undefined;
    } while (cursor);
    
    return keys;
  },
  
  async read(key: string) {
    const bucket = getR2Bucket();
    try {
      const object = await bucket.get(key);
      if (!object) return null;
      return await object.text();
    } catch {
      return null;
    }
  },
  
  async write(key: string, content: string) {
    const bucket = getR2Bucket();
    await bucket.put(key, content, {
      httpMetadata: {
        contentType: 'text/markdown',
      },
    });
  },
  
  async exists(key: string) {
    const bucket = getR2Bucket();
    try {
      const object = await bucket.head(key);
      return object !== null;
    } catch {
      return false;
    }
  },
  
  async delete(key: string) {
    const bucket = getR2Bucket();
    await bucket.delete(key);
  },
};

export function getStorage(): Storage {
  // 只有在构建时使用模拟存储，运行时优先使用 R2
  const isBuildTime = process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE === 'phase-production-build';
  
  if (!isR2BindingAvailable()) {
    if (isBuildTime) {
      console.warn('[Storage] Using dev mock storage for build - R2 binding not available');
      const { DevMockStorage } = require('./storage-dev');
      return new DevMockStorage();
    } else {
      // 运行时应该有 R2 绑定
      throw new Error(
        'R2_BUCKET binding is not available. Please configure R2 binding in wrangler.toml and Cloudflare Pages settings.'
      );
    }
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

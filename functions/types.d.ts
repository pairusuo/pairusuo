// Cloudflare Workers 类型定义
declare global {
  interface R2Bucket {
    get(key: string): Promise<R2Object | null>;
    put(key: string, body: ReadableStream | ArrayBuffer | string | null, options?: R2PutOptions): Promise<R2Object>;
    head(key: string): Promise<R2Object | null>;
    list(options?: R2ListOptions): Promise<R2Objects>;
    delete(key: string): Promise<void>;
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
    text(): Promise<string>;
    json(): Promise<any>;
    arrayBuffer(): Promise<ArrayBuffer>;
    stream(): ReadableStream;
  }

  interface R2Objects {
    objects: R2Object[];
    truncated: boolean;
    cursor?: string;
    delimitedPrefixes: string[];
  }

  interface R2ListOptions {
    limit?: number;
    prefix?: string;
    cursor?: string;
    delimiter?: string;
  }

  interface R2PutOptions {
    httpMetadata?: R2HTTPMetadata;
    customMetadata?: Record<string, string>;
  }

  interface R2HTTPMetadata {
    contentType?: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
    cacheExpiry?: Date;
  }
}

export {};
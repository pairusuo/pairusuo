declare module 'probe-image-size' {
  // The package exposes a default function that can accept a URL (string) and options.
  // We keep a minimal typing to satisfy TS while not constraining runtime usage.
  type Options = {
    timeout?: number;
    retries?: number;
    signal?: AbortSignal;
    headers?: Record<string, string>;
  };
  type Result = {
    width: number;
    height: number;
    type?: string;
    mime?: string;
    length?: number;
    url?: string;
  };
  function probe(url: string, options?: Options): Promise<Result>;
  export = probe;
}

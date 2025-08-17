// Lightweight rehype plugin to add width/height to <img> without extra deps

// We dynamically import probe-image-size only on demand to keep edge compatibility
// and avoid bundling it into client. This runs on the server during MDX compile.
async function probeSize(url: string, signal: AbortSignal): Promise<{ width: number; height: number } | null> {
  try {
    // Use dynamic import to avoid ESM/CJS interop issues in different runtimes
    const mod: any = await import('probe-image-size');
    const probe = mod.default || mod;
    // probe takes URL string directly
    const result = await probe(url, { timeout: 5000, retries: 1, signal });
    const w = Number(result?.width);
    const h = Number(result?.height);
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      return { width: w, height: h };
    }
  } catch (_) {
    // swallow errors – non-blocking
  }
  return null;
}

// simple in-memory cache for a single build/process lifecycle
const memCache = new Map<string, { width: number; height: number }>();

export type ImageDimensionsOptions = {
  // Only run on these hostnames (to avoid slow/unknown external hosts)
  hosts?: string[];
};

export const rehypeImageDimensions = (options?: ImageDimensionsOptions) => {
  const hosts = options?.hosts ?? ['image.pairusuo.top'];

  return async (tree: any) => {
    const controller = new AbortController();
    const { signal } = controller;

    const tasks: Promise<void>[] = [];

    const visit = (node: any) => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'element' && node.tagName === 'img') {
        const props = node.properties || {};
        const src = String(props.src || '');
        if (src) {
          const hasW = props.width != null && props.height != null;
          if (!hasW) {
            try {
              const url = new URL(src, 'https://dummy-base/');
              const host = url.hostname;
              if (hosts.includes(host)) {
                if (memCache.has(src)) {
                  const { width, height } = memCache.get(src)!;
                  props.width = width;
                  props.height = height;
                  node.properties = props;
                } else {
                  const task = (async () => {
                    const dim = await probeSize(src, signal);
                    if (dim) {
                      memCache.set(src, dim);
                      props.width = dim.width;
                      props.height = dim.height;
                      node.properties = props;
                    }
                  })();
                  tasks.push(task);
                }
              }
            } catch {
              // ignore invalid URL
            }
          }
        }
      }
      const children = (node.children || []) as any[];
      for (const c of children) visit(c);
    };

    visit(tree);

    if (tasks.length) {
      await Promise.allSettled(tasks);
    }
  };
};

export default rehypeImageDimensions;

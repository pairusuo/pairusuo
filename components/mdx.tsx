"use client";

import { createContext, useContext, useMemo, useRef, type ReactNode, type ImgHTMLAttributes } from 'react';
import Image from 'next/image';

// Context to mark the first MDX image as LCP automatically.
// The first <img> rendered inside the provider will be upgraded to <Image priority fetchPriority="high">.
const MdxImageContext = createContext<{ claimFirst: () => boolean } | null>(null);

export function MdxContentProvider({ children }: { children: ReactNode }) {
  const claimedRef = useRef(false);
  const value = useMemo(
    () => ({
      claimFirst: () => {
        if (claimedRef.current) return false;
        claimedRef.current = true;
        return true;
      },
    }),
    []
  );
  return <MdxImageContext.Provider value={value}>{children}</MdxImageContext.Provider>;
}

export const MDXComponents: Record<string, React.ComponentType<React.HTMLAttributes<HTMLElement>>> = {
  h1: (props) => <h1 className="text-3xl font-semibold tracking-tight mt-6 mb-4" {...props} />,
  h2: (props) => <h2 className="text-2xl font-semibold tracking-tight mt-6 mb-3" {...props} />,
  p: (props) => <p className="leading-7 [&:not(:first-child)]:mt-4" {...props} />,
  code: (props) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props} />
  ),
  pre: (props) => (
    <pre className="rounded-md border bg-muted p-4 overflow-x-auto" {...props} />
  ),
  a: (props) => <a className="underline underline-offset-4" {...props} />,
  img: (props) => {
    // Try to use next/image when width & height are available; otherwise fallback to native img
    const anyProps = props as unknown as ImgHTMLAttributes<HTMLImageElement>;
    const { alt = '', width, height } = anyProps;
    // src in MDX could be string | Blob | StaticImport (unknown at compile-time)
    const rawSrc = (anyProps as { src?: unknown }).src;
    const hasSize = typeof width === 'number' && typeof height === 'number';
    // Detect if this is the first image within provider scope
    const ctx = useContext(MdxImageContext);
    const isLcp = !!ctx && ctx.claimFirst();
    // Only pass string src to next/image to satisfy its typing (string | StaticImport)
    if (typeof rawSrc === 'string' && rawSrc && hasSize) {
      return (
        <span className="block my-4">
          <Image
            src={rawSrc}
            alt={alt}
            width={Number(width)}
            height={Number(height)}
            sizes="(min-width: 768px) 700px, 100vw"
            // First image is LCP: high priority & no lazy; others remain lazy
            priority={isLcp}
            fetchPriority={isLcp ? 'high' : undefined}
            loading={isLcp ? undefined : 'lazy'}
            decoding={isLcp ? undefined : 'async'}
            className="rounded-md border bg-muted object-contain"
          />
        </span>
      );
    }
    // Fallback preserves lazy loading and styling
    return (
      <img
        {...anyProps}
        loading={isLcp ? undefined : anyProps.loading || 'lazy'}
        decoding={isLcp ? undefined : anyProps.decoding || 'async'}
        fetchPriority={isLcp ? 'high' : (anyProps as any).fetchPriority}
        className={`rounded-md border bg-muted max-w-full h-auto ${anyProps.className || ''}`}
      />
    );
  },
};

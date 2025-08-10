import React from 'react';

export const MDXComponents: Record<string, React.ComponentType<any>> = {
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
};

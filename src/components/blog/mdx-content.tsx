import { MDXRemote } from 'next-mdx-remote/rsc'
import { useMDXComponents } from '../../../mdx-components'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'

interface MDXContentProps {
  source: string
}

export function MDXContent({ source }: MDXContentProps) {
  const components = useMDXComponents({})
  
  return (
    <div className="prose prose-zinc dark:prose-invert prose-headings:scroll-mt-20 prose-pre:bg-muted prose-pre:text-foreground prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-table:overflow-hidden prose-code:bg-muted prose-code:text-foreground max-w-none">
      <MDXRemote 
        source={source} 
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }],
              rehypeHighlight,
            ],
          },
        }}
      />
    </div>
  )
}

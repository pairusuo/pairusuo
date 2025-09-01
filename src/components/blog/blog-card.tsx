import Link from 'next/link'
import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import { t } from '@/lib/i18n'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          <Link 
            href={`/blog/${post.slug}`}
            className="hover:text-primary transition-colors"
          >
            {post.title}
          </Link>
        </h2>
        <p className="text-muted-foreground line-clamp-3">
          {post.excerpt}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors whitespace-nowrap"
          >
            {tag}
          </Link>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <time dateTime={post.createdAt}>
          {t('blog.publishedAt')} {formatDate(post.createdAt)}
        </time>
        <Link 
          href={`/blog/${post.slug}`}
          className="text-primary hover:underline"
        >
          {t('blog.readMore')} →
        </Link>
      </div>
    </article>
  )
}
import Link from 'next/link'
import { BlogPost } from '@/types/blog'
import { t } from '@/lib/i18n'
import { TagLink } from './tag-link'

interface BlogListProps {
  posts: BlogPost[]
}

export function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('blog.noPosts')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-10">
      {posts.map((post) => (
        <Link 
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group block"
        >
          <article className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <time className="shrink-0 text-sm text-muted-foreground font-mono">
                {new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </time>
            </div>
            
            <p className="text-muted-foreground leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
            
            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        </Link>
      ))}
    </div>
  )
}
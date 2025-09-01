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
    <div className="space-y-8">
      {posts.map((post) => (
        <Link 
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="block border rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary group mb-6"
        >
          <article>
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span>{new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })} {new Date(post.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                  {post.author && <span>{t('blog.author')}: {post.author}</span>}
                </div>
                
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {post.tags.map((tag) => (
                      <TagLink key={tag} tag={tag} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}
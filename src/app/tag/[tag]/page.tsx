import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPostsByTag, getAllTags } from '@/lib/mdx'
import { BlogList } from '@/components/blog/blog-list'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/i18n'

interface TagPageProps {
  params: {
    tag: string
  }
}

export async function generateStaticParams() {
  try {
    const tags = await getAllTags()
    // console.log('=== generateStaticParams Debug ===')
    // console.log('All tags found:', tags)
    
    // 为每个标签生成多个参数变体，解决URL编码问题
    const params: { tag: string }[] = []
    
    tags.forEach((tagData) => {
      const originalTag = tagData.tag.normalize('NFC')
      
      // 1. 添加原始标签
      params.push({ tag: originalTag })
      
      // 2. 添加URL编码后的标签
      const encodedTag = encodeURIComponent(originalTag)
      if (encodedTag !== originalTag) {
        params.push({ tag: encodedTag })
      }
      
      // 3. 添加双重编码的标签（处理某些边缘情况）
      const doubleEncodedTag = encodeURIComponent(encodedTag)
      if (doubleEncodedTag !== encodedTag && doubleEncodedTag !== originalTag) {
        params.push({ tag: doubleEncodedTag })
      }
    })
    
    console.log('Generated params with encoding variants:', params)
    return params
  } catch (error) {
    console.error('Error generating static params for tags:', error)
    return []
  }
}

export async function generateMetadata({ params }: TagPageProps) {
  // 处理可能的双重编码问题
  let tag = params.tag
  try {
    // 尝试解码，如果是双重编码则需要解码两次
    tag = decodeURIComponent(params.tag)
    // 检查是否还需要再次解码
    if (tag.includes('%')) {
      try {
        tag = decodeURIComponent(tag)
      } catch (e) {
        // 第二次解码失败，使用第一次解码的结果
      }
    }
    // 标准化UTF-8字符
    tag = tag.normalize('NFC')
  } catch (e) {
    tag = params.tag
  }
  
  const posts = await getPostsByTag(tag)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'
    return {
    title: `${tag} - ${t('nav.tags')} - ${t('meta.title')}`,
    description: t('tags.browseDescription').replace('{tag}', tag).replace('{count}', posts.length.toString()),
    keywords: `${tag},${t('tags.keywords')}`,
    openGraph: {
      title: `${tag} - ${t('nav.tags')}`,
      description: t('tags.browseDescription').replace('{tag}', tag).replace('{count}', posts.length.toString()),
      type: 'website',
      url: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
    },
    twitter: {
      card: 'summary',
      title: `${tag} - ${t('nav.tags')}`,
      description: t('tags.browseDescription').replace('{tag}', tag).replace('{count}', posts.length.toString()),
    },
    alternates: {
      canonical: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
    },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  try {
    // 处理UTF-8字符，支持所有语言，解决静态导出的双重编码问题
    let tag = params.tag
    
    // 处理Next.js静态导出时的编码问题
    // 在静态导出模式下，中文字符可能被多次编码
    while (tag.includes('%')) {
      try {
        const decoded = decodeURIComponent(tag)
        if (decoded === tag) {
          // 解码后没有变化，说明不是编码字符串
          break
        }
        tag = decoded
      } catch (e) {
        // 解码失败，停止解码
        break
      }
    }
    
    // 标准化UTF-8字符，确保一致性
    tag = tag.normalize('NFC')
    
    const posts = await getPostsByTag(tag)

    if (posts.length === 0) {
      notFound()
    }

    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 pb-20">
        <div className="space-y-12">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" asChild>
                    <Link href="/tag" className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {t('tags.backToList')}
                    </Link>
                  </Button>
              </div>

              <h1 className="text-4xl font-bold tracking-tight">
                {t('tags.tagPrefix')} <span className="text-primary">{tag}</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {t('tags.totalPosts').replace('{count}', posts.length.toString())}
              </p>
            </div>

            {/* Posts List */}
            <BlogList posts={posts} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in TagPage:', error)
    notFound()
  }
}
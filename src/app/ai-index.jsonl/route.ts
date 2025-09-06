import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/mdx'

/**
 * Machine-readable JSONL index for LLMs/RAG
 * Each line is a JSON object with: id, url, title, chunk, tags, createdAt, updatedAt
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'
  const posts = await getAllPosts()

  // Rough chunking by characters to keep lines readable for downstream RAG tools
  const maxChunkSize = 1200 // characters

  const lines: string[] = []
  posts.forEach((post, idx) => {
    const fullUrl = `${baseUrl}/blog/${post.slug}`
    const content = (post.content || '').replace(/\r\n/g, '\n')

    if (content.length === 0) {
      const obj = {
        id: `${post.slug}#0`,
        url: fullUrl,
        title: post.title,
        chunk: '',
        tags: post.tags,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      }
      lines.push(JSON.stringify(obj))
      return
    }

    for (let i = 0, chunkIdx = 0; i < content.length; i += maxChunkSize, chunkIdx += 1) {
      const chunk = content.slice(i, i + maxChunkSize)
      const obj = {
        id: `${post.slug}#${chunkIdx}`,
        url: fullUrl,
        title: post.title,
        chunk,
        tags: post.tags,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      }
      lines.push(JSON.stringify(obj))
    }
  })

  const body = lines.join('\n') + (lines.length ? '\n' : '')

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}


import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { BlogPost, BlogFrontmatter } from '@/types/blog'

const CONTENT_DIR = path.join(process.cwd(), 'content/blog')

/**
 * Get all blog posts
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    // Ensure directory exists
    if (!fs.existsSync(CONTENT_DIR)) {
      return []
    }

    const files = fs.readdirSync(CONTENT_DIR)
    const posts = files
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => {
        const slug = file.replace(/\.mdx$/, '')
        const fullPath = path.join(CONTENT_DIR, file)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)
        
        const frontmatter = data as BlogFrontmatter
        
        return {
          slug,
          title: frontmatter.title,
          excerpt: frontmatter.excerpt,
          content,
          tags: frontmatter.tags || [],
          createdAt: frontmatter.createdAt,
          updatedAt: frontmatter.updatedAt,
          status: frontmatter.status || 'published',
          author: frontmatter.author,
          coverImage: frontmatter.coverImage,
        } as BlogPost
      })
      .filter((post) => post.status === 'published')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return posts
  } catch (error) {
    console.error('Error reading posts:', error)
    return []
  }
}

/**
 * Get single post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(CONTENT_DIR, `${slug}.mdx`)
    
    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    const frontmatter = data as BlogFrontmatter
    
    return {
      slug,
      title: frontmatter.title,
      excerpt: frontmatter.excerpt,
      content,
      tags: frontmatter.tags || [],
      createdAt: frontmatter.createdAt,
      updatedAt: frontmatter.updatedAt,
      status: frontmatter.status || 'published',
      author: frontmatter.author,
      coverImage: frontmatter.coverImage,
    } as BlogPost
  } catch (error) {
    console.error('Error reading post:', error)
    return null
  }
}

/**
 * Get all tags
 */
export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getAllPosts()
  const tagCounts: Record<string, number> = {}
  
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })
  
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.tags.includes(tag))
}

/**
 * Search posts
 */
export async function searchPosts(query: string): Promise<BlogPost[]> {
  const posts = await getAllPosts()
  const lowercaseQuery = query.toLowerCase()
  
  return posts.filter((post) => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    post.content.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}
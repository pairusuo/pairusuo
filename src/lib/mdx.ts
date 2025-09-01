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
 * Get all tags - 支持所有UTF-8字符（中文、日语、韩语等）
 */
export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  try {
    const posts = await getAllPosts()
    const tagCounts: Record<string, number> = {}
    
    posts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          if (tag && typeof tag === 'string' && tag.trim()) {
            // 标准化UTF-8字符，确保一致性
            const normalizedTag = tag.trim().normalize('NFC')
            tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1
          }
        })
      }
    })
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('Error getting all tags:', error)
    return []
  }
}

/**
 * Get posts by tag - 支持所有UTF-8字符（中文、日语、韩语等），解决双重编码问题
 */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  try {

    
    const posts = await getAllPosts()

    
    // 标准化搜索标签的UTF-8字符
    const normalizedSearchTag = tag.trim().normalize('NFC')

    
    const filteredPosts = posts.filter((post) => {
      if (!post.tags || !Array.isArray(post.tags)) {
        return false
      }
      

      
      return post.tags.some(postTag => {
        if (!postTag || typeof postTag !== 'string') return false
        
        // 标准化文章标签的UTF-8字符
        const normalizedPostTag = postTag.trim().normalize('NFC')
        const isMatch = normalizedPostTag === normalizedSearchTag
        

        
        return isMatch
      })
    })
    

    return filteredPosts
  } catch (error) {
    console.error('Error getting posts by tag:', error)
    console.error('Error stack:', (error as Error).stack)
    return []
  }
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
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
  author?: string;
  coverImage?: string;
}

export interface BlogFrontmatter {
  title: string;
  excerpt: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
  author?: string;
  coverImage?: string;
}

export interface BlogListProps {
  posts: BlogPost[];
  currentPage?: number;
  totalPages?: number;
}

export interface BlogCardProps {
  post: BlogPost;
}

export interface TagProps {
  tag: string;
  count?: number;
}
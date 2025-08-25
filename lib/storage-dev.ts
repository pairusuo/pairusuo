// 开发环境模拟存储层
import { Storage } from './storage';

// 开发环境模拟数据
const mockPosts = {
  'posts/zh/2025/08/cloudflare-r2-object-storage.mdx': `---
title: CloudFlare R2 Object Storage的使用
summary: 使用CF的对象存储保存图片
publishedAt: "2025-08-12 13:23:56"
updatedAt: "2025-08-12 13:23:56"
draft: false
---

使用CF的对象存储保存图片的完整指南。
`,
  'posts/zh/2025/08/markdown-basics.mdx': `---
title: Markdown 基础语法全指南（对照 GFM）
summary: 按章节系统介绍 Markdown 基本语法：段落与换行、标题、强调、引用、列表、代码、分割线、链接与图片、转义、表格、任务列表、脚注等，并给出最佳实践与常见坑。
publishedAt: "2025-08-11 22:39:13"
updatedAt: "2025-08-11 22:39:13"
draft: false
---

按章节系统介绍 Markdown 基本语法的完整指南。
`,
};

export class DevMockStorage implements Storage {
  async list(prefix: string): Promise<string[]> {
    return Object.keys(mockPosts).filter(key => key.startsWith(prefix));
  }
  
  async read(key: string): Promise<string | null> {
    return mockPosts[key as keyof typeof mockPosts] || null;
  }
  
  async write(key: string, content: string): Promise<void> {
    // 在开发环境中不实际写入
    console.log(`[DevMockStorage] Write to ${key}: ${content.length} chars`);
  }
  
  async exists(key: string): Promise<boolean> {
    return key in mockPosts;
  }
  
  async delete(key: string): Promise<void> {
    // 在开发环境中不实际删除
    console.log(`[DevMockStorage] Delete ${key}`);
  }
}
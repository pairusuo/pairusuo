// S3 API 存储实现，用于构建时访问 R2
import { Storage } from './storage';

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

// S3 兼容的 R2 存储实现
export class S3R2Storage implements Storage {
  private config: R2Config;
  private baseUrl: string;

  constructor(config: R2Config) {
    this.config = config;
    this.baseUrl = `https://${config.accountId}.r2.cloudflarestorage.com`;
  }

  private async makeRequest(method: string, key: string, body?: string): Promise<Response> {
    const url = `${this.baseUrl}/${this.config.bucketName}/${key}`;
    
    // 简化的签名实现 - 在真实环境中需要 AWS SigV4
    const headers: Record<string, string> = {
      'Authorization': `AWS ${this.config.accessKeyId}:${this.config.secretAccessKey}`,
      'Host': `${this.config.accountId}.r2.cloudflarestorage.com`,
    };

    if (body && typeof body === 'string') {
      headers['Content-Type'] = 'text/markdown';
      headers['Content-Length'] = body.length.toString();
    }

    return fetch(url, {
      method,
      headers,
      body,
    });
  }

  async list(prefix: string): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/${this.config.bucketName}/?list-type=2&prefix=${encodeURIComponent(prefix)}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `AWS ${this.config.accessKeyId}:${this.config.secretAccessKey}`,
        },
      });

      if (!response.ok) {
        console.warn(`Failed to list R2 objects: ${response.status}`);
        return [];
      }

      const text = await response.text();
      // 简单的 XML 解析，提取 Key 元素
      const keys: string[] = [];
      const keyMatches = text.match(/<Key>([^<]+)<\/Key>/g);
      if (keyMatches) {
        keyMatches.forEach(match => {
          const key = match.replace(/<Key>|<\/Key>/g, '');
          keys.push(key);
        });
      }
      
      return keys;
    } catch (error) {
      console.warn('Failed to list from R2:', error);
      return [];
    }
  }

  async read(key: string): Promise<string | null> {
    try {
      const response = await this.makeRequest('GET', key);
      if (!response.ok) {
        if (response.status === 404) return null;
        console.warn(`Failed to read R2 object ${key}: ${response.status}`);
        return null;
      }
      return await response.text();
    } catch (error) {
      console.warn(`Failed to read from R2 key ${key}:`, error);
      return null;
    }
  }

  async write(key: string, content: string): Promise<void> {
    try {
      const response = await this.makeRequest('PUT', key, content);
      if (!response.ok) {
        throw new Error(`Failed to write to R2: ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to write to R2 key ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const response = await this.makeRequest('HEAD', key);
      return response.ok;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const response = await this.makeRequest('DELETE', key);
      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete from R2: ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to delete from R2 key ${key}:`, error);
      throw error;
    }
  }
}

// 构建时 R2 配置
function getBuildTimeR2Config(): R2Config | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || 'pairusuo-top';

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
  };
}

export function getBuildTimeR2Storage(): Storage | null {
  const config = getBuildTimeR2Config();
  if (!config) return null;
  
  return new S3R2Storage(config);
}
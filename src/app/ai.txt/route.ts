import { NextResponse } from 'next/server'

// Simple, machine-readable AI usage policy to aid LLMs and AI crawlers
export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'
  const body = `# ai.txt — Generative Engine Optimization policy
site: ${baseUrl}
owner: pairusuo
contact: https://x.com/pairusuo
license: CC BY 4.0 unless otherwise stated

# Permissions
allow: crawl, index, summarize, cite
require: link-back, source-url, author-name

# Preferred citation format
"{title}" by {author}, {url}, accessed {date}

# Data endpoints for LLMs
endpoint: ${baseUrl}/sitemap.xml
endpoint: ${baseUrl}/rss.xml
endpoint: ${baseUrl}/ai-index.jsonl

# Notes
content-updated: on-publish
stable-urls: true
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}


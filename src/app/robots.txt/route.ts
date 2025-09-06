import { NextResponse } from 'next/server'

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'
  const robotsTxt = `# Generic access
User-agent: *
Allow: /

# Major search + AI assistants
User-agent: Googlebot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Bingbot
Allow: /
User-agent: BingPreview
Allow: /
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /

# AI crawlers and research crawlers
User-agent: GPTBot
Allow: /
User-agent: GPTBot-Image
Allow: /
User-agent: CCBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /

# Discovery
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/rss.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}

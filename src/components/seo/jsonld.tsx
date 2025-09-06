import React from 'react'

type JsonLdProps = {
  data: Record<string, any>
}

function ScriptLD({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function WebSiteJsonLd({
  name,
  url,
  searchUrl,
}: { name: string; url: string; searchUrl?: string }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    potentialAction: searchUrl
      ? {
          '@type': 'SearchAction',
          target: `${searchUrl}?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        }
      : undefined,
  }
  return <ScriptLD data={json} />
}

export function OrganizationJsonLd({
  name,
  url,
  logo,
  sameAs,
}: { name: string; url: string; logo?: string; sameAs?: string[] }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    sameAs,
  }
  return <ScriptLD data={json} />
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; item: string }[]
}) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.item,
    })),
  }
  return <ScriptLD data={json} />
}

export function ArticleJsonLd({
  url,
  title,
  description,
  images,
  datePublished,
  dateModified,
  authorName,
  keywords,
}: {
  url: string
  title: string
  description?: string
  images?: string[]
  datePublished: string
  dateModified: string
  authorName?: string
  keywords?: string[]
}) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: url,
    headline: title,
    description,
    image: images,
    datePublished,
    dateModified,
    author: authorName ? { '@type': 'Person', name: authorName } : undefined,
    keywords: keywords?.join(', '),
  }
  return <ScriptLD data={json} />
}


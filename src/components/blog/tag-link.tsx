'use client'

import Link from 'next/link'
import { MouseEvent } from 'react'

interface TagLinkProps {
  tag: string
}

export function TagLink({ tag }: TagLinkProps) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.location.href = `/tags/${encodeURIComponent(tag)}`
  }

  return (
    <span
      className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 bg-muted rounded-md text-xs hover:bg-muted/80 transition-colors cursor-pointer whitespace-nowrap"
      onClick={handleClick}
    >
      {tag}
    </span>
  )
}
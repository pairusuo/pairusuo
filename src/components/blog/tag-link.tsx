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
    window.location.href = `/tags/${tag}`
  }

  return (
    <span
      className="px-2 py-1 bg-muted rounded-md text-xs hover:bg-muted/80 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      {tag}
    </span>
  )
}
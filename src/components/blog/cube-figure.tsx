import Image from 'next/image'
import type { ReactNode } from 'react'
import { cubeTutorialImageBase, cubeTutorialImages, type CubeTutorialImage } from '@/config/cube-tutorial'

interface CubeFigureProps {
  image: CubeTutorialImage
  caption: string
}

export function CubeFigure({ image, caption }: CubeFigureProps) {
  const details = cubeTutorialImages[image]
  const { alt, width, height } = details
  const official = 'official' in details && details.official
  const src = `${cubeTutorialImageBase}/${details.file}?v=${details.version}`
  return (
    <figure className="not-prose my-5 min-w-0">
      <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`${alt}，打开大图`} className="block rounded-lg bg-white p-3">
        <Image src={src} alt={alt} width={width} height={height} className="mx-auto h-auto w-full max-w-2xl" />
      </a>
      <figcaption className="mt-2 text-sm leading-6 text-muted-foreground">
        {caption}
        {official && <> 图源：<a href="https://rubiks.com/solve-guide" target="_blank" rel="noopener noreferrer" className="underline">Rubik’s 官方还原指南</a>。</>}
      </figcaption>
    </figure>
  )
}

export function CubeSteps({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">{children}</div>
}

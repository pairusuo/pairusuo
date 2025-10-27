import fs from 'fs'
import path from 'path'

type RawHtmlFileProps = {
  path: string
  className?: string
}

export function RawHtmlFile({ path: inputPath, className }: RawHtmlFileProps) {
  const absPath = inputPath.startsWith('/')
    ? inputPath
    : path.join(process.cwd(), inputPath)

  let html = ''
  try {
    html = fs.readFileSync(absPath, 'utf8')
  } catch (e) {
    html = `<p style="color:#dc2626">无法读取引用内容：${inputPath}</p>`
  }

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  )
}


import type { ReactNode } from 'react'

const IMG = /^!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)$/

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https:\/\/[^\s)]+|\/[^\s)]*)\)/g
  let last = 0
  let i = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(m[1] ? <strong key={i++}>{m[1]}</strong> : <a key={i++} href={m[3]}>{m[2]}</a>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function BlogBody({ content }: { content: string }) {
  const blocks: ReactNode[] = []
  let para: string[] = []
  let list: string[] = []
  const flush = () => {
    if (para.length) { blocks.push(<p key={blocks.length}>{inline(para.join(' '))}</p>); para = [] }
    if (list.length) { blocks.push(<ul key={blocks.length}>{list.map((t, i) => <li key={i}>{inline(t)}</li>)}</ul>); list = [] }
  }
  for (const raw of content.replace(/\r/g, '').split('\n')) {
    const line = raw.trim()
    if (!line) { flush(); continue }
    const img = line.match(IMG)
    if (img) {
      flush()
      // eslint-disable-next-line @next/next/no-img-element
      blocks.push(<figure key={blocks.length}><img src={img[2]} alt={img[1]} loading="lazy" /></figure>)
      continue
    }
    if (line.startsWith('### ')) { flush(); blocks.push(<h3 key={blocks.length}>{inline(line.slice(4))}</h3>); continue }
    if (line.startsWith('## ')) { flush(); blocks.push(<h2 key={blocks.length}>{inline(line.slice(3))}</h2>); continue }
    if (/^[-*] /.test(line)) { if (para.length) flush(); list.push(line.slice(2)); continue }
    if (list.length) flush()
    para.push(line)
  }
  flush()
  return <div className="blog-body">{blocks}</div>
}
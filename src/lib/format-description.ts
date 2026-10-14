// Turns the free-form product descriptions from the admin (plain text with "-" bullets,
// "Спецификации:" style headings, <br>/<p> soup) into structured blocks we can render
// with a clear hierarchy. Rich HTML (lists, tables, images, headings) is left alone.

export type Spec = { key: string; value: string }
export type Bullet = { title?: string; text: string }
export type DescBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'specs'; items: Spec[] }
  | { type: 'bullets'; items: Bullet[] }

const RICH_HTML = /<(ul|ol|table|img|h[1-6]|iframe|video)\b/i

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

export function isRichHtml(html: string) {
  return RICH_HTML.test(html)
}

export function parseDescription(html: string): DescBlock[] {
  const text = decode(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li)>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )

  const lines = text
    .split('\n')
    // Run-on bullets like "6000K (студено бяло) -Напрежение: 12V"
    .flatMap(l => l.split(/\s+(?=-[A-ZА-Я])/))
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const blocks: DescBlock[] = []
  const push = (b: DescBlock) => {
    const last = blocks[blocks.length - 1]
    if (b.type === 'specs' && last?.type === 'specs') last.items.push(...b.items)
    else if (b.type === 'bullets' && last?.type === 'bullets') last.items.push(...b.items)
    else blocks.push(b)
  }

  for (const line of lines) {
    const bullet = line.match(/^[-–—•*]\s*(.+)$/)
    if (bullet) {
      const body = bullet[1].trim()
      const spec = body.match(/^([^:–—]{2,32}):\s*(.+)$/)
      if (spec) {
        push({ type: 'specs', items: [{ key: spec[1].trim(), value: spec[2].trim() }] })
        continue
      }
      const titled = body.match(/^(.{3,60}?)\s+[–—-]\s+(.+)$/)
      push({
        type: 'bullets',
        items: [titled ? { title: titled[1], text: titled[2] } : { text: body.replace(/!+$/, '') }],
      })
      continue
    }
    if (line.endsWith(':') && line.length <= 40) {
      push({ type: 'heading', text: line.slice(0, -1) })
      continue
    }
    push({ type: 'paragraph', text: line })
  }

  // A heading with nothing after it is noise
  return blocks.filter((b, i) => b.type !== 'heading' || (blocks[i + 1] && blocks[i + 1].type !== 'heading'))
}

const BRAND = ' | LED Ivanov Auto'
const TITLE_MAX = 60
const DESC_MAX = 155

/** Page title with the brand suffix only when the result still fits in Google's ~60 chars. */
export function seoTitle(base: string): string {
  const t = base.replace(/\s+/g, ' ').trim()
  return t.length + BRAND.length <= TITLE_MAX ? t + BRAND : t
}

/** Plain-text meta description, cut at a word boundary to fit Google's snippet. */
export function seoDescription(text: string, max = DESC_MAX): string {
  const t = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–—-]+$/, '') + '…'
}

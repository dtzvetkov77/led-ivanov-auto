/**
 * Reformats product short_description compatibility lists:
 * "Toyota Carmy 2006-2021 Toyota Aurion 2006-2021 ..."
 * → <ul><li>Toyota Carmy 2006-2021</li><li>Toyota Aurion 2006-2021</li>...</ul>
 *
 * Usage: node scripts/format-compat.mjs [--dry-run]
 */
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function isHtml(text) {
  return /<[a-z][\s\S]*>/i.test(text)
}

// Matches year patterns: "2016+" or "2001-2021"
const YEAR_RE = /\d{4}(?:\+|-\d{4})/

function splitCompatSection(compat) {
  // Format A: newlines already present
  if (compat.includes('\n')) {
    return compat.split('\n').map(l => l.trim()).filter(Boolean)
  }

  // Format B: single paragraph — split after each year pattern before capital letter
  // e.g. "A1 8X 2016+ A3/S3 2016+ Seat: Alhambra 2011+"
  const parts = compat.split(/(?<=\d{4}[+]|\d{4}-\d{4})\s+(?=[A-ZА-ЯЁA-Za-zА-яё0-9\/])/)
  return parts.map(p => p.trim()).filter(Boolean)
}

/**
 * Tries to detect and reformat a compatibility list.
 * Returns null if no recognizable pattern found (or already HTML).
 */
function reformatDescription(text) {
  if (!text) return null
  if (isHtml(text)) return null  // already formatted HTML — skip

  // Need at least 3 year occurrences to be worth reformatting
  const yearCount = (text.match(/\d{4}/g) || []).length
  if (yearCount < 3) return null

  // Detect header: "Съвместими... модели:" or just start
  const headerRe = /(.*?(?:модели|моделите):?\s*)/is
  const headerMatch = text.match(headerRe)
  const header = headerMatch ? headerMatch[1].trim() : ''
  const afterHeader = header ? text.slice(header.length).trim() : text.trim()

  // Detect footer: Цената / Забележка / Note — anything after last year pattern
  const footerRe = /^([\s\S]*?)(\s+(?:Цената|Забележк|Note)[^]*)$/is
  const footerMatch = afterHeader.match(footerRe)
  const compat = footerMatch ? footerMatch[1].trim() : afterHeader
  const footer = footerMatch ? footerMatch[2].trim() : ''

  if (!compat || !YEAR_RE.test(compat)) return null

  const items = splitCompatSection(compat)
  const modelItems = items.filter(i => YEAR_RE.test(i))
  const brandItems = items.filter(i => !YEAR_RE.test(i) && i.endsWith(':'))

  if (modelItems.length < 2) return null

  // If brands extracted separately, prepend last seen brand to following model items
  let result = items.map(i => {
    if (!YEAR_RE.test(i)) return `<li><strong>${i}</strong></li>`
    return `<li>${i}</li>`
  }).join('')

  const headerHtml = header ? `<p>${header}</p>` : ''
  const footerHtml = footer ? `<p>${footer}</p>` : ''

  return `${headerHtml}<ul>${result}</ul>${footerHtml}`
}

const { data: products, error } = await supabase
  .from('products')
  .select('id, name, short_description')
  .not('short_description', 'is', null)

if (error) { console.error(error); process.exit(1) }

let updated = 0, skipped = 0

for (const p of products) {
  const formatted = reformatDescription(p.short_description)
  if (!formatted) { skipped++; continue }

  console.log(`\n[${p.name.slice(0, 60)}]`)
  if (DRY_RUN) {
    console.log('DRY RUN — would update')
  } else {
    const { error: err } = await supabase
      .from('products')
      .update({ short_description: formatted, updated_at: new Date().toISOString() })
      .eq('id', p.id)
    if (err) { console.error('  ERROR:', err.message); continue }
    console.log('  ✓ updated')
    updated++
  }
}

console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`)

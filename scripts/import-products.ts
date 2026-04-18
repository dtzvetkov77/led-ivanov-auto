/**
 * Import products from WooCommerce REST API → Supabase
 *
 * Setup:
 *   1. WooCommerce → Settings → Advanced → REST API → Add key (Read)
 *   2. Add to .env.local:
 *        WC_BASE_URL=https://ivanov-auto.com
 *        WC_CONSUMER_KEY=ck_...
 *        WC_CONSUMER_SECRET=cs_...
 *
 * Run:
 *   export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/import-products.ts
 *
 * Flags:
 *   --dry-run    Print what would be imported without writing to DB
 *   --clear      Delete all existing data first
 *   --no-ssl     Disable TLS verification
 *   --show-attrs Print all unique product attribute names and exit
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const WC_BASE   = (process.env.WC_BASE_URL ?? 'https://ivanov-auto.com').replace(/\/$/, '')
const WC_KEY    = process.env.WC_CONSUMER_KEY ?? ''
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? ''

const DRY_RUN    = process.argv.includes('--dry-run')
const CLEAR      = process.argv.includes('--clear')
const SHOW_ATTRS = process.argv.includes('--show-attrs')
const NO_SSL     = process.argv.includes('--no-ssl')
if (NO_SSL) { process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; console.warn('⚠  SSL disabled') }

// ── Slug helpers ─────────────────────────────────────────────────────────────
// Known category slugs — Cyrillic can't auto-transliterate reliably
const CATEGORY_SLUG: Record<string, string> = {
  'LED КРУШКИ':                           'led-krushki',
  'LED ПЛАФОНИ ЗА РЕГИСТРАЦИОНЕН НОМЕР':  'led-plafoni-za-nomer',
  'АВТОАКСЕСОАРИ':                        'avtoaksesoari',
  'БЯГАЩИ МИГАЧИ':                        'byagashti-migachi',
  'ДНЕВНИ СВЕТЛИНИ':                      'dnevni-svetlini',
  'КЛЮЧОДЪРЖАТЕЛИ':                       'klyuchodarzhateli',
  'BMW БЪБРЕЦІ':                          'bmw-babreci',
  'BMW':                                  'bmw-babreci',
}

const CATEGORY_DISPLAY: Record<string, string> = {
  'LED КРУШКИ':                           'LED Крушки',
  'LED ПЛАФОНИ ЗА РЕГИСТРАЦИОНЕН НОМЕР':  'LED Плафони за номер',
  'АВТОАКСЕСОАРИ':                        'Автоаксесоари',
  'БЯГАЩИ МИГАЧИ':                        'Dynamic LED Бягащи светлини',
  'ДНЕВНИ СВЕТЛИНИ':                      'Дневни LED светлини',
  'КЛЮЧОДЪРЖАТЕЛИ':                       'Ключодържатели',
  'BMW БЪБРЕЦІ':                          'BMW Бъбреци',
  'BMW':                                  'BMW Бъбреци',
}

function makeSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// ── WC types ─────────────────────────────────────────────────────────────────
type WcProduct = {
  id: number; name: string; slug: string; type: string; status: string
  description: string; short_description: string
  price: string; regular_price: string; sale_price: string; menu_order: number
  categories: { id: number; name: string; slug: string }[]
  images: { src: string; alt: string }[]
  attributes: { name: string; options: string[]; variation: boolean }[]
}
type WcVariation = {
  id: number; price: string; regular_price: string; sale_price: string; sku: string
  images: { src: string }[]
  attributes: { name: string; option: string }[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–').replace(/&#8212;/g, '—')
    .replace(/\s{2,}/g, ' ').trim()
}

async function wcGet<T>(endpoint: string, params: Record<string, string> = {}, attempt = 1): Promise<T> {
  const url = new URL(`${WC_BASE}/wp-json/wc/v3/${endpoint}`)
  url.searchParams.set('consumer_key', WC_KEY)
  url.searchParams.set('consumer_secret', WC_SECRET)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  let res: Response
  try {
    res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 WooCommerce-Import/1.0' },
      signal: AbortSignal.timeout(30_000),
    })
  } catch (err: any) {
    if (attempt < 4) {
      await new Promise(r => setTimeout(r, attempt * 2000))
      return wcGet<T>(endpoint, params, attempt + 1)
    }
    const cause = err?.cause ?? err
    throw new Error(`Network error [${endpoint}]: ${cause?.message ?? String(cause)}\n  • Try --no-ssl`)
  }
  if (!res.ok) throw new Error(`WC API [${endpoint}] HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return res.json() as T
}

async function wcGetAll<T>(endpoint: string, extra: Record<string, string> = {}): Promise<T[]> {
  const all: T[] = []
  let page = 1
  while (true) {
    const batch = await wcGet<T[]>(endpoint, { per_page: '100', page: String(page), ...extra })
    if (!Array.isArray(batch) || batch.length === 0) break
    all.push(...batch)
    if (batch.length < 100) break
    page++
    await new Promise(r => setTimeout(r, 200))
  }
  return all
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { console.error('❌  NEXT_PUBLIC_SUPABASE_URL missing'); process.exit(1) }
  if (!WC_KEY || !WC_SECRET) { console.error('❌  WC_CONSUMER_KEY / WC_CONSUMER_SECRET missing'); process.exit(1) }

  console.log(`\n🔌  ${WC_BASE}`)
  if (DRY_RUN) console.log('🔍  DRY RUN\n')

  // Schema check
  const { error: probeErr } = await supabase.from('products').select('attributes').limit(1)
  if (probeErr?.message?.includes('attributes')) {
    console.error('\n❌  Missing columns. Run in Supabase SQL Editor:')
    console.error("  ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes jsonb NOT NULL DEFAULT '[]';")
    console.error("  ALTER TABLE products ADD COLUMN IF NOT EXISTS variations jsonb NOT NULL DEFAULT '[]';")
    process.exit(1)
  }

  // Clear
  if (CLEAR && !DRY_RUN) {
    console.log('🗑   Clearing…')
    const empty = '00000000-0000-0000-0000-000000000000'
    await supabase.from('product_models').delete().neq('product_id', empty)
    await supabase.from('product_makes').delete().neq('product_id', empty)
    await supabase.from('products').delete().neq('id', empty)
    await supabase.from('models').delete().neq('id', empty)
    await supabase.from('makes').delete().neq('id', empty)
    await supabase.from('categories').delete().neq('id', empty)
    console.log('   Done.\n')
  }

  // ── 1. Fetch all products ────────────────────────────────────────────────
  console.log('📦  Fetching products…')
  const wcProducts = await wcGetAll<WcProduct>('products', { status: 'publish' })
  console.log(`   ${wcProducts.length} products\n`)

  if (SHOW_ATTRS) {
    const map: Record<string, Set<string>> = {}
    for (const p of wcProducts)
      for (const a of (p.attributes ?? [])) {
        if (!map[a.name]) map[a.name] = new Set()
        for (const o of (a.options ?? [])) map[a.name].add(o)
      }
    for (const [n, opts] of Object.entries(map).sort())
      console.log(`"${n}" (${opts.size}): ${[...opts].slice(0,5).join(', ')}${opts.size > 5 ? '…' : ''}`)
    return
  }

  // ── 2. Collect categories from "Категория" attribute + WC categories ──────
  console.log('📂  Building categories…')
  const uniqueCatNames = new Set<string>()
  // From "Категория" attribute
  for (const p of wcProducts)
    for (const a of (p.attributes ?? []))
      if (a.name === 'Категория')
        for (const o of (a.options ?? [])) uniqueCatNames.add(o.toUpperCase().trim())
  // From WC product categories (fallback source)
  for (const p of wcProducts)
    for (const c of (p.categories ?? []))
      if (c.name) uniqueCatNames.add(c.name.toUpperCase().trim())

  // wcCatSlugToRaw: maps wc category slug → our raw name key (for later lookup)
  const wcCatSlugToRaw: Record<string, string> = {}
  for (const p of wcProducts)
    for (const c of (p.categories ?? []))
      if (c.name) wcCatSlugToRaw[c.slug] = c.name.toUpperCase().trim()

  const catNameToId: Record<string, string> = {}
  if (!DRY_RUN) {
    for (const raw of uniqueCatNames) {
      const slug = CATEGORY_SLUG[raw] ?? (makeSlug(raw) || raw.toLowerCase().replace(/\s/g, '-'))
      const name = CATEGORY_DISPLAY[raw] ?? raw
      const { data, error } = await supabase.from('categories')
        .upsert({ name, slug }, { onConflict: 'slug' }).select('id').single()
      if (error) { console.error(`  Category error [${name}]:`, error.message); continue }
      catNameToId[raw] = data.id
      console.log(`  ✓ ${name}`)
    }
  }
  console.log('')

  // ── 3. Collect makes & models from "Модел X" attributes ─────────────────
  console.log('🏷️  Building makes & models from "Модел X" attributes…')
  // makeAttrName → { makeName, models: Set<string> }
  const makeData: Record<string, { name: string; models: Set<string> }> = {}

  for (const p of wcProducts) {
    for (const a of (p.attributes ?? [])) {
      if (!a.name.match(/^модел\s+\S/iu)) continue
      const makeName = a.name.replace(/^модел\s+/iu, '').trim()
      if (!makeData[makeName]) makeData[makeName] = { name: makeName, models: new Set() }
      for (const opt of (a.options ?? [])) makeData[makeName].models.add(opt.trim())
    }
  }

  // makeNameLc → supabase make id
  const makeNameToId: Record<string, string> = {}
  // makeId → modelName → model id
  const modelNameToId: Record<string, Record<string, string>> = {}

  if (!DRY_RUN) {
    for (const { name, models } of Object.values(makeData)) {
      const slug = makeSlug(name) || name.toLowerCase()
      const { data: mk, error: mkErr } = await supabase.from('makes')
        .upsert({ name, slug }, { onConflict: 'slug' }).select('id').single()
      if (mkErr) { console.error(`  Make error [${name}]:`, mkErr.message); continue }
      makeNameToId[name.toLowerCase()] = mk.id
      modelNameToId[mk.id] = {}

      for (const modelName of models) {
        const { data: mo, error: moErr } = await supabase.from('models')
          .upsert({ make_id: mk.id, name: modelName }, { onConflict: 'make_id,name' }).select('id').single()
        if (moErr) { console.error(`  Model error [${modelName}]:`, moErr.message); continue }
        modelNameToId[mk.id][modelName.toLowerCase()] = mo.id
      }
      console.log(`  ✓ ${name}: ${models.size} models`)
    }
  }
  console.log('')

  // ── 4. Import products ───────────────────────────────────────────────────
  console.log('🚗  Importing products…\n')
  let imported = 0, skipped = 0

  for (const wc of wcProducts) {
    const price       = parseFloat(wc.regular_price) || parseFloat(wc.price) || 0
    const sale_price  = wc.sale_price ? parseFloat(wc.sale_price) : null
    const images      = (wc.images ?? []).map(i => i.src)
    const description = wc.description || null
    const short_description = wc.short_description ? stripHtml(wc.short_description) : null

    // Category: first try "Категория" attribute, then fall back to WC categories
    const catAttr = (wc.attributes ?? []).find(a => a.name === 'Категория')
    const catRaw  = catAttr?.options?.[0]?.toUpperCase().trim()
      ?? (wc.categories?.[0]?.name?.toUpperCase().trim() ?? null)
    const category_id = catRaw ? (catNameToId[catRaw] ?? null) : null

    // Which makes/models this product fits
    const modelAttrs = (wc.attributes ?? []).filter(a => a.name.match(/^модел\s+\S/iu))

    // All attributes stored for variation selection
    const attributes = (wc.attributes ?? []).map(a => ({
      name: a.name, options: a.options ?? [], variation: a.variation ?? false,
    }))

    if (DRY_RUN) {
      const makes = modelAttrs.map(a => a.name.replace(/^модел\s+/iu, '').trim()).join(', ')
      console.log(`  [DRY] ${wc.name} | cat: ${catRaw ?? 'none'} | makes: ${makes || 'none'}`)
      imported++; continue
    }

    // Fetch variations
    let variations: object[] = []
    if (wc.type === 'variable') {
      try {
        const vars = await wcGetAll<WcVariation>(`products/${wc.id}/variations`)
        await new Promise(r => setTimeout(r, 100))
        variations = vars.map(v => ({
          attributes: Object.fromEntries((v.attributes ?? []).map(a => [a.name, a.option])),
          price: parseFloat(v.regular_price) || parseFloat(v.price) || 0,
          sale_price: v.sale_price ? parseFloat(v.sale_price) : null,
          sku: v.sku || null,
          images: (v.images ?? []).map(i => i.src),
        }))
      } catch (e: any) { console.warn(`  ⚠ Variations failed [${wc.name}]:`, e.message) }
    }

    let finalPrice = price
    if (wc.type === 'variable' && variations.length > 0 && finalPrice === 0) {
      const prices = variations.map((v: any) => v.price).filter((p: number) => p > 0)
      if (prices.length) finalPrice = Math.min(...prices)
    }

    // Upsert product
    const { data: product, error: pErr } = await supabase.from('products')
      .upsert({
        name: wc.name, slug: wc.slug, description, short_description,
        price: finalPrice, sale_price, category_id, images,
        published: wc.status === 'publish', position: wc.menu_order ?? 0,
        attributes, variations,
      }, { onConflict: 'slug' })
      .select('id').single()

    if (pErr) { console.error(`  ✗ [${wc.name}]:`, pErr.message); skipped++; continue }

    // Link product → makes & models
    let linkedMakes = 0, linkedModels = 0
    for (const attr of modelAttrs) {
      const makeName = attr.name.replace(/^модел\s+/iu, '').trim()
      const makeId   = makeNameToId[makeName.toLowerCase()]
      if (!makeId) continue

      await supabase.from('product_makes').upsert({ product_id: product.id, make_id: makeId })
      linkedMakes++

      const modelsMap = modelNameToId[makeId] ?? {}
      for (const modelName of (attr.options ?? [])) {
        const modelId = modelsMap[modelName.toLowerCase()]
        if (!modelId) continue
        await supabase.from('product_models').upsert({ product_id: product.id, model_id: modelId })
        linkedModels++
      }
    }

    imported++
    const varLabel = wc.type === 'variable' ? ` [${variations.length}v]` : ''
    console.log(`  ✓ [${imported}/${wcProducts.length}] ${wc.name}${varLabel} → ${linkedMakes} марки, ${linkedModels} модела`)
  }

  console.log(`\n✅  Done`)
  console.log(`   Imported  : ${imported}`)
  if (skipped) console.log(`   Skipped   : ${skipped}`)
  console.log(`   Categories: ${Object.keys(catNameToId).length}`)
  console.log(`   Makes     : ${Object.keys(makeNameToId).length}`)
  if (DRY_RUN) console.log('\n   (dry run)')
}

main().catch(err => {
  console.error('\n❌  Fatal:', err.message)
  if (err?.cause) console.error('   Cause:', err.cause?.message ?? err.cause)
  process.exit(1)
})

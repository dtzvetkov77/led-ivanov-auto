/**
 * Download all product images from WooCommerce and save them locally.
 *
 * Images are saved to:  public/images/products-local/<product-slug>/<index>.jpg
 * After running, update the Supabase `images` column to use local paths.
 *
 * Setup: same .env.local as import-products.ts
 * Run:
 *   export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/download-images.ts
 *
 * Flags:
 *   --dry-run    List URLs that would be downloaded, without saving files
 *   --no-ssl     Disable TLS certificate verification (self-signed cert)
 *   --update-db  After downloading, update the `images` column in Supabase
 *                to use /images/products-local/<slug>/<index>.ext paths
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.argv.includes('--no-ssl') ? '0' : '1'

const DRY_RUN   = process.argv.includes('--dry-run')
const UPDATE_DB = process.argv.includes('--update-db')
const OUT_DIR   = path.resolve('public/images/products-local')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const WC_BASE   = (process.env.WC_BASE_URL ?? 'https://ivanov-auto.com').replace(/\/$/, '')
const WC_KEY    = process.env.WC_CONSUMER_KEY ?? ''
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? ''

const agent = new https.Agent({ rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0' })

async function wc(endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${WC_BASE}/wp-json/wc/v3/${endpoint}`)
  url.searchParams.set('consumer_key', WC_KEY)
  url.searchParams.set('consumer_secret', WC_SECRET)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  const res = await fetch(url.toString(), { agent } as RequestInit)
  if (!res.ok) throw new Error(`WC ${endpoint} → ${res.status}`)
  return res.json()
}

async function downloadFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url, { agent } as RequestInit)
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(dest, buf)
}

function extFromUrl(url: string): string {
  const m = url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)
  return m ? `.${m[1].toLowerCase()}` : '.jpg'
}

async function fetchAllProducts(): Promise<any[]> {
  const all: any[] = []
  let page = 1
  while (true) {
    const batch = await wc('products', { per_page: 100, page, status: 'publish' })
    if (!batch.length) break
    all.push(...batch)
    console.log(`  fetched page ${page}, total so far: ${all.length}`)
    if (batch.length < 100) break
    page++
  }
  return all
}

async function main() {
  console.log('=== download-images.ts ===')
  if (DRY_RUN) console.log('[dry-run] no files will be written\n')
  if (!DRY_RUN) fs.mkdirSync(OUT_DIR, { recursive: true })

  console.log('Fetching products from WooCommerce…')
  const products = await fetchAllProducts()
  console.log(`Found ${products.length} products\n`)

  let downloaded = 0
  let skipped = 0
  let errors = 0

  const dbUpdates: { id: string; slug: string; localPaths: string[] }[] = []

  for (const prod of products) {
    const slug: string = prod.slug ?? `product-${prod.id}`
    const images: { src: string }[] = prod.images ?? []

    if (!images.length) continue

    const slugDir = path.join(OUT_DIR, slug)
    if (!DRY_RUN) fs.mkdirSync(slugDir, { recursive: true })

    const localPaths: string[] = []

    for (let i = 0; i < images.length; i++) {
      const src = images[i].src
      const ext = extFromUrl(src)
      const filename = `${i}${ext}`
      const dest = path.join(slugDir, filename)
      const publicPath = `/images/products-local/${slug}/${filename}`

      localPaths.push(publicPath)

      if (DRY_RUN) {
        console.log(`  [dry] ${src} → ${dest}`)
        continue
      }

      if (fs.existsSync(dest)) {
        skipped++
        continue
      }

      try {
        await downloadFile(src, dest)
        downloaded++
        process.stdout.write(`\r  ${downloaded} downloaded, ${skipped} skipped, ${errors} errors`)
      } catch (err) {
        errors++
        console.error(`\n  ERROR ${src}: ${err}`)
      }
    }

    if (UPDATE_DB && localPaths.length > 0) {
      dbUpdates.push({ id: prod.id, slug, localPaths })
    }
  }

  if (!DRY_RUN) console.log(`\n\nDone: ${downloaded} downloaded, ${skipped} skipped, ${errors} errors`)

  if (UPDATE_DB && dbUpdates.length > 0) {
    console.log(`\nUpdating Supabase with local image paths for ${dbUpdates.length} products…`)
    for (const { slug, localPaths } of dbUpdates) {
      const { error } = await supabase
        .from('products')
        .update({ images: localPaths })
        .eq('slug', slug)
      if (error) console.error(`  ERROR updating ${slug}: ${error.message}`)
      else process.stdout.write('.')
    }
    console.log('\nSupabase updated.')
  }

  if (!UPDATE_DB && !DRY_RUN) {
    console.log('\nTip: run with --update-db to update Supabase image paths to local URLs.')
    console.log(`Images saved to: ${OUT_DIR}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })

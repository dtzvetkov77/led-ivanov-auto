/**
 * Upload local product images to Supabase Storage and update DB URLs.
 *
 * Run:
 *   export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/upload-images-to-supabase.ts
 *
 * Flags:
 *   --dry-run   List files without uploading
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const DRY_RUN = process.argv.includes('--dry-run')
const BUCKET  = 'product-images'
const LOCAL_DIR = path.resolve('public/images/products-local')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('=== upload-images-to-supabase.ts ===')
  if (DRY_RUN) console.log('[dry-run] no files will be uploaded\n')

  if (!fs.existsSync(LOCAL_DIR)) {
    console.error(`❌  Directory not found: ${LOCAL_DIR}`)
    process.exit(1)
  }

  const slugDirs = fs.readdirSync(LOCAL_DIR).filter(f =>
    fs.statSync(path.join(LOCAL_DIR, f)).isDirectory()
  )
  console.log(`Found ${slugDirs.length} product folders\n`)

  let uploaded = 0, skipped = 0, errors = 0

  for (const slug of slugDirs) {
    const slugDir = path.join(LOCAL_DIR, slug)
    const files = fs.readdirSync(slugDir).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    if (!files.length) continue

    const publicUrls: string[] = []

    for (const filename of files) {
      const localPath = path.join(slugDir, filename)
      const storagePath = `${slug}/${filename}`

      if (DRY_RUN) {
        console.log(`  [dry] ${storagePath}`)
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
        publicUrls.push(data.publicUrl)
        continue
      }

      // Check if already uploaded
      const { data: existing } = await supabase.storage.from(BUCKET).list(slug, {
        search: filename,
      })
      if (existing && existing.length > 0) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
        publicUrls.push(data.publicUrl)
        skipped++
        continue
      }

      const fileBuffer = fs.readFileSync(localPath)
      const contentType = filename.endsWith('.webp') ? 'image/webp'
        : filename.endsWith('.png') ? 'image/png'
        : 'image/jpeg'

      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
        contentType,
        upsert: false,
      })

      if (error) {
        console.error(`\n  ERROR ${storagePath}: ${error.message}`)
        errors++
        continue
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
      publicUrls.push(data.publicUrl)
      uploaded++
      process.stdout.write(`\r  ${uploaded} uploaded, ${skipped} skipped, ${errors} errors`)
    }

    // Update DB
    if (!DRY_RUN && publicUrls.length > 0) {
      const { error } = await supabase
        .from('products')
        .update({ images: publicUrls })
        .eq('slug', slug)
      if (error) console.error(`\n  DB error [${slug}]: ${error.message}`)
    }
  }

  console.log(`\n\nDone: ${uploaded} uploaded, ${skipped} skipped, ${errors} errors`)
}

main().catch(e => { console.error(e); process.exit(1) })

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fxirokrndjapkkfvowzv.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aXJva3JuZGphcGtrZnZvd3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI5MTU5NCwiZXhwIjoyMDkxODY3NTk0fQ.lzI--Jk_rBZY6sTm86Fa2BLcGrPyNQqfLdMxvqFZyJg'
const BUCKET = 'product-images'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function uploadImageFromUrl(url, path) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const buf = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType, upsert: true })
  if (error) throw new Error(`Upload error: ${error.message}`)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

const { data: products } = await supabase
  .from('products')
  .select('id, name, images')

const broken = products.filter(p => p.images?.some(u => u.includes('ivanov-auto.com/wp-content')))
console.log(`Found ${broken.length} products with old WP images\n`)

let ok = 0, fail = 0

for (const product of broken) {
  const newImages = []
  for (const url of product.images) {
    if (!url.includes('ivanov-auto.com/wp-content')) {
      newImages.push(url)
      continue
    }
    const filename = url.split('/').pop().split('?')[0]
    const path = `wp-migrated/${product.id}/${filename}`
    try {
      const newUrl = await uploadImageFromUrl(url, path)
      newImages.push(newUrl)
      console.log(`  ✓ ${filename}`)
    } catch (e) {
      console.error(`  ✗ ${filename}: ${e.message}`)
      newImages.push(url) // keep old url so we don't lose it
      fail++
    }
  }
  const { error } = await supabase.from('products').update({ images: newImages }).eq('id', product.id)
  if (error) {
    console.error(`  DB update failed for ${product.name}: ${error.message}`)
  } else {
    ok++
    console.log(`[${ok}/${broken.length}] ${product.name}`)
  }
}

console.log(`\nDone. ${ok} products updated, ${fail} image failures.`)

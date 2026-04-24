export async function uploadFile(file: File, path: string): Promise<string> {
  // Step 1: get signed upload URL (tiny JSON request — bypasses Vercel payload limit)
  const signRes = await fetch('/api/admin/upload-signed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  if (!signRes.ok) {
    const text = await signRes.text()
    let msg = text
    try { msg = JSON.parse(text).error ?? text } catch { /* plain text */ }
    throw new Error(msg)
  }
  const { signedUrl } = await signRes.json()

  // Step 2: upload file directly to Supabase Storage (no Vercel in the middle)
  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!uploadRes.ok) {
    throw new Error(`Storage upload failed: ${uploadRes.status}`)
  }

  // Step 3: return public URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`
}

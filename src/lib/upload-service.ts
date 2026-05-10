import { createClient } from '@/lib/supabase/client'

const BUCKET = 'product-images'

export async function uploadFileToStorage(file: File, storagePath: string): Promise<string> {
  // Get signed upload URL from server (auth-protected)
  const res = await fetch('/api/admin/upload-signed', {
    method: 'POST',
    body: JSON.stringify({ path: storagePath }),
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to get upload URL')
  }
  const { token, path } = await res.json()

  // Upload directly to Supabase Storage (no Vercel size limit)
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .uploadToSignedUrl(path, token, file, { contentType: file.type || 'image/jpeg' })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export function makeStoragePath(prefix: string, file: File, suffix = ''): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  return `${prefix}/${Date.now()}${suffix ? `-${suffix}` : ''}.${ext}`
}

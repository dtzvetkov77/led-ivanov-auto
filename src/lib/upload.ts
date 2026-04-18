export async function uploadFile(file: File, path: string): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('path', path)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Upload failed')
  }
  const { url } = await res.json()
  return url
}

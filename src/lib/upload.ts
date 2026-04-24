export async function uploadFile(file: File, path: string): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('path', path)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
  if (!res.ok) {
    const text = await res.text()
    let msg = text
    try { msg = JSON.parse(text).error ?? text } catch { /* plain text error */ }
    throw new Error(msg)
  }
  const { url } = await res.json()
  return url
}

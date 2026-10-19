// Route remote/local images through Vercel's Next.js image optimizer
// (/_next/image) so we serve resized WebP/AVIF instead of multi-MB originals.
// Width must be one of Next's default device/image sizes.
type Width = 64 | 96 | 128 | 256 | 384 | 640 | 750 | 828 | 1080 | 1200 | 1920

const OPTIMIZABLE = /^(https:\/\/([a-z0-9-]+\.supabase\.co|ivanov-auto\.com)\/|\/(?!\/|_next\/))/

export function optImg(src: string | null | undefined, width: Width): string {
  if (!src) return ''
  if (!OPTIMIZABLE.test(src) || src.endsWith('.svg')) return src
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`
}

export function optImgSet(src: string | null | undefined, widths: Width[]): string | undefined {
  if (!src || !OPTIMIZABLE.test(src) || src.endsWith('.svg')) return undefined
  return widths.map(w => `${optImg(src, w)} ${w}w`).join(', ')
}

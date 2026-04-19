import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ledivanov.bg'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('published', true)

  const productUrls: MetadataRoute.Sitemap = (products ?? []).map(p => ({
    url: `${SITE}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    { url: SITE,                                     lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE}/products`,                       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE}/services/headlight-polishing`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/about`,                          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/contact`,                        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/gallery`,                        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${SITE}/video`,                          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${SITE}/privacy-policy`,                 lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${SITE}/terms`,                          lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${SITE}/cookies`,                        lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    ...productUrls,
  ]
}

import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CATEGORY_PAGE_CONFIGS } from '@/lib/categoryPages'
import { ARTICLES } from '@/lib/articles'

export const revalidate = 3600

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ledivanovauto.com').replace('http://localhost:3000', 'https://www.ledivanovauto.com')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const [{ data: products }, { data: blogPosts }, { data: partners }] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('published', true),
    supabase.from('blog_posts').select('slug, updated_at').eq('published', true),
    supabase.from('partners').select('slug, description').eq('published', true),
  ])

  // Only partner pages with their own description; empty ones are noindex
  // (see hasContent in src/app/partners/[slug]/page.tsx) until the data is filled in the admin.
  const partnerSlugs = (partners ?? [])
    .filter(p => typeof p.description === 'string' && p.description.trim().length > 0)
    .map(p => p.slug)
    .filter(Boolean)
  const partnerUrls: MetadataRoute.Sitemap = partnerSlugs.map(slug => ({
    url: `${SITE}/partners/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.4,
  }))

  const productUrls: MetadataRoute.Sitemap = (products ?? []).map(p => ({
    url: `${SITE}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const categoryUrls: MetadataRoute.Sitemap = Object.keys(CATEGORY_PAGE_CONFIGS).map(slug => ({
    url: `${SITE}/c/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  const blogUrls: MetadataRoute.Sitemap = (blogPosts ?? []).map(post => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.65,
  }))
  const dbBlogSlugs = new Set((blogPosts ?? []).map(p => p.slug))
  const articleUrls: MetadataRoute.Sitemap = ARTICLES.filter(a => !dbBlogSlugs.has(a.slug)).map(a => ({
    url: `${SITE}/blog/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    { url: SITE,                                     lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE}/products`,                       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE}/blog`,                           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE}/services`,                       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/services/headlight-polishing`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/services/headlight-tinting`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/services/headlight-alignment`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/partners`,                       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/about`,                          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/contact`,                        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/gallery`,                        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${SITE}/video`,                          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
    ...partnerUrls,
    ...categoryUrls,
    ...blogUrls,
    ...articleUrls,
    ...productUrls,
  ]
}

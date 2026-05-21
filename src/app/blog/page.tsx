import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JsonLd } from '@/components/JsonLd'

export const dynamic = 'force-dynamic'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ledivanovauto.com').replace('http://localhost:3000', 'https://www.ledivanovauto.com')

export const metadata = {
  title: 'Блог — LED крушки и авто осветление | LED Ivanov Auto',
  description: 'Ръководства, съвети и новини за LED крушки, ксенон, полиране и фолиране на фарове. Научете всичко за авто осветлението от специалистите на LED Ivanov Auto.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Блог — LED крушки и авто осветление | LED Ivanov Auto',
    description: 'Ръководства, съвети и новини за LED крушки, ксенон, полиране и фолиране на фарове.',
    url: `${SITE}/blog`,
  },
}

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, meta_description, reading_time, cover_image, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Начало', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Блог', item: `${SITE}/blog` },
    ],
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <JsonLd data={breadcrumbSchema} />

      <nav className="text-xs text-muted mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-white transition-colors">Начало</Link>
        <span>/</span>
        <span className="text-white">Блог</span>
      </nav>

      <div className="mb-10">
        <span className="text-xs font-bold tracking-[4px] uppercase text-accent mb-2 block">РЕСУРСИ</span>
        <h1 className="text-3xl font-black mb-2">Блог</h1>
        <p className="text-muted text-sm max-w-xl">Ръководства за избор на LED крушки, CANBUS съвместимост, полиране на фарове и всичко за авто осветлението.</p>
      </div>

      {!posts?.length ? (
        <div className="py-20 text-center text-muted text-sm border border-border rounded-xl">
          <p>Скоро ще публикуваме нови статии</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-surface border border-border hover:border-accent/60 rounded-2xl overflow-hidden transition-all duration-200"
            >
              {/* Image */}
              <div className="aspect-video bg-background overflow-hidden shrink-0">
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center gap-2 text-xs text-muted mb-3">
                  <time dateTime={post.created_at}>
                    {new Date(post.created_at).toLocaleDateString('bg-BG', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </time>
                  <span>·</span>
                  <span>{post.reading_time} мин.</span>
                </div>
                <h2 className="font-black text-base leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h2>
                {post.meta_description && (
                  <p className="text-muted text-xs leading-relaxed line-clamp-2 flex-1">
                    {post.meta_description}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 mt-4 text-accent text-xs font-bold">
                  Прочетете
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

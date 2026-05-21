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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <JsonLd data={breadcrumbSchema} />

      <nav className="text-xs text-muted mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-white transition-colors">Начало</Link>
        <span>/</span>
        <span className="text-white">Блог</span>
      </nav>

      <div className="mb-10">
        <span className="text-xs font-bold tracking-[4px] uppercase text-accent mb-2 block">РЕСУРСИ</span>
        <h1 className="text-3xl font-black mb-2">Блог</h1>
        <p className="text-muted text-sm">Ръководства за избор на LED крушки, CANBUS съвместимост, полиране на фарове и всичко за авто осветлението.</p>
      </div>

      {!posts?.length ? (
        <div className="py-20 text-center text-muted text-sm border border-border rounded-xl">
          <p>Скоро ще публикуваме нови статии</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block bg-surface border border-border hover:border-accent rounded-2xl overflow-hidden transition-all"
            >
              <div className="flex gap-4 p-6">
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-xs text-muted mb-3">
                    <time dateTime={post.created_at}>
                      {new Date(post.created_at).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                    <span>·</span>
                    <span>{post.reading_time} мин. четене</span>
                  </div>
                  <h2 className="text-lg font-black mb-2 group-hover:text-accent transition-colors leading-snug">{post.title}</h2>
                  {post.meta_description && (
                    <p className="text-muted text-sm leading-relaxed line-clamp-2">{post.meta_description}</p>
                  )}
                  <span className="inline-block mt-3 text-accent text-xs font-bold group-hover:underline">
                    Прочетете →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

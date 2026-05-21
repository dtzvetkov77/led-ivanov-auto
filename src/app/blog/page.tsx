import Link from 'next/link'
import { BLOG_POSTS } from '@/lib/blog'
import { JsonLd } from '@/components/JsonLd'

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

const sorted = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))

export default function BlogPage() {
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

      <div className="space-y-6">
        {sorted.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block bg-surface border border-border hover:border-accent rounded-2xl p-6 transition-all"
          >
            <div className="flex items-center gap-3 text-xs text-muted mb-3">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
              <span>·</span>
              <span>{post.readingTime} мин. четене</span>
            </div>
            <h2 className="text-lg font-black mb-2 group-hover:text-accent transition-colors leading-snug">{post.title}</h2>
            <p className="text-muted text-sm leading-relaxed line-clamp-2">{post.intro}</p>
            <span className="inline-block mt-4 text-accent text-xs font-bold group-hover:underline">
              Прочетете →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

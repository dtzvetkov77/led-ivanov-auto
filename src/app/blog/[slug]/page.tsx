import { notFound } from 'next/navigation'
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { BLOG_POSTS, getBlogPost } from '@/lib/blog'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ledivanovauto.com').replace('http://localhost:3000', 'https://www.ledivanovauto.com')

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} | LED Ivanov Auto`,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: `${post.title} | LED Ivanov Auto`,
      description: post.metaDescription,
      url: `${SITE}/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'LED Ivanov Auto',
      url: SITE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LED Ivanov Auto',
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/images/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${slug}` },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Начало', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Блог', item: `${SITE}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE}/blog/${slug}` },
    ],
  }

  const faqSchema = post.faq && post.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  } : null

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-white transition-colors">Начало</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Блог</Link>
        <span>/</span>
        <span className="text-white line-clamp-1">{post.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 text-xs text-muted mb-4">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <span>·</span>
          <span>{post.readingTime} мин. четене</span>
        </div>
        <h1 className="text-3xl font-black leading-tight mb-4">{post.title}</h1>
        <p className="text-muted leading-relaxed">{post.intro}</p>
      </header>

      {/* Divider */}
      <div className="h-px bg-border mb-8" />

      {/* Sections */}
      <div className="space-y-8">
        {post.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-xl font-black mb-3">{section.heading}</h2>
            <p className="text-muted leading-relaxed text-sm">{section.body}</p>
          </section>
        ))}
      </div>

      {/* FAQ */}
      {post.faq && post.faq.length > 0 && (
        <div className="mt-10 pt-8 border-t border-border">
          <h2 className="text-xl font-black mb-6">Често задавани въпроси</h2>
          <div className="space-y-4">
            {post.faq.map((item, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-bold text-sm mb-2">{item.q}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related category CTA */}
      {post.relatedCategory && (
        <div className="mt-10 bg-accent/10 border border-accent/20 rounded-2xl p-6 text-center">
          <p className="text-sm text-muted mb-3">Разгледайте нашите продукти в тази категория</p>
          <Link
            href={`/c/${post.relatedCategory}`}
            className="inline-block bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors"
          >
            Разгледай продуктите →
          </Link>
        </div>
      )}

      {/* Back to blog */}
      <div className="mt-10 pt-6 border-t border-border">
        <Link href="/blog" className="text-accent text-sm font-semibold hover:underline">
          ← Обратно към блога
        </Link>
      </div>
    </article>
  )
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JsonLd } from '@/components/JsonLd'
import { getArticle, articleCover, type Article } from '@/lib/articles'
import { optImg } from '@/lib/img'

export const dynamic = 'force-dynamic'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ledivanovauto.com').replace('http://localhost:3000', 'https://www.ledivanovauto.com')

type Props = { params: Promise<{ slug: string }> }

type Post = {
  title: string
  meta_description: string | null
  content: string
  cover_image: string | null
  reading_time: number | null
  created_at: string
  updated_at: string | null
}

function fromArticle(a: Article): Post {
  return {
    title: a.title,
    meta_description: a.metaDescription,
    content: a.content,
    cover_image: articleCover(a.slug),
    reading_time: a.readingTime,
    created_at: a.date,
    updated_at: a.date,
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: dbPost } = await supabase
    .from('blog_posts')
    .select('title, meta_description, cover_image, created_at, updated_at')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  const post = dbPost ?? (getArticle(slug) ? fromArticle(getArticle(slug)!) : null)

  if (!post) return {}

  return {
    title: { absolute: `${post.title} | LED Ivanov Auto` },
    description: post.meta_description ?? undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: `${post.title} | LED Ivanov Auto`,
      description: post.meta_description ?? undefined,
      url: `${SITE}/blog/${slug}`,
      type: 'article',
      publishedTime: post.created_at,
      ...(post.cover_image ? { images: [{ url: post.cover_image.startsWith('/') ? `${SITE}${post.cover_image}` : post.cover_image, width: 1600, height: 900, alt: post.title }] } : {}),
      modifiedTime: post.updated_at ?? undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: dbPost } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  const article = dbPost ? undefined : getArticle(slug)
  const post: Post | null = dbPost ?? (article ? fromArticle(article) : null)
  if (!post) notFound()
  const related = (article?.related ?? []).map(getArticle).filter((a): a is Article => !!a)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description ?? undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at ?? post.created_at,
    ...(post.cover_image ? { image: post.cover_image.startsWith('/') ? `${SITE}${post.cover_image}` : post.cover_image } : {}),
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

  const faqSchema = article?.faq.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null

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

      {/* Cover image */}
      {post.cover_image && (
        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8 bg-background">
          <img src={optImg(post.cover_image, 1200)} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 text-xs text-muted mb-4 flex-wrap">
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <span>·</span>
          <span>{post.reading_time ?? 5} мин. четене</span>
          <span>·</span>
          <span>от <strong className="text-white/70">екипа на LED Ivanov Auto</strong></span>
        </div>
        <h1 className="text-3xl font-black leading-tight">{post.title}</h1>
        {post.meta_description && (
          <p className="text-muted leading-relaxed mt-4">{post.meta_description}</p>
        )}
      </header>

      <div className="h-px bg-border mb-8" />

      {/* Content — rendered from rich text HTML */}
      <div
        className="
          [&>h2]:text-xl [&>h2]:font-black [&>h2]:text-white
          [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:pb-3
          [&>h2]:border-b [&>h2]:border-border
          [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-8 [&>h3]:mb-3
          [&>p]:text-muted [&>p]:leading-relaxed [&>p]:text-sm [&>p]:mb-5
          [&>ul]:text-muted [&>ul]:text-sm [&>ul]:mb-5 [&>ul]:pl-5 [&>ul]:list-disc [&>ul]:space-y-2
          [&>ol]:text-muted [&>ol]:text-sm [&>ol]:mb-5 [&>ol]:pl-5 [&>ol]:list-decimal [&>ol]:space-y-2
          [&>blockquote]:border-l-4 [&>blockquote]:border-accent [&>blockquote]:pl-4 [&>blockquote]:text-muted [&>blockquote]:italic [&>blockquote]:my-6
          [&>hr]:border-border [&>hr]:my-8
          [&>p>strong]:text-white [&>p>strong]:font-semibold
          [&>p>a]:text-accent [&>p>a]:underline
          [&_img]:rounded-xl [&_img]:w-full [&_img]:my-6
          [&_li>strong]:text-white [&_li>strong]:font-semibold
          [&_li_a]:text-accent [&_li_a]:underline
          [&>div]:mb-6 [&>div]:rounded-xl [&>div]:border [&>div]:border-border
          [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse
          [&_th]:text-left [&_th]:text-white [&_th]:font-bold [&_th]:bg-surface [&_th]:px-3 [&_th]:py-2.5 [&_th]:border-b [&_th]:border-border
          [&_td]:text-muted [&_td]:px-3 [&_td]:py-2.5 [&_td]:border-b [&_td]:border-border [&_td]:align-top
          [&_td_a]:text-accent [&_td_a]:underline [&_th_a]:text-accent [&_th_a]:underline
        "
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {article && article.faq.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-black text-white mb-4 pb-3 border-b border-border">Често задавани въпроси</h2>
          <div className="space-y-3">
            {article.faq.map((f, i) => (
              <details key={i} className="group bg-surface border border-border rounded-xl px-4 py-3">
                <summary className="cursor-pointer font-semibold text-sm text-white list-none flex justify-between gap-4">
                  {f.q}
                  <span className="text-accent group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-muted text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {article && (
        <section className="mt-10 bg-surface border border-accent/40 rounded-2xl p-6">
          <h2 className="text-lg font-black text-white mb-2">Монтаж и регулиране в сервиза на LED Ivanov Auto</h2>
          <p className="text-muted text-sm leading-relaxed mb-4">
            София, ж.к. Малинова долина, ул. „Георги Русев“ 2. Монтираме LED крушки, проверяваме за грешки и регулираме фаровете, докато чакате.
            Доставка в цялата страна за 1–2 дни.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="bg-accent text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity">Към магазина</Link>
            <a href="tel:+359999997996" className="border border-border text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:border-accent transition-colors">+359 99 999 7996</a>
            <Link href="/contact" className="border border-border text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:border-accent transition-colors">Пишете ни</Link>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-black text-white mb-4">Прочетете още</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {related.map(r => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="bg-surface border border-border hover:border-accent/60 rounded-xl p-4 text-sm font-semibold leading-snug transition-colors">
                {r.title}
              </Link>
            ))}
          </div>
        </section>
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

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JsonLd } from '@/components/JsonLd'

export const dynamic = 'force-dynamic'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ledivanovauto.com').replace('http://localhost:3000', 'https://www.ledivanovauto.com')

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, meta_description, created_at, updated_at')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) return {}

  return {
    title: `${post.title} | LED Ivanov Auto`,
    description: post.meta_description ?? undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: `${post.title} | LED Ivanov Auto`,
      description: post.meta_description ?? undefined,
      url: `${SITE}/blog/${slug}`,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description ?? undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    ...(post.cover_image ? { image: post.cover_image } : {}),
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

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

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
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 text-xs text-muted mb-4">
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <span>·</span>
          <span>{post.reading_time} мин. четене</span>
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
        "
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Back to blog */}
      <div className="mt-10 pt-6 border-t border-border">
        <Link href="/blog" className="text-accent text-sm font-semibold hover:underline">
          ← Обратно към блога
        </Link>
      </div>
    </article>
  )
}

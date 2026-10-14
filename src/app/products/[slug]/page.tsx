import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductGallery from '@/components/ProductGallery'
import ProductActions from '@/components/ProductActions'
import ProductDescriptionTabs from '@/components/ProductDescriptionTabs'
import FrequentlyBoughtTogether from '@/components/FrequentlyBoughtTogether'
import AdminBar from '@/components/AdminBar'
import GoogleRatingBadge from '@/components/GoogleRatingBadge'
import { getGoogleReviews } from '@/lib/google-reviews'
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import ProductDescription, { RichDescription } from '@/components/ProductDescription'
import { parseDescription, isRichHtml, type DescBlock } from '@/lib/format-description'
function sanitize(html: string) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
  // Plain text (no HTML tags) — convert newlines to <br>
  if (!/<[a-z]/i.test(cleaned)) {
    return cleaned.replace(/\n/g, '<br>')
  }
  return cleaned
}
import type { Product } from '@/lib/types'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ledivanovauto.com').replace('http://localhost:3000', 'https://www.ledivanovauto.com')

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description, images')
    .eq('slug', slug)
    .single()
  if (!product) return { title: 'LED Ivanov Auto' }
  const plainDesc = product.short_description
    ? product.short_description.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160)
    : undefined
  return {
    title: `${product.name} | LED Ivanov Auto`,
    description: plainDesc,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${product.name} | LED Ivanov Auto`,
      description: plainDesc,
      ...(product.images?.[0] ? { images: [{ url: product.images[0] }] } : {}),
    },
  }
}

const TRUST = [
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'до 2 год. гаранция',
    sub: 'На всички продукти',
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Plug & Play',
    sub: 'Монтаж за 5 минути',
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h1.172a2 2 0 011.414.586l2.828 2.828A2 2 0 0121 13.172V17a2 2 0 01-2 2h-1m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Доставка 1–2 дни',
    sub: 'Еконт / Спиди',
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Поддръжка 24/7',
    sub: 'Viber / Messenger',
  },
]

const VIBER = 'viber://chat?number=%2B359999997996'
const PHONE_RAW = '+359999997996'

const BULB_FAQ = [
  { q: 'Ще пасват ли на моята кола?', a: 'Пиши ни марка, модел и година във Viber или се обади — ще ти кажем точно кои крушки ти трябват, преди да поръчаш.' },
  { q: 'Ще има ли грешки на таблото (CanBus)?', a: 'При повечето коли — не. При някои модели (основно BMW, Mercedes, VAG група) може да е нужен CanBus модул. Имаме такива и ще ти кажем предварително дали ти трябва.' },
  { q: 'Трудно ли се монтират?', a: 'Не. Plug & Play — слагаш ги на мястото на старите крушки за около 5 минути, без преправяне на инсталацията.' },
  { q: 'Как плащам и кога пристигат?', a: 'Плащаш с наложен платеж при получаване. Поръчка до 14:00 тръгва същия ден с Еконт или Спиди, доставка 1–2 работни дни.' },
  { q: 'Какво става, ако нещо не е наред?', a: 'Гаранция до 2 години и 14 дни право на връщане. Пиши ни във Viber — отговаряме бързо.' },
]

const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*, category:categories!category_id(name, slug)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (productError || !product) notFound()

  const p = product as Product & { category: { name: string; slug: string } | null }

  // Related: same category, different product
  const { data: related } = p.category_id
    ? await supabase
        .from('products')
        .select('id, name, slug, price, sale_price, images')
        .eq('published', true)
        .eq('category_id', p.category_id)
        .neq('id', p.id)
        .limit(4)
    : { data: [] }

  // Bundle relations for FBT
  const { data: bundleRelations } = await supabase
    .from('product_relations')
    .select('product:products!related_id(id, name, slug, price, sale_price, images)')
    .eq('product_id', p.id)
    .eq('type', 'bundle')
    .order('position')
  const bundleProducts = ((bundleRelations ?? []) as unknown as { product: { id: string; name: string; slug: string; price: number; sale_price: number | null; images: string[] } }[]).map(r => r.product)

  // Short description: lead sentence + key specs up top, the full structured text in the "Описание" tab
  const shortBlocks: DescBlock[] = p.short_description && !isRichHtml(p.short_description) ? parseDescription(sanitize(p.short_description)) : []
  const lead = shortBlocks[0]?.type === 'paragraph' ? shortBlocks[0].text : null
  const keySpecs = shortBlocks.flatMap(b => (b.type === 'specs' ? b.items : [])).slice(0, 4)
  const restBlocks = lead ? shortBlocks.slice(1) : shortBlocks
  const priceNote = p.short_description && /комплект от 2|2 броя/i.test(p.short_description) ? 'Цената е за комплект от 2 броя' : undefined

  // Skip the long description when it just repeats the short one
  const longHtml = p.description ? sanitize(p.description) : null
  const longIsDuplicate = !!(longHtml && p.short_description && plain(longHtml).slice(0, 80) === plain(p.short_description).slice(0, 80))
  const longBlocks = longHtml && !longIsDuplicate && !isRichHtml(longHtml) ? parseDescription(longHtml) : []

  const descriptionContent = restBlocks.length > 0 || longBlocks.length > 0 || (longHtml && !longIsDuplicate)
    ? (
        <div className="space-y-8">
          {restBlocks.length > 0 && <ProductDescription blocks={restBlocks} />}
          {longBlocks.length > 0 && <ProductDescription blocks={longBlocks} />}
          {longHtml && !longIsDuplicate && isRichHtml(longHtml) && <RichDescription html={longHtml} />}
        </div>
      )
    : null

  const isBulb = p.category?.slug === 'led-krushki'

  const effectivePrice = Number(p.sale_price ?? p.price)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.short_description ? p.short_description.replace(/<[^>]+>/g, '') : undefined,
    image: p.images ?? [],
    brand: { '@type': 'Brand', name: 'LED Ivanov Auto' },
    offers: {
      '@type': 'Offer',
      url: `${SITE}/products/${p.slug}`,
      priceCurrency: 'EUR',
      price: effectivePrice.toFixed(2),
      availability: p.stock_quantity === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'LED Ivanov Auto' },
    },
  }

  const breadcrumbItems: { name: string; item: string }[] = [
    { name: 'Начало', item: SITE },
    { name: 'Продукти', item: `${SITE}/products` },
  ]
  if (p.category) breadcrumbItems.push({ name: p.category.name, item: `${SITE}/products?category=${p.category.slug}` })
  breadcrumbItems.push({ name: p.name, item: `${SITE}/products/${p.slug}` })

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.item,
    })),
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 overflow-x-hidden">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-white transition-colors">Начало</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-white transition-colors">Продукти</Link>
        {p.category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${p.category.slug}`} className="hover:text-white transition-colors">{p.category.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-white line-clamp-1">{p.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 mb-12">

        {/* Gallery */}
        <div className="min-w-0">
          <ProductGallery images={p.images} name={p.name} />
        </div>

        {/* Info */}
        <div className="flex flex-col min-w-0">
          {p.category && (
            <Link
              href={`/products?category=${p.category.slug}`}
              className="text-accent text-xs uppercase tracking-[3px] font-bold hover:underline mb-3 inline-block"
            >
              {p.category.name}
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl font-black mb-3 leading-tight wrap-break-word">{p.name}</h1>

          <GoogleRatingBadge reviews={await getGoogleReviews()} className="self-start mb-4" />

          {lead && <p className="text-white text-[15px] leading-relaxed mb-5">{lead}</p>}

          {keySpecs.length > 0 && (
            <dl className="grid grid-cols-2 gap-2 mb-6">
              {keySpecs.map(s => (
                <div key={s.key} className="bg-surface border border-border rounded-xl px-3 py-2.5">
                  <dt className="text-[11px] uppercase tracking-wider text-white/60">{s.key}</dt>
                  <dd className="text-sm font-bold text-white leading-snug">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Short description we couldn't structure (rich HTML) */}
          {p.short_description && shortBlocks.length === 0 && (
            <div
              className="product-description text-white text-sm mb-6 leading-relaxed wrap-break-word overflow-hidden"
              dangerouslySetInnerHTML={{ __html: sanitize(p.short_description) }}
            />
          )}

          {/* Price + variation + add to cart */}
          <ProductActions product={p} categorySlug={(p as any).category?.slug} priceNote={priceNote} />

          {/* Separator */}
          <div className="h-px bg-border my-6" />

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3">
            {TRUST.map(b => (
              <div key={b.title} className="flex items-center gap-3 bg-surface border border-border rounded-xl px-3 py-2.5">
                <span className="text-accent shrink-0">{b.icon}</span>
                <div>
                  <p className="text-xs font-semibold leading-tight">{b.title}</p>
                  <p className="text-[11px] text-muted leading-tight">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Fitment help: the #1 question before buying bulbs */}
          <div className="mt-4 bg-surface border border-border rounded-xl p-4">
            <p className="text-sm font-bold text-white">Не знаеш дали пасват на колата ти?</p>
            <p className="text-xs text-white/70 mt-0.5 mb-3">Пиши ни марка и модел — отговаряме веднага, 24/7.</p>
            <div className="grid grid-cols-2 gap-2">
              <a href={VIBER} className="flex items-center justify-center gap-2 bg-[#7360f2] hover:bg-[#6554d6] text-white text-sm font-bold rounded-lg py-2.5 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Viber
              </a>
              <a href={`tel:${PHONE_RAW}`} className="flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white text-sm font-bold rounded-lg py-2.5 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Обади се
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Description tabs */}
      <ProductDescriptionTabs description={descriptionContent} attributes={p.attributes ?? []} />

      {isBulb && (
        <section className="mt-14 border-t border-border pt-10 max-w-3xl">
          <h2 className="text-xl font-black mb-5">Често задавани въпроси</h2>
          <div className="space-y-2">
            {BULB_FAQ.map(f => (
              <details key={f.q} className="group bg-surface border border-border rounded-xl px-4 py-3 open:border-accent/40">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-white text-[15px]">
                  {f.q}
                  <span className="text-accent text-xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-[15px] text-white/85 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Frequently Bought Together */}
      <FrequentlyBoughtTogether
        currentProduct={{ id: p.id, name: p.name, slug: p.slug, price: p.price, sale_price: p.sale_price, images: p.images }}
        categorySlug={(p as any).category?.slug}
        bundleProducts={bundleProducts}
      />

      {/* Related products */}
      {related && related.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="text-xl font-black mb-6">Подобни продукти</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/products/${r.slug}`}
                className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-accent transition-all"
              >
                {r.images?.[0] && (
                  <div className="aspect-square overflow-hidden bg-surface-2">
                    <img
                      src={r.images[0]}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs font-semibold line-clamp-2 mb-1.5">{r.name}</p>
                  <p className="text-accent font-bold text-sm">{Number(r.sale_price ?? r.price).toFixed(2)} €</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <AdminBar productId={p.id} />
    </div>
  )
}

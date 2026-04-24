import { createClient } from '@/lib/supabase/server'
import HeroFilter from '@/components/HeroFilter'
import ProductGrid from '@/components/ProductGrid'
import ProductSlider from '@/components/ProductSlider'
import TestimonialsSlider from '@/components/TestimonialsSlider'
import Link from 'next/link'
import Image from 'next/image'
import { PRODUCT_CATEGORIES } from '@/lib/categories'

const STATIC_PARTNERS = [
  { slug: 'kostas-garage',     name: "Kosta's Garage",      city: 'Бяла Слатина',                    phone: '+359895756194', cover_image: null as string | null, logo_url: null as string | null },
  { slug: 'dbr-tint',          name: 'DBR.tint',             city: 'с. Долна Бела Речка, обл. Монтана', phone: '+359885850342', cover_image: null, logo_url: null },
  { slug: 'antonio-dinchev',   name: 'Антонио Динчев',       city: 'Козлодуй',                         phone: '+359887723742', cover_image: null, logo_url: null },
  { slug: 'dzumbi-folio',      name: 'DZUMBI FOLIO',         city: 'Гоце Делчев',                      phone: '+359896853262', cover_image: null, logo_url: null },
  { slug: 'zlatnite-race-ses', name: 'Златните Ръце-СЕС',   city: 'с. Искра, обл. Силистра',          phone: '+359899872135', cover_image: null, logo_url: null },
  { slug: 'erik-auto',         name: 'Ерик Ауто',            city: 'Червен Бряг',                      phone: '+359877449103', cover_image: null, logo_url: null },
]

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: products }, { data: partnersData }, { data: categoriesData }] = await Promise.all([
    supabase.from('products').select('*').eq('published', true).order('position').limit(8),
    supabase.from('partners').select('slug,name,city,phone,cover_image,logo_url').eq('published', true).order('position').limit(6),
    supabase.from('categories').select('id,name,slug,parent_id').order('name'),
  ])
  const PARTNERS = (partnersData && partnersData.length > 0) ? partnersData : STATIC_PARTNERS
  const allDbCats = (categoriesData ?? []) as { id: string; name: string; slug: string; parent_id: string | null }[]
  const dbSubcategories = allDbCats.filter(c => c.parent_id)

  return (
    <>
      {/* ── Hero filter ───────────────────────────────────────────────── */}
      <HeroFilter />

      {/* ── Product series slider ─────────────────────────────────────── */}
      <ProductSlider />

      {/* ── Subcategory shortcuts ─────────────────────────────────────── */}
      {dbSubcategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-14 pb-0">
          <div className="text-center mb-8">
            <span className="text-xs font-bold tracking-[4px] uppercase text-accent mb-3 block">НАМЕРЕТЕ ЛЕД КРУШКИ ЗА:</span>
          </div>
          <div className={`grid gap-4 ${dbSubcategories.length <= 2 ? 'grid-cols-2' : dbSubcategories.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
            {dbSubcategories.map((cat, i) => {
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
              const img = `${supabaseUrl}/storage/v1/object/public/product-images/categories/${cat.slug}.webp`
              const hue = (i * 55 + 0) % 360
              return (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden border border-border hover:border-accent transition-all duration-200 aspect-video flex items-end p-4"
                >
                  <div className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 10%) 0%, #0d0d0d 100%)` }} />
                  <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity"
                    style={{ backgroundImage: `url(${img})` }} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="relative z-10 text-sm font-black uppercase leading-tight group-hover:text-accent transition-colors tracking-wide">
                    {cat.name.toUpperCase()}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Categories ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-[4px] uppercase text-accent mb-3 block">ПРОДУКТИ</span>
          <h2 className="text-2xl md:text-3xl font-black mb-2">КАТЕГОРИИ</h2>
          <p className="text-muted text-sm">Разгледай нашата гама от LED продукти за автомобили</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {PRODUCT_CATEGORIES.map((cat, i) => {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const img = `${supabaseUrl}/storage/v1/object/public/product-images/categories/${cat.slug}.webp`
            const hue = (i * 37 + 200) % 360
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative rounded-xl overflow-hidden border border-border hover:border-accent transition-all duration-200 aspect-square flex items-end p-2.5"
              >
                <div className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, hsl(${hue} 50% 12%) 0%, #0d0d0d 100%)` }} />
                <div className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${img})` }} />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent group-hover:from-black/50 transition-all" />
                <span className="relative z-10 text-[10px] font-bold leading-tight group-hover:text-accent transition-colors">
                  {cat.name.toUpperCase()}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Bestsellers ───────────────────────────────────────────────── */}
      <section className="bg-surface border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-bold tracking-[4px] uppercase text-accent mb-3 block">ТОП ПРОДУКТИ</span>
            <h2 className="text-2xl md:text-3xl font-black mb-2">НАЙ-ПРОДАВАНИ</h2>
            <p className="text-muted text-sm">Разгледай най-популярните продукти от LED IVANOV AUTO</p>
          </div>
          <ProductGrid products={products ?? []} />
          <div className="text-center mt-8">
            <Link href="/products"
              className="inline-block border border-accent text-accent hover:bg-accent hover:text-white px-8 py-3 rounded-lg font-bold transition-colors">
              ВСИЧКИ ПРОДУКТИ
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <TestimonialsSlider />

      {/* ── Partners ─────────────────────────────────────────────────── */}
      <section className="bg-surface border-y border-border py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold tracking-[4px] uppercase text-accent mb-3 block">МРЕЖА</span>
            <h2 className="text-2xl md:text-3xl font-black mb-2">ПАРТНЬОРСКИ СЕРВИЗИ</h2>
            <p className="text-muted text-sm max-w-lg mx-auto">
              Нашите продукти се монтират от сертифицирани авто електро сервизи в цяла България.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PARTNERS.map(p => (
              <Link key={p.slug} href={`/partners/${p.slug}`} className="bg-background border border-border rounded-xl p-5 hover:border-accent transition-colors group block">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all shrink-0 overflow-hidden">
                    {(p.logo_url || p.cover_image) ? (
                      <img src={(p.logo_url ?? p.cover_image)!} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-medium">Партньор</span>
                </div>
                <h3 className="font-bold text-sm mb-3">{p.name}</h3>
                <div className="space-y-1.5 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{p.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{p.phone}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <p className="text-xs text-muted">
              Искаш да станеш партньор?{' '}
              <Link href="/contact" className="text-accent hover:underline">Свържи се с нас</Link>
            </p>
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 border border-accent text-accent hover:bg-accent hover:text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
            >
              Виж всички партньори
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Location map ─────────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold tracking-[4px] uppercase text-accent mb-3 block">НАМЕРЕТЕ НИ</span>
          <h2 className="text-2xl md:text-3xl font-black mb-2">НАШИЯТ СЕРВИЗ</h2>
          <p className="text-muted text-sm mb-8">ж.к. Малинова долина, ул. „Георги Русев" 2, 1734 София</p>
          <a
            href="https://maps.google.com/?q=ул.+Георги+Русев+2,+жк+Малинова+долина,+1734+София"
            target="_blank"
            rel="noopener noreferrer"
            className="block relative rounded-2xl overflow-hidden border border-border shadow-xl shadow-black/30 hover:border-accent/50 transition-colors group"
            style={{ height: 340 }}
          >
            <Image
              src="/images/about.webp"
              alt="LED Ivanov Auto — ж.к. Малинова долина, София"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="inline-flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white text-sm font-bold px-5 py-2.5 rounded-full border border-white/20">
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Отвори в Google Maps
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* ── Trust badges ─────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            {
              icon: <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h1.172a2 2 0 011.414.586l2.828 2.828A2 2 0 0121 13.172V17a2 2 0 01-2 2h-1m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              title: 'Бърза доставка', sub: 'Еконт / Спиди',
            },
            {
              icon: <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              title: '2 год. гаранция', sub: 'На всички продукти',
            },
            {
              icon: <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              title: 'Plug & Play', sub: 'Монтаж за 5 мин.',
            },
            {
              icon: <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              title: '24/7 поддръжка', sub: 'Viber / Messenger',
            },
          ].map(b => (
            <div key={b.title}>
              <div className="text-accent mb-3">{b.icon}</div>
              <p className="font-bold text-sm mb-1">{b.title}</p>
              <p className="text-muted text-xs">{b.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

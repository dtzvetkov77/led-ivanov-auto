import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

type Partner = {
  id: string
  slug: string
  name: string
  city: string
  address: string
  phone: string
  hours: string
  contact_person: string | null
  description: string | null
  cover_image: string | null
  published: boolean
  position: number
}

type PartnerImage = {
  id: string
  partner_id: string
  url: string
  caption: string | null
  position: number
}

const STATIC_PARTNERS: Partner[] = [
  { id: '1', slug: 'kostas-garage', name: "Kosta's Garage", city: 'Бяла Слатина', address: 'ул. Панайот Хитов 1', phone: '+359895756194', hours: 'Всеки ден', contact_person: null, description: null, cover_image: null, published: true, position: 1 },
  { id: '2', slug: 'dbr-tint', name: 'DBR.tint', city: 'с. Долна Бела Речка, обл. Монтана', address: 'ул. Първа 40', phone: '+359885850342', hours: 'Всеки ден', contact_person: null, description: null, cover_image: null, published: true, position: 2 },
  { id: '3', slug: 'antonio-dinchev', name: 'Антонио Динчев', city: 'Козлодуй', address: 'Център', phone: '+359887723742', hours: 'Всеки ден', contact_person: null, description: null, cover_image: null, published: true, position: 3 },
  { id: '4', slug: 'dzumbi-folio', name: 'DZUMBI FOLIO', city: 'Гоце Делчев', address: 'ул. кмет Никола Атанасов 16', phone: '+359896853262', hours: 'Вс. 9:30–18:00', contact_person: null, description: null, cover_image: null, published: true, position: 4 },
  { id: '5', slug: 'zlatnite-race-ses', name: 'Златните Ръце-СЕС', city: 'с. Искра, обл. Силистра', address: 'ул. Образцова 17', phone: '+359899872135', hours: 'Пн–Нд 9:00–17:00', contact_person: null, description: null, cover_image: null, published: true, position: 5 },
  { id: '6', slug: 'erik-auto', name: 'Ерик Ауто', city: 'Червен Бряг', address: 'ул. Бузлуджа 53', phone: '+359877449103', hours: 'Пн–Пт 10:00–17:00, Съб 10:00–13:00', contact_person: null, description: null, cover_image: null, published: true, position: 6 },
  { id: '7', slug: 'alpha-garage', name: 'Alpha Garage', city: 'Сандански', address: 'Индустриална зона', phone: '+359882605533', hours: 'Всеки ден 9:00–18:00', contact_person: null, description: null, cover_image: null, published: true, position: 7 },
  { id: '8', slug: 'georgi-videv', name: 'Георги Видев', city: 'обл. Казанлък', address: '—', phone: '+359897266437', hours: 'Всеки ден', contact_person: null, description: null, cover_image: null, published: true, position: 8 },
  { id: '9', slug: 'auto-union-19', name: 'Ауто Юнион19 ЕООД', city: 'Асеновград', address: '—', phone: '+359897211675', hours: 'Всеки ден', contact_person: 'Йордан Авков', description: null, cover_image: null, published: true, position: 9 },
]

export async function generateStaticParams() {
  return STATIC_PARTNERS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const partner = STATIC_PARTNERS.find(p => p.slug === slug)
  const name = partner?.name ?? slug
  return {
    title: `${name} | Партньорски сервизи | LED Ivanov Auto`,
    description: `${name} — партньорски сервиз на LED Ivanov Auto в ${partner?.city ?? ''}. Полиране на фарове и автомобилна козметика.`,
  }
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let partner: Partner | null = null
  let images: PartnerImage[] = []

  try {
    const supabase = await createClient()
    const { data: partnerData } = await supabase
      .from('partners')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (partnerData) {
      partner = partnerData as Partner
      const { data: imageData } = await supabase
        .from('partner_images')
        .select('*')
        .eq('partner_id', partner.id)
        .order('position')
      images = (imageData ?? []) as PartnerImage[]
    }
  } catch {
    // fall through to static
  }

  if (!partner) {
    partner = STATIC_PARTNERS.find(p => p.slug === slug) ?? null
  }

  if (!partner) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Back link */}
        <Link
          href="/partners"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-10"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 16l-4-4m0 0l4-4m-4 4h18" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Всички партньори
        </Link>

        {/* Partner name */}
        <div className="mb-8">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">Партньорски сервиз</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            {partner.name}
          </h1>
          <p className="text-accent text-lg font-medium mt-2">{partner.city}</p>
        </div>

        {/* Info card */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-5">Информация</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {partner.address && partner.address !== '—' && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Адрес</p>
                  <p className="text-white text-sm">{partner.address}, {partner.city}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Телефон</p>
                <a
                  href={`tel:${partner.phone}`}
                  className="text-white text-sm hover:text-accent transition-colors"
                >
                  {partner.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Работно време</p>
                <p className="text-white text-sm">{partner.hours}</p>
              </div>
            </div>
            {partner.contact_person && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Лице за контакт</p>
                  <p className="text-white text-sm">{partner.contact_person}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {partner.description && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">За сервиза</h2>
            <p className="text-white/80 leading-relaxed">{partner.description}</p>
          </div>
        )}

        {/* Gallery */}
        {images.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Галерия</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map(img => (
                <div key={img.id} className="aspect-square overflow-hidden rounded-xl bg-surface border border-border">
                  <img
                    src={img.url}
                    alt={img.caption ?? partner!.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Запази час</h2>
          <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
            Свържи се директно със сервиза или се обади на нашия основен офис за повече информация.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`tel:${partner.phone}`}
              className="inline-flex items-center gap-2 bg-accent text-black font-semibold text-sm px-6 py-3 rounded-xl hover:bg-accent/90 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Обади се
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-border text-white font-semibold text-sm px-6 py-3 rounded-xl hover:border-accent/50 hover:bg-white/5 transition-colors"
            >
              Контактна форма
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

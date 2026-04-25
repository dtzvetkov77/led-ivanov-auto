import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Партньорски сервизи | LED Ivanov Auto',
  description: 'Намери авторизиран партньорски сервиз на LED Ivanov Auto близо до теб. Полиране на фарове, фолиране и автомобилна козметика в цялата страна.',
}

type Partner = {
  id: string
  slug: string
  name: string
  city: string
  address: string
  phone: string
  hours: string
  contact_person: string | null
  cover_image: string | null
  logo_url: string | null
  published: boolean
  position: number
}

const STATIC_PARTNERS: Partner[] = [
  { id: '1', slug: 'kostas-garage', name: "Kosta's Garage", city: 'Бяла Слатина', address: 'ул. Панайот Хитов 1', phone: '+359895756194', hours: 'Всеки ден', contact_person: null, logo_url: null, cover_image: null, published: true, position: 1 },
  { id: '2', slug: 'dbr-tint', name: 'DBR.tint', city: 'с. Долна Бела Речка, обл. Монтана', address: 'ул. Първа 40', phone: '+359885850342', hours: 'Всеки ден', contact_person: null, logo_url: null, cover_image: null, published: true, position: 2 },
  { id: '3', slug: 'antonio-dinchev', name: 'Антонио Динчев', city: 'Козлодуй', address: 'Център', phone: '+359887723742', hours: 'Всеки ден', contact_person: null, logo_url: null, cover_image: null, published: true, position: 3 },
  { id: '4', slug: 'dzumbi-folio', name: 'DZUMBI FOLIO', city: 'Гоце Делчев', address: 'ул. кмет Никола Атанасов 16', phone: '+359896853262', hours: 'Вс. 9:30–18:00', contact_person: null, logo_url: null, cover_image: null, published: true, position: 4 },
  { id: '5', slug: 'zlatnite-race-ses', name: 'Златните Ръце-СЕС', city: 'с. Искра, обл. Силистра', address: 'ул. Образцова 17', phone: '+359899872135', hours: 'Пн–Нд 9:00–17:00', contact_person: null, logo_url: null, cover_image: null, published: true, position: 5 },
  { id: '6', slug: 'erik-auto', name: 'Ерик Ауто', city: 'Червен Бряг', address: 'ул. Бузлуджа 53', phone: '+359877449103', hours: 'Пн–Пт 10:00–17:00, Съб 10:00–13:00', contact_person: null, logo_url: null, cover_image: null, published: true, position: 6 },
  { id: '7', slug: 'alpha-garage', name: 'Alpha Garage', city: 'Сандански', address: 'Индустриална зона', phone: '+359882605533', hours: 'Всеки ден 9:00–18:00', contact_person: null, logo_url: null, cover_image: null, published: true, position: 7 },
  { id: '8', slug: 'georgi-videv', name: 'Георги Видев', city: 'обл. Казанлък', address: '—', phone: '+359897266437', hours: 'Всеки ден', contact_person: null, logo_url: null, cover_image: null, published: true, position: 8 },
  { id: '9', slug: 'auto-union-19', name: 'Ауто Юнион19 ЕООД', city: 'Асеновград', address: '—', phone: '+359897211675', hours: 'Всеки ден', contact_person: 'Йордан Авков', logo_url: null, cover_image: null, published: true, position: 9 },
]

export default async function PartnersPage() {
  let partners: Partner[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('partners')
      .select('*')
      .eq('published', true)
      .order('position')
    partners = (data ?? []) as Partner[]
  } catch {
    partners = []
  }

  if (partners.length === 0) {
    partners = STATIC_PARTNERS
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-3">Мрежа от партньори</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white mb-4">
            Партньорски сервизи
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Намери сервиз близо до теб
          </p>
        </div>

        {/* Featured — LED Ivanov Auto */}
        <div className="mb-10">
          <div className="relative border border-accent/60 bg-accent/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-lg shadow-accent/10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/15 px-2 py-0.5 rounded-full">Основен сервиз</span>
              </div>
              <h2 className="text-xl font-bold text-white">LED Ivanov Auto</h2>
              <p className="text-accent font-medium text-sm mt-0.5">ж.к. Малинова долина, Sofia</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  ж.к. Малинова долина, София
                </span>
              </div>
            </div>
            <Link
              href="/contact"
              className="shrink-0 inline-flex items-center gap-2 bg-accent text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-accent/90 transition-colors"
            >
              Свържи се
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Partners grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {partners.map(partner => {
            const banner = partner.cover_image ?? partner.logo_url
            return (
              <Link
                key={partner.slug}
                href={`/partners/${partner.slug}`}
                className="group block bg-surface border border-border hover:border-accent/50 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-accent/5"
              >
                {/* Banner image */}
                <div className="relative w-full h-44 bg-black">
                  {banner ? (
                    <img src={banner} alt={partner.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-accent/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <span className="absolute top-3 right-3 text-xs bg-accent text-white px-2 py-0.5 rounded-full font-medium">Партньор</span>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors mb-1">{partner.name}</h3>
                  <p className="text-accent text-sm font-medium mb-3">{partner.city}</p>

                  <div className="space-y-1.5 text-sm text-muted">
                    {partner.address && partner.address !== '—' && (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{partner.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{partner.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{partner.hours}</span>
                    </div>
                    {partner.contact_person && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{partner.contact_person}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs text-accent/70 group-hover:text-accent transition-colors">
                    <span>Виж детайли</span>
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}

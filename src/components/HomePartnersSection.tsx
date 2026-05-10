'use client'
import { useState } from 'react'
import Link from 'next/link'

type Partner = {
  slug: string
  name: string
  city: string
  phone: string
  cover_image: string | null
  logo_url: string | null
}

type Props = { partners: Partner[] }

export default function HomePartnersSection({ partners }: Props) {
  const [activeCity, setActiveCity] = useState<string | null>(null)

  const cities = [...new Set(partners.map(p => p.city))].sort((a, b) => a.localeCompare(b, 'bg'))
  const visible = activeCity ? partners.filter(p => p.city === activeCity) : partners

  return (
    <section className="bg-surface border-y border-border py-14 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-[4px] uppercase text-accent mb-3 block">МРЕЖА</span>
          <h2 className="text-2xl md:text-3xl font-black mb-2">ПАРТНЬОРСКИ СЕРВИЗИ</h2>
          <p className="text-muted text-sm max-w-lg mx-auto">
            Нашите продукти се монтират от сертифицирани авто електро сервизи в цяла България.
          </p>
        </div>

        {/* City filter bubbles */}
        {cities.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveCity(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCity === null
                  ? 'bg-accent text-white'
                  : 'bg-background border border-border text-muted hover:border-accent/50 hover:text-white'
              }`}
            >
              Всички ({partners.length})
            </button>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setActiveCity(city === activeCity ? null : city)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCity === city
                    ? 'bg-accent text-white'
                    : 'bg-background border border-border text-muted hover:border-accent/50 hover:text-white'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(p => {
            const banner = p.cover_image ?? p.logo_url
            return (
              <Link key={p.slug} href={`/partners/${p.slug}`} className="bg-background border border-border rounded-xl overflow-hidden hover:border-accent transition-colors group block">
                <div className="relative w-full h-40 bg-black">
                  {banner ? (
                    <img src={banner} alt={p.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-accent/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <span className="absolute top-2.5 right-2.5 text-xs bg-accent text-white px-2 py-0.5 rounded-full font-medium">Партньор</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-2 group-hover:text-accent transition-colors">{p.name}</h3>
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
                </div>
              </Link>
            )
          })}
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
  )
}

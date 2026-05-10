'use client'
import { useState } from 'react'
import Link from 'next/link'

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
}

type Props = { partners: Partner[] }

export default function PartnersGrid({ partners }: Props) {
  const [activeCity, setActiveCity] = useState<string | null>(null)

  // Extract unique cities, sorted
  const cities = [...new Set(partners.map(p => p.city))].sort((a, b) => a.localeCompare(b, 'bg'))

  const visible = activeCity ? partners.filter(p => p.city === activeCity) : partners

  return (
    <>
      {/* City bubble filters */}
      {cities.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCity(null)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCity === null
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-muted hover:border-accent/50 hover:text-white'
            }`}
          >
            Всички ({partners.length})
          </button>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setActiveCity(city === activeCity ? null : city)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCity === city
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-muted hover:border-accent/50 hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Partners grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map(partner => {
          const banner = partner.cover_image ?? partner.logo_url
          return (
            <Link
              key={partner.slug}
              href={`/partners/${partner.slug}`}
              className="group block bg-surface border border-border hover:border-accent/50 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-accent/5"
            >
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

      {visible.length === 0 && (
        <p className="text-center text-muted py-12">Няма партньори в {activeCity}</p>
      )}
    </>
  )
}

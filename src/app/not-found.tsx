import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Страницата не е намерена | LED Ivanov Auto',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Big 404 */}
      <p className="font-display font-black text-accent select-none leading-none mb-2"
        style={{ fontSize: 'clamp(6rem, 20vw, 14rem)', opacity: 0.15 }}>
        404
      </p>

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-6 -mt-10">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35" strokeLinecap="round"/>
          <path d="M11 8v3M11 14h.01" strokeLinecap="round"/>
        </svg>
      </div>

      <h1 className="text-2xl md:text-3xl font-black mb-3">Страницата не е намерена</h1>
      <p className="text-muted text-sm md:text-base max-w-sm mb-8 leading-relaxed">
        Изглежда тази страница не съществува или е преместена. Провери URL адреса или се върни към началото.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Начало
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 border border-border hover:border-accent/50 text-muted hover:text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          Всички продукти
        </Link>
      </div>
    </div>
  )
}

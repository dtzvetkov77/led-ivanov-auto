'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

const SLIDES = [
  {
    badge: 'ULTIMATE BLACK',
    title: 'LED КРУШКИ СЕРИЯ',
    highlight: 'ULTIMATE\nBLACK',
    tagline: '+500% ПОВЕЧЕ СВЕТЛИНА',
    sub: 'По-силна светлина. По-дълъг живот. Без компромиси.',
    stats: ['+500% светлина', '200W', 'Plug & Play', 'Без CanBus грешки'],
    href: '/products?category=led-krushki',
    img: '/images/products/ultimate-black.png',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #020a1a 100%)',
    glow: 'rgba(30,100,220,0.18)',
    accent: '#1a64dc',
  },
  {
    badge: 'SPORT RED SERIES',
    title: 'LED КРУШКИ СЕРИЯ',
    highlight: 'SPORT\nRED',
    tagline: '+500% ПОВЕЧЕ СВЕТЛИНА',
    sub: 'Стил и мощност в едно. Агресивен дизайн.',
    stats: ['+500% светлина', '180W', 'Plug & Play', 'Без CanBus грешки'],
    href: '/products?category=led-krushki',
    img: '/images/products/sport-red.png',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #200505 100%)',
    glow: 'rgba(220,0,0,0.2)',
    accent: '#e00000',
  },
  {
    badge: 'D-СЕРИЯ · GREEN LINE',
    title: 'D-СЕРИЯ',
    highlight: 'ЕВОЛЮЦИЯТА\nНА КСЕНОНА',
    tagline: '+380% ПОВЕЧЕ СВЕТЛИНА',
    sub: 'Директна смяна без преработки. Plug & Play монтаж.',
    stats: ['+380% светлина', '110W', 'Plug & Play', '4 год. гаранция'],
    href: '/products?category=led-krushki',
    img: '/images/products/d-series.png',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #041204 100%)',
    glow: 'rgba(34,160,60,0.12)',
    accent: '#22a03c',
  },
]

export default function ProductSlider() {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)
  const touchStartX = useRef<number | null>(null)

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [paused, next])

  const s = SLIDES[current]

  return (
    <section
      className="relative overflow-hidden border-y border-border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchStartX.current === null) return
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); setPaused(true) }
        touchStartX.current = null
      }}
    >
      {/* BG */}
      <div className="absolute inset-0 transition-all duration-700" style={{ background: s.bg }} />
      <div className="absolute inset-0 transition-all duration-700"
        style={{ background: `radial-gradient(ellipse 60% 80% at 70% 50%, ${s.glow} 0%, transparent 70%)` }} />
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-20 min-h-[520px] md:min-h-0 flex flex-col justify-center">
        <div className="grid md:grid-cols-2 gap-2 items-center">

          {/* ── Text ── */}
          <div className="text-center md:text-left">
            <span className="inline-block text-[11px] font-bold tracking-[4px] uppercase mb-3"
              style={{ color: s.accent }}>
              {s.badge}
            </span>

            <h2 className="font-display font-black leading-none mb-3 uppercase tracking-wide"
              style={{ fontSize: 'clamp(1.6rem, 5.5vw, 4rem)' }}>
              {s.title.split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
              {s.highlight.split('\n').map((l, i) => (
                <span key={i} className="block" style={{ color: s.accent }}>{l}</span>
              ))}
            </h2>

            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-3 border"
              style={{ background: `${s.accent}18`, borderColor: `${s.accent}30` }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" style={{ color: s.accent }}>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span className="text-xs font-bold" style={{ color: s.accent }}>{s.tagline}</span>
            </div>

            <p className="text-muted text-sm mb-4 leading-relaxed">{s.sub}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
              {s.stats.map(st => (
                <span key={st} className="bg-white/5 border border-white/10 text-xs text-muted-2 px-3 py-1.5 rounded-lg">
                  {st}
                </span>
              ))}
            </div>

            {/* Desktop button */}
            <div className="hidden md:flex justify-start">
              <Link
                href={s.href}
                className="inline-flex items-center gap-2 text-white font-bold px-7 py-3 rounded-xl transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: s.accent }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.98-1.67L23 6H6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                КУПЕТЕ СЕГА
              </Link>
            </div>
          </div>

          {/* ── Image ── */}
          <div className="relative flex items-center justify-center h-32 md:min-h-105">
            {/* Glow behind image */}
            <div className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full blur-3xl opacity-25 transition-all duration-700"
              style={{ background: s.accent }} />
            <img
              key={s.img}
              src={s.img}
              alt={s.badge}
              className="relative z-10 h-full max-h-32 md:max-h-none md:w-full md:max-w-120 mx-auto object-contain drop-shadow-2xl animate-[fadeIn_0.5s_ease]"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        </div>

        {/* Mobile button */}
        <div className="md:hidden flex justify-center mt-3">
          <Link
            href={s.href}
            className="inline-flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-xl transition-all w-full max-w-56 justify-center text-sm"
            style={{ background: s.accent }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.98-1.67L23 6H6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            КУПЕТЕ СЕГА
          </Link>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setPaused(true) }}
              aria-label={`Slide ${i + 1}`}
              className="transition-all duration-300 rounded-full"
              style={{
                width:  i === current ? 28 : 8,
                height: 8,
                background: i === current ? s.accent : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Prev / Next */}
      {(['prev', 'next'] as const).map(dir => (
        <button
          key={dir}
          onClick={() => { dir === 'prev' ? prev() : next(); setPaused(true) }}
          className={`absolute top-1/2 -translate-y-1/2 z-20 ${dir === 'prev' ? 'left-3' : 'right-3'} w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-black/70 border border-white/10 rounded-full transition-colors`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d={dir === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ))}
    </section>
  )
}

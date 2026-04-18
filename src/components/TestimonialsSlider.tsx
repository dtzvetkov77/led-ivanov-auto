'use client'
import { useState, useEffect, useCallback } from 'react'

const COLORS = ['#cc0000', '#1a6be0', '#e07b00', '#228844', '#7b22cc', '#cc6600']

const TESTIMONIALS = [
  {
    name: 'Георги Петров',
    photo: '/images/customers/georgi.jpg',
    car: 'BMW E46',
    text: 'Много съм доволен! Светят изключително силно, а монтажът беше буквално за 5 минути. Каренето стана удоволствие – виждам пътя като ден.',
    stars: 5,
  },
  {
    name: 'Николай Димитров',
    photo: '/images/customers/nikolay.jpg',
    car: 'Mercedes W204',
    text: 'Не очаквах такова качество за тази цена. Светлината е бяла и ясна, без разсейване. Минаха над 6 месеца – никакъв проблем.',
    stars: 5,
  },
  {
    name: 'Иван Стоянов',
    photo: '/images/customers/ivan.jpg',
    car: 'Audi A4',
    text: 'Ползвам ги вече 3 месеца – никакви проблеми. Няма грешки по таблото, не мигат и светят супер стабилно. Препоръчвам!',
    stars: 5,
  },
  {
    name: 'Мартин Василев',
    photo: '/images/customers/martin.jpg',
    car: 'BMW E90',
    text: 'Поръчах за BMW E90 – монтажът беше лесен и без CanBus грешки. Изглеждат страхотно нощем. Вече поръчах и за второто ми коло.',
    stars: 5,
  },
  {
    name: 'Димитър Колев',
    photo: '/images/customers/dimitar.jpg',
    car: 'VW Golf 7',
    text: 'Бързо обслужване, продуктът дойде добре опакован. Монтирах ги сам за 10 минути. Разликата е огромна – препоръчвам на всички!',
    stars: 5,
  },
  {
    name: 'Стефан Иванов',
    photo: '/images/customers/stefan.jpg',
    car: 'Toyota Corolla',
    text: 'Отличен продукт! Светят много по-силно от оригиналните халогени. Цената е достъпна, качеството е на ниво. Поръчах и за жена ми.',
    stars: 5,
  },
]

const TOTAL = TESTIMONIALS.length
const DESK_PAGES = 2 // 6 items / 3 per page

function Card({ t, index }: { t: typeof TESTIMONIALS[0]; index: number }) {
  const [imgFailed, setImgFailed] = useState(false)
  const color = COLORS[index % COLORS.length]

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-border bg-surface">
      {/* Square photo */}
      <div className="relative aspect-square">
        {!imgFailed ? (
          <img
            src={t.photo}
            alt={t.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: `radial-gradient(ellipse at 50% 40%, ${color}22 0%, #080808 80%)` }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: `${color}50`, background: `${color}18` }}
            >
              <span className="text-5xl font-black" style={{ color }}>{t.name[0]}</span>
            </div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: `${color}99` }}>{t.car}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-surface to-transparent" />
      </div>

      {/* Content */}
      <div className="px-4 pt-1 pb-4 flex flex-col gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: t.stars }).map((_, s) => (
            <svg key={s} className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>
        <p className="text-xs text-muted-2 leading-relaxed line-clamp-3">&ldquo;{t.text}&rdquo;</p>
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: color }}
          >
            {t.name[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-tight truncate">{t.name}</p>
            <p className="text-[11px] text-muted">{t.car}</p>
          </div>
          <div className="ml-auto shrink-0">
            <span className="text-[10px] bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full font-medium">
              ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function NavButton({ onClick, dir }: { onClick: () => void; dir: 'prev' | 'next' }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center bg-surface border border-border hover:border-accent hover:text-accent rounded-full transition-colors text-muted"
      aria-label={dir === 'prev' ? 'Предишен' : 'Следващ'}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d={dir === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

export default function TestimonialsSlider() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  const nextMobile = useCallback(() => setIdx(i => (i + 1) % TOTAL), [])
  const nextDesktop = useCallback(() => setIdx(i => (i + 3) % TOTAL), [])
  const prevDesktop = useCallback(() => setIdx(i => (i - 3 + TOTAL) % TOTAL), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(nextMobile, 6000)
    return () => clearInterval(t)
  }, [paused, nextMobile])

  const deskPage = Math.floor(idx / 3)
  const deskItems = TESTIMONIALS.slice(deskPage * 3, deskPage * 3 + 3)

  return (
    <section
      className="py-20 px-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold tracking-[4px] uppercase text-accent mb-3">КЛИЕНТСКИ МНЕНИЯ</span>
          <h2 className="text-3xl md:text-4xl font-black mb-3">КАКВО КАЗВАТ НАШИТЕ КЛИЕНТИ</h2>
          <p className="text-muted max-w-xl mx-auto text-sm">
            Реални мнения от верифицирани купувачи. Без редактиране.
          </p>
        </div>

        {/* Desktop: 3 cards */}
        <div className="hidden md:grid grid-cols-3 gap-5">
          {deskItems.map((t, i) => (
            <Card key={t.name} t={t} index={deskPage * 3 + i} />
          ))}
        </div>

        {/* Mobile: peek slider */}
        <div className="md:hidden overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              gap: '12px',
              transform: `translateX(calc(-${idx} * (82vw + 12px)))`,
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="shrink-0 transition-opacity duration-300"
                style={{ width: '82vw', opacity: i === idx ? 1 : 0.45 }}
                onClick={() => { setIdx(i); setPaused(true) }}
              >
                <Card t={t} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {/* Desktop nav */}
          <span className="hidden md:block">
            <NavButton onClick={() => { prevDesktop(); setPaused(true) }} dir="prev" />
          </span>

          {/* Desktop dots: 2 pages */}
          <div className="hidden md:flex gap-2">
            {Array.from({ length: DESK_PAGES }).map((_, p) => (
              <button
                key={p}
                onClick={() => { setIdx(p * 3); setPaused(true) }}
                aria-label={`Страница ${p + 1}`}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: p === deskPage ? 24 : 8,
                  height: 8,
                  background: p === deskPage ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>

          {/* Mobile: dots only (tapping peeked card advances too) */}
          <div className="md:hidden flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setIdx(i); setPaused(true) }}
                aria-label={`Мнение ${i + 1}`}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === idx ? 20 : 8,
                  height: 8,
                  background: i === idx ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>

          <span className="hidden md:block">
            <NavButton onClick={() => { nextDesktop(); setPaused(true) }} dir="next" />
          </span>
        </div>
      </div>
    </section>
  )
}

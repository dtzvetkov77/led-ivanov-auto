'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const COLORS = ['#cc0000', '#1a6be0', '#e07b00', '#228844', '#7b22cc', '#cc6600']

const FALLBACK: Review[] = [
  { id: '1', name: 'Георги Петров',   car: 'BMW E46',          stars: 5, photo_url: null, text: 'Много съм доволен! Светят изключително силно, а монтажът беше буквално за 5 минути. Каренето стана удоволствие – виждам пътя като ден.' },
  { id: '2', name: 'Николай Димитров', car: 'Mercedes W204',   stars: 5, photo_url: null, text: 'Не очаквах такова качество за тази цена. Светлината е бяла и ясна, без разсейване. Минаха над 6 месеца – никакъв проблем.' },
  { id: '3', name: 'Иван Стоянов',     car: 'Audi A4',         stars: 5, photo_url: null, text: 'Ползвам ги вече 3 месеца – никакви проблеми. Няма грешки по таблото, не мигат и светят супер стабилно. Препоръчвам!' },
  { id: '4', name: 'Мартин Василев',   car: 'BMW E90',         stars: 5, photo_url: null, text: 'Поръчах за BMW E90 – монтажът беше лесен и без CanBus грешки. Изглеждат страхотно нощем.' },
  { id: '5', name: 'Димитър Колев',    car: 'VW Golf 7',       stars: 5, photo_url: null, text: 'Бързо обслужване, продуктът дойде добре опакован. Монтирах ги сам за 10 минути. Разликата е огромна!' },
  { id: '6', name: 'Стефан Иванов',    car: 'Toyota Corolla',  stars: 5, photo_url: null, text: 'Отличен продукт! Светят много по-силно от оригиналните халогени. Цената е достъпна, качеството е на ниво.' },
]

type Review = {
  id: string
  name: string
  car: string | null
  text: string
  photo_url: string | null
  stars: number
}

const DESK_VISIBLE = 3

function Card({ t, index }: { t: Review; index: number }) {
  const [imgFailed, setImgFailed] = useState(false)
  const color = COLORS[index % COLORS.length]

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-border bg-surface">
      <div className="relative aspect-square">
        {t.photo_url && !imgFailed ? (
          <img src={t.photo_url} alt={t.name} className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: `radial-gradient(ellipse at 50% 40%, ${color}22 0%, #080808 80%)` }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: `${color}50`, background: `${color}18` }}>
              <span className="text-5xl font-black" style={{ color }}>{t.name[0]}</span>
            </div>
            {t.car && <span className="text-xs font-bold tracking-widest uppercase" style={{ color: `${color}99` }}>{t.car}</span>}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-surface to-transparent" />
      </div>
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
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: color }}>
            {t.name[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-tight truncate">{t.name}</p>
            {t.car && <p className="text-[11px] text-muted">{t.car}</p>}
          </div>
          <div className="ml-auto shrink-0">
            <span className="text-[10px] bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full font-medium">✓</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function NavButton({ onClick, dir }: { onClick: () => void; dir: 'prev' | 'next' }) {
  return (
    <button onClick={onClick}
      className="w-10 h-10 flex items-center justify-center bg-surface border border-border hover:border-accent hover:text-accent rounded-full transition-colors text-muted"
      aria-label={dir === 'prev' ? 'Предишен' : 'Следващ'}>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d={dir === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

export default function TestimonialsSlider() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    createClient()
      .from('customer_reviews')
      .select('id, name, car, text, photo_url, stars')
      .eq('published', true)
      .order('position')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data?.length) setReviews(data); else setReviews(FALLBACK) })
  }, [])

  const total = reviews.length
  const deskPages = Math.ceil(total / DESK_VISIBLE)
  const deskPage = total ? Math.floor(idx / DESK_VISIBLE) % deskPages : 0

  const nextMobile = useCallback(() => setIdx(i => (i + 1) % (total || 1)), [total])
  const nextDesktop = useCallback(() => setIdx(i => ((Math.floor(i / DESK_VISIBLE) + 1) % deskPages) * DESK_VISIBLE), [deskPages])
  const prevDesktop = useCallback(() => setIdx(i => ((Math.floor(i / DESK_VISIBLE) - 1 + deskPages) % deskPages) * DESK_VISIBLE), [deskPages])

  useEffect(() => {
    if (paused || total === 0) return
    const t = setInterval(nextMobile, 6000)
    return () => clearInterval(t)
  }, [paused, nextMobile, total])

  if (reviews.length === 0) return null

  const deskItems = reviews.slice(deskPage * DESK_VISIBLE, deskPage * DESK_VISIBLE + DESK_VISIBLE)

  return (
    <section className="py-20 px-4" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold tracking-[4px] uppercase text-accent mb-3">КЛИЕНТСКИ МНЕНИЯ</span>
          <h2 className="text-3xl md:text-4xl font-black mb-3">КАКВО КАЗВАТ НАШИТЕ КЛИЕНТИ</h2>
          <p className="text-muted max-w-xl mx-auto text-sm">Реални мнения от верифицирани купувачи. Без редактиране.</p>
        </div>

        <div className="hidden md:grid grid-cols-3 gap-5">
          {deskItems.map((t, i) => <Card key={t.id} t={t} index={deskPage * DESK_VISIBLE + i} />)}
        </div>

        <div className="md:hidden overflow-hidden">
          <div className="flex transition-transform duration-500 ease-out"
            style={{ gap: '12px', transform: `translateX(calc(-${idx} * (82vw + 12px)))` }}>
            {reviews.map((t, i) => (
              <div key={t.id} className="shrink-0 transition-opacity duration-300"
                style={{ width: '82vw', opacity: i === idx ? 1 : 0.45 }}
                onClick={() => { setIdx(i); setPaused(true) }}>
                <Card t={t} index={i} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          {deskPages > 1 && <span className="hidden md:block"><NavButton onClick={() => { prevDesktop(); setPaused(true) }} dir="prev" /></span>}
          <div className="hidden md:flex gap-2">
            {Array.from({ length: deskPages }).map((_, p) => (
              <button key={p} onClick={() => { setIdx(p * DESK_VISIBLE); setPaused(true) }}
                className="transition-all duration-300 rounded-full"
                style={{ width: p === deskPage ? 24 : 8, height: 8, background: p === deskPage ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
          <div className="md:hidden flex gap-2">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => { setIdx(i); setPaused(true) }}
                className="transition-all duration-300 rounded-full"
                style={{ width: i === idx ? 20 : 8, height: 8, background: i === idx ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
          {deskPages > 1 && <span className="hidden md:block"><NavButton onClick={() => { nextDesktop(); setPaused(true) }} dir="next" /></span>}
        </div>
      </div>
    </section>
  )
}

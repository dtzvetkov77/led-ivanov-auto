import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { createClient } from '@/lib/supabase/server'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ledivanov.bg'

export const metadata: Metadata = {
  title: 'Полиране на фарове | LED Ivanov Auto',
  description: 'Професионално полиране и възстановяване на фарове в София. Премахваме пожълтяването и мътността за кристална прозрачност и ярка светлина. Гаранция за резултата.',
}

const STEPS = [
  {
    n: '01',
    title: 'Оценка на състоянието',
    desc: 'Преглеждаме фаровете и определяме степента на окисление. Уведомяваме те за очаквания резултат преди да започнем.',
  },
  {
    n: '02',
    title: 'Почистване и подготовка',
    desc: 'Внимателно почистваме повърхността от замърсявания и обезмасляваме пластмасата за оптимален контакт.',
  },
  {
    n: '03',
    title: 'Шлайфане',
    desc: 'Премахваме окислената горна слойка чрез прецизно шлайфане с няколко степени на фина шкурка.',
  },
  {
    n: '04',
    title: 'Полиране и запечатване',
    desc: 'Полираме до блясък и нанасяме UV-защитен лак, който забавя повторното окисление с до 2 години.',
  },
]

const STATS = [
  { value: 'до 80%', label: 'по-малко светлина при пожълтели фарове' },
  { value: '~ 1 ч.', label: 'средно време за обработка' },
  { value: 'до 2г.', label: 'UV защита след запечатване' },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Полиране на фарове',
  serviceType: 'Automotive Headlight Restoration',
  description: 'Професионално полиране и възстановяване на пожълтели и мътни фарове. Шлайфане, полиране и UV-защитно запечатване. Гаранция за резултата.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'LED Ivanov Auto',
    url: SITE,
    telephone: '+359999997996',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Георги Русев 2',
      addressLocality: 'София',
      postalCode: '1734',
      addressCountry: 'BG',
    },
  },
  areaServed: { '@type': 'Country', name: 'Bulgaria' },
  url: `${SITE}/services/headlight-polishing`,
  image: `${SITE}/images/services/headlight-polishing-hero.webp`,
}

const STATIC_PAIRS = [
  { id: 's1', before_url: '/images/services/before-1.webp', after_url: '/images/services/after-1.webp', label: 'BMW 5 серия — пожълтели фарове след 8 години' },
  { id: 's2', before_url: '/images/services/before-2.webp', after_url: '/images/services/after-2.webp', label: 'Toyota Corolla — мътни фарове след UV увреждане' },
]

export default async function HeadlightPolishingPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('service_before_after')
    .select('id, before_url, after_url, label')
    .eq('service', 'headlight-polishing')
    .eq('published', true)
    .order('position')
  const pairs = (data && data.length > 0) ? data : STATIC_PAIRS

  return (
    <div className="bg-background min-h-screen text-white">
      <JsonLd data={serviceSchema} />

      {/* ── Before / After (top) ── */}
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-8">
        <div className="text-center mb-8">
          <p className="text-accent text-xs tracking-[5px] uppercase font-medium mb-3">Резултати</p>
          <h2 className="text-3xl font-black">ПРЕДИ И СЛЕД</h2>
          <p className="text-muted text-sm mt-2">Реални резултати от нашия сервиз</p>
        </div>
        <div className="space-y-6">
          {pairs.map(pair => (
            <BeforeAfterPair
              key={pair.id}
              before={pair.before_url}
              after={pair.after_url}
              label={pair.label ?? ''}
            />
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="hidden md:block absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/hero.webp)' }} />
        <div className="md:hidden absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: 'url(/images/hero-mobile.webp)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.3) 40%, rgba(10,10,10,0.85) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(180,0,0,0.2) 0%, transparent 70%)' }} />

        <div className="relative z-10 text-center px-4 py-20 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-xs px-4 py-1.5 rounded-full font-semibold tracking-widest uppercase mb-6">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round"/>
            </svg>
            Услуги
          </span>
          <h1 className="font-display font-bold uppercase tracking-wide mb-4"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}>
            ПОЛИРАНЕ НА <span className="text-accent">ФАРОВЕ</span>
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Възстановяваме кристалната прозрачност на пожълтели и мътни фарове.
            Повече светлина, по-безопасно шофиране, по-добър вид.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact"
              className="bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-xl font-bold transition-colors">
              Запази час
            </Link>
            <a href="tel:+35999999796"
              className="border border-border hover:border-accent/50 text-muted hover:text-white px-8 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              +359 99 999 7996
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-20">

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 -mt-8 mb-16 relative z-10">
          {STATS.map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-2xl p-6 text-center hover:border-accent/40 transition-colors">
              <p className="font-display font-black text-3xl text-accent mb-1">{s.value}</p>
              <p className="text-xs text-muted leading-snug">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Why section ── */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-20">
          <div className="space-y-4 text-muted leading-relaxed">
            <p className="text-accent text-xs tracking-[5px] uppercase font-medium">Защо е важно</p>
            <h2 className="text-3xl font-black text-white">ПОЖЪЛТЕЛИТЕ ФАРОВЕ СА ОПАСНИ</h2>
            <p>
              С времето UV лъчите разграждат поликарбонатната обвивка на фара.
              Резултатът — пожълтяла, мътна пластмаса, която <strong className="text-white">задържа до 80% от светлината</strong> и критично намалява видимостта при нощно шофиране.
            </p>
            <p>
              Полирането не е само естетика. Чистите фарове означават по-ярко осветление, по-кратко разстояние за реакция и пo-малък риск от инцидент.
            </p>
            <p>
              В LED Ivanov Auto използваме професионален метод на шлайфане и полиране, последван от UV-защитно запечатване —
              за траен резултат, който се вижда от пръв поглед.
            </p>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface border border-border">
            <Image
              src="/images/services/headlight-polishing-hero.webp"
              alt="Полиране на фарове — LED Ivanov Auto"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* ── Process steps ── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-accent text-xs tracking-[5px] uppercase font-medium mb-3">Как работим</p>
            <h2 className="text-3xl font-black">НАШИЯТ ПРОЦЕС</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {STEPS.map(step => (
              <div key={step.n}
                className="bg-surface border border-border rounded-2xl p-6 hover:border-accent/40 transition-colors group relative overflow-hidden">
                <span className="absolute top-4 right-5 font-display font-black text-5xl text-white/4 select-none group-hover:text-accent/8 transition-colors">
                  {step.n}
                </span>
                <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm mb-4 group-hover:bg-accent group-hover:text-white transition-all">
                  {step.n}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-black mb-3">ГОТОВ ДА ВИДИШ РАЗЛИКАТА?</h2>
          <p className="text-muted text-sm mb-6 max-w-md mx-auto">
            Свържи се с нас и запази час за полиране. Намираме се в ж.к. Малинова долина, София.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact"
              className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Запази час
            </Link>
            <a href="tel:+3599999979996"
              className="border border-accent text-accent hover:bg-accent hover:text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Обади се сега
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}

function BeforeAfterPair({ before, after, label }: { before: string; after: string; label: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="grid grid-cols-2">
        {/* Before */}
        <div className="relative aspect-[4/3] border-r border-border group">
          <ImageSlot src={before} alt={`Преди — ${label}`} />
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">
            ПРЕДИ
          </div>
        </div>
        {/* After */}
        <div className="relative aspect-[4/3] group">
          <ImageSlot src={after} alt={`След — ${label}`} />
          <div className="absolute top-3 right-3 bg-accent/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
            СЛЕД
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-border">
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  )
}

function ImageSlot({ src, alt }: { src: string; alt: string }) {
  return (
    <>
      <div className="absolute inset-0 bg-surface-2 flex flex-col items-center justify-center gap-2 text-muted/30">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
        <p className="text-xs text-center px-4 break-all">{src.split('/').pop()}</p>
      </div>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        unoptimized
      />
    </>
  )
}

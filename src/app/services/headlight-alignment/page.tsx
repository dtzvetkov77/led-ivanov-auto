import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { createClient } from '@/lib/supabase/server'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ledivanov.bg'

export const metadata: Metadata = {
  title: 'Регулиране на фарове | LED Ivanov Auto',
  description: 'Професионално регулиране на фарове в София. Правилната насоченост на фаровете е задължителна за ГТП и за безопасност. Обслужваме всички марки автомобили.',
}

const STEPS = [
  {
    n: '01',
    title: 'Оценка',
    desc: 'Проверяваме текущата насоченост на фаровете с калибрирано оборудване и определяме нужните корекции.',
  },
  {
    n: '02',
    title: 'Настройка',
    desc: 'Регулираме хоризонталния и вертикалния ъгъл на всеки фар съгласно спецификациите на производителя.',
  },
  {
    n: '03',
    title: 'Проверка',
    desc: 'Повторно измерваме насочеността след регулацията и потвърждаваме съответствие с изискванията за ГТП.',
  },
  {
    n: '04',
    title: 'Тест',
    desc: 'Финален преглед при условия, симулиращи нощно шофиране — проверяваме за заслепяване и покритие на пътя.',
  },
]

const STATS = [
  { value: 'ГТП', label: 'успешно преминаване след регулация' },
  { value: '~30 мин.', label: 'средно време за регулация' },
  { value: 'Всички марки', label: 'леки и лекотоварни автомобили' },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Регулиране на фарове',
  serviceType: 'Automotive Headlight Alignment',
  description: 'Професионално регулиране на фарове за правилна насоченост. Задължително за ГТП и за безопасност при нощно шофиране. Обслужваме всички марки автомобили.',
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
  url: `${SITE}/services/headlight-alignment`,
  image: `${SITE}/images/hero.webp`,
}

export default async function HeadlightAlignmentPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('service_images')
    .select('id, url, caption')
    .eq('service', 'headlight-alignment')
    .eq('published', true)
    .order('position')
  const gallery = data ?? []

  return (
    <div className="bg-background min-h-screen text-white">
      <JsonLd data={serviceSchema} />

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
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round"/>
            </svg>
            Услуги
          </span>
          <h1 className="font-display font-bold uppercase tracking-wide mb-4"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}>
            РЕГУЛИРАНЕ НА <span className="text-accent">ФАРОВЕ</span>
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Правилно насочените фарове са задължително условие за ГТП и за безопасно нощно шофиране.
            Регулираме всички марки бързо и прецизно.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact"
              className="bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-xl font-bold transition-colors">
              Запази час
            </Link>
            <a href="tel:+359999997996"
              className="border border-border hover:border-accent/50 text-muted hover:text-white px-8 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              +359 99 999 7996
            </a>
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      {gallery.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-8">
          <div className="text-center mb-8">
            <p className="text-accent text-xs tracking-[5px] uppercase font-medium mb-3">Галерия</p>
            <h2 className="text-3xl font-black">НАШАТА РАБОТА</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gallery.map(img => (
              <div key={img.id} className="flex flex-col gap-1">
                {img.caption && (
                  <p className="text-xs text-muted px-1">{img.caption}</p>
                )}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-surface border border-border group">
                  <Image src={img.url} alt={img.caption ?? 'Регулиране на фарове'} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pb-20">

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
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
            <h2 className="text-3xl font-black text-white">НЕПРАВИЛНО РЕГУЛИРАНИ ФАРОВЕ СА ОПАСНИ</h2>
            <p>
              Фарове, насочени прекалено нагоре, <strong className="text-white">заслепяват насрещното движение</strong> и са честа причина за инциденти при нощно шофиране.
              Насочени прекалено надолу — намаляват видимостта ти и правят реакцията по-бавна.
            </p>
            <p>
              Неправилната регулация е основна причина за <strong className="text-white">отпадане на техническия преглед (ГТП)</strong>.
              Регулацията е задължителна и след смяна на окачването, подмяна на броня, монтаж на LED крушки или след натоварване с тежък товар.
            </p>
            <p>
              В LED Ivanov Auto извършваме прецизна регулация с калибрирано оборудване — бързо, точно и за всички марки.
            </p>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface border border-border">
            <Image
              src="/images/hero.webp"
              alt="Регулиране на фарове — LED Ivanov Auto"
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
          <h2 className="text-2xl font-black mb-3">РЕГУЛИРАЙ ФАРОВЕТЕ ПРЕДИ ГТП</h2>
          <p className="text-muted text-sm mb-6 max-w-md mx-auto">
            Свържи се с нас и запази час за регулация. Намираме се в ж.к. Малинова долина, София.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact"
              className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Запази час
            </Link>
            <a href="tel:+359999997996"
              className="border border-accent text-accent hover:bg-accent hover:text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Обади се сега
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}


import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'За нас | LED Ivanov Auto',
  description: 'LED Ivanov Auto – вашият специалист за LED крушки и авто осветление в България. Качество, гаранция и монтаж.',
}

const VALUES = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Проверено качество',
    desc: 'Всеки продукт преминава строг контрол преди да достигне до теб. Работим само с доказани производители.',
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Plug & Play монтаж',
    desc: 'Нашите крушки са проектирани за лесен монтаж – без преработки, без CanBus грешки. Готово за 5 минути.',
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '2–4 години гаранция',
    desc: 'Стоим зад всеки продукт. При дефект подменяме без въпроси – така е трябвало да бъде от самото начало.',
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Личен подход',
    desc: 'Не продаваме просто крушки – намираме точния продукт за твоя автомобил. Консултацията е безплатна.',
  },
]

const STATS = [
  { value: '5000+', label: 'Доволни клиенти' },
  { value: '10+', label: 'Години опит' },
  { value: '2–4г.', label: 'Гаранция' },
  { value: '1–2 дни', label: 'Доставка' },
]

export default function AboutPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-accent text-xs tracking-[5px] uppercase mb-3 font-medium">Нашата история</p>
          <h1 className="text-4xl md:text-5xl font-black mb-5">ЗА НАС</h1>
          <p className="text-muted max-w-2xl mx-auto leading-relaxed">
            LED Ivanov Auto е семеен бизнес, роден от страст към автомобилите и убедеността,
            че всеки шофьор заслужава кристално ясна видимост на пътя – независимо от часа или времето.
          </p>
        </div>

        {/* Hero image + story */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-20">
          <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-square bg-surface border border-border">
            <div className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{ backgroundImage: 'url(/images/hero-mobile.webp)' }} />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white font-black text-2xl font-display uppercase">LED Ivanov Auto</p>
              <p className="text-accent text-sm font-semibold tracking-widest uppercase">София, България</p>
            </div>
          </div>

          <div className="space-y-5 text-muted leading-relaxed">
            <p>
              Всичко започна с един прост въпрос: <strong className="text-white">защо крушките на колата
              трябва да светят толкова слабо?</strong> Вместо да се примиряваме с жълтата, размазана
              светлина на халогените, решихме да намерим по-добро решение.
            </p>
            <p>
              След години тестване на различни продукти и стотици монтажи, изградихме асортимент от
              LED крушки, за които стоим с две ръце. Не предлагаме нещо, което не бихме сложили
              на собствената си кола.
            </p>
            <p>
              Днес помагаме на хиляди шофьори в цяла България да виждат пътя ясно – и да се
              прибират вкъщи по-безопасно. Имаме собствен сервиз в София и мрежа от партньори
              из цялата страна.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {STATS.map(s => (
            <div key={s.value} className="bg-surface border border-border rounded-2xl p-6 text-center hover:border-accent transition-colors">
              <p className="font-display font-black text-3xl text-accent mb-1">{s.value}</p>
              <p className="text-xs text-muted uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-accent text-xs tracking-[5px] uppercase mb-3 font-medium">Принципи</p>
            <h2 className="text-3xl font-black">ЗАЩО ДА ИЗБЕРЕТЕ НАС</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALUES.map(v => (
              <div key={v.title} className="bg-surface border border-border rounded-2xl p-6 hover:border-accent transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-all">
                  {v.icon}
                </div>
                <h3 className="font-bold mb-2">{v.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-black mb-3">ГОТОВ ДА ВИЖДАШ ПО-ДОБРЕ?</h2>
          <p className="text-muted text-sm mb-6 max-w-md mx-auto">
            Разгледай нашите продукти или се свържи с нас – ще намерим точните крушки за твоя автомобил.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products"
              className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Разгледай продуктите
            </Link>
            <Link href="/contact"
              className="border border-accent text-accent hover:bg-accent hover:text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Свържи се с нас
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import type { Metadata } from 'next'

const PHONE = '+359 99 999 7996'
const PHONE_RAW = '+35999999796'
const FACEBOOK = 'https://www.facebook.com/p/LED-Ivanov-Auto-%D0%9A%D1%80%D1%83%D1%88%D0%BA%D0%B8-%D0%B8-%D0%90%D0%B2%D1%82%D0%BE%D0%B0%D0%BA%D1%81%D0%B5%D1%81%D0%BE%D0%B0%D1%80%D0%B8-100065233232609/'
const TIKTOK = 'https://www.tiktok.com/@ivanov_auto'

const FAQ = [
  {
    q: 'Имат ли продуктите гаранция?',
    a: 'Да! Всеки продукт закупен от нашия магазин е с до 2 години гаранция.',
  },
  {
    q: 'Колко дни са нужни за доставка?',
    a: 'Стандартната доставка е в рамките на 1-2 работни дни. При поръчка до 14:00 ч., изпращаме продуктите на същия ден.',
  },
  {
    q: 'С кои куриери работите?',
    a: 'Работим с Еконт и Спиди. При поръчката можеш да избереш предпочитания куриер и офис или адрес за доставка.',
  },
  {
    q: 'Мога ли да платя при доставка?',
    a: 'Да, предлагаме наложен платеж. Плащаш директно на куриера при получаване на пратката.',
  },
  {
    q: 'Предлагате ли монтаж?',
    a: 'Да! Имаме собствен сервиз в София (ж.к. Малинова долина). Работим и с мрежа от партньорски авто електро сервизи в цяла България.',
  },
  {
    q: 'Безплатна ли е доставката?',
    a: 'Да – при поръчка над 150 € доставката е напълно безплатна. При по-малки поръчки куриерската такса е стандартна според тарифата на избрания куриер.',
  },
  {
    q: 'Ще паснат ли крушките на моята кола?',
    a: 'Напиши ни марката, модела и годината на автомобила в чата – ще намерим точния продукт за теб. Имаме съвместимост с над 5000 модела.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
      >
        <span className="font-bold text-sm md:text-base group-hover:text-accent transition-colors">{q}</span>
        <svg className={`w-4 h-4 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180 text-accent' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <p className="text-muted text-sm pb-4 leading-relaxed pr-8">{a}</p>
      )}
    </div>
  )
}

export default function ContactPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent text-xs tracking-[5px] uppercase mb-3 font-medium">Връзка с нас</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">КОНТАКТИ</h1>
          <p className="text-muted">Готови сме да отговорим на всичките ти въпроси.</p>
        </div>

        {/* Contact + Hours grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-16">

          {/* Contact methods */}
          <div className="flex flex-col gap-3">
            <a href={`tel:${PHONE_RAW}`}
              className="flex items-center gap-4 bg-surface border border-border hover:border-accent rounded-xl p-5 transition-all group">
              <span className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Телефон</p>
                <p className="font-bold group-hover:text-accent transition-colors">{PHONE}</p>
              </div>
            </a>

            <a href={FACEBOOK} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 bg-surface border border-border hover:border-accent rounded-xl p-5 transition-all group">
              <span className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </span>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Facebook</p>
                <p className="font-bold group-hover:text-accent transition-colors">LED Ivanov Auto</p>
              </div>
            </a>

            <a href={TIKTOK} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 bg-surface border border-border hover:border-accent rounded-xl p-5 transition-all group">
              <span className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </span>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-0.5">TikTok</p>
                <p className="font-bold group-hover:text-accent transition-colors">@ivanov_auto</p>
              </div>
            </a>

            {/* Google Maps */}
            <div className="flex-1 rounded-xl overflow-hidden border border-border min-h-45">
              <iframe
                title="LED Ivanov Auto"
                src="https://maps.google.com/maps?q=ул.+Георги+Русев+2,+жк+Малинова+долина,+1734+София,+България&hl=bg&z=16&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <h2 className="font-bold">Работно време</h2>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { day: 'Понеделник – Неделя', hours: '09:00 – 23:00' },
                ].map(r => (
                  <div key={r.day} className="flex justify-between py-2">
                    <span className="text-muted">{r.day}</span>
                    <span className="font-medium text-accent">{r.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 className="font-bold">Адрес</h2>
              </div>
              <p className="text-sm text-muted">LED IVANOV AUTO</p>
              <p className="text-sm text-muted">ж.к. Малинова долина, ул. „Георги Русев" 2</p>
              <p className="text-sm text-muted">1734 София</p>
              <a href="https://maps.google.com/?q=ул.+Георги+Русев+2,+жк+Малинова+долина,+1734+София"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent hover:underline text-xs mt-2 font-medium">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Отвори в Google Maps
              </a>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h1.172a2 2 0 011.414.586l2.828 2.828A2 2 0 0121 13.172V17a2 2 0 01-2 2h-1m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 className="font-bold">Доставка</h2>
              </div>
              {[
                'Доставка чрез Еконт или Спиди',
                'Безплатна доставка над 150 €',
                'Наложен платеж – плащане при получаване',
                'Доставка в рамките на 1–2 работни дни',
              ].map(t => (
                <div key={t} className="flex items-start gap-2.5 py-1.5 text-sm">
                  <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-muted">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <p className="text-accent text-xs tracking-[5px] uppercase mb-3 font-medium">Помощ</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">ЧЕСТО ЗАДАВАНИ ВЪПРОСИ</h2>
            <p className="text-muted text-sm">Не намираш отговор? Пиши ни директно.</p>
          </div>
          <div className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl px-6">
            {FAQ.map(item => <FAQItem key={item.q} q={item.q} a={item.a} />)}
          </div>
        </div>

      </div>
    </div>
  )
}

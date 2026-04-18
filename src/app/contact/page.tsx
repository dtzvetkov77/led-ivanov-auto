import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контакти | LED Ivanov Auto',
  description: 'Свържи се с нас по телефон, Viber, WhatsApp или Facebook. Работно време и партньорски сервизи.',
}

const PARTNERS = [
  { name: 'Авто Сервиз "Победа"',     city: 'София',        address: 'бул. Цариградско шосе 48',   phone: '+359 88 XXX XXXX' },
  { name: 'Авто Електро Петров',       city: 'Пловдив',      address: 'ул. Карловска 12',            phone: '+359 89 XXX XXXX' },
  { name: 'Мото Тех',                  city: 'Варна',        address: 'бул. Владислав Варненчик 95', phone: '+359 87 XXX XXXX' },
  { name: 'Сервиз "Авто Плюс"',        city: 'Бургас',       address: 'ул. Александровска 32',       phone: '+359 88 XXX XXXX' },
  { name: 'Авто Ел Монтаж',            city: 'Стара Загора', address: 'ул. Цар Симеон Велики 15',    phone: '+359 88 XXX XXXX' },
  { name: 'Авто Ателие Нова',          city: 'Русе',         address: 'бул. Трети март 22',          phone: '+359 89 XXX XXXX' },
]

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
          <div className="space-y-3">
            <a href="tel:+359XXXXXXXXX"
              className="flex items-center gap-4 bg-surface border border-border hover:border-accent rounded-xl p-5 transition-all group">
              <span className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Телефон</p>
                <p className="font-bold group-hover:text-accent transition-colors">+359 XX XXX XXXX</p>
              </div>
            </a>

            <a href="viber://chat?number=%2B359XXXXXXXXX"
              className="flex items-center gap-4 bg-surface border border-border hover:border-accent rounded-xl p-5 transition-all group">
              <span className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Viber</p>
                <p className="font-bold group-hover:text-accent transition-colors">+359 XX XXX XXXX</p>
              </div>
            </a>

            <a href="https://wa.me/359XXXXXXXXX" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 bg-surface border border-border hover:border-accent rounded-xl p-5 transition-all group">
              <span className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.987 9.987 0 00-5.031-1.378c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-0.5">WhatsApp</p>
                <p className="font-bold group-hover:text-accent transition-colors">+359 XX XXX XXXX</p>
              </div>
            </a>

            <a href="https://facebook.com/ledivanovauto" target="_blank" rel="noopener noreferrer"
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
                  { day: 'Понеделник – Петък', hours: '9:00 – 18:00' },
                  { day: 'Събота',             hours: '10:00 – 16:00' },
                  { day: 'Неделя',             hours: 'Почивен ден' },
                ].map(r => (
                  <div key={r.day} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-muted">{r.day}</span>
                    <span className={`font-medium ${r.hours === 'Почивен ден' ? 'text-muted' : ''}`}>{r.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
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

            <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 text-sm">
              <p className="font-semibold mb-1">Въпрос за съвместимост?</p>
              <p className="text-muted">Пиши ни марката, модела и годината – ще намерим подходящите крушки за теб.</p>
            </div>
          </div>
        </div>

        {/* ── Partner Services ── */}
        <div className="border-t border-border pt-14">
          <div className="text-center mb-10">
            <p className="text-accent text-xs tracking-[5px] uppercase mb-3 font-medium">Мрежа</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">ПАРТНЬОРСКИ СЕРВИЗИ</h2>
            <p className="text-muted max-w-xl mx-auto text-sm">
              Нашите продукти се монтират от сертифицирани авто електро сервизи в цяла България.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PARTNERS.map(p => (
              <div key={p.name} className="bg-surface border border-border rounded-xl p-5 hover:border-accent transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-medium">
                    Партньор
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-3">{p.name}</h3>
                <div className="space-y-1.5 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{p.city}, {p.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{p.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted mt-6">
            Искаш да станеш партньор?{' '}
            <a href="tel:+359XXXXXXXXX" className="text-accent hover:underline">Свържи се с нас</a>
          </p>
        </div>

      </div>
    </div>
  )
}

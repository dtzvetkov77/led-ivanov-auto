import Link from 'next/link'

const services = [
  {
    href: '/admin/services/headlight-tinting',
    title: 'Фолиране на фарове',
    desc: 'Галерия снимки за страницата на услугата',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
    ),
  },
  {
    href: '/admin/services/headlight-alignment',
    title: 'Регулиране на фарове',
    desc: 'Галерия снимки за страницата на услугата',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
    ),
  },
  {
    href: '/admin/services/headlight-polishing',
    title: 'Полиране на фарове',
    desc: 'Двойки ПРЕДИ / СЛЕД снимки',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16M4 10h16M4 14h8M4 18h6"/>
      </svg>
    ),
  },
]

export default function AdminServicesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Услуги — снимки</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        {services.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-surface border border-border rounded-2xl p-6 hover:border-accent/40 transition-colors group flex flex-col gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
              {s.icon}
            </div>
            <div>
              <p className="font-semibold text-white mb-1">{s.title}</p>
              <p className="text-xs text-muted">{s.desc}</p>
            </div>
            <span className="text-xs text-accent font-medium mt-auto">Управление →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

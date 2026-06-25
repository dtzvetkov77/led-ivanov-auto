import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Услуги за фарове | LED Ivanov Auto',
  description: 'Полиране, фолиране и регулиране на фарове в София. Професионална грижа за фаровете на вашия автомобил.',
  alternates: { canonical: '/services' },
}

const SERVICES = [
  {
    slug: 'headlight-polishing',
    name: 'Полиране на фарове',
    desc: 'Премахваме пожълтяването и мътността — фаровете изглеждат и светят като нови. UV-защитно запечатване с гаранция.',
    heroImg: '/images/services/headlight-polishing-hero.jpg',
  },
  {
    slug: 'headlight-tinting',
    name: 'Фолиране на фарове',
    desc: 'PPF фолио за защита от UV лъчи, камъчета и надрасквания. Запазва прозрачността и стойността на автомобила.',
    heroImg: null,
  },
  {
    slug: 'headlight-alignment',
    name: 'Регулиране на фарове',
    desc: 'Правилната насоченост на фаровете е задължителна за ГТП и за безопасност на пътя. Обслужваме всички марки.',
    heroImg: null,
  },
]

export default async function ServicesPage() {
  const supabase = await createClient()

  const previews = await Promise.all(
    SERVICES.map(async s => {
      const { data } = await supabase
        .from('service_before_after')
        .select('before_url, after_url, label')
        .eq('service', s.slug)
        .eq('published', true)
        .limit(1)
        .maybeSingle()
      return { ...s, pair: data ?? null }
    })
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <span className="text-xs font-bold tracking-[4px] uppercase text-accent mb-3 block">СЕРВИЗ</span>
        <h1 className="text-3xl md:text-4xl font-black mb-3">НАШИТЕ УСЛУГИ</h1>
        <p className="text-muted text-sm max-w-xl mx-auto">Професионална грижа за фаровете на вашия автомобил — полиране, фолиране и регулиране в София.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {previews.map(s => (
          <Link
            key={s.slug}
            href={`/services/${s.slug}`}
            className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent transition-all duration-200"
          >
            <div className="relative aspect-video overflow-hidden bg-surface-2">
              {s.pair ? (
                <>
                  <img src={s.pair.before_url} alt={`Преди — ${s.name}`} className="absolute inset-0 w-full h-full object-cover" />
                  <img src={s.pair.after_url} alt={`След — ${s.name}`} className="absolute inset-0 w-full h-full object-cover translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded z-10">ПРЕДИ</span>
                  <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-accent/90 text-white px-2 py-0.5 rounded z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">СЛЕД</span>
                </>
              ) : s.heroImg ? (
                <img src={s.heroImg} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-surface flex items-center justify-center">
                  <svg className="w-12 h-12 text-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="p-5">
              <h2 className="font-black text-base mb-2 group-hover:text-accent transition-colors">{s.name}</h2>
              <p className="text-muted text-sm leading-relaxed mb-4">{s.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
                Научи повече
                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

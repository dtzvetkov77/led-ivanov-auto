import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Политика за бисквитки | LED Ivanov Auto',
  description: 'Информация за бисквитките, използвани от LED Ivanov Auto — видове, цел и как да ги управлявате.',
  robots: { index: false },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4 text-white pb-2 border-b border-border">{title}</h2>
      <div className="text-muted text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

const COOKIE_TABLE = [
  { name: 'cookie-consent',    type: 'Задължителна', purpose: 'Съхранява вашия избор за бисквитки',          duration: '1 година' },
  { name: 'cart',              type: 'Задължителна', purpose: 'Съдържанието на количката ви',                 duration: '30 дни'   },
  { name: '_ga, _gid',         type: 'Аналитична',   purpose: 'Google Analytics — анализ на посещенията',     duration: '2 години' },
  { name: 'sb-access-token',  type: 'Задължителна', purpose: 'Сесия за автентикация (само за администратори)', duration: 'Сесия'    },
]

export default function CookiesPage() {
  return (
    <div className="py-16 px-4">
      <article className="max-w-3xl mx-auto">

        <div className="mb-12">
          <p className="text-accent text-xs tracking-[5px] uppercase mb-3 font-medium">Правна информация</p>
          <h1 className="text-4xl font-black mb-3">ПОЛИТИКА ЗА БИСКВИТКИ</h1>
          <p className="text-muted text-sm">Последна актуализация: 19.04.2026</p>
        </div>

        <Section title="1. Какво са бисквитки">
          <p>
            Бисквитките (cookies) са малки текстови файлове, които уебсайтът записва на вашето устройство.
            Те позволяват сайтът да „помни" вашите действия и предпочитания за определен период от време.
          </p>
          <p>
            Бисквитките не съдържат лична информация като имена или пароли и не могат да изпълняват код или
            да разпространяват вируси.
          </p>
        </Section>

        <Section title="2. Видове бисквитки, които използваме">
          <p className="font-semibold text-white">Задължителни бисквитки</p>
          <p>
            Необходими за основното функциониране на сайта — количка, навигация и сигурност.
            Не могат да бъдат изключени без значително нарушаване на функционалността.
          </p>

          <p className="font-semibold text-white mt-4">Аналитични бисквитки</p>
          <p>
            Използваме <strong className="text-white">Google Analytics</strong> за анализ на посещенията —
            кои страници са най-посещавани, откъде идват потребителите и как се движат из сайта.
            Данните са анонимизирани и не идентифицират конкретни лица. Активират се само при ваше съгласие.
          </p>

          <p className="font-semibold text-white mt-4">Маркетингови бисквитки</p>
          <p>В момента не използваме маркетингови или рекламни бисквитки.</p>
        </Section>

        <Section title="3. Конкретни бисквитки">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-white font-semibold">Бисквитка</th>
                  <th className="text-left py-2 pr-4 text-white font-semibold">Тип</th>
                  <th className="text-left py-2 pr-4 text-white font-semibold">Цел</th>
                  <th className="text-left py-2 text-white font-semibold">Срок</th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_TABLE.map(row => (
                  <tr key={row.name} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 font-mono text-accent/80">{row.name}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">{row.type}</td>
                    <td className="py-2.5 pr-4">{row.purpose}</td>
                    <td className="py-2.5 whitespace-nowrap">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="4. Как да управлявате бисквитките">
          <p>
            При първото ви посещение показваме банер за съгласие. Можете да изберете:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-white">Само необходими</strong> — само задължителните бисквитки</li>
            <li><strong className="text-white">Приемам всички</strong> — включително аналитични бисквитки</li>
          </ul>
          <p>
            Можете да изтриете бисквитките по всяко време от настройките на браузъра си:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-white">Chrome:</strong> Настройки → Поверителност → Изчисти данните за сърфиране</li>
            <li><strong className="text-white">Firefox:</strong> Настройки → Поверителност → Изчисти данните</li>
            <li><strong className="text-white">Safari:</strong> Настройки → Поверителност → Управление на данните на уебсайтове</li>
          </ul>
          <p>
            Имайте предвид, че забраняването на всички бисквитки може да наруши функционалността на сайта
            (напр. количката може да спре да работи правилно).
          </p>
        </Section>

        <Section title="5. Бисквитки на трети страни">
          <p>
            Google Analytics използва собствени бисквитки. Повече информация:{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              policies.google.com/privacy
            </a>
          </p>
        </Section>

        <Section title="6. Промени в политиката">
          <p>
            Може да актуализираме тази политика при промяна на използваните технологии или нормативни изисквания.
            Датата на актуализация е посочена в горната част на страницата.
          </p>
        </Section>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href="/privacy-policy" className="flex-1 p-4 bg-surface border border-border rounded-xl text-sm text-center hover:border-accent/40 transition-colors">
            <p className="font-semibold text-white mb-1">Поверителност</p>
            <p className="text-muted text-xs">Политика за лични данни</p>
          </Link>
          <Link href="/terms" className="flex-1 p-4 bg-surface border border-border rounded-xl text-sm text-center hover:border-accent/40 transition-colors">
            <p className="font-semibold text-white mb-1">Условия за ползване</p>
            <p className="text-muted text-xs">Общи условия на магазина</p>
          </Link>
        </div>

      </article>
    </div>
  )
}

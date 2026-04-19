import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Политика за поверителност | LED Ivanov Auto',
  description: 'Политика за защита на личните данни на LED Ivanov Auto. Научете как събираме, използваме и пазим вашата информация.',
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

export default function PrivacyPage() {
  return (
    <div className="py-16 px-4">
      <article className="max-w-3xl mx-auto">

        <div className="mb-12">
          <p className="text-accent text-xs tracking-[5px] uppercase mb-3 font-medium">Правна информация</p>
          <h1 className="text-4xl font-black mb-3">ПОЛИТИКА ЗА ПОВЕРИТЕЛНОСТ</h1>
          <p className="text-muted text-sm">Последна актуализация: 19.04.2026</p>
        </div>

        <Section title="1. Администратор на лични данни">
          <p>
            LED Ivanov Auto е администратор на лични данни по смисъла на Регламент (ЕС) 2016/679 (GDPR)
            и Закона за защита на личните данни (ЗЗЛД).
          </p>
          <p>
            <strong className="text-white">LED Ivanov Auto</strong><br />
            Адрес: ж.к. Малинова долина, ул. „Георги Русев" 2, 1734 София, България<br />
            Телефон: <a href="tel:+35999999796" className="text-accent hover:underline">+359 99 999 7996</a>
          </p>
        </Section>

        <Section title="2. Каква информация събираме">
          <p>Събираме следните категории лични данни:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-white">Данни при поръчка:</strong> три имена, телефонен номер, адрес за доставка</li>
            <li><strong className="text-white">Данни при контакт:</strong> имена и телефонен номер при обаждане или съобщение</li>
            <li><strong className="text-white">Технически данни:</strong> IP адрес, вид на браузър, посетени страници (чрез бисквитки)</li>
          </ul>
          <p>Не събираме и не съхраняваме данни за платежни карти. Всички плащания се извършват в брой при доставка (наложен платеж).</p>
        </Section>

        <Section title="3. Цел и правно основание за обработването">
          <p>Обработваме лични данни на следните правни основания:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-white">Изпълнение на договор</strong> — обработка и доставка на поръчки</li>
            <li><strong className="text-white">Законово задължение</strong> — съхранение на документи за счетоводни цели (5 години)</li>
            <li><strong className="text-white">Легитимен интерес</strong> — подобряване на сайта чрез анализ на посещенията</li>
            <li><strong className="text-white">Съгласие</strong> — аналитични и маркетингови бисквитки (при дадено съгласие)</li>
          </ul>
        </Section>

        <Section title="4. Срок на съхранение">
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Данни, свързани с поръчки — 5 години (счетоводно изискване)</li>
            <li>Данни при контакт — до 6 месеца след приключване на комуникацията</li>
            <li>Технически и аналитични данни (бисквитки) — до 1 година</li>
          </ul>
        </Section>

        <Section title="5. Получатели на данни">
          <p>Вашите данни могат да бъдат предоставени единствено на:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-white">Куриерски фирми</strong> (Еконт, Спиди) — за изпълнение на доставка</li>
            <li><strong className="text-white">Supabase Inc.</strong> — хостинг на база данни (ЕС-съвместим)</li>
            <li><strong className="text-white">Google LLC</strong> — анализ на посещения (при дадено съгласие)</li>
          </ul>
          <p>Не продаваме и не предоставяме данни на трети страни за маркетингови цели.</p>
        </Section>

        <Section title="6. Вашите права">
          <p>Като субект на данни имате следните права:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-white">Право на достъп</strong> — да поискате копие на данните, които съхраняваме за вас</li>
            <li><strong className="text-white">Право на коригиране</strong> — да поискате поправка на неточни данни</li>
            <li><strong className="text-white">Право на изтриване</strong> — „правото да бъдеш забравен"</li>
            <li><strong className="text-white">Право на ограничаване</strong> — да ограничите обработването при определени условия</li>
            <li><strong className="text-white">Право на преносимост</strong> — да получите данните си в структуриран формат</li>
            <li><strong className="text-white">Право на възражение</strong> — срещу обработване на база легитимен интерес</li>
          </ul>
          <p>
            За упражняване на права се свържете с нас на телефон{' '}
            <a href="tel:+35999999796" className="text-accent hover:underline">+359 99 999 7996</a>.
            Имате право да подадете жалба до{' '}
            <strong className="text-white">Комисията за защита на личните данни (КЗЛД)</strong>{' '}
            — <a href="https://www.cpdp.bg" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">www.cpdp.bg</a>.
          </p>
        </Section>

        <Section title="7. Бисквитки">
          <p>
            Използваме бисквитки за функционалност и анализ на посещенията. Подробна информация ще намерите в нашата{' '}
            <Link href="/cookies" className="text-accent hover:underline">Политика за бисквитки</Link>.
          </p>
        </Section>

        <Section title="8. Промени в политиката">
          <p>
            Запазваме правото да актуализираме тази политика. При съществени промени ще уведомим потребителите чрез
            сайта. Препоръчваме периодично да преглеждате страницата.
          </p>
        </Section>

        <div className="mt-10 p-5 bg-surface border border-border rounded-xl text-sm text-muted">
          За въпроси относно защитата на личните ви данни: <a href="tel:+35999999796" className="text-accent hover:underline">+359 99 999 7996</a>
        </div>

      </article>
    </div>
  )
}

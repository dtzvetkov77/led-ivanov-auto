import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Условия за ползване | LED Ivanov Auto',
  description: 'Общи условия за ползване на онлайн магазин LED Ivanov Auto. Поръчки, доставка, гаранция и право на отказ.',
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

export default function TermsPage() {
  return (
    <div className="py-16 px-4">
      <article className="max-w-3xl mx-auto">

        <div className="mb-12">
          <p className="text-accent text-xs tracking-[5px] uppercase mb-3 font-medium">Правна информация</p>
          <h1 className="text-4xl font-black mb-3">УСЛОВИЯ ЗА ПОЛЗВАНЕ</h1>
          <p className="text-muted text-sm">Последна актуализация: 19.04.2026</p>
        </div>

        <Section title="1. Общи разпоредби">
          <p>
            Настоящите Общи условия уреждат отношенията между <strong className="text-white">LED Ivanov Auto</strong>
            (ж.к. Малинова долина, ул. „Георги Русев" 2, 1734 София) и потребителите на уебсайта и онлайн магазина.
          </p>
          <p>
            С използването на сайта и извършването на поръчка потребителят приема настоящите условия изцяло.
            Ако не сте съгласни с тях, моля не ползвайте услугите ни.
          </p>
        </Section>

        <Section title="2. Продукти и цени">
          <p>
            Всички цени са посочени в евро (€) и включват приложимия данък. Запазваме правото да променяме
            цените по всяко време, като промяната не засяга вече потвърдени поръчки.
          </p>
          <p>
            Снимките на продуктите са илюстративни. Полагаме усилия описанията да бъдат точни,
            но не носим отговорност за несъществени разлики в опаковката или аксесоарите.
          </p>
          <p>
            Наличността се проверява в реално време. При изчерпване на количества ще се свържем с вас
            за уточняване на срок за доставка или замяна с алтернативен продукт.
          </p>
        </Section>

        <Section title="3. Поръчки и сключване на договор">
          <p>
            Поръчката се счита за приета след потвърждение от наша страна по телефон или друг комуникационен канал.
            До потвърждението запазваме правото да отменим поръчката при технически грешки в цените или наличностите.
          </p>
          <p>
            Минималната стойност на поръчка не е ограничена. Потребителят е отговорен за правилното
            посочване на адрес и телефон за доставка.
          </p>
        </Section>

        <Section title="4. Начин на плащане">
          <p>Предлагаме следния начин на плащане:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-white">Наложен платеж</strong> — плащане в брой директно на куриера при получаване на пратката</li>
          </ul>
        </Section>

        <Section title="5. Доставка">
          <p>
            Извършваме доставки на територията на <strong className="text-white">България</strong> чрез
            куриерски фирми <strong className="text-white">Еконт</strong> и <strong className="text-white">Спиди</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Срок: <strong className="text-white">1–2 работни дни</strong> след потвърждение на поръчката</li>
            <li>При поръчка до <strong className="text-white">14:00 ч.</strong> изпращаме същия ден</li>
            <li>Безплатна доставка при поръчки над <strong className="text-white">150 €</strong></li>
            <li>При по-малки поръчки куриерската такса е по стандартната тарифа на избрания куриер</li>
          </ul>
          <p>
            Не носим отговорност за забавяния, причинени от куриера, природни бедствия или
            непредвидени обстоятелства извън нашия контрол.
          </p>
        </Section>

        <Section title="6. Гаранция и рекламации">
          <p>
            Всички продукти са с <strong className="text-white">до 2 (две) години гаранция</strong> от датата на покупка.
          </p>
          <p>
            При дефект в гаранционния период:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Свържете се с нас на <a href="tel:+359999997996" className="text-accent hover:underline">+359 99 999 7996</a></li>
            <li>Предоставете доказателство за покупка (снимка на стикер/опаковка, дата и номер на поръчка)</li>
            <li>Ще организираме замяна на продукта без допълнителни разходи за вас</li>
          </ul>
          <p>
            Гаранцията не покрива: механични повреди от неправилен монтаж, пожар, наводнение
            или умишлена повреда.
          </p>
        </Section>

        <Section title="7. Право на отказ (връщане)">
          <p>
            В съответствие с Директива 2011/83/ЕС и Закона за защита на потребителите,
            имате право да се откажете от поръчката в рамките на <strong className="text-white">14 дни</strong>
            {' '}от получаването, без да посочвате причина.
          </p>
          <p>За упражняване на правото на отказ:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Уведомете ни по телефон преди изтичане на 14-дневния срок</li>
            <li>Върнете продукта в оригинална опаковка, неизползван и без следи от монтаж</li>
            <li>Разходите за връщане са за сметка на потребителя</li>
            <li>Ще възстановим сумата в рамките на 14 дни след получаване на стоката</li>
          </ul>
          <p>
            Правото на отказ не се прилага за продукти, монтирани на автомобила.
          </p>
        </Section>

        <Section title="8. Интелектуална собственост">
          <p>
            Всички материали на сайта — текстове, изображения, лога, дизайн — са собственост на LED Ivanov Auto
            и са защитени от авторското право. Забранено е копирането или разпространението им без писмено разрешение.
          </p>
        </Section>

        <Section title="9. Ограничаване на отговорността">
          <p>
            LED Ivanov Auto не носи отговорност за вреди, произтичащи от неправилен монтаж на продуктите,
            несъвместимост с конкретен автомобил (без предварителна консултация с нас) или за непреки вреди.
          </p>
        </Section>

        <Section title="10. Приложимо право и спорове">
          <p>
            Настоящите условия се уреждат от <strong className="text-white">българското законодателство</strong>.
            Всички спорове ще се решават по взаимно съгласие, а при невъзможност — от компетентен български съд.
          </p>
          <p>
            Потребителите могат да се обърнат и към Помирителна комисия към Комисията за защита на потребителите
            или Европейска платформа за онлайн решаване на спорове:{' '}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              ec.europa.eu/consumers/odr
            </a>
          </p>
        </Section>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href="/privacy-policy" className="flex-1 p-4 bg-surface border border-border rounded-xl text-sm text-center hover:border-accent/40 transition-colors">
            <p className="font-semibold text-white mb-1">Поверителност</p>
            <p className="text-muted text-xs">Как обработваме данните ви</p>
          </Link>
          <Link href="/cookies" className="flex-1 p-4 bg-surface border border-border rounded-xl text-sm text-center hover:border-accent/40 transition-colors">
            <p className="font-semibold text-white mb-1">Бисквитки</p>
            <p className="text-muted text-xs">Политика за бисквитки</p>
          </Link>
        </div>

      </article>
    </div>
  )
}

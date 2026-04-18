import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Доволни Клиенти | LED Ivanov Auto',
  description: 'Реални отзиви от клиенти на LED Ivanov Auto. Над 1000 доволни шофьори в България.',
}

const reviews = [
  {
    name: 'Георги Петров',
    car: 'BMW 5 Series',
    stars: 5,
    text: 'Много съм доволен! Светят изключително силно, а монтажът беше буквално за 5 минути. Каренето стана удоволствие – виждам пътя като ден, дори в най-тъмните участъци. Препоръчвам на всеки!',
  },
  {
    name: 'Николай Димитров',
    car: 'Audi A6',
    stars: 5,
    text: 'Честно казано не очаквах такова качество за тази цена. Светлината е бяла и ясна, няма разсейване и не заслепява насрещните. Минаха над 6 месеца – никакъв проблем.',
  },
  {
    name: 'Иван Стоянов',
    car: 'Mercedes C-Class',
    stars: 5,
    text: 'Ползвам ги вече 3 месеца – никакви проблеми. Няма грешки по таблото, не мигат и светят супер стабилно. Препоръчвам на всеки, който иска качество без да доплаща.',
  },
  {
    name: 'Мартин Василев',
    car: 'BMW E46',
    stars: 5,
    text: 'Поръчах за BMW E46 – монтажът беше лесен и без никакви CanBus грешки. Изглеждат страхотно нощем. Вече поръчах и за второто ми коло.',
  },
  {
    name: 'Димитър Колев',
    car: 'VW Golf',
    stars: 5,
    text: 'Бързо обслужване, продуктът дойде добре опакован. Монтирах ги сам за 10 минути. Разликата е огромна – препоръчвам на всички!',
  },
  {
    name: 'Стефан Иванов',
    car: 'Opel Astra',
    stars: 5,
    text: 'Отличен продукт! Светят много по-силно от оригиналните халогени. Цената е достъпна, качеството е на ниво. Вече поръчах и за жена ми.',
  },
  {
    name: 'Петър Андреев',
    car: 'Toyota Corolla',
    stars: 5,
    text: 'Страхотни крушки! Монтажът беше лесен, светят ярко и равномерно. Доставката дойде на следващия ден. Определено ще поръчам пак.',
  },
  {
    name: 'Антон Марков',
    car: 'Ford Focus',
    stars: 5,
    text: 'Качеството е супер за тази цена. Много по-бели и ярки от оригинала. Никакви проблеми с CAN шина. Доволен съм на 100%.',
  },
  {
    name: 'Калин Тодоров',
    car: 'Skoda Octavia',
    stars: 5,
    text: 'Поръчвам втори път. Първия път бяха за предница, сега за задни фарове. Отново перфектно качество и бърза доставка. Сайтът е удобен за поръчка.',
  },
]

export default function ReviewsPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-accent text-xs tracking-[5px] uppercase mb-3 font-medium">Отзиви</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">ДОВОЛНИ КЛИЕНТИ</h1>
          <p className="text-muted max-w-xl mx-auto">
            Без скрити условия. Само честни мнения и реални резултати от верифицирани клиенти.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-14">
          {[
            { value: '1000+', label: 'Доволни клиенти' },
            { value: '5★', label: 'Средна оценка' },
            { value: '99%', label: 'Препоръчват ни' },
          ].map(s => (
            <div key={s.label} className="text-center bg-surface border border-border rounded-xl p-4">
              <p className="text-2xl font-black text-accent">{s.value}</p>
              <p className="text-xs text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Reviews grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map(r => (
            <div key={r.name} className="bg-surface border border-border rounded-xl p-6 flex flex-col">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-sm text-muted-2 leading-relaxed flex-1 mb-5">"{r.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold shrink-0">
                  {r.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted">{r.car}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

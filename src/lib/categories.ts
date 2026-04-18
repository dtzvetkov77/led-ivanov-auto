/**
 * Product type categories — must match slugs created by the import script
 * (CATEGORY_SLUG map in scripts/import-products.ts)
 */
export const PRODUCT_CATEGORIES = [
  { slug: 'led-krushki',          name: 'LED Крушки' },
  { slug: 'dnevni-svetlini',      name: 'Дневни LED светлини' },
  { slug: 'byagashti-migachi',    name: 'Dynamic LED Бягащи светлини' },
  { slug: 'led-plafoni-za-nomer', name: 'LED Плафони за номер' },
  { slug: 'avtoaksesoari',        name: 'Автоаксесоари' },
  { slug: 'klyuchodarzhateli',    name: 'Ключодържатели' },
  { slug: 'bmw-babreci',         name: 'BMW Бъбреци' },
] as const

export type StaticCategory = typeof PRODUCT_CATEGORIES[number]

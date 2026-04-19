/**
 * Product type categories — must match slugs created by the import script
 * (CATEGORY_SLUG map in scripts/import-products.ts)
 */
export type StaticCategory = { slug: string; name: string; onlyMakes?: readonly string[] }

export const PRODUCT_CATEGORIES: readonly StaticCategory[] = [
  { slug: 'led-krushki',          name: 'LED Крушки' },
  { slug: 'dnevni-svetlini',      name: 'Дневни LED светлини' },
  { slug: 'byagashti-migachi',    name: 'Dynamic LED Бягащи светлини' },
  { slug: 'led-plafoni-za-nomer', name: 'LED Плафони за номер' },
  { slug: 'avtoaksesoari',        name: 'Автоаксесоари' },
  { slug: 'klyuchodarzhateli',    name: 'Ключодържатели' },
  { slug: 'bmw-babreci',         name: 'BMW Бъбреци', onlyMakes: ['bmw'] as const },
]

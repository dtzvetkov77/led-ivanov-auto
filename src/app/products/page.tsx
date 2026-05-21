import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/ProductGrid'
import ProductFilter from '@/components/ProductFilter'
import { Suspense } from 'react'

export const metadata = {
  title: 'LED крушки и ксенон за автомобили | LED Ivanov Auto',
  description: 'Купете LED и ксенон крушки за фарове онлайн — широк избор от H1, H4, H7, H11 и др. Plug & Play монтаж, без CanBus грешки, до 2 год. гаранция. Безплатна доставка над 199 €.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'LED крушки и ксенон за автомобили | LED Ivanov Auto',
    description: 'Купете LED и ксенон крушки за фарове онлайн — широк избор от H1, H4, H7, H11 и др. Plug & Play монтаж, без CanBus грешки, до 2 год. гаранция.',
    url: 'https://www.ledivanovauto.com/products',
  },
}

type Props = {
  searchParams: Promise<{
    make?: string
    model?: string
    category?: string
    sort?: string
    q?: string
  }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  // ── Fetch filter data ─────────────────────────────────────────────────────
  const [{ data: makes }, { data: allModels }, { data: categories }] = await Promise.all([
    supabase.from('makes').select('id, name, slug').order('name'),
    supabase.from('models').select('id, make_id, name').order('name'),
    supabase.from('categories').select('id, name, slug, parent_id').order('name'),
  ])

  const makesData  = makes ?? []
  const catsData   = (categories ?? []) as { id: string; name: string; slug: string; parent_id: string | null }[]
  const modelsData = allModels ?? []

  // ── Detect mode: real makes table vs categories-as-makes fallback ─────────
  const hasMakesTable = makesData.length > 0

  // ── Resolve IDs from params ───────────────────────────────────────────────
  let productIds: string[] | null = null
  let makeId: string | null = null

  // ?make= param — try makes table first, fall back to categories
  // When makes table is empty, ?make=slug is treated as ?category=slug
  let categoryFallbackSlug: string | undefined
  if (params.make) {
    if (hasMakesTable) {
      const make = makesData.find(m => m.slug === params.make)
      if (make) {
        makeId = make.id
        const { data: pm } = await supabase
          .from('product_makes').select('product_id').eq('make_id', make.id)
        productIds = pm?.map(r => r.product_id) ?? []
      }
    } else {
      // Makes table empty — treat ?make= as category filter (WC categories = car makes)
      const cat = catsData.find(c => c.slug === params.make)
      if (cat) categoryFallbackSlug = cat.slug
    }
  }

  // ?model= — narrow productIds by model (only when product_models data exists)
  if (params.model && makeId) {
    const model = modelsData.find(m => m.make_id === makeId && m.name === params.model)
    if (model) {
      const { data: pm } = await supabase
        .from('product_models').select('product_id').eq('model_id', model.id)
      const modelIds = pm?.map(r => r.product_id) ?? []
      // Only apply model filter if linked products exist — otherwise fall back to make filter
      if (modelIds.length > 0) productIds = modelIds
    }
  }

  // ── Build query ───────────────────────────────────────────────────────────
  let query = supabase.from('products').select('*').eq('published', true)

  if (params.q) {
    const words = params.q.trim().split(/\s+/).filter(Boolean)
    for (const word of words) {
      const safe = word.replace(/[%_]/g, '\\$&')
      query = query.or(`name.ilike.%${safe}%,short_description.ilike.%${safe}%,description.ilike.%${safe}%`)
    }
  }

  switch (params.sort) {
    case 'price_asc':  query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'newest':     query = query.order('created_at', { ascending: false }); break
    default:           query = query.order('position').order('created_at', { ascending: false })
  }

  // ?category= filter — via product_categories join table, fallback to category_id column
  const effectiveCategory = params.category ?? categoryFallbackSlug
  if (effectiveCategory) {
    const cat = catsData.find(c => c.slug === effectiveCategory)
    if (cat) {
      // Include children categories (subcategory inheritance)
      const catIds = [cat.id, ...catsData.filter(c => c.parent_id === cat.id).map(c => c.id)]

      const { data: pc } = await supabase
        .from('product_categories').select('product_id').in('category_id', catIds)
      let catProductIds = [...new Set((pc ?? []).map(r => r.product_id))]

      // Fallback: product_categories table missing or empty → try direct category_id column
      if (catProductIds.length === 0) {
        const { data: direct } = await supabase
          .from('products').select('id').in('category_id', catIds).eq('published', true)
        catProductIds = [...new Set((direct ?? []).map(r => r.id))]
      }

      if (catProductIds.length === 0) {
        return renderPage(
          <p className="text-muted text-center py-20 text-lg">Няма намерени продукти за тази категория.</p>,
          { makes: makesData, models: modelsData, categories: catsData, params }
        )
      }
      productIds = productIds !== null
        ? productIds.filter(id => catProductIds.includes(id))
        : catProductIds
    } else {
      return renderPage(
        <p className="text-muted text-center py-20 text-lg">Няма намерени продукти за тази категория.</p>,
        { makes: makesData, models: modelsData, categories: catsData, params }
      )
    }
  }

  // make/model filter via junction tables
  if (productIds !== null) {
    if (productIds.length === 0) {
      return renderPage(
        <p className="text-muted text-center py-20 text-lg">Няма намерени продукти за тази марка/модел.</p>,
        { makes: makesData, models: modelsData, categories: catsData, params }
      )
    }
    query = query.in('id', productIds)
  }

  const { data: products } = await query

  // ── Page title ────────────────────────────────────────────────────────────
  let title = 'Всички продукти'
  if (params.q) {
    title = `Търсене: "${params.q}"`
  } else {
    const makePart = (params.make && hasMakesTable)
      ? (makesData.find(m => m.slug === params.make)?.name ?? null)
      : null
    const catPart = effectiveCategory
      ? (catsData.find(c => c.slug === effectiveCategory)?.name ?? null)
      : categoryFallbackSlug
        ? (catsData.find(c => c.slug === categoryFallbackSlug)?.name ?? null)
        : null
    if (makePart && catPart) title = `${catPart} — ${makePart}`
    else if (makePart) title = makePart
    else if (catPart) title = catPart
  }

  const activeFiltersCount = [params.make, params.model, effectiveCategory, params.q].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black">{title}</h1>
        <span className="text-muted text-sm">{products?.length ?? 0} продукта</span>
      </div>

      {activeFiltersCount === 0 && (
        <p className="text-muted text-sm leading-relaxed mb-5 max-w-3xl">
          Открийте нашия пълен каталог от <strong className="text-white">LED и ксенон крушки за автомобили</strong> — халогени H1, H4, H7, H8, H9, H11, D1S, D2S и много други. Всички крушки са с Plug &amp; Play монтаж, без CanBus грешки и до 2 год. гаранция. Доставяме с Еконт и Спиди до целта България — безплатно при поръчка над 199 €.
        </p>
      )}

      <Suspense>
        <ProductFilter
          makes={makesData}
          models={modelsData}
          categories={catsData}
          activeMake={params.make}
          activeModel={params.model}
          activeCategory={effectiveCategory}
          activeSort={params.sort}
        />
      </Suspense>

      {activeFiltersCount > 0 && (
        <p className="text-xs text-muted mb-4">
          <a href="/products" className="text-accent hover:underline">✕ Изчисти филтрите</a>
        </p>
      )}

      <ProductGrid products={products ?? []} />
    </div>
  )
}

function renderPage(
  content: React.ReactNode,
  { makes, models, categories, params }: {
    makes: { id: string; name: string; slug: string }[]
    models: { id: string; make_id: string; name: string }[]
    categories: { id: string; name: string; slug: string; parent_id: string | null }[]
    params: { make?: string; model?: string; category?: string; sort?: string }
  }
) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black">Продукти</h1>
      </div>
      <Suspense>
        <ProductFilter
          makes={makes}
          models={models}
          categories={categories}
          activeMake={params.make}
          activeModel={params.model}
          activeCategory={params.category}
          activeSort={params.sort}
        />
      </Suspense>
      {content}
    </div>
  )
}

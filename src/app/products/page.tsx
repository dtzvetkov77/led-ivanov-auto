import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/ProductGrid'
import ProductFilter from '@/components/ProductFilter'
import { Suspense } from 'react'

export const metadata = { title: 'Продукти | LED Ivanov Auto' }

type Props = {
  searchParams: Promise<{
    make?: string
    model?: string
    category?: string
    sort?: string
  }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  // ── Fetch filter data ─────────────────────────────────────────────────────
  const [{ data: makes }, { data: allModels }, { data: categories }] = await Promise.all([
    supabase.from('makes').select('id, name, slug').order('name'),
    supabase.from('models').select('id, make_id, name').order('name'),
    supabase.from('categories').select('id, name, slug').order('name'),
  ])

  const makesData  = makes ?? []
  const catsData   = categories ?? []
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

  switch (params.sort) {
    case 'price_asc':  query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'newest':     query = query.order('created_at', { ascending: false }); break
    default:           query = query.order('position').order('created_at', { ascending: false })
  }

  // ?category= filter — exact match in categories table
  const effectiveCategory = params.category ?? categoryFallbackSlug
  if (effectiveCategory) {
    const cat = catsData.find(c => c.slug === effectiveCategory)
    if (cat) {
      query = query.eq('category_id', cat.id)
    } else {
      // Category slug not found in DB — force empty result rather than showing everything
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
  if (params.make && hasMakesTable) {
    const make = makesData.find(m => m.slug === params.make)
    if (make) title = make.name
  } else if (effectiveCategory) {
    const cat = catsData.find(c => c.slug === effectiveCategory)
    if (cat) title = cat.name
  } else if (categoryFallbackSlug) {
    const cat = catsData.find(c => c.slug === categoryFallbackSlug)
    if (cat) title = cat.name
  }

  const activeFiltersCount = [params.make, params.model, effectiveCategory].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black">{title}</h1>
        <span className="text-muted text-sm">{products?.length ?? 0} продукта</span>
      </div>

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
    categories: { id: string; name: string; slug: string }[]
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

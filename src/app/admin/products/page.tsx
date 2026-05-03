import { createClient } from '@/lib/supabase/server'
import AdminTable from '@/components/AdminTable'
import AdminProductFilters from '@/components/AdminProductFilters'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Product } from '@/lib/types'

type Props = { searchParams: Promise<{ q?: string; cat?: string; pub?: string }> }

export default async function AdminProductsPage({ searchParams }: Props) {
  const { q, cat, pub } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('id, name, slug, price, sale_price, published, images, category:categories!category_id(id, name)')
    .order('position')

  if (q) query = query.ilike('name', `%${q}%`)
  if (cat) query = query.eq('category_id', cat)
  if (pub === '1') query = query.eq('published', true)
  if (pub === '0') query = query.eq('published', false)

  const { data: products } = await query
  const { data: categories } = await supabase.from('categories').select('id, name').order('name')

  type Row = Product & { category?: { name: string } }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Продукти <span className="text-muted text-lg font-normal">({products?.length ?? 0})</span>
        </h1>
        <Link href="/admin/products/new" className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm font-semibold transition-colors">
          + Нов продукт
        </Link>
      </div>

      <Suspense>
        <AdminProductFilters categories={categories ?? []} />
      </Suspense>

      <AdminTable<Row>
        rows={(products ?? []) as Row[]}
        columns={[
          {
            key: 'images',
            label: '',
            render: p => p.images?.[0]
              ? <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-surface-2 shrink-0" />
              : <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center text-muted/30">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>,
          },
          {
            key: 'name',
            label: 'Продукт',
            render: p => (
              <Link href={`/admin/products/${p.id}`} className="text-accent hover:underline line-clamp-2 max-w-xs block leading-snug">
                {p.name}
              </Link>
            ),
          },
          { key: 'category', label: 'Категория', render: p => (p as Row).category?.name ?? '—' },
          {
            key: 'price',
            label: 'Цена',
            render: p => p.sale_price
              ? <><span className="text-accent">{Number(p.sale_price).toFixed(2)} €</span> <span className="text-muted line-through text-xs">{Number(p.price).toFixed(2)}</span></>
              : `${Number(p.price).toFixed(2)} €`,
          },
          {
            key: 'published',
            label: 'Статус',
            render: p => p.published
              ? <span className="text-green-400 text-xs font-medium">● Публикуван</span>
              : <span className="text-muted text-xs font-medium">○ Скрит</span>,
          },
        ]}
      />
    </div>
  )
}

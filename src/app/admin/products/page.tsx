import { createClient } from '@/lib/supabase/server'
import AdminTable from '@/components/AdminTable'
import Link from 'next/link'
import type { Product } from '@/lib/types'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products').select('*, category:categories(name)').order('position')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Продукти</h1>
        <Link href="/admin/products/new" className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm font-semibold transition-colors">
          + Нов продукт
        </Link>
      </div>
      <AdminTable<Product & { category?: { name: string } }>
        rows={(products ?? []) as (Product & { category?: { name: string } })[]}
        columns={[
          { key: 'name', label: 'Продукт', render: p => <Link href={`/admin/products/${p.id}`} className="text-accent hover:underline line-clamp-1">{p.name}</Link> },
          { key: 'category', label: 'Категория', render: p => p.category?.name ?? '—' },
          { key: 'price', label: 'Цена', render: p => `${Number(p.price).toFixed(2)} €` },
          { key: 'published', label: 'Публикуван', render: p => p.published ? '✓' : '✗' },
        ]}
      />
    </div>
  )
}

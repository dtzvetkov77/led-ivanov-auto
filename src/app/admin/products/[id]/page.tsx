import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/ProductForm'

type Props = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])
  if (!product) notFound()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Редактирай продукт</h1>
      <ProductForm product={product} categories={categories ?? []} />
    </div>
  )
}

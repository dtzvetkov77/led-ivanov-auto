import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/ProductForm'

type Props = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }, { data: makes }, { data: pc }, { data: pm }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
    supabase.from('makes').select('*').order('name'),
    supabase.from('product_categories').select('category_id').eq('product_id', id),
    supabase.from('product_makes').select('make_id').eq('product_id', id),
  ])

  if (!product) notFound()

  // If product_categories table missing, fall back to direct category_id on product
  let selectedCategoryIds = (pc ?? []).map(r => r.category_id)
  if (selectedCategoryIds.length === 0 && product.category_id) {
    selectedCategoryIds = [product.category_id]
  }
  const selectedMakeIds = (pm ?? []).map(r => r.make_id)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Редактирай продукт</h1>
      <ProductForm
        product={product}
        categories={categories ?? []}
        makes={makes ?? []}
        selectedCategoryIds={selectedCategoryIds}
        selectedMakeIds={selectedMakeIds}
      />
    </div>
  )
}

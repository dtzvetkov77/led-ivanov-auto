import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Нов продукт</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  )
}

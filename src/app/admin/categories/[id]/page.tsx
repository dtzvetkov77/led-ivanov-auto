import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CategoryForm from '@/components/CategoryForm'
import Link from 'next/link'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: category } = await supabase.from('categories').select('*').eq('id', id).single()
  if (!category) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/categories" className="text-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Редактиране: {category.name}</h1>
      </div>
      <CategoryForm category={category} />
    </div>
  )
}

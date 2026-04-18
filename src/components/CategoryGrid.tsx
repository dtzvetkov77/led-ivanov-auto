import Link from 'next/link'
import Image from 'next/image'
import type { Category } from '@/lib/types'

type Props = { categories: Category[] }

export default function CategoryGrid({ categories }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Категории</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group relative rounded-lg overflow-hidden bg-surface border border-border hover:border-accent transition-colors aspect-[4/3]"
          >
            {cat.image_url ? (
              <Image src={cat.image_url} alt={cat.name} fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" unoptimized />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a0000] to-surface-2" />
            )}
            <div className="absolute inset-0 flex items-end p-3">
              <span className="text-sm font-semibold bg-black/60 px-2 py-1 rounded">{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

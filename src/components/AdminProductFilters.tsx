'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

type Category = { id: string; name: string }

export default function AdminProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    if (key !== 'page') params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return (
    <div className="flex flex-wrap gap-3 mb-5">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Търси продукт..."
          defaultValue={searchParams.get('q') ?? ''}
          onChange={e => update('q', e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {/* Category filter */}
      <select
        defaultValue={searchParams.get('cat') ?? ''}
        onChange={e => update('cat', e.target.value)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
      >
        <option value="">Всички категории</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Published filter */}
      <select
        defaultValue={searchParams.get('pub') ?? ''}
        onChange={e => update('pub', e.target.value)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
      >
        <option value="">Всички</option>
        <option value="1">Публикувани</option>
        <option value="0">Скрити</option>
      </select>
    </div>
  )
}

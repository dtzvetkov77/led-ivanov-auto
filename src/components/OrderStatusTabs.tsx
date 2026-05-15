'use client'
import { useRouter } from 'next/navigation'

const STATUSES = [
  { value: 'all',       label: 'Всички',     color: '' },
  { value: 'new',       label: 'Нови',       color: 'text-yellow-400' },
  { value: 'confirmed', label: 'Потвърдени', color: 'text-blue-400' },
  { value: 'shipped',   label: 'Изпратени',  color: 'text-purple-400' },
  { value: 'delivered', label: 'Доставени',  color: 'text-green-400' },
  { value: 'cancelled', label: 'Отказани',   color: 'text-red-400' },
]

type Props = {
  active: string
  counts: Record<string, number>
  total: number
}

export default function OrderStatusTabs({ active, counts, total }: Props) {
  const router = useRouter()

  const set = (v: string) => {
    const url = v === 'all' ? '/admin/orders' : `/admin/orders?status=${v}`
    router.push(url)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map(s => {
        const count = s.value === 'all' ? total : (counts[s.value] ?? 0)
        const isActive = active === s.value
        return (
          <button
            key={s.value}
            onClick={() => set(s.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isActive
                ? 'bg-accent border-accent text-white'
                : 'bg-surface border-border text-muted hover:text-white hover:border-white/20'
            }`}
          >
            <span>{s.label}</span>
            {count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : `bg-border ${s.color || 'text-muted'}`
              }`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

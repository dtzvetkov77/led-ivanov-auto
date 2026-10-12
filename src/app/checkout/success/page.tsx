import Link from 'next/link'
import ConversionTracker from './ConversionTracker'
import { createServiceClient } from '@/lib/supabase/server'

export const metadata = { title: 'Поръчката е получена | LED Ivanov Auto', robots: { index: false } }

type Props = { searchParams: Promise<{ order?: string }> }

export default async function SuccessPage({ searchParams }: Props) {
  const { order } = await searchParams
  const safeOrder = order && /^ORD-\d{4}-\d{4,}$/.test(order) ? order : null

  // Order total for the Google Ads conversion value (orders are not publicly readable)
  let total: number | null = null
  if (safeOrder) {
    const supabase = createServiceClient()
    const { data } = await supabase.from('orders').select('total').eq('order_number', safeOrder).maybeSingle()
    total = data ? Number(data.total) : null
  }
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <ConversionTracker orderNumber={safeOrder} value={total} />
      <div className="text-accent text-6xl mb-4">✓</div>
      <h1 className="text-3xl font-black mb-3">Поръчката е получена!</h1>
      {safeOrder && (
        <p className="text-muted mb-2">
          Номер: <span className="text-white font-mono">{safeOrder}</span>
        </p>
      )}
      <p className="text-muted mb-8">Ще се свържем с вас скоро за потвърждение.</p>
      <Link
        href="/products"
        className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded font-semibold transition-colors"
      >
        Продължи пазаруването
      </Link>
    </div>
  )
}

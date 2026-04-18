import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OrderStatusForm from '@/components/OrderStatusForm'
import type { Order } from '@/lib/types'

type Props = { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: order } = await supabase.from('orders').select('*').eq('id', id).single()
  if (!order) notFound()

  const o = order as Order
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{o.order_number}</h1>
      <div className="bg-surface border border-border rounded-lg p-6 space-y-3 mb-6 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div><span className="text-muted">Клиент:</span> {o.customer_name}</div>
          <div><span className="text-muted">Телефон:</span> {o.customer_phone}</div>
          <div><span className="text-muted">Имейл:</span> {o.customer_email ?? '—'}</div>
          <div><span className="text-muted">Куриер:</span> {o.courier === 'ekont' ? 'Еконт' : 'Спиди'}</div>
          <div className="col-span-2"><span className="text-muted">Адрес:</span> {o.delivery_address}, {o.delivery_city}</div>
          {o.notes && <div className="col-span-2"><span className="text-muted">Бележка:</span> {o.notes}</div>}
        </div>
      </div>
      <div className="bg-surface border border-border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Артикули</h2>
        {o.items.map((item, i) => (
          <div key={i} className="flex justify-between py-2 border-b border-border last:border-0 text-sm">
            <span>{item.name} × {item.qty}</span>
            <span className="text-accent">{(item.price * item.qty).toFixed(2)} €</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 font-bold">
          <span>Общо</span>
          <span>{Number(o.total).toFixed(2)} €</span>
        </div>
      </div>
      <OrderStatusForm orderId={o.id} currentStatus={o.status} />
    </div>
  )
}

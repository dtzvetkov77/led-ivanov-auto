import { createClient } from '@/lib/supabase/server'
import AdminTable from '@/components/AdminTable'
import Link from 'next/link'
import DeleteOrderButton from '@/components/DeleteOrderButton'
import type { Order } from '@/lib/types'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const statusColors: Record<string, string> = {
    new: 'text-yellow-400', confirmed: 'text-blue-400',
    shipped: 'text-purple-400', delivered: 'text-green-400', cancelled: 'text-red-400',
  }
  const statusLabels: Record<string, string> = {
    new: 'Нова', confirmed: 'Потвърдена', shipped: 'Изпратена', delivered: 'Доставена', cancelled: 'Отказана',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Поръчки</h1>
      <AdminTable<Order>
        rows={orders ?? []}
        columns={[
          { key: 'order_number', label: 'Номер', render: o => <Link href={`/admin/orders/${o.id}`} className="text-accent hover:underline font-mono">{o.order_number}</Link> },
          { key: 'customer_name', label: 'Клиент' },
          { key: 'customer_phone', label: 'Телефон' },
          { key: 'delivery_city', label: 'Град' },
          { key: 'total', label: 'Сума', render: o => `${Number(o.total).toFixed(2)} €` },
          { key: 'status', label: 'Статус', render: o => <span className={statusColors[o.status]}>{statusLabels[o.status]}</span> },
          { key: 'created_at', label: 'Дата', render: o => new Date(o.created_at).toLocaleDateString('bg-BG') },
          { key: 'id', label: '', render: o => <DeleteOrderButton orderId={o.id} /> },
        ]}
      />
    </div>
  )
}

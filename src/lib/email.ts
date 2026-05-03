import { Resend } from 'resend'
import type { Order } from './types'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
if (!ADMIN_EMAIL && process.env.NODE_ENV === 'production') {
  throw new Error('ADMIN_EMAIL environment variable is required')
}

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function sendOrderEmails(order: Order) {
  const itemsHtml = order.items
    .map(i => `<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${i.price.toFixed(2)} €</td></tr>`)
    .join('')

  const adminEmailPromise = resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ADMIN_EMAIL ?? 'admin@ivanov-auto.com',
    subject: `Нова поръчка ${esc(order.order_number)}`,
    html: `
      <h2>Нова поръчка ${esc(order.order_number)}</h2>
      <p><b>Клиент:</b> ${esc(order.customer_name)}</p>
      <p><b>Телефон:</b> ${esc(order.customer_phone)}</p>
      <p><b>Имейл:</b> ${esc(order.customer_email)}</p>
      <p><b>Адрес:</b> ${esc(order.delivery_address)}, ${esc(order.delivery_city)}</p>
      <p><b>Куриер:</b> ${order.courier === 'ekont' ? 'Еконт' : 'Спиди'}</p>
      <table border="1" cellpadding="6">
        <thead><tr><th>Продукт</th><th>Бр.</th><th>Цена</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><b>Общо: ${order.total.toFixed(2)} €</b></p>
      ${order.notes ? `<p><b>Бележка:</b> ${esc(order.notes)}</p>` : ''}
    `,
  })

  const customerEmailPromise = order.customer_email
    ? resend.emails.send({
        from: 'LED Ivanov Auto <onboarding@resend.dev>',
        to: order.customer_email,
        subject: `Вашата поръчка ${esc(order.order_number)} е получена`,
        html: `
          <h2>Благодарим Ви!</h2>
          <p>Поръчка <b>${esc(order.order_number)}</b> беше получена успешно.</p>
          <p>Ще се свържем с вас скоро на телефон ${esc(order.customer_phone)} за потвърждение.</p>
          <table border="1" cellpadding="6">
            <thead><tr><th>Продукт</th><th>Бр.</th><th>Цена</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p><b>Общо: ${order.total.toFixed(2)} €</b></p>
        `,
      })
    : Promise.resolve(null)

  const results = await Promise.allSettled([adminEmailPromise, customerEmailPromise])
  results.forEach((r, i) => {
    const label = i === 0 ? 'admin' : 'customer'
    if (r.status === 'rejected') {
      console.error(`[email] ${label} REJECTED:`, r.reason)
    } else {
      const val = r.value as unknown as { data?: { id?: string }; error?: { message?: string; name?: string } } | null
      if (val?.error) {
        console.error(`[email] ${label} ERROR:`, JSON.stringify(val.error))
      } else {
        console.log(`[email] ${label} sent OK, id=${val?.data?.id}`)
      }
    }
  })
}

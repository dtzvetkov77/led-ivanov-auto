import { Resend } from 'resend'
import type { Order } from './types'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
if (!ADMIN_EMAIL && process.env.NODE_ENV === 'production') {
  throw new Error('ADMIN_EMAIL environment variable is required')
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ledivanovauto.com'

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="bg">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:#111111;border-radius:16px 16px 0 0;padding:32px 40px;border-bottom:2px solid #c8102e;text-align:center;">
            <div style="font-size:22px;font-weight:900;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">
              ⚡ LED IVANOV AUTO
            </div>
            <div style="font-size:11px;color:#888888;letter-spacing:2px;margin-top:4px;text-transform:uppercase;">ledivanovauto.com</div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#161616;padding:40px;border-radius:0 0 16px 16px;">
            ${body}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <div style="font-size:11px;color:#444444;line-height:1.8;">
              LED Ivanov Auto · ул. Георги Русев 2, София · <a href="tel:+359999997996" style="color:#c8102e;text-decoration:none;">+359 99 999 7996</a>
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function itemsTable(items: Order['items']) {
  const rows = items.map(i => `
    <tr>
      <td style="padding:12px 16px;color:#ffffff;font-size:13px;border-bottom:1px solid #222222;">${esc(i.name)}</td>
      <td style="padding:12px 16px;color:#aaaaaa;font-size:13px;border-bottom:1px solid #222222;text-align:center;white-space:nowrap;">${i.qty} бр.</td>
      <td style="padding:12px 16px;color:#c8102e;font-size:13px;font-weight:700;border-bottom:1px solid #222222;text-align:right;white-space:nowrap;">${(i.price * i.qty).toFixed(2)} €</td>
    </tr>`).join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:12px;overflow:hidden;margin:20px 0;">
      <tr style="background:#1a1a1a;">
        <th style="padding:10px 16px;color:#666666;font-size:11px;letter-spacing:1px;text-transform:uppercase;text-align:left;font-weight:600;">Продукт</th>
        <th style="padding:10px 16px;color:#666666;font-size:11px;letter-spacing:1px;text-transform:uppercase;text-align:center;font-weight:600;">Кол.</th>
        <th style="padding:10px 16px;color:#666666;font-size:11px;letter-spacing:1px;text-transform:uppercase;text-align:right;font-weight:600;">Цена</th>
      </tr>
      ${rows}
    </table>`
}

function infoRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;color:#666666;font-size:12px;letter-spacing:1px;text-transform:uppercase;width:120px;">${label}</td>
      <td style="padding:8px 0;color:#ffffff;font-size:14px;">${value}</td>
    </tr>`
}

function adminHtml(order: Order) {
  const body = `
    <!-- Title -->
    <div style="margin-bottom:28px;">
      <div style="display:inline-block;background:#c8102e;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:4px 12px;border-radius:4px;margin-bottom:12px;">Нова поръчка</div>
      <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:2px;">${esc(order.order_number)}</div>
    </div>

    <!-- Customer info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${infoRow('Клиент', esc(order.customer_name))}
      ${infoRow('Телефон', `<a href="tel:${esc(order.customer_phone)}" style="color:#c8102e;text-decoration:none;">${esc(order.customer_phone)}</a>`)}
      ${order.customer_email ? infoRow('Имейл', `<a href="mailto:${esc(order.customer_email)}" style="color:#c8102e;text-decoration:none;">${esc(order.customer_email)}</a>`) : ''}
      ${infoRow('Адрес', `${esc(order.delivery_address)}, ${esc(order.delivery_city)}`)}
      ${infoRow('Куриер', order.courier === 'ekont' ? 'Еконт' : 'Спиди')}
    </table>

    <!-- Items -->
    ${itemsTable(order.items)}

    <!-- Total -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:16px;background:#1a0000;border:1px solid #c8102e;border-radius:10px;text-align:right;">
          <span style="color:#888888;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-right:16px;">Общо</span>
          <span style="color:#c8102e;font-size:24px;font-weight:900;">${order.total.toFixed(2)} €</span>
        </td>
      </tr>
    </table>

    ${order.notes ? `
    <div style="margin-top:20px;padding:16px;background:#111111;border-left:3px solid #c8102e;border-radius:0 8px 8px 0;">
      <div style="color:#666666;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Бележка</div>
      <div style="color:#cccccc;font-size:13px;">${esc(order.notes)}</div>
    </div>` : ''}

    <!-- CTA -->
    <div style="margin-top:28px;text-align:center;">
      <a href="${SITE}/admin/orders" style="display:inline-block;background:#c8102e;color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:14px 32px;border-radius:10px;text-decoration:none;">Виж поръчката в админ панела</a>
    </div>`

  return baseTemplate(`Нова поръчка ${order.order_number}`, body)
}

function customerHtml(order: Order) {
  const body = `
    <!-- Title -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:40px;margin-bottom:12px;">✅</div>
      <div style="font-size:24px;font-weight:900;color:#ffffff;margin-bottom:8px;">Поръчката е получена!</div>
      <div style="font-size:14px;color:#888888;">Благодарим ти за доверието</div>
    </div>

    <!-- Order number badge -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#1a0000;border:1px solid #c8102e;border-radius:8px;padding:10px 24px;">
        <span style="color:#666666;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Номер на поръчка</span>
        <div style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:2px;margin-top:2px;">${esc(order.order_number)}</div>
      </div>
    </div>

    <!-- Info -->
    <div style="background:#111111;border-radius:12px;padding:20px 24px;margin-bottom:8px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow('Адрес', `${esc(order.delivery_address)}, ${esc(order.delivery_city)}`)}
        ${infoRow('Куриер', order.courier === 'ekont' ? 'Еконт' : 'Спиди')}
      </table>
    </div>

    <!-- Items -->
    ${itemsTable(order.items)}

    <!-- Total -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:16px;background:#1a0000;border:1px solid #c8102e;border-radius:10px;text-align:right;">
          <span style="color:#888888;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-right:16px;">Общо</span>
          <span style="color:#c8102e;font-size:24px;font-weight:900;">${order.total.toFixed(2)} €</span>
        </td>
      </tr>
    </table>

    <!-- Message -->
    <div style="margin-top:24px;padding:20px;background:#111111;border-radius:12px;text-align:center;">
      <div style="color:#aaaaaa;font-size:13px;line-height:1.7;">
        Ще се свържем с теб на <a href="tel:${esc(order.customer_phone)}" style="color:#c8102e;text-decoration:none;font-weight:700;">${esc(order.customer_phone)}</a> за потвърждение.<br>
        Въпроси? Пиши ни или се обади на <a href="tel:+359999997996" style="color:#c8102e;text-decoration:none;font-weight:700;">+359 99 999 7996</a>
      </div>
    </div>

    <!-- CTA -->
    <div style="margin-top:28px;text-align:center;">
      <a href="${SITE}/products" style="display:inline-block;background:#c8102e;color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:14px 32px;border-radius:10px;text-decoration:none;">Разгледай още продукти</a>
    </div>`

  return baseTemplate(`Поръчка ${order.order_number} е получена`, body)
}

export async function sendOrderEmails(order: Order) {
  console.log('[email] sendOrderEmails called, order=', order.order_number, 'adminTo=', ADMIN_EMAIL)

  const adminEmailPromise = resend.emails.send({
    from: 'LED Ivanov Auto <orders@ledivanovauto.com>',
    to: ADMIN_EMAIL ?? 'admin@ledivanovauto.com',
    subject: `🔔 Нова поръчка ${order.order_number}`,
    html: adminHtml(order),
  })

  const customerEmailPromise = order.customer_email
    ? resend.emails.send({
        from: 'LED Ivanov Auto <orders@ledivanovauto.com>',
        to: order.customer_email,
        subject: `✅ Поръчка ${order.order_number} е получена — LED Ivanov Auto`,
        html: customerHtml(order),
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

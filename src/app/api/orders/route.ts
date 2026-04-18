import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/order-number'
import { sendOrderEmails } from '@/lib/email'

const CartItemSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string(),
  price: z.number().positive(),
  image: z.string(),
  qty: z.number().int().positive(),
})

const OrderSchema = z.object({
  customer_name: z.string().min(2).max(100),
  customer_phone: z.string().min(7).max(20),
  customer_email: z.string().email().optional().or(z.literal('')),
  delivery_address: z.string().min(5).max(200),
  delivery_city: z.string().min(2).max(100),
  courier: z.enum(['ekont', 'speedy']),
  items: z.array(CartItemSchema).min(1),
  notes: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  // Validate and replace prices with authoritative values from DB
  const productIds = data.items.map(i => i.product_id)
  const supabase = createServiceClient()
  const { data: dbProducts, error: productsError } = await supabase
    .from('products')
    .select('id, price, sale_price, published')
    .in('id', productIds)
    .eq('published', true)

  if (productsError || !dbProducts) {
    return NextResponse.json({ error: 'Грешка при запис' }, { status: 500 })
  }

  const priceMap = new Map(dbProducts.map(p => [p.id, Number(p.sale_price ?? p.price)]))

  // Reject if any product_id is not found (unpublished or doesn't exist)
  for (const item of data.items) {
    if (!priceMap.has(item.product_id)) {
      return NextResponse.json({ error: 'Невалиден продукт в количката' }, { status: 400 })
    }
  }

  // Replace client prices with DB prices
  const validatedItems = data.items.map(item => ({
    ...item,
    price: priceMap.get(item.product_id)!,
  }))

  const total = validatedItems.reduce((s, i) => s + i.price * i.qty, 0)

  let order_number: string
  try {
    order_number = await generateOrderNumber()
  } catch {
    return NextResponse.json({ error: 'Грешка при запис' }, { status: 500 })
  }

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      order_number,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email || null,
      delivery_address: data.delivery_address,
      delivery_city: data.delivery_city,
      courier: data.courier,
      items: validatedItems,
      total,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Грешка при запис' }, { status: 500 })

  await sendOrderEmails(order)

  return NextResponse.json({ order_number: order.order_number }, { status: 201 })
}

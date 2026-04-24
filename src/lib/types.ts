export type Make = {
  id: string
  name: string
  slug: string
}

export type Model = {
  id: string
  make_id: string
  name: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  sale_price: number | null
  category_id: string | null
  images: string[]
  published: boolean
  position: number
  attributes: ProductAttribute[]
  variations: ProductVariation[]
  created_at: string
  updated_at: string
}

export type ProductAttribute = {
  name: string
  options: string[]
  variation: boolean
}

export type ProductVariation = {
  attributes: Record<string, string>  // e.g. { "Цокъл": "H7" }
  price: number
  sale_price: number | null
  sku: string | null
  images: string[]
}

export type CartItem = {
  product_id: string
  name: string
  slug: string
  price: number
  image: string
  qty: number
}

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  delivery_address: string
  delivery_city: string
  courier: 'ekont' | 'speedy'
  items: CartItem[]
  total: number
  status: OrderStatus
  notes: string | null
  created_at: string
  updated_at: string
}

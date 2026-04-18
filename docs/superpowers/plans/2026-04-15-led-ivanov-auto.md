# LED Ivanov Auto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Bulgarian e-commerce site for LED car bulbs — cart + cash-on-delivery via Еконт/Спиди, admin panel, and Resend email notifications.

**Architecture:** Next.js 14 App Router with Supabase (PostgreSQL + Auth + Storage). Public pages are server-rendered; cart lives in localStorage. Admin routes are protected by Next.js middleware that checks the Supabase session.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Supabase JS client v2, Tailwind CSS, Zod, Resend, Vercel Edge Middleware.

---

## File Map

```
src/
  app/
    layout.tsx                  — root layout, Inter font, dark bg
    page.tsx                    — homepage (hero + filter + category grid + featured products)
    products/
      page.tsx                  — catalog with filter sidebar
      [slug]/page.tsx           — product detail
    cart/page.tsx               — cart page
    checkout/
      page.tsx                  — checkout form
      success/page.tsx          — order confirmation
    video/page.tsx              — video page
    reviews/page.tsx            — customer reviews
    contact/page.tsx            — contact info
    admin/
      layout.tsx                — admin shell, checks auth
      login/page.tsx            — email+password login
      page.tsx                  — dashboard
      orders/
        page.tsx                — orders list
        [id]/page.tsx           — order detail + status update
      products/
        page.tsx                — products list
        new/page.tsx            — create product
        [id]/page.tsx           — edit product
      categories/page.tsx       — manage categories
    api/
      orders/route.ts           — POST: validate + save + email
      makes/route.ts            — GET: all makes
      models/route.ts           — GET: models for a make
  components/
    Navbar.tsx
    HeroFilter.tsx
    CategoryGrid.tsx
    ProductGrid.tsx
    ProductCard.tsx
    ProductGallery.tsx
    CartDrawer.tsx
    CheckoutForm.tsx
    AdminTable.tsx
  lib/
    supabase/
      client.ts                 — browser Supabase client
      server.ts                 — server Supabase client (service role)
    cart.ts                     — localStorage cart helpers
    order-number.ts             — generate ORD-YYYY-NNNN
    email.ts                    — Resend send helpers
    types.ts                    — shared TypeScript types
  middleware.ts                 — protect /admin/* routes
scripts/
  import-products.ts            — one-time WooCommerce CSV import
supabase/
  migrations/
    001_initial_schema.sql
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Init Next.js project with TypeScript and Tailwind**

```bash
cd "/Users/daniel/Developer/Led ivanov "
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-git --import-alias "@/*"
```

Expected: project scaffolded, `src/app/` exists.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr zod resend
npm install -D tsx
```

- [ ] **Step 3: Create `.env.local`**

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
```

- [ ] **Step 4: Write shared types**

Create `src/lib/types.ts`:

```typescript
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
  created_at: string
  updated_at: string
}

export type CartItem = {
  product_id: string
  name: string
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
```

- [ ] **Step 5: Write browser Supabase client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 6: Write server Supabase client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}

export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}
```

- [ ] **Step 7: Write root layout**

Replace `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'LED Ivanov Auto',
  description: 'Висококачествени LED крушки и авто аксесоари',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body className={`${inter.className} bg-[#0a0a0a] text-white`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 8: Update `tailwind.config.ts` with brand colors**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: '#111111', 2: '#1a1a1a' },
        border: { DEFAULT: '#2a2a2a', 2: '#333333' },
        accent: { DEFAULT: '#cc0000', hover: '#dd0000' },
        muted: { DEFAULT: '#888888', 2: '#aaaaaa' },
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js project with Supabase + Tailwind"
```

---

## Task 2: Database Migration

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Write migration SQL**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Makes
create table makes (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

-- Models
create table models (
  id      uuid primary key default gen_random_uuid(),
  make_id uuid references makes on delete cascade,
  name    text not null
);

-- Categories
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  image_url   text
);

-- Products
create table products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  description       text,
  short_description text,
  price             numeric(10,2) not null,
  sale_price        numeric(10,2),
  category_id       uuid references categories on delete set null,
  images            text[] default '{}',
  published         boolean default true,
  position          integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Product–Make join
create table product_makes (
  product_id uuid references products on delete cascade,
  make_id    uuid references makes on delete cascade,
  primary key (product_id, make_id)
);

-- Product–Model join
create table product_models (
  product_id uuid references products on delete cascade,
  model_id   uuid references models on delete cascade,
  primary key (product_id, model_id)
);

-- Orders
create table orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique not null,
  customer_name    text not null,
  customer_phone   text not null,
  customer_email   text,
  delivery_address text not null,
  delivery_city    text not null,
  courier          text not null check (courier in ('ekont', 'speedy')),
  items            jsonb not null,
  total            numeric(10,2) not null,
  status           text default 'new' check (status in ('new','confirmed','shipped','delivered','cancelled')),
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Indexes
create index on product_makes(make_id);
create index on product_models(model_id);
create index on models(make_id);
create index on products(category_id);
create index on products(published);
create index on orders(status);
create index on orders(created_at desc);

-- RLS
alter table makes     enable row level security;
alter table models    enable row level security;
alter table categories enable row level security;
alter table products  enable row level security;
alter table product_makes  enable row level security;
alter table product_models enable row level security;
alter table orders    enable row level security;

-- Public read for catalog tables
create policy "public read makes"      on makes      for select using (true);
create policy "public read models"     on models     for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read products"   on products   for select using (true);
create policy "public read product_makes"  on product_makes  for select using (true);
create policy "public read product_models" on product_models for select using (true);

-- Authenticated write for catalog tables
create policy "admin write makes"      on makes      for all using (auth.role() = 'authenticated');
create policy "admin write models"     on models     for all using (auth.role() = 'authenticated');
create policy "admin write categories" on categories for all using (auth.role() = 'authenticated');
create policy "admin write products"   on products   for all using (auth.role() = 'authenticated');
create policy "admin write product_makes"  on product_makes  for all using (auth.role() = 'authenticated');
create policy "admin write product_models" on product_models for all using (auth.role() = 'authenticated');

-- Orders: anyone inserts, only admin reads/updates
create policy "public insert orders" on orders for insert with check (true);
create policy "admin read orders"    on orders for select using (auth.role() = 'authenticated');
create policy "admin update orders"  on orders for update using (auth.role() = 'authenticated');
```

- [ ] **Step 2: Apply migration via Supabase CLI (or paste in SQL editor)**

```bash
# Option A — CLI (if supabase project linked)
npx supabase db push

# Option B — paste the file into Supabase Dashboard → SQL Editor → Run
```

Expected: all 7 tables created, indexes set, RLS policies active.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/001_initial_schema.sql
git commit -m "feat: add initial database schema with RLS"
```

---

## Task 3: CSV Import Script

**Files:**
- Create: `scripts/import-products.ts`

The CSV columns we need (Bulgarian headers, 0-indexed after parsing):
- `ID` → wc id (ignored after import)
- `Ime` (col 4) → name
- `Публикувано` (col 5) → published
- `Кратко описание` (col 8) → short_description
- `Описание` (col 9) → description
- `Промоционална цена:` (col 25) → sale_price
- `Редовна цена:` (col 26) → price
- `Категории` (col 27) → category name
- `Изображения` (col 31) → comma-separated image URLs
- `Позиция` (col 40) → position
- `Марки` (col 41) → make name (comma-separated if multiple)
- `Стойност(и) на атрибута 1` (col 43) → model names (comma-separated, for attr named "Модел X")

- [ ] **Step 1: Write the import script**

Create `scripts/import-products.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[а-яёА-ЯЁ]/g, (ch) => cyrillicMap[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const cyrillicMap: Record<string, string> = {
  а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ж:'zh',з:'z',и:'i',й:'y',
  к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',
  ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sht',ъ:'a',ь:'',ю:'yu',я:'ya',
}

async function main() {
  const csvPath = join(process.cwd(), 'wc-product-export-9-4-2026-1775722045909.csv')
  const raw = readFileSync(csvPath, 'utf-8')
  const rows: string[][] = parse(raw, { relaxColumnCount: true, skipEmptyLines: true })
  const headers = rows[0]
  const data = rows.slice(1)

  const col = (row: string[], name: string) => row[headers.indexOf(name)] ?? ''

  // Collect unique makes
  const makeNames = new Set<string>()
  for (const row of data) {
    const brand = col(row, 'Марки').trim()
    if (brand) brand.split(',').forEach(b => makeNames.add(b.trim()))
  }

  // Insert makes
  const makeMap: Record<string, string> = {}
  for (const name of makeNames) {
    if (!name) continue
    const { data: existing } = await supabase.from('makes').select('id').eq('name', name).single()
    if (existing) { makeMap[name] = existing.id; continue }
    const { data: inserted, error } = await supabase
      .from('makes').insert({ name, slug: slugify(name) }).select('id').single()
    if (error) throw error
    makeMap[name] = inserted.id
    console.log(`Make: ${name}`)
  }

  // Collect categories
  const catNames = new Set<string>()
  for (const row of data) {
    const cat = col(row, 'Категории').trim()
    if (cat) catNames.add(cat)
  }

  // Insert categories
  const catMap: Record<string, string> = {}
  for (const name of catNames) {
    if (!name) continue
    const { data: existing } = await supabase.from('categories').select('id').eq('name', name).single()
    if (existing) { catMap[name] = existing.id; continue }
    const { data: inserted, error } = await supabase
      .from('categories').insert({ name, slug: slugify(name) }).select('id').single()
    if (error) throw error
    catMap[name] = inserted.id
    console.log(`Category: ${name}`)
  }

  // Insert products
  for (const row of data) {
    const name = col(row, 'Ими').trim() || col(row, 'Ime').trim()
    // Find name column dynamically — it's always index 4 in this export
    const productName = row[4]?.trim()
    if (!productName) continue

    const priceRaw = col(row, 'Редовна цена:').replace(',', '.')
    const salePriceRaw = col(row, 'Промоционална цена:').replace(',', '.')
    const price = parseFloat(priceRaw) || 0
    const sale_price = salePriceRaw ? parseFloat(salePriceRaw) : null
    const published = col(row, 'Публикувано') === '1'
    const position = parseInt(col(row, 'Позиция') || '0', 10)
    const imagesRaw = col(row, 'Изображения')
    const images = imagesRaw ? imagesRaw.split(',').map(s => s.trim()).filter(Boolean) : []
    const short_description = col(row, 'Кратко описание') || null
    const description = col(row, 'Описание') || null
    const catName = col(row, 'Категории').trim()
    const category_id = catName ? (catMap[catName] ?? null) : null
    const slug = slugify(productName) + '-' + row[0]

    const { data: product, error: pErr } = await supabase
      .from('products')
      .upsert({ name: productName, slug, description, short_description, price, sale_price, category_id, images, published, position }, { onConflict: 'slug' })
      .select('id').single()
    if (pErr) { console.error(`Product error: ${productName}`, pErr.message); continue }

    // Link makes
    const makesRaw = col(row, 'Марки')
    if (makesRaw) {
      for (const makeName of makesRaw.split(',').map(s => s.trim()).filter(Boolean)) {
        const makeId = makeMap[makeName]
        if (!makeId) continue
        await supabase.from('product_makes').upsert({ product_id: product.id, make_id: makeId })
      }
    }

    // Link models — find attribute columns for model values
    // Attribute names are at cols 42, 46, 50… (every 4 cols); values at 43, 47, 51…
    for (let a = 42; a < headers.length - 1; a += 4) {
      const attrName = row[a]?.trim() ?? ''
      const attrValue = row[a + 1]?.trim() ?? ''
      if (!attrName.toLowerCase().startsWith('модел') || !attrValue) continue
      // attrName is like "Модел Audi" — extract make from it
      const makePart = attrName.replace(/^Модел\s*/i, '').trim()
      const makeId = makeMap[makePart]
      if (!makeId) continue

      for (const modelName of attrValue.split(',').map(s => s.trim()).filter(Boolean)) {
        // Find or create model
        const { data: existing } = await supabase
          .from('models').select('id').eq('make_id', makeId).eq('name', modelName).single()
        let modelId: string
        if (existing) {
          modelId = existing.id
        } else {
          const { data: newModel, error: mErr } = await supabase
            .from('models').insert({ make_id: makeId, name: modelName }).select('id').single()
          if (mErr) continue
          modelId = newModel.id
        }
        await supabase.from('product_models').upsert({ product_id: product.id, model_id: modelId })
      }
    }
  }

  console.log('Import complete.')
}

main().catch(console.error)
```

- [ ] **Step 2: Install csv-parse**

```bash
npm install csv-parse
```

- [ ] **Step 3: Copy CSV to project root, then run the script**

```bash
cp "/Users/daniel/Downloads/wc-product-export-9-4-2026-1775722045909.csv" "/Users/daniel/Developer/Led ivanov /wc-product-export-9-4-2026-1775722045909.csv"
cd "/Users/daniel/Developer/Led ivanov "
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/import-products.ts
```

Expected: ~681 products inserted, makes and models linked.

- [ ] **Step 4: Add CSV to .gitignore**

```bash
echo "wc-product-export-*.csv" >> .gitignore
```

- [ ] **Step 5: Commit**

```bash
git add scripts/import-products.ts .gitignore
git commit -m "feat: add WooCommerce CSV import script"
```

---

## Task 4: Cart Helpers

**Files:**
- Create: `src/lib/cart.ts`

- [ ] **Step 1: Write cart helpers**

Create `src/lib/cart.ts`:

```typescript
import type { CartItem } from './types'

const KEY = 'led_ivanov_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function addToCart(item: Omit<CartItem, 'qty'>): CartItem[] {
  const cart = getCart()
  const existing = cart.find(i => i.product_id === item.product_id)
  if (existing) {
    existing.qty += 1
  } else {
    cart.push({ ...item, qty: 1 })
  }
  saveCart(cart)
  return cart
}

export function updateQty(product_id: string, qty: number): CartItem[] {
  const cart = getCart().map(i =>
    i.product_id === product_id ? { ...i, qty } : i
  ).filter(i => i.qty > 0)
  saveCart(cart)
  return cart
}

export function removeFromCart(product_id: string): CartItem[] {
  const cart = getCart().filter(i => i.product_id !== product_id)
  saveCart(cart)
  return cart
}

export function clearCart(): void {
  localStorage.removeItem(KEY)
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/cart.ts
git commit -m "feat: add localStorage cart helpers"
```

---

## Task 5: Order Number + Email Helpers

**Files:**
- Create: `src/lib/order-number.ts`
- Create: `src/lib/email.ts`

- [ ] **Step 1: Write order number generator**

Create `src/lib/order-number.ts`:

```typescript
import { createServiceClient } from './supabase/server'

export async function generateOrderNumber(): Promise<string> {
  const supabase = createServiceClient()
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`)
  const seq = String((count ?? 0) + 1).padStart(4, '0')
  return `ORD-${year}-${seq}`
}
```

- [ ] **Step 2: Write email helpers**

Create `src/lib/email.ts`:

```typescript
import { Resend } from 'resend'
import type { Order } from './types'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'admin@ivanov-auto.com' // replace with real address

export async function sendOrderEmails(order: Order) {
  const itemsHtml = order.items
    .map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.price.toFixed(2)} лв</td></tr>`)
    .join('')

  // Email to admin
  await resend.emails.send({
    from: 'orders@ivanov-auto.com',
    to: ADMIN_EMAIL,
    subject: `Нова поръчка ${order.order_number}`,
    html: `
      <h2>Нова поръчка ${order.order_number}</h2>
      <p><b>Клиент:</b> ${order.customer_name}</p>
      <p><b>Телефон:</b> ${order.customer_phone}</p>
      <p><b>Имейл:</b> ${order.customer_email ?? '—'}</p>
      <p><b>Адрес:</b> ${order.delivery_address}, ${order.delivery_city}</p>
      <p><b>Куриер:</b> ${order.courier === 'ekont' ? 'Еконт' : 'Спиди'}</p>
      <table border="1" cellpadding="6">
        <thead><tr><th>Продукт</th><th>Бр.</th><th>Цена</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><b>Общо: ${order.total.toFixed(2)} лв</b></p>
      ${order.notes ? `<p><b>Бележка:</b> ${order.notes}</p>` : ''}
    `,
  })

  // Email to customer (if provided)
  if (order.customer_email) {
    await resend.emails.send({
      from: 'orders@ivanov-auto.com',
      to: order.customer_email,
      subject: `Вашата поръчка ${order.order_number} е получена`,
      html: `
        <h2>Благодарим Ви!</h2>
        <p>Поръчка <b>${order.order_number}</b> беше получена успешно.</p>
        <p>Ще се свържем с вас скоро на телефон ${order.customer_phone} за потвърждение.</p>
        <table border="1" cellpadding="6">
          <thead><tr><th>Продукт</th><th>Бр.</th><th>Цена</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><b>Общо: ${order.total.toFixed(2)} лв</b></p>
      `,
    })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/order-number.ts src/lib/email.ts
git commit -m "feat: add order number generator and Resend email helpers"
```

---

## Task 6: API Routes

**Files:**
- Create: `src/app/api/orders/route.ts`
- Create: `src/app/api/makes/route.ts`
- Create: `src/app/api/models/route.ts`

- [ ] **Step 1: Write POST /api/orders**

Create `src/app/api/orders/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/order-number'
import { sendOrderEmails } from '@/lib/email'

const CartItemSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().min(1),
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
  const body = await req.json()
  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const total = data.items.reduce((s, i) => s + i.price * i.qty, 0)
  const order_number = await generateOrderNumber()

  const supabase = createServiceClient()
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
      items: data.items,
      total,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Грешка при запис' }, { status: 500 })

  await sendOrderEmails(order)

  return NextResponse.json({ order_number: order.order_number }, { status: 201 })
}
```

- [ ] **Step 2: Write GET /api/makes**

Create `src/app/api/makes/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('makes').select('id, name, slug').order('name')
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 3: Write GET /api/models**

Create `src/app/api/models/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const makeSlug = req.nextUrl.searchParams.get('make')
  if (!makeSlug) return NextResponse.json([], { status: 200 })

  const supabase = await createClient()
  const { data: make } = await supabase
    .from('makes').select('id').eq('slug', makeSlug).single()
  if (!make) return NextResponse.json([])

  const { data, error } = await supabase
    .from('models').select('id, name').eq('make_id', make.id).order('name')
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/
git commit -m "feat: add orders, makes, models API routes"
```

---

## Task 7: Middleware (Admin Auth + Rate Limiting)

**Files:**
- Create: `src/middleware.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Write middleware**

Create `src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Rate limiting for /api/orders (10 req/min per IP)
const ipCounts = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipCounts.get(ip)
  if (!entry || now > entry.reset) {
    ipCounts.set(ip, { count: 1, reset: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rate limit order submissions
  if (pathname === '/api/orders' && req.method === 'POST') {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Твърде много заявки' }, { status: 429 })
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const res = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookies) => cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
        },
      }
    )
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/orders'],
}
```

- [ ] **Step 2: Add security headers to next.config.ts**

Replace or update `next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ivanov-auto.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
```

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts next.config.ts
git commit -m "feat: add admin auth middleware and security headers"
```

---

## Task 8: Navbar Component

**Files:**
- Create: `src/components/Navbar.tsx`

- [ ] **Step 1: Write Navbar**

Create `src/components/Navbar.tsx`:

```typescript
'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getCart } from '@/lib/cart'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const update = () => {
      const items = getCart()
      setCartCount(items.reduce((s, i) => s + i.qty, 0))
    }
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg tracking-wide">
            LED IVANOV <span className="text-accent">AUTO</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted">
            <Link href="/products" className="hover:text-white transition-colors">Продукти</Link>
            <Link href="/video" className="hover:text-white transition-colors">Видео</Link>
            <Link href="/reviews" className="hover:text-white transition-colors">Доволни Клиенти</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Контакти</Link>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2 text-white hover:text-accent transition-colors"
            aria-label="Количка"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 6M17 13l1.4 6M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
```

- [ ] **Step 2: Add Navbar to root layout**

Modify `src/app/layout.tsx` body:

```typescript
import Navbar from '@/components/Navbar'
// ...
<body className={`${inter.className} bg-[#0a0a0a] text-white`}>
  <Navbar />
  <main className="pt-16">{children}</main>
</body>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.tsx src/app/layout.tsx
git commit -m "feat: add Navbar with cart count badge"
```

---

## Task 9: CartDrawer Component

**Files:**
- Create: `src/components/CartDrawer.tsx`

- [ ] **Step 1: Write CartDrawer**

Create `src/components/CartDrawer.tsx`:

```typescript
'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getCart, updateQty, removeFromCart, cartTotal } from '@/lib/cart'
import type { CartItem } from '@/lib/types'

type Props = { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (open) setItems(getCart())
  }, [open])

  const handleQty = (id: string, qty: number) => {
    setItems(updateQty(id, qty))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleRemove = (id: string) => {
    setItems(removeFromCart(id))
    window.dispatchEvent(new Event('cart-updated'))
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-surface z-50 shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Количка</h2>
          <button onClick={onClose} className="text-muted hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-muted text-center mt-8">Количката е празна</p>
          ) : (
            items.map(item => (
              <div key={item.product_id} className="flex gap-3">
                {item.image && (
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover rounded" unoptimized />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2">{item.name}</p>
                  <p className="text-accent font-semibold">{item.price.toFixed(2)} лв</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => handleQty(item.product_id, item.qty - 1)} className="w-6 h-6 rounded bg-border-2 flex items-center justify-center text-sm">−</button>
                    <span className="text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => handleQty(item.product_id, item.qty + 1)} className="w-6 h-6 rounded bg-border-2 flex items-center justify-center text-sm">+</button>
                    <button onClick={() => handleRemove(item.product_id)} className="ml-auto text-muted hover:text-red-400 text-xs">Премахни</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="flex justify-between mb-3">
              <span className="text-muted">Общо</span>
              <span className="font-bold text-lg">{cartTotal(items).toFixed(2)} лв</span>
            </div>
            <Link href="/checkout" onClick={onClose} className="block w-full bg-accent hover:bg-accent-hover text-white text-center py-3 rounded font-semibold transition-colors">
              Поръчай
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CartDrawer.tsx
git commit -m "feat: add CartDrawer slide-in component"
```

---

## Task 10: ProductCard + ProductGrid Components

**Files:**
- Create: `src/components/ProductCard.tsx`
- Create: `src/components/ProductGrid.tsx`

- [ ] **Step 1: Write ProductCard**

Create `src/components/ProductCard.tsx`:

```typescript
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { addToCart } from '@/lib/cart'
import type { Product } from '@/lib/types'

type Props = { product: Product }

export default function ProductCard({ product }: Props) {
  const image = product.images[0] ?? ''
  const displayPrice = product.sale_price ?? product.price

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart({
      product_id: product.id,
      name: product.name,
      price: displayPrice,
      image,
    })
    window.dispatchEvent(new Event('cart-updated'))
  }

  return (
    <Link href={`/products/${product.slug}`} className="group bg-surface rounded-lg overflow-hidden border border-border hover:border-accent transition-colors flex flex-col">
      <div className="relative aspect-square bg-surface-2 overflow-hidden">
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">Няма снимка</div>
        )}
        {product.sale_price && (
          <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">Промо</span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-medium line-clamp-3 flex-1 mb-2">{product.name}</h3>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-accent font-bold">{displayPrice.toFixed(2)} лв</span>
            {product.sale_price && (
              <span className="text-muted line-through text-xs ml-2">{product.price.toFixed(2)} лв</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="bg-accent hover:bg-accent-hover text-white text-xs px-3 py-2 rounded transition-colors whitespace-nowrap"
          >
            В количка
          </button>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Write ProductGrid**

Create `src/components/ProductGrid.tsx`:

```typescript
import type { Product } from '@/lib/types'
import ProductCard from './ProductCard'

type Props = { products: Product[] }

export default function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return <p className="text-muted text-center py-12">Няма намерени продукти.</p>
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProductCard.tsx src/components/ProductGrid.tsx
git commit -m "feat: add ProductCard and ProductGrid components"
```

---

## Task 11: HeroFilter + CategoryGrid

**Files:**
- Create: `src/components/HeroFilter.tsx`
- Create: `src/components/CategoryGrid.tsx`

- [ ] **Step 1: Write HeroFilter**

Create `src/components/HeroFilter.tsx`:

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Make, Model, Category } from '@/lib/types'

type Props = {
  categories: Category[]
}

export default function HeroFilter({ categories }: Props) {
  const router = useRouter()
  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetch('/api/makes').then(r => r.json()).then(setMakes)
  }, [])

  useEffect(() => {
    if (!selectedMake) { setModels([]); setSelectedModel(''); return }
    fetch(`/api/models?make=${selectedMake}`).then(r => r.json()).then(data => {
      setModels(data)
      setSelectedModel('')
    })
  }, [selectedMake])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedMake) params.set('make', selectedMake)
    if (selectedModel) params.set('model', selectedModel)
    if (selectedCategory) params.set('category', selectedCategory)
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-[#1a0000] to-[#0a0a0a]">
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-20" />
      <div className="relative z-10 text-center px-4 w-full max-w-4xl">
        <p className="text-accent text-sm tracking-[4px] uppercase mb-3">LED Ivanov Auto</p>
        <h1 className="text-4xl md:text-6xl font-black mb-2">Висококачествени</h1>
        <h1 className="text-4xl md:text-6xl font-black text-accent mb-8">LED Крушки</h1>

        <div className="bg-black/50 backdrop-blur border border-border rounded-lg p-4 inline-flex flex-wrap gap-3 items-center justify-center">
          <select
            value={selectedMake}
            onChange={e => setSelectedMake(e.target.value)}
            className="bg-transparent border border-border-2 rounded px-3 py-2 text-sm min-w-[140px] text-white"
          >
            <option value="">Марка</option>
            {makes.map(m => <option key={m.id} value={m.slug}>{m.name}</option>)}
          </select>

          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="bg-transparent border border-border-2 rounded px-3 py-2 text-sm min-w-[140px] text-white disabled:opacity-40"
            disabled={!selectedMake}
          >
            <option value="">Модел</option>
            {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-transparent border border-border-2 rounded px-3 py-2 text-sm min-w-[160px] text-white"
          >
            <option value="">Категория</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>

          <button
            onClick={handleSearch}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded font-semibold transition-colors"
          >
            Търси
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write CategoryGrid**

Create `src/components/CategoryGrid.tsx`:

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroFilter.tsx src/components/CategoryGrid.tsx
git commit -m "feat: add HeroFilter and CategoryGrid components"
```

---

## Task 12: Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write homepage**

Replace `src/app/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import HeroFilter from '@/components/HeroFilter'
import CategoryGrid from '@/components/CategoryGrid'
import ProductGrid from '@/components/ProductGrid'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('products').select('*').eq('published', true).order('position').limit(8),
  ])

  return (
    <>
      <HeroFilter categories={categories ?? []} />
      <CategoryGrid categories={categories ?? []} />
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">Популярни Продукти</h2>
        <ProductGrid products={products ?? []} />
      </section>
    </>
  )
}
```

- [ ] **Step 2: Verify dev server starts**

```bash
npm run dev
```

Expected: homepage loads at http://localhost:3000 with hero section.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add homepage with hero, category grid, featured products"
```

---

## Task 13: Products Catalog Page

**Files:**
- Create: `src/app/products/page.tsx`

- [ ] **Step 1: Write catalog page**

Create `src/app/products/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/ProductGrid'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{ make?: string; model?: string; category?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('products')
    .select('*, category:categories(name,slug)')
    .eq('published', true)
    .order('position')

  // Filter by category
  if (params.category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', params.category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  // Filter by make (via product_makes join)
  if (params.make) {
    const { data: make } = await supabase.from('makes').select('id').eq('slug', params.make).single()
    if (make) {
      const { data: pm } = await supabase.from('product_makes').select('product_id').eq('make_id', make.id)
      const ids = pm?.map(r => r.product_id) ?? []
      if (ids.length > 0) query = query.in('id', ids)
      else return <div className="max-w-7xl mx-auto px-4 py-16 text-muted">Няма продукти за тази марка.</div>
    }
  }

  // Filter by model
  if (params.model && params.make) {
    const { data: make } = await supabase.from('makes').select('id').eq('slug', params.make).single()
    if (make) {
      const { data: model } = await supabase.from('models').select('id').eq('make_id', make.id).eq('name', params.model).single()
      if (model) {
        const { data: pm } = await supabase.from('product_models').select('product_id').eq('model_id', model.id)
        const ids = pm?.map(r => r.product_id) ?? []
        if (ids.length > 0) query = query.in('id', ids)
      }
    }
  }

  const { data: products } = await query
  const { data: categories } = await supabase.from('categories').select('id, name, slug').order('name')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/products" className={`px-3 py-1 rounded text-sm border ${!params.category ? 'bg-accent border-accent' : 'border-border hover:border-accent-hover'}`}>
          Всички
        </Link>
        {categories?.map(c => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}${params.make ? `&make=${params.make}` : ''}${params.model ? `&model=${params.model}` : ''}`}
            className={`px-3 py-1 rounded text-sm border transition-colors ${params.category === c.slug ? 'bg-accent border-accent' : 'border-border hover:border-accent-hover'}`}
          >
            {c.name}
          </Link>
        ))}
      </div>
      <ProductGrid products={products ?? []} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/products/page.tsx
git commit -m "feat: add products catalog page with make/model/category filtering"
```

---

## Task 14: Product Detail Page

**Files:**
- Create: `src/app/products/[slug]/page.tsx`
- Create: `src/components/ProductGallery.tsx`

- [ ] **Step 1: Write ProductGallery**

Create `src/components/ProductGallery.tsx`:

```typescript
'use client'
import { useState } from 'react'
import Image from 'next/image'

type Props = { images: string[]; name: string }

export default function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)
  if (images.length === 0) return <div className="aspect-square bg-surface-2 rounded-lg flex items-center justify-center text-muted">Няма снимка</div>

  return (
    <div>
      <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-2 mb-3">
        <Image src={images[active]} alt={name} fill className="object-contain" unoptimized />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)} className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${i === active ? 'border-accent' : 'border-border'}`}>
              <Image src={img} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write product detail page**

Create `src/app/products/[slug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductGallery from '@/components/ProductGallery'
import AddToCartButton from '@/components/AddToCartButton'

type Props = { params: Promise<{ slug: string }> }

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!product) notFound()

  const displayPrice = product.sale_price ?? product.price

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <ProductGallery images={product.images} name={product.name} />
        <div>
          {product.category && (
            <p className="text-accent text-sm uppercase tracking-wide mb-2">{product.category.name}</p>
          )}
          <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black text-accent">{displayPrice.toFixed(2)} лв</span>
            {product.sale_price && (
              <span className="text-muted line-through text-lg">{product.price.toFixed(2)} лв</span>
            )}
          </div>
          {product.short_description && (
            <div className="text-muted text-sm mb-6 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: product.short_description }} />
          )}
          <AddToCartButton product={product} />
        </div>
      </div>
      {product.description && (
        <div className="mt-10 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write AddToCartButton**

Create `src/components/AddToCartButton.tsx`:

```typescript
'use client'
import { addToCart } from '@/lib/cart'
import type { Product } from '@/lib/types'
import { useState } from 'react'

type Props = { product: Product }

export default function AddToCartButton({ product }: Props) {
  const [added, setAdded] = useState(false)
  const displayPrice = product.sale_price ?? product.price

  const handleClick = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.images[0] ?? '',
    })
    window.dispatchEvent(new Event('cart-updated'))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded text-lg transition-colors"
    >
      {added ? 'Добавено ✓' : 'Добави в количка'}
    </button>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/products/[slug]/page.tsx src/components/ProductGallery.tsx src/components/AddToCartButton.tsx
git commit -m "feat: add product detail page with gallery and add-to-cart"
```

---

## Task 15: Cart Page

**Files:**
- Create: `src/app/cart/page.tsx`

- [ ] **Step 1: Write cart page**

Create `src/app/cart/page.tsx`:

```typescript
'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getCart, updateQty, removeFromCart, cartTotal } from '@/lib/cart'
import type { CartItem } from '@/lib/types'

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => { setItems(getCart()) }, [])

  const handleQty = (id: string, qty: number) => {
    setItems(updateQty(id, qty))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleRemove = (id: string) => {
    setItems(removeFromCart(id))
    window.dispatchEvent(new Event('cart-updated'))
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted text-lg mb-6">Количката е празна</p>
        <Link href="/products" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded font-semibold transition-colors">
          Към продуктите
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Количка</h1>
      <div className="space-y-4 mb-8">
        {items.map(item => (
          <div key={item.product_id} className="flex gap-4 bg-surface rounded-lg p-4">
            {item.image && (
              <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium line-clamp-2 mb-2">{item.name}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleQty(item.product_id, item.qty - 1)} className="w-8 h-8 rounded bg-border-2 text-sm">−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => handleQty(item.product_id, item.qty + 1)} className="w-8 h-8 rounded bg-border-2 text-sm">+</button>
                </div>
                <span className="text-accent font-bold">{(item.price * item.qty).toFixed(2)} лв</span>
                <button onClick={() => handleRemove(item.product_id)} className="ml-auto text-muted hover:text-red-400 text-sm">Премахни</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-surface rounded-lg p-4 flex items-center justify-between mb-4">
        <span className="text-muted">Общо</span>
        <span className="text-2xl font-black">{cartTotal(items).toFixed(2)} лв</span>
      </div>
      <Link href="/checkout" className="block w-full bg-accent hover:bg-accent-hover text-white text-center py-4 rounded font-bold text-lg transition-colors">
        Поръчай
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/cart/page.tsx
git commit -m "feat: add cart page"
```

---

## Task 16: Checkout Flow

**Files:**
- Create: `src/app/checkout/page.tsx`
- Create: `src/app/checkout/success/page.tsx`
- Create: `src/components/CheckoutForm.tsx`

- [ ] **Step 1: Write CheckoutForm**

Create `src/components/CheckoutForm.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCart, clearCart, cartTotal } from '@/lib/cart'

export default function CheckoutForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    delivery_city: '',
    courier: 'ekont' as 'ekont' | 'speedy',
    notes: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const items = getCart()
    if (items.length === 0) return

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error?.fieldErrors) {
          const errs: Record<string, string> = {}
          for (const [k, v] of Object.entries(data.error.fieldErrors as Record<string, string[]>)) {
            errs[k] = v[0]
          }
          setErrors(errs)
        }
        return
      }
      clearCart()
      window.dispatchEvent(new Event('cart-updated'))
      router.push(`/checkout/success?order=${data.order_number}`)
    } finally {
      setLoading(false)
    }
  }

  const items = typeof window !== 'undefined' ? getCart() : []

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {([
        ['customer_name', 'Имена', 'text'],
        ['customer_phone', 'Телефон', 'tel'],
        ['customer_email', 'Имейл (незадължително)', 'email'],
        ['delivery_address', 'Адрес за доставка', 'text'],
        ['delivery_city', 'Град', 'text'],
      ] as [keyof typeof form, string, string][]).map(([key, label, type]) => (
        <div key={key}>
          <label className="block text-sm text-muted mb-1">{label}</label>
          <input
            type={type}
            value={form[key]}
            onChange={set(key)}
            required={key !== 'customer_email'}
            className="w-full bg-surface border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-accent"
          />
          {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
        </div>
      ))}

      <div>
        <label className="block text-sm text-muted mb-1">Куриер</label>
        <select value={form.courier} onChange={set('courier')} className="w-full bg-surface border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-accent">
          <option value="ekont">Еконт</option>
          <option value="speedy">Спиди</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Бележка (незадължително)</label>
        <textarea value={form.notes} onChange={set('notes')} rows={3} className="w-full bg-surface border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-accent" />
      </div>

      <div className="bg-surface rounded-lg p-4 flex justify-between">
        <span className="text-muted">Общо</span>
        <span className="font-bold text-lg">{cartTotal(items).toFixed(2)} лв</span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded text-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Изпращане...' : 'Потвърди поръчката'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Write checkout page**

Create `src/app/checkout/page.tsx`:

```typescript
import CheckoutForm from '@/components/CheckoutForm'

export default function CheckoutPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Поръчка</h1>
      <CheckoutForm />
    </div>
  )
}
```

- [ ] **Step 3: Write success page**

Create `src/app/checkout/success/page.tsx`:

```typescript
import Link from 'next/link'

type Props = { searchParams: Promise<{ order?: string }> }

export default async function SuccessPage({ searchParams }: Props) {
  const { order } = await searchParams
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-accent text-6xl mb-4">✓</div>
      <h1 className="text-3xl font-black mb-3">Поръчката е получена!</h1>
      {order && <p className="text-muted mb-2">Номер: <span className="text-white font-mono">{order}</span></p>}
      <p className="text-muted mb-8">Ще се свържем с вас скоро за потвърждение.</p>
      <Link href="/products" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded font-semibold transition-colors">
        Продължи пазаруването
      </Link>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/checkout/ src/components/CheckoutForm.tsx
git commit -m "feat: add checkout flow with form validation and success page"
```

---

## Task 17: Admin Panel

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/orders/page.tsx`
- Create: `src/app/admin/orders/[id]/page.tsx`
- Create: `src/app/admin/products/page.tsx`
- Create: `src/app/admin/products/new/page.tsx`
- Create: `src/app/admin/products/[id]/page.tsx`
- Create: `src/app/admin/categories/page.tsx`
- Create: `src/components/AdminTable.tsx`

- [ ] **Step 1: Write admin layout**

Create `src/app/admin/layout.tsx`:

```typescript
import Link from 'next/link'

const links = [
  { href: '/admin', label: 'Начало' },
  { href: '/admin/orders', label: 'Поръчки' },
  { href: '/admin/products', label: 'Продукти' },
  { href: '/admin/categories', label: 'Категории' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-48 bg-surface border-r border-border flex-shrink-0 p-4">
        <p className="text-accent font-bold text-sm mb-6 uppercase tracking-wide">Admin</p>
        <nav className="space-y-1">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="block px-3 py-2 rounded text-sm text-muted hover:text-white hover:bg-border transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Write admin login page**

Create `src/app/admin/login/page.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) { setError('Грешен имейл или парола'); return }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center mb-2">Admin вход</h1>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Имейл" required
          className="w-full bg-[#0a0a0a] border border-border rounded px-3 py-2 text-white" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Парола" required
          className="w-full bg-[#0a0a0a] border border-border rounded px-3 py-2 text-white" />
        <button type="submit" disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover text-white py-2 rounded font-semibold disabled:opacity-50">
          {loading ? 'Влизане...' : 'Влез'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Write AdminTable component**

Create `src/components/AdminTable.tsx`:

```typescript
type Column<T> = { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode }
type Props<T> = { columns: Column<T>[]; rows: T[] }

export default function AdminTable<T extends { id: string }>({ columns, rows }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-2">
          <tr>
            {columns.map(c => (
              <th key={String(c.key)} className="text-left px-4 py-3 text-muted font-medium">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-t border-border hover:bg-surface transition-colors">
              {columns.map(c => (
                <td key={String(c.key)} className="px-4 py-3">
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[String(c.key)] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-muted">Няма записи</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Write admin dashboard**

Create `src/app/admin/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [{ count: orderCount }, { count: productCount }, { data: recentOrders }] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('id, order_number, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const statusLabels: Record<string, string> = {
    new: 'Нова', confirmed: 'Потвърдена', shipped: 'Изпратена', delivered: 'Доставена', cancelled: 'Отказана',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Начало</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Поръчки', value: orderCount, href: '/admin/orders' },
          { label: 'Продукти', value: productCount, href: '/admin/products' },
        ].map(s => (
          <Link key={s.label} href={s.href} className="bg-surface border border-border rounded-lg p-4 hover:border-accent transition-colors">
            <p className="text-muted text-sm">{s.label}</p>
            <p className="text-3xl font-black mt-1">{s.value}</p>
          </Link>
        ))}
      </div>
      <h2 className="font-semibold mb-3">Последни поръчки</h2>
      <div className="space-y-2">
        {recentOrders?.map(o => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center gap-4 bg-surface border border-border rounded-lg px-4 py-3 hover:border-accent transition-colors">
            <span className="font-mono text-sm">{o.order_number}</span>
            <span className="flex-1 text-sm">{o.customer_name}</span>
            <span className="text-accent font-semibold">{Number(o.total).toFixed(2)} лв</span>
            <span className="text-xs px-2 py-1 rounded bg-border-2 text-muted">{statusLabels[o.status] ?? o.status}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write orders list page**

Create `src/app/admin/orders/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import AdminTable from '@/components/AdminTable'
import Link from 'next/link'
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
          { key: 'total', label: 'Сума', render: o => `${Number(o.total).toFixed(2)} лв` },
          { key: 'status', label: 'Статус', render: o => <span className={statusColors[o.status]}>{statusLabels[o.status]}</span> },
          { key: 'created_at', label: 'Дата', render: o => new Date(o.created_at).toLocaleDateString('bg-BG') },
        ]}
      />
    </div>
  )
}
```

- [ ] **Step 6: Write order detail page with status update**

Create `src/app/admin/orders/[id]/page.tsx`:

```typescript
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
            <span className="text-accent">{(item.price * item.qty).toFixed(2)} лв</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 font-bold">
          <span>Общо</span>
          <span>{Number(o.total).toFixed(2)} лв</span>
        </div>
      </div>
      <OrderStatusForm orderId={o.id} currentStatus={o.status} />
    </div>
  )
}
```

- [ ] **Step 7: Write OrderStatusForm**

Create `src/components/OrderStatusForm.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { OrderStatus } from '@/lib/types'

const STATUSES: OrderStatus[] = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled']
const LABELS: Record<OrderStatus, string> = {
  new: 'Нова', confirmed: 'Потвърдена', shipped: 'Изпратена', delivered: 'Доставена', cancelled: 'Отказана',
}

type Props = { orderId: string; currentStatus: OrderStatus }

export default function OrderStatusForm({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
      <label className="text-muted text-sm">Статус:</label>
      <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)}
        className="bg-[#0a0a0a] border border-border rounded px-3 py-2 text-sm text-white flex-1">
        {STATUSES.map(s => <option key={s} value={s}>{LABELS[s]}</option>)}
      </select>
      <button onClick={handleSave} disabled={saving || status === currentStatus}
        className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-40 transition-colors">
        {saving ? 'Запис...' : 'Запази'}
      </button>
    </div>
  )
}
```

- [ ] **Step 8: Write products admin list page**

Create `src/app/admin/products/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import AdminTable from '@/components/AdminTable'
import Link from 'next/link'
import type { Product } from '@/lib/types'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products').select('*, category:categories(name)').order('position')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Продукти</h1>
        <Link href="/admin/products/new" className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm font-semibold transition-colors">
          + Нов продукт
        </Link>
      </div>
      <AdminTable<Product & { category?: { name: string } }>
        rows={(products ?? []) as (Product & { category?: { name: string } })[]}
        columns={[
          { key: 'name', label: 'Продукт', render: p => <Link href={`/admin/products/${p.id}`} className="text-accent hover:underline line-clamp-1">{p.name}</Link> },
          { key: 'category', label: 'Категория', render: p => p.category?.name ?? '—' },
          { key: 'price', label: 'Цена', render: p => `${Number(p.price).toFixed(2)} лв` },
          { key: 'published', label: 'Публикуван', render: p => p.published ? '✓' : '✗' },
        ]}
      />
    </div>
  )
}
```

- [ ] **Step 9: Write product edit form (used for both new + edit)**

Create `src/components/ProductForm.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category } from '@/lib/types'

type Props = {
  product?: Product
  categories: Category[]
}

export default function ProductForm({ product, categories }: Props) {
  const router = useRouter()
  const isNew = !product
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    short_description: product?.short_description ?? '',
    price: String(product?.price ?? ''),
    sale_price: String(product?.sale_price ?? ''),
    category_id: product?.category_id ?? '',
    images: (product?.images ?? []).join('\n'),
    published: product?.published ?? true,
    position: String(product?.position ?? 0),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const slugify = (text: string) =>
    text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const payload = {
      name: form.name.trim(),
      slug: product?.slug ?? slugify(form.name),
      description: form.description || null,
      short_description: form.short_description || null,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      category_id: form.category_id || null,
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      published: form.published,
      position: parseInt(form.position, 10),
    }
    if (isNew) {
      const { error: err } = await supabase.from('products').insert(payload)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('products').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', product.id)
      if (err) { setError(err.message); setSaving(false); return }
    }
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {[
        ['name', 'Наименование', 'text', true],
        ['price', 'Цена', 'number', true],
        ['sale_price', 'Промо цена', 'number', false],
        ['position', 'Позиция', 'number', false],
      ].map(([key, label, type, req]) => (
        <div key={String(key)}>
          <label className="block text-sm text-muted mb-1">{String(label)}</label>
          <input type={String(type)} value={form[key as keyof typeof form] as string} onChange={set(key as keyof typeof form)}
            required={Boolean(req)} step="0.01" min={type === 'number' ? '0' : undefined}
            className="w-full bg-[#0a0a0a] border border-border rounded px-3 py-2 text-white" />
        </div>
      ))}
      <div>
        <label className="block text-sm text-muted mb-1">Категория</label>
        <select value={form.category_id} onChange={set('category_id')} className="w-full bg-[#0a0a0a] border border-border rounded px-3 py-2 text-white">
          <option value="">— без категория —</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Кратко описание</label>
        <textarea value={form.short_description} onChange={set('short_description')} rows={3}
          className="w-full bg-[#0a0a0a] border border-border rounded px-3 py-2 text-white" />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Описание</label>
        <textarea value={form.description} onChange={set('description')} rows={6}
          className="w-full bg-[#0a0a0a] border border-border rounded px-3 py-2 text-white" />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Изображения (по един URL на ред)</label>
        <textarea value={form.images} onChange={set('images')} rows={4}
          className="w-full bg-[#0a0a0a] border border-border rounded px-3 py-2 text-white font-mono text-xs" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.published} onChange={set('published')} className="accent-red-600 w-4 h-4" />
        <span className="text-sm">Публикуван</span>
      </label>
      <button type="submit" disabled={saving}
        className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded font-semibold disabled:opacity-40 transition-colors">
        {saving ? 'Запис...' : isNew ? 'Създай' : 'Запази'}
      </button>
    </form>
  )
}
```

- [ ] **Step 10: Write new product page**

Create `src/app/admin/products/new/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Нов продукт</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  )
}
```

- [ ] **Step 11: Write edit product page**

Create `src/app/admin/products/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/ProductForm'

type Props = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])
  if (!product) notFound()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Редактирай продукт</h1>
      <ProductForm product={product} categories={categories ?? []} />
    </div>
  )
}
```

- [ ] **Step 12: Write categories admin page**

Create `src/app/admin/categories/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import AdminTable from '@/components/AdminTable'
import type { Category } from '@/lib/types'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Категории</h1>
      <AdminTable<Category>
        rows={categories ?? []}
        columns={[
          { key: 'name', label: 'Наименование' },
          { key: 'slug', label: 'Slug' },
          { key: 'image_url', label: 'Снимка', render: c => c.image_url ? <a href={c.image_url} target="_blank" className="text-accent text-xs">URL</a> : '—' },
        ]}
      />
    </div>
  )
}
```

- [ ] **Step 13: Commit all admin files**

```bash
git add src/app/admin/ src/components/AdminTable.tsx src/components/ProductForm.tsx src/components/OrderStatusForm.tsx
git commit -m "feat: add complete admin panel — orders, products, categories"
```

---

## Task 18: Static Public Pages

**Files:**
- Create: `src/app/video/page.tsx`
- Create: `src/app/reviews/page.tsx`
- Create: `src/app/contact/page.tsx`

- [ ] **Step 1: Write video page**

Create `src/app/video/page.tsx`:

```typescript
export default function VideoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Видео</h1>
      <p className="text-muted text-center">Видео съдържанието ще бъде добавено скоро.</p>
    </div>
  )
}
```

- [ ] **Step 2: Write reviews page**

Create `src/app/reviews/page.tsx`:

```typescript
export default function ReviewsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Доволни Клиенти</h1>
      <p className="text-muted text-center">Отзивите на нашите клиенти ще бъдат добавени скоро.</p>
    </div>
  )
}
```

- [ ] **Step 3: Write contact page**

Create `src/app/contact/page.tsx`:

```typescript
export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Контакти</h1>
      <div className="bg-surface border border-border rounded-lg p-6 space-y-4 text-center">
        <p className="text-lg">📞 <a href="tel:+359XXXXXXXXX" className="text-accent hover:underline">+359 XX XXX XXXX</a></p>
        <p className="text-lg">💬 <span className="text-muted">Viber / WhatsApp: </span><span className="text-accent">+359 XX XXX XXXX</span></p>
        <p className="text-lg">📘 <a href="https://facebook.com" target="_blank" className="text-accent hover:underline">Facebook</a></p>
        <p className="text-muted text-sm mt-4">Работно време: Пон–Пет 9:00–18:00</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/video/page.tsx src/app/reviews/page.tsx src/app/contact/page.tsx
git commit -m "feat: add video, reviews, and contact pages"
```

---

## Task 19: Final Build Verification

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: no TypeScript errors, no build failures. Fix any type errors before proceeding.

- [ ] **Step 2: Run dev server and manually test critical paths**

```bash
npm run dev
```

Test checklist:
- [ ] Homepage loads with hero filter and category grid
- [ ] `/products` shows product list
- [ ] `/products?category=<slug>` filters correctly
- [ ] `/products/<slug>` shows product detail with gallery
- [ ] "Добави в количка" updates cart badge in navbar
- [ ] Cart drawer opens and shows items
- [ ] `/cart` shows full cart with qty controls
- [ ] `/checkout` form submits → creates order in Supabase → sends emails → redirects to success
- [ ] `/admin/login` logs in with Supabase Auth
- [ ] `/admin/orders` lists orders
- [ ] `/admin/orders/<id>` shows detail, status update works
- [ ] `/admin/products` lists products, edit works
- [ ] Unauthenticated access to `/admin` redirects to `/admin/login`

- [ ] **Step 3: Add `.superpowers` to .gitignore**

```bash
echo ".superpowers/" >> .gitignore
git add .gitignore
git commit -m "chore: ignore .superpowers directory"
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete LED Ivanov Auto e-commerce site"
```

---

## Task 20: Vercel Deployment

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin <your-github-repo-url>
git push -u origin master
```

- [ ] **Step 2: Connect to Vercel**

1. Go to vercel.com → New Project → Import from GitHub
2. Select this repo

- [ ] **Step 3: Set environment variables in Vercel Dashboard**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

- [ ] **Step 4: Deploy**

Click Deploy. Expected: build passes, site is live.

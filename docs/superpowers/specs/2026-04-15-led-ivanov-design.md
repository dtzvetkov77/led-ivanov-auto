# LED Ivanov Auto — Design Spec
**Date:** 2026-04-15  
**Status:** Approved

---

## Overview

A new e-commerce website for **LED Ivanov Auto** — a Bulgarian shop selling LED car bulbs, running turn signals, interior lighting, and auto accessories. The site replaces the existing WordPress/WooCommerce site at ivanov-auto.com.

**Tech stack:** Next.js (App Router) + Supabase + Vercel  
**Language:** Bulgarian only  
**E-commerce model:** Cart + cash-on-delivery via Еконт / Спиди (no card payments in v1)

---

## Decisions Made

| Topic | Decision |
|---|---|
| Homepage layout | Option C — Cinematic dark hero + inline Make/Model/Category filter + visual category cards |
| E-commerce scope | Option C — Cart + cash-on-delivery, no card payment (expandable later) |
| Admin panel | Custom `/admin` — orders management + product management |
| Make/Model data | From WooCommerce CSV (39 brands, ~680 products) |
| Cart storage | `localStorage` (no login required) |
| Product images | Keep existing WordPress URLs at launch; migrate to Supabase Storage later |
| Auth | Supabase Auth (email + password), admin only |
| Email | Resend — order notifications to admin + customer confirmation |

---

## Navigation

```
Начало → Продукти (dropdown: 6 категории) → Видео → Доволни Клиенти → Контакти
```

---

## Database Schema (Supabase / PostgreSQL)

### Tables

```sql
makes
  id          uuid primary key
  name        text not null unique        -- "Audi", "BMW"
  slug        text not null unique        -- "audi", "bmw"

models
  id          uuid primary key
  make_id     uuid references makes
  name        text not null               -- "A4", "3 Series"

categories
  id          uuid primary key
  name        text not null unique        -- "LED КРУШКИ"
  slug        text not null unique
  description text
  image_url   text                        -- AI-generated, Supabase Storage

products
  id          uuid primary key
  name        text not null
  slug        text not null unique
  description text
  short_description text
  price       numeric(10,2) not null
  sale_price  numeric(10,2)
  category_id uuid references categories
  images      text[]                      -- WordPress URLs initially
  published   boolean default true
  position    integer default 0
  created_at  timestamptz default now()
  updated_at  timestamptz default now()

product_makes
  product_id  uuid references products
  make_id     uuid references makes
  primary key (product_id, make_id)

product_models
  product_id  uuid references products
  model_id    uuid references models
  primary key (product_id, model_id)

orders
  id              uuid primary key
  order_number    text unique             -- "ORD-2026-0001"
  customer_name   text not null
  customer_phone  text not null
  customer_email  text
  delivery_address text not null
  delivery_city   text not null
  courier         text not null           -- "ekont" | "speedy"
  items           jsonb not null          -- [{product_id, name, price, qty, image}]
  total           numeric(10,2) not null
  status          text default 'new'      -- new|confirmed|shipped|delivered|cancelled
  notes           text
  created_at      timestamptz default now()
  updated_at      timestamptz default now()
```

### Indexes

```sql
create index on product_makes(make_id);
create index on product_models(model_id);
create index on models(make_id);
create index on products(category_id);
create index on products(published);
create index on orders(status);
create index on orders(created_at desc);
```

### Row Level Security

```
products, categories, makes, models:
  SELECT → public (anon)
  INSERT / UPDATE / DELETE → authenticated (admin only)

orders:
  INSERT → public (anyone can place an order)
  SELECT / UPDATE → authenticated (admin only)
```

---

## Routing

### Public

| Route | Description |
|---|---|
| `/` | Homepage — hero, filter, category grid, featured products |
| `/products` | Full product catalog with filter sidebar |
| `/products?make=audi&model=a4&category=led-krushki` | Filtered catalog |
| `/products/[slug]` | Product detail — gallery, description, add to cart |
| `/cart` | Cart page — items, quantities, totals |
| `/checkout` | Checkout form — name, phone, email, address, courier |
| `/checkout/success` | Order confirmation — order number, next steps |
| `/video` | Video content page |
| `/reviews` | Customer testimonials |
| `/contact` | Contact — phone, Viber, Facebook, address |

### Admin (authenticated)

| Route | Description |
|---|---|
| `/admin` | Dashboard — recent orders, key stats |
| `/admin/login` | Login page (email + password) |
| `/admin/orders` | Orders list with status management |
| `/admin/orders/[id]` | Order detail + status update |
| `/admin/products` | Products list |
| `/admin/products/new` | Create product |
| `/admin/products/[id]` | Edit product |
| `/admin/categories` | Manage categories |

### API

| Route | Description |
|---|---|
| `POST /api/orders` | Place order — validates, saves, sends emails |
| `GET /api/makes` | All makes for filter dropdowns |
| `GET /api/models?make=audi` | Models for a given make |

---

## Visual Style

```
Background:     #0a0a0a
Surface:        #111111 / #1a1a1a
Border:         #2a2a2a / #333333
Accent:         #cc0000 (red)
Accent hover:   #dd0000
Text primary:   #ffffff
Text muted:     #888888 / #aaaaaa
Font:           Inter (Google Fonts)
```

### Key Components

- **`<Navbar>`** — Logo | Navigation links | Cart icon with item count badge
- **`<HeroFilter>`** — Full-width cinematic dark hero image, overlaid with transparent Make / Model / Category dropdowns + Търси button
- **`<CategoryGrid>`** — Grid of 4–6 cards, each with AI-generated image + category name
- **`<ProductGrid>`** — Responsive: 2 cols mobile / 3–4 cols desktop
- **`<ProductCard>`** — Image, name, price (sale price if applicable), Add to Cart button
- **`<ProductGallery>`** — Main image + thumbnail strip
- **`<CartDrawer>`** — Slide-in from right, no page navigation needed
- **`<CheckoutForm>`** — Step 1: customer details + courier; Step 2: review + confirm
- **`<AdminTable>`** — Sortable table, status badges, action buttons

### AI-Generated Images

One dark automotive-style image per category, stored in Supabase Storage:
- LED Крушки, Бягащи Мигачи, LED Плафони за Регистрационен Номер, Автоаксесоари, Ключодържатели, Стикери, LED Осветление за Купе, BMW Бъбреци, Дневни Светлини, LED Габарити

Format: 1200×800 WebP

---

## Security

### Supabase RLS
- All public tables: SELECT open, mutations require `authenticated` role
- Orders: INSERT open (checkout), SELECT/UPDATE require `authenticated`
- No `service_role` key in any client-side code — only in server-side API routes / Server Actions

### Input Validation
- Checkout form validated with **Zod** in Server Actions (server-side only)
- All text inputs sanitized before database write
- No raw SQL — only Supabase client with parameterized queries

### Rate Limiting
- `/api/orders`: max 10 requests/min per IP via Vercel Edge Middleware

### Admin Auth
- Supabase Auth (email + password) — single admin account
- Next.js middleware checks session for all `/admin/*` routes
- Session expires after 24 hours

### HTTP Security Headers (next.config.ts)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Restrictive Content Security Policy

---

## Email Notifications (Resend)

**On new order:**
1. Email to admin — full order details, customer phone, delivery address
2. Email to customer (if email provided) — order number, items summary, "ще се свържем с вас скоро"

---

## Deployment

| Service | Purpose |
|---|---|
| Vercel | Next.js hosting, Edge Middleware, CI/CD |
| Supabase | PostgreSQL + Auth + Storage |
| Resend | Transactional email |

Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `RESEND_API_KEY`

---

## Data Import (One-Time Script)

`scripts/import-products.ts` — runs once at deploy time:

1. Parse WooCommerce CSV (`wc-product-export-9-4-2026-1775722045909.csv`)
2. Extract unique makes → `INSERT INTO makes`
3. Extract models per make → `INSERT INTO models`
4. Extract categories → `INSERT INTO categories`
5. Insert products with prices, descriptions, images (WordPress URLs)
6. Insert `product_makes` and `product_models` join records

**Source data:** 681 products, 39 car brands, ~10 categories

Image migration (later, separate script): download WordPress images → upload to Supabase Storage → update `products.images[]`

---

## Out of Scope (v1)

- Card payment (Stripe) — expandable later
- Customer accounts / order history
- Product reviews
- Multi-language (BG only)
- Inventory tracking / stock levels
- Courier API integration (Еконт/Спиди labels) — admin handles manually

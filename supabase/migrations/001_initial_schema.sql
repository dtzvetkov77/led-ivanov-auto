-- Makes
create table makes (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

-- Models
create table models (
  id      uuid primary key default gen_random_uuid(),
  make_id uuid not null references makes on delete cascade,
  name    text not null
);

alter table models add constraint models_make_id_name_unique unique (make_id, name);

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
create policy "admin write makes"      on makes      for all using (auth.uid() is not null);
create policy "admin write models"     on models     for all using (auth.uid() is not null);
create policy "admin write categories" on categories for all using (auth.uid() is not null);
create policy "admin write products"   on products   for all using (auth.uid() is not null);
create policy "admin write product_makes"  on product_makes  for all using (auth.uid() is not null);
create policy "admin write product_models" on product_models for all using (auth.uid() is not null);

-- Orders: anyone inserts, only admin reads/updates
create policy "public insert orders" on orders for insert with check (true);
create policy "admin read orders"    on orders for select using (auth.uid() is not null);
create policy "admin update orders"  on orders for update using (auth.uid() is not null);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at before update on products
  for each row execute procedure set_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute procedure set_updated_at();

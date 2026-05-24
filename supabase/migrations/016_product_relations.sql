create table if not exists product_relations (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  related_id  uuid not null references products(id) on delete cascade,
  type        text not null check (type in ('bundle','upsell','downsell','crosssell')),
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  unique(product_id, related_id, type)
);

create index if not exists product_relations_product_type_idx on product_relations(product_id, type);

alter table product_relations enable row level security;
create policy "public read product_relations"  on product_relations for select using (true);
create policy "admin manage product_relations" on product_relations for all using (auth.uid() is not null);

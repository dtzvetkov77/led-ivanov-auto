alter table products add column if not exists is_order_bump boolean default false;
create index if not exists products_order_bump_idx on products(is_order_bump) where is_order_bump = true;

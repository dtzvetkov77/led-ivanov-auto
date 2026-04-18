-- Sequence for order numbers (resets conceptually per year via the function)
create sequence if not exists orders_seq start 1;

-- RPC function to atomically generate order numbers
create or replace function generate_order_number()
returns text
language plpgsql
security definer
as $$
declare
  seq_val bigint;
  year_str text;
begin
  select nextval('orders_seq') into seq_val;
  year_str := to_char(now(), 'YYYY');
  return 'ORD-' || year_str || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

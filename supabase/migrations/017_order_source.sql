-- Traffic source of each order (UTM params, gclid/fbclid, referrer),
-- captured on the storefront and shown in the admin.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source jsonb;

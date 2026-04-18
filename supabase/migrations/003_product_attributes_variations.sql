-- Product attributes: [{name, options, variation}]
-- Example: [{"name":"Цокъл","options":["H1","H7","H11"],"variation":true}]
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS attributes jsonb NOT NULL DEFAULT '[]';

-- Product variations: [{attributes, price, sale_price, sku, images}]
-- Example: [{"attributes":{"Цокъл":"H7"},"price":29.99,"sale_price":null,"sku":"LED-H7"}]
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variations jsonb NOT NULL DEFAULT '[]';

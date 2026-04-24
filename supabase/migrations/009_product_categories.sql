-- Many-to-many product ↔ category join table
CREATE TABLE IF NOT EXISTS product_categories (
  product_id  UUID REFERENCES products  ON DELETE CASCADE,
  category_id UUID REFERENCES categories ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Seed from existing single category_id
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id FROM products WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE INDEX ON product_categories(category_id);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read product_categories"  ON product_categories FOR SELECT USING (true);
CREATE POLICY "admin write product_categories"  ON product_categories FOR ALL    USING (auth.uid() IS NOT NULL);

-- Gallery images for headlight-tinting and headlight-alignment service pages
CREATE TABLE service_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service     TEXT NOT NULL,
  url         TEXT NOT NULL,
  caption     TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  published   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON service_images(service, position);

-- Before/After pairs for headlight-polishing service page
CREATE TABLE service_before_after (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service     TEXT NOT NULL DEFAULT 'headlight-polishing',
  before_url  TEXT NOT NULL,
  after_url   TEXT NOT NULL,
  label       TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  published   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON service_before_after(service, position);

ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_before_after ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read service_images" ON service_images FOR SELECT USING (published = true);
CREATE POLICY "admin write service_images" ON service_images FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "public read service_before_after" ON service_before_after FOR SELECT USING (published = true);
CREATE POLICY "admin write service_before_after" ON service_before_after FOR ALL USING (auth.uid() IS NOT NULL);

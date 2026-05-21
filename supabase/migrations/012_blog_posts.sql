CREATE TABLE blog_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  meta_description TEXT,
  cover_image TEXT,
  content     TEXT NOT NULL DEFAULT '',
  published   BOOLEAN NOT NULL DEFAULT false,
  reading_time INTEGER NOT NULL DEFAULT 5,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON blog_posts(slug);
CREATE INDEX ON blog_posts(published, created_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read blog_posts"
  ON blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "admin all blog_posts"
  ON blog_posts FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  caption TEXT,
  position INT DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery" ON gallery_images FOR SELECT USING (published = true);
CREATE POLICY "Admin full access gallery" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');

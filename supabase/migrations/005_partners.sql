CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  hours TEXT NOT NULL DEFAULT 'Всеки ден',
  contact_person TEXT,
  description TEXT,
  cover_image TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published partners" ON partners FOR SELECT USING (published = true);
CREATE POLICY "Admin all on partners" ON partners FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Public can view partner images" ON partner_images FOR SELECT USING (true);
CREATE POLICY "Admin all on partner_images" ON partner_images FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Seed data
INSERT INTO partners (slug, name, city, address, phone, hours, position) VALUES
  ('kostas-garage', 'Kosta''s Garage', 'Бяла Слатина', 'ул. Панайот Хитов 1', '+359895756194', 'Всеки ден', 1),
  ('dbr-tint', 'DBR.tint', 'с. Долна Бела Речка, обл. Монтана', 'ул. Първа 40', '+359885850342', 'Всеки ден', 2),
  ('antonio-dinchev', 'Антонио Динчев', 'Козлодуй', 'Център', '+359887723742', 'Всеки ден', 3),
  ('dzumbi-folio', 'DZUMBI FOLIO', 'Гоце Делчев', 'ул. кмет Никола Атанасов 16', '+359896853262', 'Вс. 9:30–18:00', 4),
  ('zlatnite-race-ses', 'Златните Ръце-СЕС', 'с. Искра, обл. Силистра', 'ул. Образцова 17', '+359899872135', 'Пн–Нд 9:00–17:00', 5),
  ('erik-auto', 'Ерик Ауто', 'Червен Бряг', 'ул. Бузлуджа 53', '+359877449103', 'Пн–Пт 10:00–17:00, Съб 10:00–13:00', 6),
  ('alpha-garage', 'Alpha Garage', 'Сандански', 'Индустриална зона', '+359882605533', 'Всеки ден 9:00–18:00', 7),
  ('georgi-videv', 'Георги Видев', 'обл. Казанлък', '—', '+359897266437', 'Всеки ден', 8),
  ('auto-union-19', 'Ауто Юнион19 ЕООД', 'Асеновград', '—', '+359897211675', 'Всеки ден', 9)
ON CONFLICT (slug) DO NOTHING;

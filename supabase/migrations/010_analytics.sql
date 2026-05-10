CREATE TABLE analytics_events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  path       text        NOT NULL,
  referrer   text,
  device     text,
  country    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON analytics_events (created_at DESC);
CREATE INDEX ON analytics_events (path);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin read analytics" ON analytics_events
  FOR SELECT USING (auth.uid() IS NOT NULL);

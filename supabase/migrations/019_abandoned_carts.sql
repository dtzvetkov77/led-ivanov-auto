-- Abandoned cart reminders: checkout saves the cart once a valid email is typed;
-- a daily cron emails one reminder if no order follows.
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id uuid PRIMARY KEY,                     -- generated in the browser, kept in localStorage
  email text NOT NULL,
  name text,
  items jsonb NOT NULL,                    -- validated against products (DB names/prices only)
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reminded_at timestamptz,
  recovered_at timestamptz                 -- set when an order is placed with this email
);

-- Hashed client IP, used to cap captures per IP (anti-abuse: stops anyone
-- from making the site email arbitrary addresses in bulk)
ALTER TABLE abandoned_carts ADD COLUMN IF NOT EXISTS ip_hash text;
CREATE INDEX IF NOT EXISTS abandoned_carts_ip_idx ON abandoned_carts (ip_hash, created_at);

-- Enforce the per-IP cap atomically: an advisory lock on the IP serialises
-- concurrent inserts, so parallel requests can't all pass the count.
-- Updates of an existing cart (same id) are always allowed.
CREATE OR REPLACE FUNCTION abandoned_carts_ip_cap() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.ip_hash IS NULL OR EXISTS (SELECT 1 FROM abandoned_carts WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('abandoned_carts_ip:' || NEW.ip_hash));
  IF (SELECT count(*) FROM abandoned_carts
      WHERE ip_hash = NEW.ip_hash AND created_at > now() - interval '24 hours') >= 3 THEN
    RAISE EXCEPTION 'cart_ip_cap' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS abandoned_carts_ip_cap ON abandoned_carts;
CREATE TRIGGER abandoned_carts_ip_cap BEFORE INSERT ON abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION abandoned_carts_ip_cap();

CREATE INDEX IF NOT EXISTS abandoned_carts_email_idx ON abandoned_carts (email);
CREATE INDEX IF NOT EXISTS abandoned_carts_pending_idx ON abandoned_carts (updated_at)
  WHERE reminded_at IS NULL AND recovered_at IS NULL;

-- Writes happen only via the service role; admins can read.
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin read abandoned carts" ON abandoned_carts;
CREATE POLICY "admin read abandoned carts" ON abandoned_carts
  FOR SELECT TO authenticated USING (true);

-- Email campaigns to past buyers (admin → Имейл кампании)

-- Customers who clicked "unsubscribe" in a campaign email; never emailed again.
CREATE TABLE IF NOT EXISTS email_unsubscribes (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Log of sent campaigns (also used to block accidental double sends).
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  segment text NOT NULL,
  template text,
  recipients int NOT NULL DEFAULT 0,
  sent int NOT NULL DEFAULT 0,
  failed int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'sending',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_unsubscribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Admins (authenticated) read unsubscribes; inserts happen via the service role.
DROP POLICY IF EXISTS "admin read unsubscribes" ON email_unsubscribes;
CREATE POLICY "admin read unsubscribes" ON email_unsubscribes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin manage campaigns" ON email_campaigns;
CREATE POLICY "admin manage campaigns" ON email_campaigns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

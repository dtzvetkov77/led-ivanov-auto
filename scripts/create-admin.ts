/**
 * Create an admin user in Supabase Auth.
 *
 * Run:
 *   export $(grep -v '^#' .env.local | xargs)
 *   npx tsx scripts/create-admin.ts
 *
 * Or pass credentials directly:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=YourPass123! \
 *   npx tsx scripts/create-admin.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const email    = process.env.ADMIN_EMAIL    ?? ''
const password = process.env.ADMIN_PASSWORD ?? ''

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local or as env vars.')
  process.exit(1)
}

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,   // skip confirmation email
})

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log('Admin user created:', data.user?.email)
console.log('You can now log in at /admin/login')

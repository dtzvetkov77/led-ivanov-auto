import { createClient } from '@/lib/supabase/server'
import { loadCustomers, segmentContext, SEGMENTS } from '@/lib/customerSegments'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  const supabase = await createClient()
  const customers = await loadCustomers(supabase)
  const ctx = segmentContext(customers)
  const withEmail = customers.filter(c => c.email).length
  const withPhone = customers.filter(c => c.phone).length

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Клиенти за Google Ads</h1>
        <p className="text-sm text-muted mt-1">
          {customers.length} уникални купувачи (без отказани поръчки) — {withPhone} с телефон, {withEmail} с имейл.
          Файловете са във формат Customer Match: Email, Phone, First Name, Last Name, Country, Zip.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
        {SEGMENTS.map(s => {
          const count = customers.filter(c => s.match(c, ctx)).length
          return (
            <div key={s.key} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-semibold text-white">{s.label}</p>
                <p className="text-xs text-muted">{s.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-sm tabular-nums ${count < 100 ? 'text-yellow-400' : 'text-green-400'}`}>{count}</span>
                {count > 0 ? (
                  <a
                    href={`/admin/customers/export?segment=${s.key}`}
                    className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
                  >
                    CSV
                  </a>
                ) : (
                  <span className="px-3 py-1.5 text-sm text-muted">—</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 text-sm text-muted space-y-2">
        <p className="font-semibold text-white">Качване в Google Ads</p>
        <p>1. Google Ads → Инструменти → Споделена библиотека → Мениджър на аудитории → Сегменти → + → Списък с клиенти.</p>
        <p>2. Избери „Качване на имейли, телефони и/или пощенски адреси“ → CSV файла от тук. Google хешира данните при качване.</p>
        <p>3. Списък под ~100 съвпаднали потребители (жълто) не се показва в Търсене/YouTube — ползвай „Всички купувачи“ или обедини сегменти.</p>
        <p>4. Политика за поверителност трябва да споменава споделяне с рекламни партньори (Google) за Customer Match.</p>
        <p>Файловете съдържат лични данни — не ги пращай по чатове и ги изтрий след качване.</p>
      </div>
    </div>
  )
}

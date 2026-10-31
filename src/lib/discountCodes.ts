// Discount codes. Server-side only: the list is never sent to the browser.
// Codes match case-insensitively. Dates are inclusive, Sofia time.

type DiscountCode = {
  code: string
  percent: number
  validFrom: string // ISO with offset
  validUntil: string
}

const DISCOUNT_CODES: DiscountCode[] = [
  { code: 'AVTONONCHEV', percent: 10, validFrom: '2026-10-31T00:00:00+02:00', validUntil: '2026-11-30T23:59:59+02:00' },
]

export type DiscountResult =
  | { ok: true; code: string; percent: number }
  | { ok: false; error: string }

export function checkDiscountCode(input: string, now = new Date()): DiscountResult {
  const wanted = input.trim().toUpperCase()
  if (!wanted) return { ok: false, error: 'Въведете код за отстъпка.' }
  const found = DISCOUNT_CODES.find(d => d.code === wanted)
  if (!found) return { ok: false, error: 'Невалиден код за отстъпка.' }
  if (now < new Date(found.validFrom)) return { ok: false, error: 'Кодът все още не е активен.' }
  if (now > new Date(found.validUntil)) return { ok: false, error: 'Кодът за отстъпка е изтекъл.' }
  return { ok: true, code: found.code, percent: found.percent }
}

export function discountAmount(total: number, percent: number) {
  return Math.round(total * percent) / 100
}

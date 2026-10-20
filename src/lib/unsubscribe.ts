import { createHmac, timingSafeEqual } from 'node:crypto'
import { SITE } from './campaignEmail'

function secret(): string {
  const s = process.env.UNSUBSCRIBE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new Error('UNSUBSCRIBE_SECRET or SUPABASE_SERVICE_ROLE_KEY is required')
  return s
}

export function unsubscribeToken(email: string): string {
  return createHmac('sha256', secret()).update(`unsubscribe:${email.toLowerCase()}`).digest('base64url').slice(0, 32)
}

export function verifyUnsubscribe(email: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

const query = (email: string) => `e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`

/** Page link shown in the email footer (asks for confirmation, safe against link scanners). */
export const unsubscribePageUrl = (email: string) => `${SITE}/unsubscribe?${query(email)}`

/** RFC 8058 one-click endpoint for the List-Unsubscribe header. */
export const unsubscribeOneClickUrl = (email: string) => `${SITE}/api/unsubscribe?${query(email)}`

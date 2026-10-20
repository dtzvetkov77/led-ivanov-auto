import type { Metadata } from 'next'
import { normalizeEmail } from '@/lib/customerSegments'
import { verifyUnsubscribe } from '@/lib/unsubscribe'

export const metadata: Metadata = {
  title: 'Отписване от имейли | LED Ivanov Auto',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ e?: string; t?: string; done?: string }> }

export default async function UnsubscribePage({ searchParams }: Props) {
  const { e, t, done } = await searchParams
  const email = normalizeEmail(e ?? null)
  const valid = !!email && !!t && verifyUnsubscribe(email, t)

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Отписване от имейли</h1>
      {done ? (
        <p className="text-muted">Готово — няма да получаваш повече рекламни имейли от нас. Имейлите за поръчки ще продължат да идват.</p>
      ) : valid ? (
        <form method="post" action={`/api/unsubscribe?e=${encodeURIComponent(email)}&t=${encodeURIComponent(t)}&form=1`} className="space-y-6">
          <p className="text-muted">Да отпишем ли <span className="text-white">{email}</span> от рекламните имейли на LED Ivanov Auto?</p>
          <button type="submit" className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-colors">
            Отпиши ме
          </button>
        </form>
      ) : (
        <p className="text-muted">Линкът е невалиден. Пиши ни на телефона от сайта и ще те отпишем ръчно.</p>
      )}
    </div>
  )
}

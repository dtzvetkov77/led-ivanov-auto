import Link from 'next/link'

export const metadata = { title: 'Поръчката е получена | LED Ivanov Auto', robots: { index: false } }

type Props = { searchParams: Promise<{ order?: string }> }

export default async function SuccessPage({ searchParams }: Props) {
  const { order } = await searchParams
  const safeOrder = order && /^ORD-\d{4}-\d{4,}$/.test(order) ? order : null
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-accent text-6xl mb-4">✓</div>
      <h1 className="text-3xl font-black mb-3">Поръчката е получена!</h1>
      {safeOrder && (
        <p className="text-muted mb-2">
          Номер: <span className="text-white font-mono">{safeOrder}</span>
        </p>
      )}
      <p className="text-muted mb-8">Ще се свържем с вас скоро за потвърждение.</p>
      <Link
        href="/products"
        className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded font-semibold transition-colors"
      >
        Продължи пазаруването
      </Link>
    </div>
  )
}

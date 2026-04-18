import CheckoutForm from '@/components/CheckoutForm'

export const metadata = { title: 'Поръчка | LED Ivanov Auto', robots: { index: false } }

export default function CheckoutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Оформи поръчка</h1>
        <p className="text-muted text-sm">Попълни данните и ще се свържем с теб за потвърждение.</p>
      </div>
      <CheckoutForm />
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCart, clearCart, cartTotal } from '@/lib/cart'
import type { CartItem } from '@/lib/types'

type DeliveryType = 'address' | 'office'

export default function CheckoutForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [items, setItems] = useState<CartItem[]>([])
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('address')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    delivery_city: '',
    courier_office: '',
    courier: 'ekont' as 'ekont' | 'speedy',
    notes: '',
  })

  useEffect(() => { setItems(getCart()) }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!privacyAccepted) {
      setErrors({ privacy: 'Трябва да приемете политиката за поверителност.' })
      return
    }
    if (items.length === 0) {
      setErrors({ _form: 'Количката е празна.' })
      return
    }

    const delivery_address = deliveryType === 'address'
      ? form.delivery_address
      : `Офис ${form.courier.charAt(0).toUpperCase() + form.courier.slice(1)}: ${form.courier_office}`
    const delivery_city = deliveryType === 'address' ? form.delivery_city : form.courier.toUpperCase()

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, delivery_address, delivery_city, items }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error?.fieldErrors) {
          const errs: Record<string, string> = {}
          for (const [k, v] of Object.entries(data.error.fieldErrors as Record<string, string[]>)) {
            errs[k] = v[0]
          }
          setErrors(errs)
        }
        return
      }
      clearCart()
      window.dispatchEvent(new Event('cart-updated'))
      router.push(`/checkout/success?order=${data.order_number}`)
    } catch {
      setErrors({ _form: 'Грешка при свързване. Моля опитайте отново.' })
    } finally {
      setLoading(false)
    }
  }

  const total = cartTotal(items)
  const freeShipping = total >= 150

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
      {/* ── Left: Form ── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors._form && (
          <p className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-3 rounded-xl">{errors._form}</p>
        )}

        {/* Contact */}
        <fieldset className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <legend className="text-sm font-bold uppercase tracking-widest text-accent px-1">Данни за контакт</legend>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Имена" error={errors.customer_name}>
              <input type="text" value={form.customer_name} onChange={set('customer_name')} required
                placeholder="Иван Иванов"
                className="field-input" />
            </Field>
            <Field label="Телефон" error={errors.customer_phone}>
              <input type="tel" value={form.customer_phone} onChange={set('customer_phone')} required
                placeholder="+359 88 XXX XXXX"
                className="field-input" />
            </Field>
          </div>

          <Field label="Имейл" error={errors.customer_email}>
            <input type="email" value={form.customer_email} onChange={set('customer_email')} required
              placeholder="email@example.com"
              className="field-input" />
          </Field>
        </fieldset>

        {/* Courier + delivery type */}
        <fieldset className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <legend className="text-sm font-bold uppercase tracking-widest text-accent px-1">Доставка</legend>

          {/* Courier picker */}
          <div>
            <p className="text-sm text-muted mb-2">Куриер</p>
            <div className="grid grid-cols-2 gap-3">
              {(['ekont', 'speedy'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, courier: c }))}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    form.courier === c
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-border text-muted hover:border-border-2'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h1.172a2 2 0 011.414.586l2.828 2.828A2 2 0 0121 13.172V17a2 2 0 01-2 2h-1m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {c === 'ekont' ? 'Еконт' : 'Спиди'}
                </button>
              ))}
            </div>
          </div>

          {/* Address type toggle */}
          <div>
            <p className="text-sm text-muted mb-2">Вид доставка</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setDeliveryType('address')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  deliveryType === 'address' ? 'border-accent bg-accent/10 text-white' : 'border-border text-muted hover:border-border-2'
                }`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                До адрес
              </button>
              <button type="button" onClick={() => setDeliveryType('office')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  deliveryType === 'office' ? 'border-accent bg-accent/10 text-white' : 'border-border text-muted hover:border-border-2'
                }`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                До офис на куриер
              </button>
            </div>
          </div>

          {/* Address fields */}
          {deliveryType === 'address' ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Адрес" error={errors.delivery_address}>
                <input type="text" value={form.delivery_address} onChange={set('delivery_address')} required
                  placeholder="ул. Примерна 10, ет. 3"
                  className="field-input" />
              </Field>
              <Field label="Град" error={errors.delivery_city}>
                <input type="text" value={form.delivery_city} onChange={set('delivery_city')} required
                  placeholder="София"
                  className="field-input" />
              </Field>
            </div>
          ) : (
            <Field label={`Офис на ${form.courier === 'ekont' ? 'Еконт' : 'Спиди'}`} error={errors.courier_office}>
              <input type="text" value={form.courier_office} onChange={set('courier_office')} required
                placeholder="напр. Офис Витоша, София или населено място"
                className="field-input" />
            </Field>
          )}
        </fieldset>

        {/* Notes */}
        <fieldset className="bg-surface border border-border rounded-2xl p-6">
          <legend className="text-sm font-bold uppercase tracking-widest text-accent px-1">Бележка</legend>
          <textarea value={form.notes} onChange={set('notes')} rows={3}
            placeholder="Допълнителна информация за поръчката (незадължително)"
            className="field-input mt-3 resize-none" />
        </fieldset>

        {/* Privacy */}
        <label className={`flex items-start gap-3 cursor-pointer group ${errors.privacy ? 'text-red-400' : ''}`}>
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              className="sr-only"
              checked={privacyAccepted}
              onChange={e => { setPrivacyAccepted(e.target.checked); if (e.target.checked) setErrors(er => ({ ...er, privacy: '' })) }}
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              privacyAccepted ? 'bg-accent border-accent' : 'border-border group-hover:border-accent/60'
            }`}>
              {privacyAccepted && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-muted leading-snug">
            Прочетох и приемам{' '}
            <Link href="/privacy" className="text-accent hover:underline" target="_blank">Политиката за поверителност</Link>
            {' '}и{' '}
            <Link href="/terms" className="text-accent hover:underline" target="_blank">Условията за ползване</Link>.
            <span className="text-red-400 ml-1">*</span>
          </span>
        </label>
        {errors.privacy && <p className="text-red-400 text-xs -mt-4">{errors.privacy}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              Изпращане...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Потвърди поръчката
            </>
          )}
        </button>

        {/* Security row */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-2 border-t border-border">
          {[
            { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4.5 8-11.8A8 8 0 0012 2a8 8 0 00-8 8.2c0 7.3 8 11.8 8 11.8z"/><path d="M9 12l2 2 4-4"/></svg>, label: 'Сигурна форма' },
            { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label: 'Наложен платеж' },
            { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h1.172a2 2 0 011.414.586l2.828 2.828A2 2 0 0121 13.172V17a2 2 0 01-2 2h-1m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round"/></svg>, label: 'Еконт / Спиди' },
            { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/></svg>, label: '2 год. гаранция' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted">
              <span className="text-accent">{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </form>

      {/* ── Right: Order summary ── */}
      <div className="lg:sticky lg:top-28 space-y-4">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
            </svg>
            Вашата поръчка
          </h2>

          {items.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">Количката е празна</p>
          ) : (
            <div className="space-y-3">
              {items.map(item => {
                const [base, variation] = item.name.split(' — ')
                return (
                  <div key={item.product_id} className="flex gap-3">
                    {item.image && (
                      <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-border">
                        <Image src={item.image} alt={base} fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{base}</p>
                      {variation && <p className="text-xs text-muted">{variation}</p>}
                      <p className="text-xs text-muted">× {item.qty}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-accent">{(item.price * item.qty).toFixed(2)} €</p>
                      <p className="text-[11px] text-muted/50">{(item.price * item.qty * 1.95583).toFixed(2)} лв.</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Продукти</span>
              <div className="text-right">
                <span>{total.toFixed(2)} €</span>
                <p className="text-[11px] text-muted/50">{(total * 1.95583).toFixed(2)} лв.</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Доставка</span>
              <span className={freeShipping ? 'text-green-400 font-medium' : ''}>
                {freeShipping ? 'Безплатна' : '~6–8 €'}
              </span>
            </div>
            {!freeShipping && (
              <p className="text-xs text-muted/60">Безплатна доставка при поръчка над 150 €</p>
            )}
            <div className="flex justify-between font-black text-lg pt-2 border-t border-border">
              <span>Общо</span>
              <div className="text-right">
                <span className="text-accent">{total.toFixed(2)} €</span>
                <p className="text-sm font-normal text-muted/60">{(total * 1.95583).toFixed(2)} лв.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust */}
        <div className="bg-surface/60 border border-border rounded-2xl p-5 space-y-3">
          {[
            { icon: <svg className="w-5 h-5 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4.5 8-11.8A8 8 0 0012 2a8 8 0 00-8 8.2c0 7.3 8 11.8 8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>, text: 'Данните ви са защитени и криптирани' },
            { icon: <svg className="w-5 h-5 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h1.172a2 2 0 011.414.586l2.828 2.828A2 2 0 0121 13.172V17a2 2 0 01-2 2h-1m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round"/></svg>, text: 'Доставка 1–2 работни дни' },
            { icon: <svg className="w-5 h-5 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/></svg>, text: '2 години гаранция на всички продукти' },
          ].map(b => (
            <div key={b.text} className="flex items-start gap-2.5 text-xs text-muted">{b.icon}{b.text}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

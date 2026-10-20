'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveCart } from '@/lib/cart'
import { setCartId } from '@/lib/cartCapture'
import type { CartItem } from '@/lib/types'

export default function RestoreCartPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch(`/api/cart-capture?id=${encodeURIComponent(id)}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(({ items }: { items: CartItem[] }) => {
        if (!items?.length) throw new Error()
        saveCart(items)
        setCartId(id)
        window.dispatchEvent(new Event('cart-updated'))
        router.replace('/checkout')
      })
      .catch(() => setFailed(true))
  }, [id, router])

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      {failed ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Количката не е намерена</h1>
          <p className="text-muted mb-6">Линкът е изтекъл или поръчката вече е направена.</p>
          <Link href="/products" className="inline-block px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-colors">
            Към продуктите
          </Link>
        </>
      ) : (
        <p className="text-muted">Възстановяваме количката ти...</p>
      )}
    </div>
  )
}

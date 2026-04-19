'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Partner = {
  id: string
  slug: string
  name: string
  city: string
  phone: string
  hours: string
  published: boolean
  position: number
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-а-яёА-ЯЁ]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const EMPTY_FORM = { name: '', city: '', address: '', phone: '', hours: 'Всеки ден', slug: '' }

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPartners()
  }, [])

  async function fetchPartners() {
    setLoading(true)
    const { data } = await supabase.from('partners').select('*').order('position')
    setPartners(data ?? [])
    setLoading(false)
  }

  function handleNameChange(name: string) {
    setForm(prev => ({ ...prev, name, slug: slugify(name) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Грешка при създаване')
      } else {
        setForm(EMPTY_FORM)
        await fetchPartners()
      }
    } catch {
      setError('Мрежова грешка')
    } finally {
      setSubmitting(false)
    }
  }

  async function togglePublished(id: string, current: boolean) {
    await supabase.from('partners').update({ published: !current }).eq('id', id)
    setPartners(prev => prev.map(p => p.id === id ? { ...p, published: !current } : p))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Партньори</h1>
        <Link
          href="/partners"
          target="_blank"
          className="text-sm text-muted hover:text-white transition-colors"
        >
          Преглед →
        </Link>
      </div>

      {/* Add partner form */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-5">Добави партньор</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted uppercase tracking-wide">Име *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Kosta's Garage"
              className="bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted uppercase tracking-wide">Slug *</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="kostas-garage"
              className="bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted uppercase tracking-wide">Град *</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
              placeholder="София"
              className="bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted uppercase tracking-wide">Адрес *</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
              placeholder="ул. Примерна 1"
              className="bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted uppercase tracking-wide">Телефон *</label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+359..."
              className="bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted uppercase tracking-wide">Работно време *</label>
            <input
              type="text"
              required
              value={form.hours}
              onChange={e => setForm(prev => ({ ...prev, hours: e.target.value }))}
              placeholder="Всеки ден"
              className="bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <div className="sm:col-span-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-accent text-black font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Добавяне...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Добави партньор
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Partners list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted text-sm">Зареждане...</div>
      ) : partners.length === 0 ? (
        <p className="text-center text-muted py-8 text-sm">Няма добавени партньори</p>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Партньор</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted hidden sm:table-cell">Телефон</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Статус</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {partners.map(partner => (
                <tr key={partner.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{partner.name}</p>
                    <p className="text-muted text-xs mt-0.5">{partner.city}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell text-muted">{partner.phone}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => togglePublished(partner.id, partner.published)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        partner.published
                          ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                          : 'bg-white/5 text-muted hover:bg-white/10'
                      }`}
                    >
                      {partner.published ? 'Публикуван' : 'Скрит'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/partners/${partner.id}`}
                      className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-white border border-border hover:border-accent/50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Редактирай
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

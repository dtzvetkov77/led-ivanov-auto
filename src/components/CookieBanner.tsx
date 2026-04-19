'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) setShow(true)
  }, [])

  const accept = (type: 'all' | 'necessary') => {
    localStorage.setItem('cookie-consent', type)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur border-t border-border shadow-2xl">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <svg className="w-5 h-5 text-accent shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 0a5 5 0 015 5" strokeLinecap="round"/>
            <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none"/>
            <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/>
          </svg>
          <div>
            <p className="text-sm font-semibold mb-0.5">Използваме бисквитки</p>
            <p className="text-xs text-muted leading-relaxed">
              Сайтът използва бисквитки за функционалност и анализ на посещенията.{' '}
              <Link href="/cookies" className="text-accent hover:underline">Научи повече</Link>
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => accept('necessary')}
            className="flex-1 sm:flex-none px-4 py-2 text-xs border border-border rounded-lg text-muted hover:text-white hover:border-border-2 transition-colors whitespace-nowrap"
          >
            Само необходими
          </button>
          <button
            onClick={() => accept('all')}
            className="flex-1 sm:flex-none px-5 py-2 text-xs bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-bold whitespace-nowrap"
          >
            Приемам всички
          </button>
        </div>
      </div>
    </div>
  )
}

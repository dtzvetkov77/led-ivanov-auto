'use client'
import { useState } from 'react'

export default function LogoImage({ className = 'h-8' }: { className?: string }) {
  const [failed, setFailed] = useState(false)

  if (!failed) {
    return (
      <img
        src="/images/logo.png"
        alt="LED Ivanov Auto"
        className={`w-auto object-contain ${className}`}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-black text-base tracking-tight">
      <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
      LED <span className="text-accent">IVANOV</span> AUTO
    </span>
  )
}

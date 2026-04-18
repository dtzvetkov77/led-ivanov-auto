'use client'
import { useState } from 'react'

export default function PartnerLogo({ name, logo, href }: { name: string; logo: string; href: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-center h-16 bg-background border border-border rounded-xl px-4 hover:border-accent/50 transition-colors"
    >
      {!failed ? (
        <img
          src={logo}
          alt={name}
          className="max-h-8 max-w-full object-contain opacity-50 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-xs text-muted font-medium group-hover:text-white transition-colors">{name}</span>
      )}
    </a>
  )
}

'use client'
import { useState } from 'react'

const COLORS = ['#cc0000', '#1a6be0', '#e07b00', '#228844', '#7b22cc', '#cc6600']

export default function CustomerAvatar({
  name, photo, index, size = 'md',
}: {
  name: string
  photo: string
  index: number
  size?: 'sm' | 'md'
}) {
  const [failed, setFailed] = useState(false)
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-11 h-11'
  const text = size === 'sm' ? 'text-sm' : 'text-sm'

  return (
    <div className={`relative shrink-0 ${dim}`}>
      {!failed && (
        <img
          src={photo}
          alt={name}
          className={`${dim} rounded-full object-cover border-2 border-border absolute inset-0`}
          onError={() => setFailed(true)}
        />
      )}
      <div
        className={`${dim} rounded-full flex items-center justify-center text-white font-bold ${text} ${!failed ? '-z-10' : ''}`}
        style={{ background: COLORS[index % COLORS.length] }}
      >
        {name[0]}
      </div>
    </div>
  )
}

import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
        }}
      >
        {/* Headlight: red lens circle + white light beams */}
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
          {/* Lens */}
          <circle cx="7" cy="12" r="4.5" fill="#cc0000" />
          {/* Beams */}
          <line x1="11.5" y1="7" x2="23" y2="4" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="11.5" y1="12" x2="23" y2="12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="11.5" y1="17" x2="23" y2="20" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  )
}

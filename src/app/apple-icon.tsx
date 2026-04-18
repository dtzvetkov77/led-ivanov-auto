import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          borderRadius: '40px',
        }}
      >
        <svg viewBox="0 0 24 24" width="120" height="120">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#cc0000" />
        </svg>
      </div>
    ),
    { ...size },
  )
}

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 170, height: 170 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '64px',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="144"
          height="144"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
        </svg>
      </div>
    ),
    { ...size }
  )
}

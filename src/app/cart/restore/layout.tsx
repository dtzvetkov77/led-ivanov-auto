import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Възстановяване на количка | LED Ivanov Auto',
  robots: { index: false, follow: false },
}

export default function RestoreLayout({ children }: { children: React.ReactNode }) {
  return children
}

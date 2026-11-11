import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Контакти | LED Ivanov Auto' },
  alternates: { canonical: '/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}

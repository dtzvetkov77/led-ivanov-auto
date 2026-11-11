import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Контакти и адрес в София | LED Ivanov Auto' },
  description: 'Свържете се с LED Ivanov Auto в София: телефон, адрес и работно време на сервиза за LED крушки и фарове.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Контакти и адрес в София | LED Ivanov Auto',
    description: 'Свържете се с LED Ivanov Auto в София: телефон, адрес и работно време на сервиза за LED крушки и фарове.',
    url: '/contact',
    type: 'website',
    locale: 'bg_BG',
    siteName: 'LED Ivanov Auto',
    images: ['/images/hero.webp'],
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}

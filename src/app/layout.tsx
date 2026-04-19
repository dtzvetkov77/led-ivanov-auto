import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import ToastContainer from '@/components/ToastContainer'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import { JsonLd } from '@/components/JsonLd'

const inter  = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' })
const oswald = Oswald({ subsets: ['latin', 'cyrillic'], variable: '--font-oswald', weight: ['400', '500', '600', '700'] })

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ledivanov.bg'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'LED Ivanov Auto — LED крушки и авто осветление',
    template: '%s | LED Ivanov Auto',
  },
  description: 'Висококачествени LED крушки за фарове — Plug & Play монтаж, без CanBus грешки, до 2 години гаранция. Безплатна доставка над 150 €. Онлайн магазин и сервиз в София.',
  keywords: ['LED крушки', 'LED фарове', 'авто LED', 'крушки за кола', 'авто осветление', 'LED Ivanov Auto', 'полиране фарове', 'LED крушки България', 'купи LED', 'plug and play LED'],
  authors: [{ name: 'LED Ivanov Auto', url: SITE }],
  creator: 'LED Ivanov Auto',
  publisher: 'LED Ivanov Auto',
  alternates: { canonical: SITE },
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    siteName: 'LED Ivanov Auto',
    title: 'LED Ivanov Auto — LED крушки и авто осветление',
    description: 'Висококачествени LED крушки за фарове — Plug & Play монтаж, без CanBus грешки, до 2 години гаранция.',
    url: SITE,
    images: [
      {
        url: `${SITE}/images/hero.webp`,
        width: 1200,
        height: 630,
        alt: 'LED Ivanov Auto — LED крушки за автомобили',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LED Ivanov Auto — LED крушки и авто осветление',
    description: 'Висококачествени LED крушки за фарове — Plug & Play монтаж, без CanBus грешки, до 2 години гаранция.',
    images: [`${SITE}/images/hero.webp`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    // google: 'YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN',
  },
}

const globalSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['AutoPartsStore', 'LocalBusiness'],
      '@id': `${SITE}/#business`,
      name: 'LED Ivanov Auto',
      description: 'Висококачествени LED крушки за фарове и авто аксесоари. Plug & Play монтаж, до 2 години гаранция, безплатна доставка над 150 €.',
      url: SITE,
      telephone: '+35999999796',
      image: `${SITE}/images/hero.webp`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/images/logo.png`,
      },
      priceRange: '€€',
      currenciesAccepted: 'EUR',
      paymentAccepted: 'Наложен платеж',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ул. Георги Русев 2',
        addressLocality: 'София',
        addressRegion: 'София-град',
        postalCode: '1734',
        addressCountry: 'BG',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 42.6370748,
        longitude: 23.3354294,
      },
      hasMap: 'https://www.google.com/maps/place/LED+IVANOV+AUTO/@42.6370748,23.3354294,17z',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        opens: '09:00',
        closes: '23:00',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '250',
        bestRating: '5',
        worstRating: '1',
      },
      sameAs: [
        'https://www.facebook.com/p/LED-Ivanov-Auto-%D0%9A%D1%80%D1%83%D1%88%D0%BA%D0%B8-%D0%B8-%D0%90%D0%B2%D1%82%D0%BE%D0%B0%D0%BA%D1%81%D0%B5%D1%81%D0%BE%D0%B0%D1%80%D0%B8-100065233232609/',
        'https://www.tiktok.com/@ivanov_auto',
        'https://www.google.com/maps/place/LED+IVANOV+AUTO/@42.6370748,23.3354294,17z',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'LED Ivanov Auto',
      url: SITE,
      inLanguage: 'bg',
      publisher: { '@id': `${SITE}/#business` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE}/products?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body className={`${inter.variable} ${oswald.variable} font-sans bg-background text-white`}>
        <JsonLd data={globalSchema} />
        {/* Fixed delivery banner — h-8 (32px) */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-accent text-white text-center text-xs h-8 flex items-center justify-center font-semibold tracking-widest uppercase">
          <svg className="w-3.5 h-3.5 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h1.172a2 2 0 011.414.586l2.828 2.828A2 2 0 0121 13.172V17a2 2 0 01-2 2h-1m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Безплатна доставка над 150 €
        </div>
        <Navbar />
        {/* pt-8 for banner + pt-16 for navbar = pt-24 */}
        <main className="pt-24">{children}</main>
        <Footer />
        <ToastContainer />
        <CookieBanner />
      </body>
    </html>
  )
}

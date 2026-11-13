const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ledivanovauto.com').replace('http://localhost:3000', 'https://www.ledivanovauto.com')

// Next.js replaces the whole openGraph object of the root layout when a page
// sets its own openGraph, so pages must pass the default image explicitly.
export const DEFAULT_OG_IMAGES = [
  {
    url: `${SITE}/images/hero.webp`,
    width: 1200,
    height: 630,
    alt: 'LED Ivanov Auto — LED крушки за автомобили',
  },
]

import { unstable_cache } from 'next/cache'

// Google Business Profile rating, shown on the site and in the LocalBusiness schema.
// Fetched from the Places API once a day; these values are the fallback when
// the API key is missing or Google doesn't answer (last checked by hand 2026-10-14).
export const GOOGLE_REVIEWS = {
  rating: 4.9,
  count: 460,
  url: 'https://www.google.com/maps/place/LED+IVANOV+AUTO/@42.6370748,23.3354294,17z',
} as const

export type GoogleReviews = { rating: number; count: number; url: string }

const fetchFromPlaces = unstable_cache(
  async (): Promise<GoogleReviews> => {
    const key = process.env.GOOGLE_PLACES_API_KEY
    if (!key) throw new Error('GOOGLE_PLACES_API_KEY missing')
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.displayName,places.rating,places.userRatingCount,places.googleMapsUri',
      },
      body: JSON.stringify({
        textQuery: 'LED IVANOV AUTO',
        locationBias: { circle: { center: { latitude: 42.6370748, longitude: 23.3354294 }, radius: 2000 } },
      }),
      cache: 'no-store', // cached by unstable_cache instead
    })
    if (!res.ok) throw new Error(`Places API ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = (await res.json()) as {
      places?: { displayName?: { text?: string }; rating?: number; userRatingCount?: number; googleMapsUri?: string }[]
    }
    // Only trust our own listing, never a nearby business with a similar name
    const place = data.places?.find(p => /ivanov/i.test(p.displayName?.text ?? ''))
    if (!place?.rating || !place.userRatingCount) throw new Error('LED Ivanov Auto not found in Places results')
    return { rating: place.rating, count: place.userRatingCount, url: place.googleMapsUri ?? GOOGLE_REVIEWS.url }
  },
  ['google-reviews'],
  { revalidate: 60 * 60 * 24 },
)

// Never throws: a failed lookup isn't cached and the fallback is shown until the next try
export async function getGoogleReviews(): Promise<GoogleReviews> {
  try {
    return await fetchFromPlaces()
  } catch (e) {
    console.error('[google-reviews]', e instanceof Error ? e.message : e)
    return { ...GOOGLE_REVIEWS }
  }
}

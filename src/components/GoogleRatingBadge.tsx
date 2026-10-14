import { GOOGLE_REVIEWS } from '@/lib/google-reviews'

// Google logo + stars + review count, linking to the Google Maps profile
export default function GoogleRatingBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href={GOOGLE_REVIEWS.url}
      target="_blank" rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/12 rounded-full px-4 py-1.5 transition-colors ${className}`}
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#EA4335" d="M5.27 9.17A6.74 6.74 0 0112 5.25a6.7 6.7 0 014.75 1.97l3.55-3.55A11.25 11.25 0 0012 0 11.94 11.94 0 00.9 7.27l4.37 1.9z"/>
        <path fill="#34A853" d="M16.04 18.01A6.7 6.7 0 0112 19.25a6.74 6.74 0 01-6.37-4.56l-4.4 1.68A11.94 11.94 0 0012 24a11.25 11.25 0 007.5-2.87l-3.46-3.12z"/>
        <path fill="#4A90E2" d="M19.5 12.25c0-.7-.07-1.37-.19-2H12v3.79h4.19a3.6 3.6 0 01-1.56 2.36l3.46 3.12C20.33 17.55 19.5 15.07 19.5 12.25z"/>
        <path fill="#FBBC05" d="M5.63 14.69A6.74 6.74 0 015.27 12.25c0-.85.15-1.67.42-2.43L1.32 7.92A11.94 11.94 0 000 12.25c0 1.5.28 2.94.78 4.24l4.85-1.8z"/>
      </svg>
      <span className="flex items-center gap-1">
        <span className="text-white text-xs font-bold">{GOOGLE_REVIEWS.rating.toFixed(1)}</span>
        <span className="flex gap-0.5" aria-label={`${GOOGLE_REVIEWS.rating} от 5 звезди`}>
          {[1, 2, 3, 4, 5].map(s => (
            <svg key={s} className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </span>
        <span className="text-white/50 text-xs">· {GOOGLE_REVIEWS.count}+ ревюта в Google</span>
      </span>
    </a>
  )
}

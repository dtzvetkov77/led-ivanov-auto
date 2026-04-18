import ReviewForm from '@/components/ReviewForm'
import Link from 'next/link'

export default function NewReviewPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/reviews" className="text-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Ново ревю</h1>
      </div>
      <ReviewForm />
    </div>
  )
}

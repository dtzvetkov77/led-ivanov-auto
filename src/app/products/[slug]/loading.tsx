export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Gallery skeleton */}
        <div className="w-full md:w-1/2 space-y-3 shrink-0">
          <div className="aspect-square bg-surface-2 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-16 h-16 bg-surface-2 rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-4 w-32 bg-surface-2 rounded animate-pulse" />
          <div className="h-8 bg-surface-2 rounded animate-pulse" />
          <div className="h-8 w-3/4 bg-surface-2 rounded animate-pulse" />
          <div className="h-10 w-36 bg-surface-2 rounded animate-pulse mt-2" />
          <div className="h-px bg-border my-4" />
          <div className="space-y-2">
            {[0,1,2,3].map(i => (
              <div key={i} className="h-4 bg-surface-2 rounded animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
            ))}
            <div className="h-4 w-2/3 bg-surface-2 rounded animate-pulse" />
          </div>
          <div className="flex gap-3 mt-6">
            <div className="h-12 flex-1 bg-surface-2 rounded-xl animate-pulse" />
            <div className="h-12 flex-1 bg-surface-2 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Filter bar skeleton */}
      <div className="h-11 bg-surface-2 rounded-xl mb-6 animate-pulse" />

      {/* Grid skeleton — matches ProductGrid col layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-lg overflow-hidden border border-border">
            <div className="aspect-square bg-surface-2 animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
            <div className="p-3 space-y-2">
              <div className="h-3.5 bg-surface-2 rounded animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
              <div className="h-3.5 bg-surface-2 rounded w-4/5 animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
              <div className="h-3 bg-surface-2 rounded w-1/2 animate-pulse mt-1" style={{ animationDelay: `${i * 40}ms` }} />
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                <div className="space-y-1">
                  <div className="h-5 w-20 bg-surface-2 rounded animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
                  <div className="h-3 w-16 bg-surface-2 rounded animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
                </div>
                <div className="h-8 w-16 bg-surface-2 rounded-lg animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

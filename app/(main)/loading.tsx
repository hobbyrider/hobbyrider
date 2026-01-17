export default function Loading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Header Skeleton */}
        <header className="mb-6 text-center sm:text-left sm:mb-8">
          <div className="h-8 sm:h-10 w-64 sm:w-80 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 sm:h-6 w-96 max-w-full bg-gray-100 rounded animate-pulse"></div>
        </header>

        {/* Filter Controls Skeleton */}
        <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
          <div>
            <div className="h-3.5 sm:h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="flex gap-1.5 sm:gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
          <div>
            <div className="h-3.5 sm:h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="flex gap-1.5 sm:gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Feed Skeleton */}
        <section className="space-y-4 sm:space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-4 sm:p-5">
              <div className="flex gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-5 w-16 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="h-4 w-12 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}

"use client"

const EarnPageSkeletonLoading = () => {
  return (
    <div className="min-h-screen flex flex-col text-white space-y-6 p-6 overflow-x-hidden">
      {/* Header skeleton */}
      <div className="h-12 bg-gray-800/50 rounded-lg skeleton-shine"></div>

      {/* CoinDisplay skeleton */}
      <div className="h-20 bg-gray-800/50 rounded-lg skeleton-shine"></div>

      {/* Daily Reward skeleton */}
      <div className="h-24 bg-gray-800/50 rounded-lg skeleton-shine"></div>

      {/* Special Offers title skeleton */}
      <div className="h-8 w-1/2 bg-gray-800/50 rounded-lg skeleton-shine"></div>

      {/* Special Offers list skeleton */}
      <div className="space-y-4 flex-grow">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-20 bg-gray-800/50 rounded-lg skeleton-shine"></div>
        ))}
      </div>

      {/* Navbar skeleton */}
      <div className="h-16 bg-gray-800/50 fixed bottom-0 left-0 right-0 skeleton-shine"></div>
    </div>
  )
}

export default EarnPageSkeletonLoading

"use client"

const EarnPageSkeletonLoading = () => {
  return (
    <div className="min-h-screen flex flex-col text-white space-y-6 p-6 overflow-x-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="h-12 bg-gray-700 rounded-lg"></div>

      {/* CoinDisplay skeleton */}
      <div className="h-20 bg-gray-700 rounded-lg"></div>

      {/* Daily Reward skeleton */}
      <div className="h-24 bg-gray-700 rounded-lg"></div>

      {/* Special Offers title skeleton */}
      <div className="h-8 w-1/2 bg-gray-700 rounded-lg"></div>

      {/* Special Offers list skeleton */}
      <div className="space-y-4 flex-grow">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-20 bg-gray-700 rounded-lg"></div>
        ))}
      </div>

      {/* Navbar skeleton */}
      <div className="h-16 bg-gray-700 rounded-lg fixed bottom-0 left-0 right-0"></div>
    </div>
  )
}

export default EarnPageSkeletonLoading

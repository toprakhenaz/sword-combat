"use client"

const MainPageSkeletonLoading = () => {
  return (
    <div className="min-h-screen flex flex-col text-white space-y-6 p-6 overflow-x-hidden">
      {/* Header skeleton */}
      <div className="h-12 bg-gray-800/50 rounded-lg skeleton-shine"></div>

      {/* CoinDisplay skeleton */}
      <div className="h-20 bg-gray-800/50 rounded-lg skeleton-shine"></div>

      {/* CentralButton skeleton */}
      <div className="py-8 flex justify-center">
        <div className="w-40 h-40 bg-gray-800/50 rounded-full skeleton-shine"></div>
      </div>

      {/* EnergyBar skeleton */}
      <div className="h-12 bg-gray-800/50 rounded-lg skeleton-shine"></div>

      {/* Navbar skeleton */}
      <div className="h-16 bg-gray-800/50 fixed bottom-0 left-0 right-0 skeleton-shine"></div>
    </div>
  )
}

export default MainPageSkeletonLoading

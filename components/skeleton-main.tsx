"use client"

const MainPageSkeletonLoading = () => {
  return (
    <div className="min-h-screen flex flex-col text-white space-y-6 p-6 overflow-x-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="h-12 bg-gray-700 rounded-lg"></div>

      {/* CoinDisplay skeleton */}
      <div className="h-20 bg-gray-700 rounded-lg"></div>

      {/* CentralButton skeleton */}
      <div className="py-8 flex justify-center">
        <div className="w-40 h-40 bg-gray-700 rounded-full"></div>
      </div>

      {/* EnergyBar skeleton */}
      <div className="h-12 bg-gray-700 rounded-lg"></div>

      {/* Navbar skeleton */}
      <div className="h-16 bg-gray-700 rounded-lg fixed bottom-0 left-0 right-0"></div>
    </div>
  )
}

export default MainPageSkeletonLoading

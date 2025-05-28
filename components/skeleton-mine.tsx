"use client"

const SkeletonLoading = () => {
  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-1 space-y-4 bg-gray-900 text-white font-['Poppins',sans-serif]">
      {/* HeaderCard skeleton */}
      <div className="h-20 bg-gray-700 rounded-lg skeleton-shine"></div>

      {/* TimerBar skeleton */}
      <div className="h-12 bg-gray-700 rounded-lg skeleton-shine"></div>

      {/* BottomNav skeleton */}
      <div className="h-12 bg-gray-700 rounded-lg skeleton-shine"></div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-2 gap-3" style={{ height: "45vh" }}>
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-700 rounded-lg h-48 skeleton-shine"></div>
        ))}
      </div>

      {/* Navbar skeleton */}
      <div className="h-16 bg-gray-700 rounded-lg fixed bottom-0 left-0 right-0 skeleton-shine"></div>
    </div>
  )
}

export default SkeletonLoading

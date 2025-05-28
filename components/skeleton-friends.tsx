"use client"

const FriendsSkeletonLoading = () => {
  return (
    <div className="min-h-screen flex flex-col text-white space-y-6 p-6 overflow-x-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="h-12 bg-gray-700 rounded-lg"></div>

      {/* Friends list title skeleton */}
      <div className="h-8 w-1/2 bg-gray-700 rounded-lg"></div>

      {/* Friends list skeleton */}
      <div className="space-y-4 flex-grow">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-16 bg-gray-700 rounded-lg flex items-center space-x-4 p-4">
            {/* Profile picture skeleton */}
            <div className="h-12 w-12 bg-gray-600 rounded-full"></div>
            <div className="flex-grow space-y-2">
              <div className="h-4 bg-gray-600 rounded-lg"></div>
              <div className="h-4 bg-gray-600 rounded-lg w-3/4"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Friend button skeleton */}
      <div className="h-10 bg-gray-700 rounded-lg"></div>

      {/* Navbar skeleton */}
      <div className="h-16 bg-gray-700 rounded-lg fixed bottom-0 left-0 right-0"></div>
    </div>
  )
}

export default FriendsSkeletonLoading

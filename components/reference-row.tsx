"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { RefferanceRowProps } from "@/types"

export default function ReferenceRow({ referance, collectCoins, isAnimating = false }: RefferanceRowProps) {
  return (
    <div
      className={`bg-gradient-to-r ${
        referance.isClaimed ? "from-gray-800 to-gray-700" : "from-zinc-800 to-zinc-700"
      } rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isAnimating ? "scale-105 border-2 border-yellow-400" : ""
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-inner">
            <span className="text-white font-bold">{referance.referancedName.charAt(0).toUpperCase()}</span>
          </div>

          <div>
            <div className="font-bold text-white">{referance.referancedName}</div>
            <div className="text-sm sm:text-base text-yellow-300 font-semibold flex items-center">
              <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1" />
              <span className={isAnimating ? "animate-pulse" : ""}>+{referance.referenceAmount}</span>
            </div>
          </div>
        </div>

        {referance.isClaimed ? (
          <div className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg font-medium flex items-center">
            <FontAwesomeIcon icon={icons.check} className="mr-1" />
            Collected
          </div>
        ) : (
          <button
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-yellow-500/20 flex items-center"
            onClick={() => collectCoins(referance.referencedId)}
            disabled={isAnimating}
          >
            <FontAwesomeIcon icon={icons.coins} className="mr-2" />
            {isAnimating ? "Collecting..." : "Collect"}
          </button>
        )}
      </div>

      {isAnimating && (
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 animate-shimmer"></div>
      )}
    </div>
  )
}

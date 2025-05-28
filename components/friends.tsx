"use client"

import type { FriendsProps } from "@/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

export default function Friends({ length }: FriendsProps) {
  return (
    <>
      <div className="text-center my-6">
        <h1 className="text-3xl font-bold mb-2">{length} Friends</h1>
        <p className="text-sm text-gray-300">Invite a friend and earn bonuses</p>
      </div>

      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mr-3 flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={icons.userGroup} className="text-yellow-700" />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-300">Invite your friend</p>
            <p className="text-sm font-bold text-white">
              You and your friend earn <span className="text-yellow-300">100,000</span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

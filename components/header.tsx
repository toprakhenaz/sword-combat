"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { HeaderProps } from "@/types"
import { useLeagues } from "@/hooks/useLeagues"

export default function Header({ earnPerTap, coinsToLevelUp, hourlyEarn }: HeaderProps) {
  const { getLeagueColors } = useLeagues()
  const leagueColors = getLeagueColors(1)
  const leagueColor = leagueColors.primary

  return (
    <div className="bg-[#0d1220] rounded-xl p-4 shadow-lg mb-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-center">
          <p className="text-xs text-gray-300 mb-1">Hourly Earnings</p>
          <div className="flex items-center">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
            <span className="text-white font-bold">{hourlyEarn.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-xs text-gray-300 mb-1">Required for Level</p>
          <div className="flex items-center">
            <FontAwesomeIcon icon={icons.angleDoubleUp} className="text-white mr-1 text-sm" />
            <span className="text-white font-bold">{coinsToLevelUp.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-xs text-gray-300 mb-1">Per Click</p>
          <div className="flex items-center">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
            <span className="text-white font-bold">+{earnPerTap}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

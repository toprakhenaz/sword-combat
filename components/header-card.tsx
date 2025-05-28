"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useLeagues } from "@/hooks/useLeagues"
import { useUser } from "@/contexts/UserContext"
import { formatNumber } from "@/lib/utils"

export default function HeaderCard({
  coins,
  league,
  hourlyEarn,
}: {
  coins?: number
  league?: number
  hourlyEarn?: number
}) {
  const { getLeagueById, loading } = useLeagues()
  const { hourlyEarn: contextHourlyEarn } = useUser()
  const leagueId = league || 1
  const leagueObj = getLeagueById(leagueId)
  if (!leagueObj) return null
  const displayHourlyEarn = hourlyEarn !== undefined ? hourlyEarn : contextHourlyEarn

  // colors, name, image gibi alanları leagueObj'den al

  return (
    <div className="bg-gray-800/60 py-3 px-4 mb-4 rounded-lg flex justify-between items-center shadow-lg backdrop-blur-sm border border-gray-700/70">
      <div
        className="flex items-center bg-gradient-to-r rounded-full py-2 px-4 shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          background: `linear-gradient(135deg, #b47300, #ffd700)`,
          boxShadow: `0 4px 12px rgba(255, 215, 0, 0.3)`,
        }}
      >
        <FontAwesomeIcon
          icon={icons.coins}
          className="text-yellow-300 mr-2 animate-pulse"
          style={{ animationDuration: "3s" }}
        />
        <span className="text-white font-bold text-lg">{coins ? formatNumber(coins) : "0"}</span>
      </div>

      <div
        className="flex items-center rounded-full py-2 px-4 border transition-all hover:shadow-lg"
        style={{
          background: `linear-gradient(to right, ${leagueObj.colors.primary}30, ${leagueObj.colors.secondary}30)`,
          borderColor: `${leagueObj.colors.secondary}60`,
          boxShadow: `0 2px 8px ${leagueObj.colors.glow}30`,
        }}
      >
        <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2" />
        <div>
          <span className="font-medium text-white text-lg">{formatNumber(displayHourlyEarn)}</span>
          <span className="text-gray-400 text-xs ml-1">/hour</span>
        </div>
      </div>
    </div>
  )
}

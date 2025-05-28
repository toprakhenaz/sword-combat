"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { EnergyBarProps } from "@/types"
import { useLeagues } from "@/hooks/useLeagues"
import { formatNumber } from "@/lib/utils"

export default function EnergyBar({ energy, maxEnergy, boost, onOpenBoostOverlay, league = 1 }: EnergyBarProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [prevEnergy, setPrevEnergy] = useState(energy)
  const { getLeagueColors } = useLeagues()
  const leagueColors = getLeagueColors(league)

  // Calculate energy percentage
  const energyPercentage = (energy / maxEnergy) * 100

  // Track energy changes for animations
  useEffect(() => {
    if (energy !== prevEnergy) {
      setIsAnimating(true)
      setPrevEnergy(energy)

      // End animation after transition
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [energy, prevEnergy])

  // Calculate and display the energy regen speed based on league
  const getRegenSpeed = () => {
    // Base regeneration time in seconds (15s for league 1, decreasing by 2s per league)
    const baseRegenTime = Math.max(3, 15 - (league - 1) * 2)
    return `${baseRegenTime}s/energy`
  }

  const formattedEnergy = (
    <span>
      <span
        className={energy < maxEnergy * 0.2 ? "text-red-400" : energy === maxEnergy ? "text-green-400" : "text-white"}
      >
        {formatNumber(energy, 0)}
      </span>
      <span className="text-gray-300"> / {formatNumber(maxEnergy, 0)}</span>
    </span>
  )

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={icons.bolt} className="text-white text-lg" />
          <span className="text-white font-semibold text-base">Energy</span>
        </div>
        <span className="font-bold text-base" style={{ color: energy === maxEnergy ? "#22c55e" : "#fff" }}>
          {formatNumber(energy)} <span className="text-gray-400 font-bold">/ {formatNumber(maxEnergy)}</span>
        </span>
      </div>
      {/* Bar + Rocket */}
      <div className="flex items-center gap-3 mt-1">
        <div className="flex-1 relative h-12 bg-[#1a1e2e] rounded-full overflow-hidden shadow-2xl">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500`}
            style={{
              width: `${energyPercentage}%`,
              background: `linear-gradient(90deg, ${leagueColors.primary}, ${leagueColors.secondary})`,
              boxShadow: `0 0 24px 3px ${leagueColors.glow}`,
              transition: "width 0.5s cubic-bezier(.4,2,.6,1)",
            }}
          />
        </div>
        <button
          onClick={onOpenBoostOverlay}
          className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 focus:outline-none border border-white/10 relative overflow-hidden"
          style={{
            background: `linear-gradient(120deg, ${leagueColors.primary} 60%, ${leagueColors.secondary} 100%)`,
            boxShadow: `0 2px 16px 0 ${leagueColors.secondary}80, 0 1.5px 0 0 #fff2 inset`,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "60%",
              background: "linear-gradient(180deg, #fff5 0%, #fff0 100%)",
              borderRadius: "9999px",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <FontAwesomeIcon icon={icons.rocket} className="text-white text-xl relative z-10" />
        </button>
      </div>
    </div>
  )
}

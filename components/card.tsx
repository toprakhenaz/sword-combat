"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { CardProps } from "@/types"
import { useState } from "react"
import { useLeagueData } from "@/data/GeneralData"
import { formatNumber } from "@/lib/utils"

export default function Card({ card, onUpgrade, coins }: CardProps) {
  const isDisabled = coins < card.upgradeCost
  const [isHovered, setIsHovered] = useState(false)
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(card.level > 5 ? 6 : card.level)

  return (
    <div
      className={`rounded-lg p-3 relative flex flex-col justify-between shadow-lg transition-all duration-300 ${
        isHovered ? "transform scale-105" : ""
      }`}
      style={{
        background: `linear-gradient(to bottom, ${colors.primary}40, ${colors.secondary}70)`,
        boxShadow: isHovered
          ? `0 8px 20px rgba(0, 0, 0, 0.6), 0 0 10px ${colors.glow}`
          : `0 4px 8px rgba(0, 0, 0, 0.4)`,
        border: `1px solid ${colors.secondary}60`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-lg mb-2" style={{ height: "120px" }}>
        <img
          src={card.image || "/placeholder.svg"}
          alt={card.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          loading="lazy" // Add lazy loading for better performance
        />
      </div>

      <div className="space-y-1 mb-2">
        <div className="text-center font-semibold text-sm sm:text-base" style={{ color: colors.text }}>
          {card.name}
        </div>

        <div className="text-center text-sm sm:text-base text-yellow-300 font-semibold">
          <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1" />+{formatNumber(card.hourlyIncome)}
          /Saat
        </div>

        <div className="flex justify-center items-center mt-1">
          <div
            className="px-3 py-1 rounded-full text-xs"
            style={{
              background: `linear-gradient(to right, ${colors.primary}60, ${colors.secondary}60)`,
              color: colors.text,
            }}
          >
            Seviye {card.level}
          </div>
        </div>
      </div>

      <button
        onClick={() => onUpgrade(card.id)}
        className={`mt-2 w-full py-2 px-4 rounded-lg font-medium text-center transition-all duration-300 flex items-center justify-center
          ${isDisabled ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "text-white hover:shadow-lg"}`}
        style={{
          background: isDisabled
            ? "linear-gradient(to right, #4b5563, #374151)"
            : `linear-gradient(to right, ${colors.secondary}, ${colors.primary})`,
          boxShadow: isDisabled ? "none" : `0 4px 12px ${colors.glow}30`,
        }}
        disabled={isDisabled}
        aria-disabled={isDisabled}
      >
        <FontAwesomeIcon icon={icons.coins} className="mr-2" />
        <span className="text-lg">{formatNumber(card.upgradeCost)}</span>
      </button>

      {/* Add sparkle effect on higher level cards */}
      {card.level > 2 && (
        <div
          className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full shadow-lg"
          style={{
            background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
            boxShadow: `0 0 10px ${colors.glow}`,
          }}
        >
          <FontAwesomeIcon icon={icons.star} className="text-xs" style={{ color: colors.text }} />
        </div>
      )}
    </div>
  )
}

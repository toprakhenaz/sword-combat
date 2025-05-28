"use client"

import type { BottomNavProps } from "@/types"
import { useLeagueData } from "@/data/GeneralData"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

export default function TaskNav({ activeCategory, setActiveCategory }: BottomNavProps) {
  const categories = ["Daily", "Crypto", "Bank", "Sponsor", "Ads"]

  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(6) // Use league 6 colors for the bottom nav

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Daily":
        return icons.star
      case "Crypto":
        return icons.coins
      case "Bank":
        return icons.swords
      case "Sponsor":
        return icons.handPointer
      case "Ads":
        return icons.infoCircle
      default:
        return icons.star
    }
  }

  return (
    <div
      className="flex overflow-x-auto scrollbar-hide rounded-full p-1 text-xs sm:text-sm"
      style={{
        background: `linear-gradient(to right, ${colors.primary}30, ${colors.secondary}30)`,
        border: `1px solid ${colors.secondary}40`,
        boxShadow: `0 4px 12px ${colors.glow}20`,
      }}
    >
      {categories.map((category) => (
        <button
          key={category}
          className={`flex-shrink-0 py-2 px-3 rounded-full text-center transition-colors flex items-center ${
            activeCategory === category ? "text-white" : "text-gray-300 hover:text-white hover:bg-gray-700/50"
          }`}
          style={{
            background:
              activeCategory === category
                ? `linear-gradient(to right, ${colors.secondary}80, ${colors.primary}80)`
                : "transparent",
            boxShadow: activeCategory === category ? `0 2px 8px ${colors.glow}40` : "none",
          }}
          onClick={() => setActiveCategory(category)}
        >
          <FontAwesomeIcon
            icon={getCategoryIcon(category)}
            className={`mr-1.5 ${activeCategory === category ? "text-yellow-300" : "text-gray-400"}`}
          />
          <span className="whitespace-nowrap">{category}</span>
        </button>
      ))}
    </div>
  )
}

"use client"

import { useMemo, useCallback } from "react"
import type { BottomNavProps } from "@/types"
import { useLeagueData } from "@/data/GeneralData"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

export default function BottomNav({ activeCategory, setActiveCategory }: BottomNavProps) {
  const categories = useMemo(() => ["Equipment", "Workers", "Isekai", "Special"], [])
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(6) // Use league 6 colors for the bottom nav

  const getCategoryIcon = useCallback((category: string) => {
    switch (category) {
      case "Equipment":
        return icons.pickaxe
      case "Workers":
        return icons.userGroup
      case "Isekai":
        return icons.swords
      case "Special":
        return icons.star
      default:
        return icons.star
    }
  }, [])

  const handleCategoryChange = useCallback(
    (category: string) => {
      setActiveCategory(category)
    },
    [setActiveCategory],
  )

  return (
    <div
      className="flex justify-between rounded-xl p-1 text-xs sm:text-sm shadow-lg"
      style={{
        background: `linear-gradient(to right, ${colors.primary}30, ${colors.secondary}30)`,
        border: `1px solid ${colors.secondary}40`,
        boxShadow: `0 4px 12px ${colors.glow}20, inset 0 1px 1px rgba(255, 255, 255, 0.05)`,
        backdropFilter: "blur(4px)",
      }}
    >
      {categories.map((category) => (
        <button
          key={category}
          className={`flex-1 py-3 px-2 sm:px-4 rounded-lg text-center transition-all duration-300 flex flex-col items-center ${
            activeCategory === category
              ? "text-white transform scale-105"
              : "text-gray-300 hover:text-white hover:bg-gray-700/30"
          }`}
          style={{
            background:
              activeCategory === category
                ? `linear-gradient(to bottom, ${colors.secondary}80, ${colors.primary}80)`
                : "transparent",
            boxShadow: activeCategory === category ? `0 2px 8px ${colors.glow}40` : "none",
          }}
          onClick={() => handleCategoryChange(category)}
        >
          <FontAwesomeIcon
            icon={getCategoryIcon(category)}
            className={`text-lg mb-1 ${activeCategory === category ? "text-yellow-300" : "text-gray-400"}`}
            style={{
              filter: activeCategory === category ? `drop-shadow(0 0 3px ${colors.glow})` : "none",
              transform: activeCategory === category ? "scale(1.1)" : "scale(1)",
              transition: "all 0.3s ease",
            }}
          />
          <span className="whitespace-nowrap text-xs">{category}</span>
        </button>
      ))}
    </div>
  )
}

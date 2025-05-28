"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useLeagueData } from "@/data/GeneralData"
import { useUser } from "@/context/UserContext"

interface TaskCategoryProps {
  categories: string[]
  activeCategory: string
  setActiveCategory: (category: string) => void
}

export default function TaskCategory({ categories, activeCategory, setActiveCategory }: TaskCategoryProps) {
  const { league } = useUser()
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(league)

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "All":
        return icons.listCheck
      case "Daily":
        return icons.calendar
      case "Crypto":
        return icons.coins
      case "Social":
        return icons.userGroup
      case "Learn":
        return icons.bookOpen
      default:
        return icons.listCheck
    }
  }

  return (
    <div className="mb-4 overflow-x-auto scrollbar-hide">
      <div className="flex space-x-2 p-1">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeCategory === category
                ? "text-white shadow-lg"
                : "bg-gray-800/70 text-gray-300 hover:bg-gray-700/70 hover:text-white"
            }`}
            style={
              activeCategory === category
                ? {
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: `0 2px 8px ${colors.glow}50`,
                  }
                : {}
            }
            onClick={() => setActiveCategory(category)}
          >
            <FontAwesomeIcon icon={getCategoryIcon(category)} className="mr-1" />
            <span>{category}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

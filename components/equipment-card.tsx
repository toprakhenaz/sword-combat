"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import Image from "next/image"
import { motion } from "framer-motion"

interface EquipmentCardProps {
  id: number
  name: string
  image: string
  level: number
  hourlyIncome: number
  isSelected: boolean
  onClick: () => void
  maxLevel?: number
}

export default function EquipmentCard({
  id,
  name,
  image,
  level,
  hourlyIncome,
  isSelected,
  onClick,
  maxLevel = 10,
}: EquipmentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Calculate level percentage
  const levelPercentage = Math.min(100, (level / maxLevel) * 100)

  // Determine rarity based on hourlyIncome
  const getRarityInfo = () => {
    if (hourlyIncome >= 500) {
      return { color: "from-purple-500 to-purple-700", label: "Efsanevi", textColor: "text-purple-300" }
    } else if (hourlyIncome >= 100) {
      return { color: "from-blue-500 to-blue-700", label: "Nadir", textColor: "text-blue-300" }
    } else if (hourlyIncome >= 50) {
      return { color: "from-green-500 to-green-700", label: "Sık", textColor: "text-green-300" }
    } else {
      return { color: "from-gray-500 to-gray-700", label: "Normal", textColor: "text-gray-300" }
    }
  }

  const rarity = getRarityInfo()

  return (
    <motion.div
      className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
        isSelected ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20" : "hover:ring-1 hover:ring-gray-400"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background with gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          isSelected ? "from-yellow-900/80 to-amber-950/90" : "from-gray-800/90 to-gray-900/95"
        }`}
      />

      {/* Rarity indicator */}
      <div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-80"
        style={{
          backgroundImage: `linear-gradient(to right, ${isSelected ? "#fbbf24, #f59e0b" : `var(--tw-gradient-from), var(--tw-gradient-to)`})`,
        }}
      ></div>

      <div className="relative p-3 flex items-center">
        {/* Equipment image */}
        <div className="relative w-14 h-14 mr-3 flex-shrink-0">
          <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${rarity.color} opacity-20`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={image || "/placeholder.svg?height=56&width=56&query=fantasy+sword"}
              alt={name}
              width={56}
              height={56}
              className="object-contain drop-shadow-lg"
            />
          </div>

          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-900/90 border border-gray-700 flex items-center justify-center shadow-lg">
            <span className="text-xs font-bold text-yellow-400">{level}</span>
          </div>
        </div>

        {/* Equipment info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="font-bold text-white text-sm truncate">{name}</h3>
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${rarity.textColor} bg-gray-800/50 border border-gray-700/50 text-[10px]`}
            >
              {rarity.label}
            </span>
          </div>

          <div className="flex items-center text-xs mt-0.5">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-xs" />
            <span className="text-yellow-300">+{hourlyIncome.toLocaleString()}/s</span>
          </div>

          {/* Level progress bar */}
          <div className="mt-2 relative h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className="absolute h-full left-0 top-0 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"
              style={{ width: `${levelPercentage}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 opacity-30">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 animate-shine"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="ml-2 flex-shrink-0">
          <FontAwesomeIcon
            icon={icons.chevronRight}
            className={`text-sm transition-all duration-300 ${
              isSelected ? "text-yellow-400 transform rotate-90" : "text-gray-500"
            }`}
          />
        </div>
      </div>
    </motion.div>
  )
}

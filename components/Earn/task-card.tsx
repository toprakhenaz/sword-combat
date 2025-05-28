"use client"

import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

interface TaskCardProps {
  title: string
  description: string
  reward: number
  platform: string
  isCompleted: boolean
  progress: number
  onStart: () => void
  onComplete: () => void
  disabled?: boolean
}

export default function TaskCard({
  title,
  description,
  reward,
  platform,
  isCompleted,
  progress,
  onStart,
  onComplete,
  disabled = false,
}: TaskCardProps) {
  // Get platform icon and color
  const getPlatformStyle = () => {
    const platformName = (platform || "").toLowerCase()
    switch (platformName) {
      case "youtube":
        return { bgColor: "#FF0000", icon: icons.youtube }
      case "twitter":
        return { bgColor: "#000000", icon: icons.twitter }
      case "telegram":
        return { bgColor: "#0088cc", icon: icons.telegram }
      case "instagram":
        return { bgColor: "#E1306C", icon: icons.instagram }
      case "facebook":
        return { bgColor: "#1877F2", icon: icons.facebook }
      case "linkedin":
        return { bgColor: "#0077B5", icon: icons.linkedin }
      case "binance":
        return { bgColor: "#F0B90B", icon: icons.coins }
      case "swordcoin":
        return { bgColor: "#6366F1", icon: icons.swords }
      default:
        return { bgColor: "#6366F1", icon: icons.globe }
    }
  }
  const platformStyle = getPlatformStyle()

  // Get button text and style based on task state
  const getButtonContent = () => {
    if (isCompleted) {
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={icons.check} className="text-white text-sm" />
        </div>
      )
    } else if (progress < 100) {
      return (
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onStart()
          }}
        >
          Görevi Başlat
        </button>
      )
    } else {
      return (
        <button
          className="px-3 py-1 bg-yellow-500 text-black rounded-full text-xs font-bold"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onComplete()
          }}
        >
          Tamamla ve Ödül Al
        </button>
      )
    }
  }

  return (
    <motion.div
      className={`bg-gray-800/90 rounded-xl overflow-hidden ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${isCompleted && !disabled ? "opacity-70" : ""}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 flex items-center">
        {/* Platform icon */}
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 mr-4 flex items-center justify-center"
          style={{ backgroundColor: platformStyle.bgColor }}
        >
          <FontAwesomeIcon icon={platformStyle.icon} className="text-white text-xl" />
        </div>
        {/* Task content */}
        <div className="flex-1">
          <p className="text-white text-sm font-medium mb-1">{description}</p>
          {/* Reward */}
          <div className="flex items-center mb-2">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-xs" />
            <span className="text-yellow-300 font-bold text-sm">+{reward.toLocaleString()}</span>
          </div>
          {/* Status text */}
          {isCompleted && (
            <div className="flex items-center text-green-400 text-xs">
              <FontAwesomeIcon icon={icons.check} className="mr-1" />
              <span>Tamamlandı</span>
            </div>
          )}
          {/* Progress bar */}
          {!isCompleted && (
            <div className="h-2 bg-gray-700 rounded-full mt-2 w-full">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
        {/* Action button or status */}
        <div className="ml-2 flex-shrink-0">{getButtonContent()}</div>
      </div>
    </motion.div>
  )
}

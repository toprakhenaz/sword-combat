"use client"

import { useState, useEffect } from "react"
import { useLeagues } from "@/hooks/useLeagues"
import { motion } from "framer-motion"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { X } from "lucide-react"

interface LeagueUpPopupProps {
  previousLeague: number
  newLeague: number
  onCollect: () => void
  onClose: () => void
}

export default function LeagueUpPopup({ previousLeague, newLeague, onCollect, onClose }: LeagueUpPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showCoins, setShowCoins] = useState(false)
  const { getLeagueById } = useLeagues()

  const nextLeague = getLeagueById(newLeague) || {
    name: "Unknown League",
    image: "/placeholder.svg",
    colors: {
      primary: "#808080",
      secondary: "#606060",
      text: "#FFFFFF",
      glow: "#A0A0A0",
    },
  }

  // Format reward amount based on league level
  const formatReward = (league: number): string => {
    switch (league) {
      case 2:
        return "50K"
      case 3:
        return "500K"
      case 4:
        return "5M"
      case 5:
        return "50M"
      case 6:
        return "500M"
      case 7:
        return "5B"
      default:
        return "0"
    }
  }

  // Handle collect button click
  const handleCollect = () => {
    setShowCoins(true)

    // Call onCollect immediately to update the balance
    onCollect()

    // Wait for coin collection animation
    setTimeout(() => {
      handleClose()
    }, 1000)
  }

  // Handle close
  const handleClose = () => {
    setIsVisible(false)
    // Delay the actual close to allow animation to complete
    setTimeout(onClose, 300)
  }

  // Animation for entrance
  useEffect(() => {
    // Slight delay before showing for smoother animation
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    // ESC key functionality
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose()
      }
    }

    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 transition-all duration-300 backdrop-blur-sm"
      style={{ opacity: isVisible ? 1 : 0 }}
      onClick={handleClose}
    >
      <motion.div
        className="rounded-2xl overflow-hidden relative w-[90%] max-w-sm transform transition-transform duration-300 bg-gray-900"
        style={{
          boxShadow: `0 15px 30px -10px rgba(0, 0, 0, 0.6), 0 8px 20px -6px rgba(0, 0, 0, 0.4)`,
          transform: isVisible ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)",
        }}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
      >
        {/* Header */}
        <div
          className="p-4 text-center relative"
          style={{
            background: `linear-gradient(135deg, ${nextLeague.colors.primary}, ${nextLeague.colors.secondary})`,
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 bg-gray-800/40 hover:bg-gray-700/60 rounded-full flex items-center justify-center transition-colors duration-300 text-gray-300 hover:text-white"
          >
            <X size={16} />
          </button>

          <h2 className="text-xl font-bold text-white">League Up!</h2>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-800">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Image
                src={nextLeague.image || "/placeholder.svg"}
                alt={`${nextLeague.name} League`}
                width={96}
                height={96}
                className="object-contain"
                style={{ filter: `drop-shadow(0 0 10px ${nextLeague.colors.glow})` }}
                priority
              />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{nextLeague.name} League</h3>

            <p className="text-gray-300 text-center mb-4">
              Congratulations! You've reached a new league and earned a reward!
            </p>

            <div className="flex items-center justify-center bg-gray-700/50 px-4 py-2 rounded-lg mb-4">
              <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2 text-xl" />
              <span className="text-yellow-400 font-bold text-xl">+{formatReward(newLeague)}</span>
            </div>
          </div>

          <button
            onClick={handleCollect}
            className="w-full py-3 px-4 text-white font-bold rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 tap-feedback"
            style={{
              background: `linear-gradient(to right, ${nextLeague.colors.primary}, ${nextLeague.colors.secondary})`,
              boxShadow: `0 4px 12px ${nextLeague.colors.glow}40, 0 2px 6px rgba(0, 0, 0, 0.3)`,
            }}
          >
            Collect Reward
          </button>
        </div>

        {/* Coin Collection Animation */}
        {showCoins && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => {
              const randomX = Math.random() * 300 - 150
              const randomY = Math.random() * 300 - 150
              const randomDelay = Math.random() * 0.5
              const randomDuration = 0.5 + Math.random() * 0.5

              return (
                <motion.div
                  key={i}
                  className="absolute w-8 h-8 flex items-center justify-center"
                  style={{
                    left: "50%",
                    top: "50%",
                    x: randomX,
                    y: randomY,
                  }}
                  animate={{
                    x: 0,
                    y: 0,
                    opacity: [1, 0],
                    scale: [1, 0.5],
                  }}
                  transition={{
                    duration: randomDuration,
                    delay: randomDelay,
                    ease: "easeInOut",
                  }}
                >
                  <FontAwesomeIcon
                    icon={icons.coins}
                    className="text-yellow-400 text-2xl"
                    style={{ filter: "drop-shadow(0 0 5px rgba(255, 215, 0, 0.7))" }}
                  />
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}

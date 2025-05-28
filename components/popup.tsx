"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useLeagues } from "@/hooks/useLeagues"
import { X } from "lucide-react"
import { useUser } from "@/contexts/UserContext"

interface PopupProps {
  title: string
  message: string
  image: string
  onClose: () => void
}

export default function Popup({ title, message, image, onClose }: PopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { getLeagueById } = useLeagues()
  const { league } = useUser()
  const currentLeague = getLeagueById(league)
  const { getLeagueColors } = useLeagues()
  const colors = getLeagueColors(6) // Use league 6 colors for the popup

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

    // Auto close after 5 seconds
    const autoCloseTimer = setTimeout(() => {
      handleClose()
    }, 5000)

    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
      clearTimeout(timer)
      clearTimeout(autoCloseTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Delay the actual close to allow animation to complete
    setTimeout(onClose, 300)
  }

  // Handle touch events
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleClose()
  }

  // Get appropriate icon for the popup
  const getPopupIcon = () => {
    if (title.toLowerCase().includes("task started")) return icons.play
    if (title.toLowerCase().includes("completed")) return icons.check
    if (title.toLowerCase().includes("reward") || title.toLowerCase().includes("earning")) return icons.coins
    if (title.toLowerCase().includes("level")) return icons.levelUp
    if (title.toLowerCase().includes("boost")) return icons.rocket
    return icons.bell
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 transition-all duration-300 backdrop-blur-sm"
      style={{ opacity: isVisible ? 1 : 0 }}
      onClick={handleClose}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="rounded-2xl overflow-hidden relative w-[90%] max-w-sm transform transition-transform duration-300 bg-gray-900"
        style={{
          boxShadow: `0 15px 30px -10px rgba(0, 0, 0, 0.6), 0 8px 20px -6px rgba(0, 0, 0, 0.4)`,
          transform: isVisible ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 text-center relative"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 bg-gray-800/40 hover:bg-gray-700/60 rounded-full flex items-center justify-center transition-colors duration-300 text-gray-300 hover:text-white"
          >
            <X size={16} />
          </button>

          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-800">
          <div className="flex items-center mb-4">
            {image === "/coin.png" ? (
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center mr-4">
                <FontAwesomeIcon icon={icons.coins} className="text-white text-xl" />
              </div>
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                }}
              >
                <FontAwesomeIcon icon={getPopupIcon()} className="text-white text-xl" />
              </div>
            )}

            <p className="text-white text-base flex-1">{message}</p>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-3 px-4 text-white font-bold rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 tap-feedback"
            style={{
              background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 4px 12px ${colors.glow}40, 0 2px 6px rgba(0, 0, 0, 0.3)`,
            }}
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  )
}

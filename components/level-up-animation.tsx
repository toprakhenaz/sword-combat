"use client"

import { useState, useEffect } from "react"
import { useLeagues } from "@/hooks/useLeagues"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

interface LevelUpAnimationProps {
  previousLeague: number
  newLeague: number
  onComplete: () => void
}

export default function LevelUpAnimation({ previousLeague, newLeague, onComplete }: LevelUpAnimationProps) {
  const { getLeagueById } = useLeagues()
  const prevLeague = getLeagueById(previousLeague) || {
    name: "Unknown League",
    image: "/placeholder.svg",
    colors: {
      primary: "#808080",
      secondary: "#606060",
      text: "#FFFFFF",
      glow: "#A0A0A0",
    },
  }
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
  const [step, setStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [showCollectButton, setShowCollectButton] = useState(false)
  const [isCollected, setIsCollected] = useState(false)
  const [showCoins, setShowCoins] = useState(false)

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
    setIsCollected(true)
    setShowCoins(true)

    // Wait for coin collection animation
    setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        onComplete()
      }, 500) // Wait for exit animation to complete
    }, 1000)
  }

  useEffect(() => {
    // Animation steps timing
    const timer1 = setTimeout(() => setStep(1), 500)
    const timer2 = setTimeout(() => setStep(2), 1500)
    const timer3 = setTimeout(() => {
      setShowCollectButton(true)
    }, 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="absolute inset-0 backdrop-blur-md transition-all duration-500"
        style={{
          background: `radial-gradient(circle, ${nextLeague.colors.primary}40, ${nextLeague.colors.secondary}80)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <AnimatePresence>
          {step >= 0 && !isExiting && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <h2 className="text-4xl font-bold mb-2" style={{ color: prevLeague.colors.text }}>
                {prevLeague.name} League
              </h2>
              <div className="relative w-32 h-32 mx-auto">
                <Image
                  src={prevLeague.image || "/placeholder.svg"}
                  alt={`League ${previousLeague}`}
                  width={128}
                  height={128}
                  className="object-contain"
                  style={{ filter: `drop-shadow(0 0 10px ${prevLeague.colors.glow})` }}
                  priority
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step >= 1 && !isExiting && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.7, type: "spring" }}
            className="my-4"
          >
            <div className="relative">
              <FontAwesomeIcon
                icon={icons.angleDoubleUp}
                className="text-6xl"
                style={{ color: nextLeague.colors.text }}
              />
              <motion.div
                animate={{ y: [-10, 10], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                className="absolute inset-0"
                style={{ filter: `drop-shadow(0 0 15px ${nextLeague.colors.glow})` }}
              >
                <FontAwesomeIcon
                  icon={icons.angleDoubleUp}
                  className="text-6xl"
                  style={{ color: nextLeague.colors.text }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {step >= 2 && !isExiting && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="mt-8 text-center"
            >
              <h2 className="text-5xl font-bold mb-4" style={{ color: nextLeague.colors.text }}>
                {nextLeague.name} League
              </h2>
              <div className="relative w-48 h-48 mx-auto">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [-2, 2, -2],
                  }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                >
                  <Image
                    src={nextLeague.image || "/placeholder.svg"}
                    alt={`League ${newLeague}`}
                    width={192}
                    height={192}
                    className="object-contain"
                    style={{ filter: `drop-shadow(0 0 20px ${nextLeague.colors.glow})` }}
                    priority
                  />
                </motion.div>

                {/* Particle effects */}
                {[...Array(20)].map((_, i) => {
                  const angle = Math.random() * Math.PI * 2
                  const distance = 30 + Math.random() * 100
                  const size = 2 + Math.random() * 6
                  const delay = Math.random() * 2

                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `calc(50% + ${Math.cos(angle) * distance}px)`,
                        top: `calc(50% + ${Math.sin(angle) * distance}px)`,
                        background: i % 2 === 0 ? nextLeague.colors.primary : nextLeague.colors.secondary,
                        boxShadow: `0 0 10px ${nextLeague.colors.glow}`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 0.8, 0],
                        x: [0, Math.cos(angle) * 50],
                        y: [0, Math.sin(angle) * 50],
                      }}
                      transition={{
                        delay: delay,
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: Math.random() * 3,
                      }}
                    />
                  )
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-xl"
                style={{ color: nextLeague.colors.text }}
              >
                Congratulations! You've reached a new league!
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-2 text-xl flex items-center justify-center"
                style={{ color: nextLeague.colors.text }}
              >
                <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2" />
                <span className="font-bold">+{formatReward(newLeague)}</span>
              </motion.div>

              {/* Collect Button */}
              {showCollectButton && !isCollected && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCollect}
                  className="mt-6 px-8 py-3 rounded-full font-bold text-lg shadow-lg"
                  style={{
                    background: `linear-gradient(to bottom, ${nextLeague.colors.primary}, ${nextLeague.colors.secondary})`,
                    color: nextLeague.colors.text,
                    border: `2px solid ${nextLeague.colors.glow}`,
                    boxShadow: `0 0 15px ${nextLeague.colors.glow}`,
                  }}
                >
                  Collect Reward
                </motion.button>
              )}

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
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

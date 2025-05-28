"use client"

import { useLeagues } from "@/hooks/useLeagues"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { motion } from "framer-motion"
import { useState, useMemo } from "react"

interface DailyComboProps {
  reward: number
  isCheckedIn: boolean
  onCheckIn: () => Promise<void>
  league: number
  streak: number
  streakDay: number
}

export default function DailyCombo({ reward, isCheckedIn, onCheckIn, league, streak, streakDay = 1 }: DailyComboProps) {
  const { getLeagueById, getLeagueColors } = useLeagues()
  const leagueId = league || 1

  // Use getLeagueColors directly instead of accessing leagueObj.colors
  const colors = useMemo(() => {
    return getLeagueColors(leagueId)
  }, [getLeagueColors, leagueId])

  const leagueObj = useMemo(() => {
    return getLeagueById(leagueId)
  }, [getLeagueById, leagueId])

  const [isClaimLoading, setIsClaimLoading] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  if (!leagueObj) return null

  // Calculate streak progress (1-7 pattern)
  const streakProgress = (streakDay / 7) * 100

  // Handle claim button click with loading state
  const handleClaimClick = async () => {
    if (isCheckedIn || isClaimLoading) return

    setIsClaimLoading(true)
    try {
      await onCheckIn()
      setShowAnimation(true)
      setTimeout(() => setShowAnimation(false), 2000)
    } finally {
      setIsClaimLoading(false)
    }
  }

  // Rewards for each day of the week
  const weeklyRewards = [
    { day: 1, amount: 100 },
    { day: 2, amount: 200 },
    { day: 3, amount: 300 },
    { day: 4, amount: 400 },
    { day: 5, amount: 500 },
    { day: 6, amount: 600 },
    { day: 7, amount: 2000 },
  ]

  return (
    <motion.div
      className="mb-4 rounded-xl overflow-hidden relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
        boxShadow: `0 4px 12px ${colors.glow}40`,
      }}
    >
      {showAnimation && (
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-yellow-300 font-bold text-4xl flex items-center"
            initial={{ scale: 0.5, y: 0 }}
            animate={{ scale: 1.2, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <FontAwesomeIcon icon={icons.coins} className="mr-2" />+{reward}
          </motion.div>
        </motion.div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{leagueObj.name}</h2>
            <p className="text-sm text-white/80">Streak: {streak} gün</p>
          </div>
          <button
            onClick={handleClaimClick}
            disabled={isCheckedIn || isClaimLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
              isCheckedIn
                ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                : isClaimLoading
                  ? "bg-yellow-300/80 text-yellow-900"
                  : "bg-yellow-300 text-yellow-900 hover:bg-yellow-400"
            }`}
          >
            {isClaimLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin mr-1"></div>
                <span>Claiming...</span>
              </div>
            ) : (
              <>
                <FontAwesomeIcon icon={icons.gift} className="mr-2" />
                {isCheckedIn ? "Alındı" : "Ödülü Al"}
              </>
            )}
          </button>
        </div>

        {/* Weekly rewards display */}
        <div className="mt-2 grid grid-cols-7 gap-1">
          {weeklyRewards.map((day, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-1 rounded text-xs ${
                streakDay === day.day
                  ? "bg-white/20 font-bold"
                  : streakDay > day.day || (streakDay === 7 && day.day < 7)
                    ? "opacity-75"
                    : "opacity-50"
              }`}
            >
              <span className="text-white">{day.day}</span>
              <div className="flex items-center text-yellow-300">
                <FontAwesomeIcon icon={icons.coins} className="text-[8px] mr-0.5" />
                <span>{day.day === 7 ? "2K" : day.amount}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-3 relative h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="absolute h-full left-0 top-0 rounded-full bg-blue-500"
            style={{ width: `${streakProgress}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine"></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

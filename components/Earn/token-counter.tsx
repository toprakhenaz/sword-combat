"use client"

import { useLeagueData } from "@/data/GeneralData"
import { motion } from "framer-motion"

interface TokenCounterProps {
  totalTokens: number
  league: number
}

export default function TokenCounter({ totalTokens, league }: TokenCounterProps) {
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(league)

  // Countdown timer values (static for now)
  const countdown = {
    days: 90,
    hours: 12,
    minutes: 45,
    seconds: 30,
  }

  return (
    <motion.div
      className="mb-4 rounded-xl overflow-hidden border border-gray-700/50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}60)`,
      }}
    >
      <div className="p-4 relative">
        {/* Background pattern with swords */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/patterns/sword-pattern.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "overlay",
          }}
        ></div>

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 4px 10px ${colors.glow}50`,
              }}
            >
              <img src="/coin.png" alt="Token" className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Token Balance</h2>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown timer - Always visible */}
        <div className="mt-4">
          <div className="text-gray-200 text-sm mb-2 text-center">Token Listing Countdown</div>
          <div className="flex justify-center space-x-3">
            <div className="flex flex-col items-center">
              <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                {countdown.days}
              </div>
              <div className="text-xs text-gray-300 mt-1">Days</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                {countdown.hours}
              </div>
              <div className="text-xs text-gray-300 mt-1">Hours</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                {countdown.minutes}
              </div>
              <div className="text-xs text-gray-300 mt-1">Mins</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                {countdown.seconds}
              </div>
              <div className="text-xs text-gray-300 mt-1">Secs</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-3">
          <div className="text-sm text-gray-300">Exchange Listing</div>
          <div className="text-white font-medium">Binance, KuCoin, Gate.io</div>
        </div>
      </div>
    </motion.div>
  )
}

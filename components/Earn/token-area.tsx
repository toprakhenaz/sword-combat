"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface TokenAreaProps {
  onBuy: () => void
  onSell: () => void
  onStake: () => void
}

export default function TokenArea({ onBuy, onSell, onStake }: TokenAreaProps) {
  const [activeTab, setActiveTab] = useState("buy")

  return (
    <div className="bg-gray-800/70 rounded-xl overflow-hidden border border-gray-700/50 mb-6">
      <div className="flex border-b border-gray-700/50">
        {["buy", "sell", "stake"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 text-center text-sm font-medium capitalize ${
              activeTab === tab ? "text-white bg-gray-700/50" : "text-gray-400"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "buy" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-1">Amount (USDT)</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">USDT</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">You will receive</span>
                <span className="text-gray-400">Balance: 0 SWC</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                  readOnly
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">SWC</div>
              </div>
            </div>

            <button
              onClick={onBuy}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium"
            >
              Buy Tokens
            </button>
          </motion.div>
        )}

        {activeTab === "sell" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-1">Amount (SWC)</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">SWC</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">You will receive</span>
                <span className="text-gray-400">Balance: 0 USDT</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                  readOnly
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">USDT</div>
              </div>
            </div>

            <button
              onClick={onSell}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-medium"
            >
              Sell Tokens
            </button>
          </motion.div>
        )}

        {activeTab === "stake" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-1">Stake Amount (SWC)</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">SWC</div>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300 text-sm">APY</span>
                <span className="text-green-400 font-medium">12.5%</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300 text-sm">Lock Period</span>
                <span className="text-white">30 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">Early Unstake Fee</span>
                <span className="text-white">5%</span>
              </div>
            </div>

            <button
              onClick={onStake}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium"
            >
              Stake Tokens
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

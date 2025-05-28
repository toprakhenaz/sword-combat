"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useCards } from "@/hooks/useCards"
import { useLeagues } from "@/hooks/useLeagues"
import { useUser } from "@/contexts/UserContext"

export default function TimeBar() {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean[]>([false, false, false])
  const [cardStatus, setCardStatus] = useState<string[]>(["", "", ""])
  const { getLeagueColors } = useLeagues()
  const { dailyCombo, findComboCard, league } = useUser()
  const { getCardImage } = useCards()
  const colors = getLeagueColors(league) // Use the user's league colors

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
      const timeRemaining = Math.floor((endOfDay.getTime() - now.getTime()) / 1000)
      setTimeLeft(timeRemaining)
    }

    calculateTimeLeft()

    const intervalId = setInterval(() => {
      calculateTimeLeft()
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  // Update flip state and card status when found cards change
  useEffect(() => {
    setIsFlipped(dailyCombo.cardIds.map((cardId) => dailyCombo.foundCardIds.includes(cardId)))
    setCardStatus(dailyCombo.cardIds.map((cardId) => (dailyCombo.foundCardIds.includes(cardId) ? "Found" : "")))
  }, [dailyCombo.foundCardIds, dailyCombo.cardIds])

  // Card flip animation - removed automatic reveal, now requires the user to find the card
  const toggleCardFlip = async (index: number) => {
    if (dailyCombo.foundCardIds.includes(dailyCombo.cardIds[index])) {
      // If card is already found, just toggle flip animation
      const newIsFlipped = [...isFlipped]
      newIsFlipped[index] = !newIsFlipped[index]
      setIsFlipped(newIsFlipped)
    } else {
      // Card not found yet - show mystery state
      const newStatus = [...cardStatus]
      newStatus[index] = "Find this card in Mine!"
      setCardStatus(newStatus)

      // Clear status after 2 seconds
      setTimeout(() => {
        const resetStatus = [...cardStatus]
        resetStatus[index] = ""
        setCardStatus(resetStatus)
      }, 2000)
    }
  }

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <>
      <div
        className="rounded-lg p-4 flex items-center justify-between shadow-md mb-5"
        style={{
          background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
          border: `1px solid ${colors.secondary}`,
        }}
      >
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{
              background: `linear-gradient(to bottom, #ffd700, #b8860b)`,
              boxShadow: `0 0 5px rgba(255, 215, 0, 0.5)`,
            }}
          >
            <FontAwesomeIcon icon={icons.clock} className="text-lg text-white" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-semibold text-white">Daily Combo</div>
            <div className="text-xs sm:text-sm font-mono text-yellow-200">{formatTime(timeLeft)}</div>
          </div>
        </div>
        <div className="flex items-center bg-black/20 px-3 py-1 rounded-full">
          <FontAwesomeIcon icon={icons.coins} className="text-yellow-300 mr-2" />
          <span className="text-base sm:text-lg font-bold text-white">{dailyCombo.reward.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {dailyCombo.cardIds.map((cardId, index) => (
          <div key={cardId} className="relative" onClick={() => toggleCardFlip(index)}>
            {/* Card container with fixed aspect ratio */}
            <div className="aspect-square relative cursor-pointer">
              <div
                className={`absolute inset-0 rounded-lg transition-transform duration-500 ${
                  isFlipped[index] && dailyCombo.foundCardIds.includes(cardId) ? "rotate-y-180" : ""
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped[index] && dailyCombo.foundCardIds.includes(cardId) ? "rotateY(180deg)" : "",
                }}
              >
                {/* Card front - Always show mystery state */}
                <div
                  className="absolute inset-0 rounded-lg border flex items-center justify-center"
                  style={{
                    backfaceVisibility: "hidden",
                    background: dailyCombo.foundCardIds.includes(cardId)
                      ? `linear-gradient(to bottom, ${colors.primary}, ${colors.secondary})`
                      : `linear-gradient(to bottom, #ffd700, #b8860b)`,
                    borderColor: dailyCombo.foundCardIds.includes(cardId) ? colors.secondary : "#b8860b",
                  }}
                >
                  <FontAwesomeIcon
                    icon={icons.question}
                    className={`text-4xl text-white ${!dailyCombo.foundCardIds.includes(cardId) ? "animate-pulse" : ""}`}
                    style={{ animationDuration: "2s" }}
                  />
                </div>

                {/* Card back - Only show if found */}
                {dailyCombo.foundCardIds.includes(cardId) && (
                  <div
                    className="absolute inset-0 rounded-lg border overflow-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      borderColor: colors.secondary,
                    }}
                  >
                    <img
                      src={getCardImage(cardId) || "/placeholder-j0tzm.png"}
                      alt={`Card ${cardId}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Status indicator */}
            {cardStatus[index] && (
              <div className="absolute bottom-0 left-0 right-0 text-center py-1 text-xs font-medium rounded-b-lg bg-black/70 text-white">
                {cardStatus[index]}
              </div>
            )}

            {/* Completion badge */}
            {dailyCombo.foundCardIds.includes(cardId) && (
              <div
                className="absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 z-10"
                style={{
                  background: `linear-gradient(to bottom, #22c55e, #16a34a)`,
                  boxShadow: `0 0 5px rgba(34, 197, 94, 0.5)`,
                }}
              >
                <FontAwesomeIcon icon={icons.check} className="text-xs text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

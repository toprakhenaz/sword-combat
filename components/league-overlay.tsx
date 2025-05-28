"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import Image from "next/image"
import { useLeagues } from "@/hooks/useLeagues"
import { useUser } from "@/contexts/UserContext"
import { supabase } from "@/lib/supabase"
import { formatNumber } from "@/lib/utils"

interface LeaderboardUser {
  id: string
  username: string
  coins: number
  league: number
  hourly_earn: number
}

interface LeagueOverlayProps {
  onClose: () => void
  coins: number
}

// Kompakt skeleton loader
const LeaderboardSkeleton = () => (
  <div className="space-y-2">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/40 animate-pulse">
        <div className="h-8 w-8 bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-1">
          <div className="h-3 bg-gray-700 rounded w-20" />
          <div className="h-2 bg-gray-700 rounded w-12" />
        </div>
        <div className="h-3 bg-gray-700 rounded w-16" />
      </div>
    ))}
  </div>
)

export default function LeagueOverlay({ onClose, coins }: LeagueOverlayProps) {
  const { league: userLeague, userId } = useUser()
  const [currentLeague, setCurrentLeague] = useState<number>(userLeague || 1)
  const [leaderboardCache, setLeaderboardCache] = useState<Record<number, LeaderboardUser[]>>({})
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const totalLeagues = 7
  const leaderboardRef = useRef<HTMLDivElement>(null)
  const { getLeagueById } = useLeagues()
  const [userRank, setUserRank] = useState<number | null>(null)

  const leagueObj = getLeagueById(currentLeague)
  if (!leagueObj) return null

  const colors = leagueObj.colors
  const totalNeeded = leagueObj.coin_requirement
  const progress = Math.min((coins / totalNeeded) * 100, 100)

  useEffect(() => {
    if (currentLeague !== userLeague || !leaderboard.length) {
      setUserRank(null)
      return
    }
    setUserRank(leaderboard.findIndex((user) => user.id === userId) + 1)
  }, [currentLeague, userLeague, leaderboard, userId])

  // Memoized calculations
  const progressText = useMemo(() => {
    if (totalNeeded > coins) {
      return `${formatNumber(totalNeeded - coins)} more needed`
    }
    return "Ready to advance!"
  }, [totalNeeded, coins])

  // Mask username
  const maskUsername = useCallback((username: string) => {
    if (username.length <= 2) return username[0] + "*"
    return username[0] + "*".repeat(username.length - 2) + username[username.length - 1]
  }, [])

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(
    async (league: number) => {
      if (leaderboardCache[league]) {
        setLeaderboard(leaderboardCache[league])
        setLoadingLeaderboard(false)
        setError(null)
        return
      }

      setLoadingLeaderboard(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from("users")
          .select("id, username, coins, league, hourly_earn")
          .eq("league", league)
          .order("hourly_earn", { ascending: false })
          .limit(8) // Reduced from 10

        if (fetchError) throw fetchError

        setLeaderboardCache((prev) => ({ ...prev, [league]: data || [] }))
        setLeaderboard(data || [])
      } catch (err) {
        setError("Failed to load leaderboard")
        console.error("Leaderboard fetch error:", err)
      } finally {
        setLoadingLeaderboard(false)
      }
    },
    [leaderboardCache],
  )

  useEffect(() => {
    fetchLeaderboard(currentLeague)
  }, [currentLeague, fetchLeaderboard])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          e.preventDefault()
          handlePrevLeague()
          break
        case "ArrowRight":
          e.preventDefault()
          handleNextLeague()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleNextLeague = useCallback(() => {
    setCurrentLeague((prevLeague) => (prevLeague < totalLeagues ? prevLeague + 1 : 1))
  }, [totalLeagues])

  const handlePrevLeague = useCallback(() => {
    setCurrentLeague((prevLeague) => (prevLeague > 1 ? prevLeague - 1 : totalLeagues))
  }, [totalLeagues])

  const handleSliderScroll = useCallback((direction: "up" | "down") => {
    const slider = leaderboardRef.current
    if (slider) {
      const scrollAmount = direction === "up" ? -80 : 80
      slider.scrollBy({ top: scrollAmount, behavior: "smooth" })
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Kompakt modal container */}
      <div
        className="relative w-full max-w-sm bg-gray-900/95 rounded-2xl border border-gray-700/50 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/90 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={icons.times} size="sm" />
        </button>

        <div className="p-5">
          {/* Kompakt header */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-white mb-1">League Rankings</h1>
            <p className="text-gray-400 text-xs">Climb the ranks for rewards</p>
          </div>

          {/* Kompakt league navigation */}
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={handlePrevLeague}
              className="h-8 w-8 rounded-full bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center mr-4"
              aria-label="Previous league"
            >
              <FontAwesomeIcon icon={icons.chevronLeft} size="sm" />
            </button>

            <div className="flex flex-col items-center">
              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-full shadow-lg mb-3"
                style={{
                  background: `linear-gradient(135deg, ${colors.secondary}40, ${colors.primary}60)`,
                  border: `2px solid ${colors.secondary}50`,
                  boxShadow: `0 0 20px ${colors.glow}30`,
                }}
              >
                <Image
                  src={leagueObj.image || "/leagues/wooden-sword.png"}
                  alt={`${leagueObj.name} League`}
                  width={70}
                  height={70}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                  {leagueObj.name}
                </h2>
                <div className="text-gray-400 text-sm">
                  {currentLeague}/{totalLeagues}
                </div>
              </div>
            </div>

            <button
              onClick={handleNextLeague}
              className="h-8 w-8 rounded-full bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center ml-4"
              aria-label="Next league"
            >
              <FontAwesomeIcon icon={icons.chevronRight} size="sm" />
            </button>
          </div>

          {/* Kompakt progress section */}
          <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm font-medium">Progress</span>
              <div className="flex items-center text-sm font-bold">
                <FontAwesomeIcon icon={icons.coins} className="mr-1 text-yellow-400 text-xs" />
                <span className="text-yellow-300">{formatNumber(coins)}</span>
                <span className="mx-1 text-gray-500">/</span>
                <span className="text-white">{formatNumber(totalNeeded)}</span>
              </div>
            </div>

            {/* Kompakt progress bar */}
            <div className="relative h-6 w-full overflow-hidden rounded-full bg-gray-700 mb-2">
              <div
                className="absolute top-0 left-0 h-full transition-all duration-500 ease-out flex items-center justify-center rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`,
                }}
              >
                {progress > 15 && <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>}
              </div>
              {progress <= 15 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
                </div>
              )}
            </div>

            <div className="text-center">
              <span className={`text-xs font-medium ${totalNeeded > coins ? "text-gray-400" : "text-green-400"}`}>
                {progressText}
              </span>
            </div>

            {userRank && (
              <div className="text-center text-xs mt-2 p-1 bg-blue-500/20 rounded border border-blue-500/30">
                <span className="text-blue-300">Your rank: #{userRank}</span>
              </div>
            )}
          </div>

          {/* Kompakt leaderboard */}
          <div className="bg-gray-800/30 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">
                Top Players
                {leaderboard.length > 0 && (
                  <span className="text-xs font-normal text-gray-400 ml-1">({leaderboard.length})</span>
                )}
              </h3>
              <div className="flex">
                <button
                  onClick={() => handleSliderScroll("up")}
                  className="h-6 w-6 rounded-l bg-gray-700/80 text-gray-400 hover:bg-gray-600 hover:text-white transition-colors flex items-center justify-center"
                  aria-label="Scroll up"
                >
                  <FontAwesomeIcon icon={icons.chevronUp} size="xs" />
                </button>
                <button
                  onClick={() => handleSliderScroll("down")}
                  className="h-6 w-6 rounded-r bg-gray-700/80 text-gray-400 hover:bg-gray-600 hover:text-white transition-colors flex items-center justify-center"
                  aria-label="Scroll down"
                >
                  <FontAwesomeIcon icon={icons.chevronDown} size="xs" />
                </button>
              </div>
            </div>

            <div className="relative h-48 overflow-hidden">
              <div ref={leaderboardRef} className="overflow-y-auto h-full scrollbar-hide">
                {loadingLeaderboard ? (
                  <LeaderboardSkeleton />
                ) : error ? (
                  <div className="text-center py-4">
                    <div className="text-red-400 text-sm mb-2">⚠️ {error}</div>
                    <button
                      onClick={() => fetchLeaderboard(currentLeague)}
                      className="text-blue-400 hover:text-blue-300 text-xs underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <FontAwesomeIcon icon={icons.userGroup} className="text-xl mb-2 opacity-50" />
                    <div className="text-sm">No players yet</div>
                  </div>
                ) : (
                  leaderboard.map((user, index) => {
                    const isCurrentUser = user.id === userId
                    const displayName = isCurrentUser ? user.username : maskUsername(user.username || "?")
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-2 mb-2 p-2 rounded-lg transition-colors ${
                          isCurrentUser
                            ? "bg-pink-600/20 border border-pink-500/30"
                            : "bg-gray-800/40 hover:bg-gray-700/50"
                        }`}
                      >
                        {/* Kompakt rank */}
                        <div className="mr-1">
                          {index < 3 ? (
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                              style={{
                                background:
                                  index === 0
                                    ? "linear-gradient(135deg, #FFD700, #FFA500)"
                                    : index === 1
                                      ? "linear-gradient(135deg, #C0C0C0, #A9A9A9)"
                                      : "linear-gradient(135deg, #CD7F32, #8B4513)",
                              }}
                            >
                              <FontAwesomeIcon icon={icons.star} className="text-white" size="xs" />
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700/80 text-xs font-bold text-gray-300">
                              {index + 1}
                            </div>
                          )}
                        </div>

                        {/* Kompakt user info */}
                        <div className="flex flex-1 items-center gap-2">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                            style={{
                              background: `linear-gradient(135deg, ${colors.secondary}30, ${colors.primary}50)`,
                              color: colors.text,
                            }}
                          >
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-semibold truncate ${
                                isCurrentUser ? "text-pink-300" : "text-white"
                              }`}
                            >
                              {displayName}
                              {isCurrentUser && <span className="ml-1 text-xs text-pink-400 font-normal">(You)</span>}
                            </div>
                            <div className="text-xs text-gray-500">#{index + 1}</div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm font-bold text-yellow-400">
                              {formatNumber(user.hourly_earn)}
                              <FontAwesomeIcon icon={icons.coins} className="ml-1 text-xs" />
                            </div>
                            <div className="text-xs text-gray-500">per hour</div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

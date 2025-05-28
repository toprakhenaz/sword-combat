"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import Navbar from "@/components/navbar"
import HeaderCard from "@/components/header-card"
import Popup from "@/components/popup"
import EarnPageSkeletonLoading from "@/components/skeleton-earn"
import { useLeagues } from "@/hooks/useLeagues"
import TaskCard from "@/components/Earn/task-card"
import { supabase } from "@/lib/supabase"
import {
  getTokenListingDate,
  getUserDailyStreak,
  claimDailyReward,
  startTask,
  completeTask,
  getTasksWithUrls,
} from "@/lib/db-actions"
import DailyCombo from "@/components/Earn/daily-combo"
import { setupDailyRewardsTable } from "@/lib/setup-daily-rewards"

interface Task {
  id: number
  title: string
  description: string
  reward: number
  isCompleted: boolean
  platform: string
  url?: string
  progress?: number
  category?: string
}

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface TokenListingDate {
  date: string
}

interface DailyStreakInfo {
  streak: number
  canCheckIn: boolean
  lastCheckIn: Date | null
  reward: number
}

export default function EarnPage() {
  const { userId, coins, league, isLoading: userLoading, updateCoins } = useUser()
  const { getLeagueById, getLeagueColors, loading } = useLeagues()
  const leagueId = league || 1

  // Tüm state tanımlamalarını component seviyesine taşıyoruz
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDailyCheckedIn, setIsDailyCheckedIn] = useState(false)
  const [dailyStreak, setDailyStreak] = useState(0)
  const [dailyReward, setDailyReward] = useState(500)
  const [streakDay, setStreakDay] = useState(1)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({
    title: "",
    message: "",
    image: "",
  })
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isLoadingCountdown, setIsLoadingCountdown] = useState(true)
  const [dailyStreakInfo, setDailyStreakInfo] = useState<DailyStreakInfo | null>(null)
  const [leagueObj, setLeagueObj] = useState(getLeagueById(leagueId))
  const [leagueColors, setLeagueColors] = useState(getLeagueColors(leagueId))

  useEffect(() => {
    setLeagueObj(getLeagueById(leagueId))
    setLeagueColors(getLeagueColors(leagueId))
  }, [leagueId, getLeagueById, getLeagueColors])

  // Daily streak effect
  useEffect(() => {
    const loadDailyStreakInfo = async () => {
      if (!userId) return
      try {
        const streakInfo = (await getUserDailyStreak(userId)) as DailyStreakInfo
        setDailyStreakInfo(streakInfo)
        setDailyStreak(streakInfo.streak)
        setIsDailyCheckedIn(!streakInfo.canCheckIn)
        setDailyReward(streakInfo.reward)
        setStreakDay((streakInfo.streak % 7) + 1)
      } catch (error) {
        setDailyStreakInfo(null)
        setDailyStreak(0)
        setIsDailyCheckedIn(false)
        setDailyReward(100)
        setStreakDay(1)
      }
    }

    if (userId && !userLoading) {
      loadDailyStreakInfo()
    }
  }, [userId, userLoading])

  // Token listing date effect
  useEffect(() => {
    const fetchTokenListingDate = async () => {
      try {
        setIsLoadingCountdown(true)
        const { date } = (await getTokenListingDate()) as TokenListingDate
        const targetDate = new Date(date)

        const updateCountdown = () => {
          const now = new Date()
          const difference = targetDate.getTime() - now.getTime()

          if (difference <= 0) {
            setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            return
          }

          const days = Math.floor(difference / (1000 * 60 * 60 * 24))
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)

          setCountdown({ days, hours, minutes, seconds })
        }

        updateCountdown()
        setIsLoadingCountdown(false)

        const interval = setInterval(updateCountdown, 1000)
        return () => clearInterval(interval)
      } catch (error) {
        console.error("Error fetching token listing date:", error)
        setIsLoadingCountdown(false)

        const defaultDate = new Date()
        defaultDate.setMonth(defaultDate.getMonth() + 3)

        const updateCountdown = () => {
          const now = new Date()
          const difference = defaultDate.getTime() - now.getTime()

          if (difference <= 0) {
            setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            return
          }

          const days = Math.floor(difference / (1000 * 60 * 60 * 24))
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)

          setCountdown({ days, hours, minutes, seconds })
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)
        return () => clearInterval(interval)
      }
    }

    fetchTokenListingDate()
  }, []) // Bu effect sadece component mount olduğunda çalışmalı

  // League objesi null ise erken return
  if (!leagueObj) return null

  // Tasks loading effect
  useEffect(() => {
    const loadTasks = async () => {
      if (!userId) return
      try {
        const tasksData = await getTasksWithUrls()
        const { data: userTasks } = await supabase.from("user_tasks").select("*").eq("user_id", userId)

        const completedTaskIds = userTasks ? userTasks.filter((t) => t.is_completed).map((t) => t.task_id) : []
        const mergedTasks: Task[] = tasksData.map((task) => ({
          id: Number(task.id),
          title: String(task.title),
          description: String(task.description),
          reward: Number(task.reward),
          isCompleted: completedTaskIds.includes(Number(task.id)),
          platform: String(task.platform),
          url: task.link ? String(task.link) : undefined,
          progress: task.progress ? Number(task.progress) : 0,
          category: task.category ? String(task.category) : undefined,
        }))
        setTasks(mergedTasks)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading tasks:", error)
        setIsLoading(false)
      }
    }

    if (userId && !userLoading) {
      loadTasks()
    }
  }, [userId, userLoading])

  // Daily rewards setup effect
  useEffect(() => {
    const setupRewards = async () => {
      if (userId) {
        try {
          await setupDailyRewardsTable()
        } catch (error) {
          console.error("Error setting up daily rewards:", error)
        }
      }
    }

    setupRewards()
  }, [userId])

  const handleStartTask = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !userId) return
    try {
      const result = await startTask(userId, taskId, task.url)
      if (result.success) {
        // Progress güncelle
        const updatedTasks = tasks.map((t) => {
          if (t.id === taskId) {
            return { ...t, progress: result.progress || 50 }
          }
          return t
        })
        setTasks(updatedTasks)
        // Linki yeni sekmede aç
        if (task.url) {
          window.open(task.url, "_blank")
        }
        setPopupData({
          title: "Görev Başlatıldı",
          message: `"${task.title}" görevine başladın. Görevi tamamlayınca ödülünü alabilirsin!`,
          image: "/coin.png",
        })
        setShowPopup(true)
      }
    } catch (error) {
      console.error("Error starting task:", error)
    }
  }

  // Görev tamamlama fonksiyonu
  const handleCompleteTask = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.isCompleted || !userId) return
    try {
      const result = await completeTask(userId, taskId)
      if (result.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, isCompleted: true } : t)))
        await updateCoins(result.reward || task.reward, "task_reward", `Completed task ${taskId}`)
        setPopupData({
          title: "Görev Tamamlandı!",
          message: `${result.reward || task.reward} token kazandın!`,
          image: "/coin.png",
        })
        setShowPopup(true)
      } else {
        setPopupData({
          title: "Claim Hatası",
          message: result.message || "Görev claim edilirken hata oluştu.",
          image: "/coin.png",
        })
        setShowPopup(true)
      }
    } catch (error) {
      setPopupData({
        title: "Claim Hatası",
        message: "Görev claim edilirken beklenmeyen bir hata oluştu.",
        image: "/coin.png",
      })
      setShowPopup(true)
    }
  }

  // handleTaskAction fonksiyonunu ikiye ayır
  const handleTaskAction = (taskId: number, action: "start" | "complete") => {
    if (action === "start") handleStartTask(taskId)
    else handleCompleteTask(taskId)
  }

  const handleDailyCheckIn = async () => {
    if (isDailyCheckedIn || !userId) return

    try {
      const result = await claimDailyReward(userId)

      if (result.success) {
        // Update local state
        setIsDailyCheckedIn(true)
        setDailyStreak(result.streak || 0)
        setStreakDay(result.streakDay || 1)

        // Update coins
        await updateCoins(Number(result.reward) || 0, "daily_reward", "Daily check-in reward")

        // Show success popup
        setPopupData({
          title: "Daily Check-in Complete!",
          message: `You earned ${result.reward} tokens! Your streak is now ${result.streak} days.`,
          image: "/coin.png",
        })
        setShowPopup(true)
      } else {
        // Show error popup
        setPopupData({
          title: "Check-in Failed",
          message: result.message || "Failed to claim daily reward.",
          image: "/coin.png",
        })
        setShowPopup(true)
      }
    } catch (error) {
      console.error("Error claiming daily reward:", error)
      setPopupData({
        title: "Check-in Failed",
        message: "An error occurred while claiming your reward.",
        image: "/coin.png",
      })
      setShowPopup(true)
    }
  }

  // Daily görevleri ayrı göster
  const dailyTasks = tasks.filter((task) => task.category?.toLowerCase() === "daily")
  const otherTasks = tasks.filter((task) => task.category?.toLowerCase() !== "daily")

  const filteredTasks = tasks

  if (isLoading || userLoading) {
    return <EarnPageSkeletonLoading />
  }

  return (
    <main className="min-h-screen bg-[#0d1220] text-white pb-24">
      <HeaderCard coins={coins} league={league} />

      {/* Main content container with consistent styling */}
      <div className="px-4">
        {/* Token Listing Countdown - Only keeping this part */}
        <div
          className="mb-4 rounded-xl overflow-hidden border border-gray-700/50"
          style={{
            background: `linear-gradient(135deg, ${leagueColors.primary}40, ${leagueColors.secondary}60)`,
          }}
        >
          <div className="p-4 relative">
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/patterns/sword-pattern.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                mixBlendMode: "overlay",
              }}
            ></div>

            {/* Token Listing Countdown - Only keeping this part */}
            <div>
              <div className="text-gray-200 text-sm mb-2 text-center">Token Listing Countdown</div>
              <div className="flex justify-center space-x-3">
                {isLoadingCountdown ? (
                  // Loading skeleton
                  <>
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-md bg-gray-700/70 animate-pulse"></div>
                        </div>
                        <div className="text-xs text-gray-300 mt-1 w-8 h-3 bg-gray-700/70 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </>
                ) : (
                  // Actual countdown
                  <>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                        {countdown.days.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Days</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                        {countdown.hours.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Hours</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                        {countdown.minutes.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Mins</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                        {countdown.seconds.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Secs</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <DailyCombo
          reward={dailyReward}
          isCheckedIn={isDailyCheckedIn}
          onCheckIn={handleDailyCheckIn}
          league={league}
          streak={dailyStreak}
          streakDay={streakDay}
        />

        <div className="mb-6">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Other Tasks</h2>
            <span className="text-sm text-gray-400">{otherTasks.length} tasks</span>
          </div>
          {otherTasks.length > 0 ? (
            <div
              className="overflow-y-auto scrollbar-hide rounded-lg"
              style={{
                maxHeight: "350px",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="space-y-3 pr-1">
                {otherTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    reward={task.reward}
                    platform={task.platform}
                    isCompleted={task.isCompleted}
                    progress={task.progress || 0}
                    onStart={() => handleTaskAction(task.id, "start")}
                    onComplete={() => handleTaskAction(task.id, "complete")}
                    disabled={task.isCompleted}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/70 rounded-xl p-6 text-center">
              <p className="text-gray-400">No tasks available in this category</p>
            </div>
          )}
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          image={popupData.image}
          onClose={() => setShowPopup(false)}
        />
      )}

      <Navbar />
    </main>
  )
}

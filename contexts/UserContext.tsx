"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import {
  upgradeBoost,
  useRocketBoost,
  useFullEnergyBoost,
  getUserDailyCombo,
  findDailyComboCard,
  updateUserCoins,
  updateUserEnergy,
} from "@/lib/db-actions"
import { usePathname } from "next/navigation"

// Telegram WebApp integration
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code: string
          }
        }
      }
    }
  }
}

// For demo purposes, we'll use a hardcoded user ID
// In a real Telegram app, you would get this from the Telegram WebApp
const DEMO_TELEGRAM_ID = "123456789"
const DEMO_USERNAME = "demo_user"

type UserContextType = {
  userId: string | null
  telegramId: string | null
  username: string | null
  coins: number
  energy: number
  maxEnergy: number
  earnPerTap: number
  hourlyEarn: number
  league: number
  isLoading: boolean
  isLevelingUp: boolean
  previousLeague: number | null
  dailyCombo: {
    cardIds: number[]
    foundCardIds: number[]
    reward: number
    isCompleted: boolean
  }
  boosts: {
    multiTouch: { level: number; cost: number }
    energyLimit: { level: number; cost: number }
    chargeSpeed: { level: number; cost: number }
    dailyRockets: number
    maxDailyRockets: number
    energyFullUsed: boolean
  }
  updateCoins: (amount: number, transactionType: string, description?: string) => Promise<boolean>
  updateEnergy: (amount: number) => Promise<void>
  refreshUserData: () => Promise<void>
  setLeague: (league: number) => void
  handleTap: () => Promise<void>
  collectHourlyEarnings: () => Promise<{ success: boolean; coins?: number; message?: string }>
  upgradeBoost: (boostType: string) => Promise<{ success: boolean; message?: string; statChange?: number }>
  useRocketBoost: () => Promise<{ success: boolean; message?: string }>
  useFullEnergyBoost: () => Promise<{ success: boolean; message?: string }>
  findComboCard: (cardIndex: number) => Promise<{
    success: boolean
    cardId?: number
    isCompleted?: boolean
    reward?: number
    message?: string
  }>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [telegramId, setTelegramId] = useState<string | null>(DEMO_TELEGRAM_ID)
  const [username, setUsername] = useState<string | null>(DEMO_USERNAME)
  const [coins, setCoins] = useState(0)
  const [energy, setEnergy] = useState(0)
  const [maxEnergy, setMaxEnergy] = useState(100)
  const [earnPerTap, setEarnPerTap] = useState(1)
  const [hourlyEarn, setHourlyEarn] = useState(0)
  const [league, setLeagueState] = useState(1)
  const [previousLeague, setPreviousLeague] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLevelingUp, setIsLevelingUp] = useState(false)
  const [lastEnergyUpdate, setLastEnergyUpdate] = useState<Date>(new Date())
  const [comboCounter, setComboCounter] = useState(0)
  const [tapMultiplier, setTapMultiplier] = useState(1)
  const [dailyCombo, setDailyCombo] = useState({
    cardIds: [1, 2, 3],
    foundCardIds: [],
    reward: 100000,
    isCompleted: false,
  })
  const [boosts, setBoosts] = useState({
    multiTouch: { level: 0, cost: 2000 },
    energyLimit: { level: 0, cost: 2000 },
    chargeSpeed: { level: 0, cost: 2000 },
    dailyRockets: 3,
    maxDailyRockets: 3,
    energyFullUsed: false,
  })
  const [isBanned, setIsBanned] = useState(false)

  // Debounce and rate limiting
  const energyUpdateQueue = useRef<number>(0)
  const isUpdatingEnergy = useRef<boolean>(false)
  const energyUpdateTimer = useRef<NodeJS.Timeout | null>(null)

  // Coin update queue and debouncing
  const coinUpdateQueue = useRef<{ amount: number; transactionType: string; description?: string }[]>([])
  const isUpdatingCoins = useRef<boolean>(false)
  const coinUpdateTimer = useRef<NodeJS.Timeout | null>(null)
  const lastSavedCoins = useRef<number>(0)

  const lastTapTime = useRef<number>(0)
  const tapCooldown = 50 // ms between taps (reduced from 300ms for better responsiveness)

  const pathname = usePathname()

  // Helper to calculate league rewards
  const calculateLeagueReward = (league: number): number => {
    switch (league) {
      case 2:
        return 50000
      case 3:
        return 500000
      case 4:
        return 5000000
      case 5:
        return 50000000
      case 6:
        return 500000000
      case 7:
        return 5000000000
      default:
        return 0
    }
  }

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    try {
      if (!userId) return

      const { data: userData } = await supabase.from("users").select("*").eq("id", userId).single()

      if (userData) {
        const userCoins = Number(userData.coins) || 0
        setCoins(userCoins)
        lastSavedCoins.current = userCoins
        setEnergy(userData.energy)
        setMaxEnergy(userData.max_energy)
        setEarnPerTap(userData.earn_per_tap)
        setHourlyEarn(userData.hourly_earn)
        setLeagueState(userData.league)
        setLastEnergyUpdate(new Date(userData.last_energy_regen))
        setIsBanned(!!userData.is_banned)

        // Reset level up state after refresh
        setIsLevelingUp(false)
        setPreviousLeague(null)
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
    }
  }, [userId])

  // Update coins handler - Moved up to avoid initialization errors
  const checkAndUpdateLeague = useCallback(
    async (coinCount: number) => {
      if (!userId) return

      // Define league thresholds - bu değerler StaticLeagues.ts ile aynı olmalı
      const leagueThresholds = [
        { level: 1, threshold: 0 }, // Wooden
        { level: 2, threshold: 10000 }, // Bronze
        { level: 3, threshold: 100000 }, // Iron
        { level: 4, threshold: 1000000 }, // Steel
        { level: 5, threshold: 10000000 }, // Adamantite
        { level: 6, threshold: 100000000 }, // Legendary
        { level: 7, threshold: 1000000000 }, // Dragon
      ]

      // Determine new league
      let newLeague = 1
      for (let i = leagueThresholds.length - 1; i >= 0; i--) {
        if (coinCount >= leagueThresholds[i].threshold) {
          newLeague = leagueThresholds[i].level
          break
        }
      }

      // Only update if league has changed and is higher than current league
      if (newLeague > league) {
        console.log(`[League Update] Upgrading from league ${league} to ${newLeague} (coins: ${coinCount})`)
        setLeague(newLeague)
      }
    },
    [userId, league],
  )

  const updateCoinsHandler = useCallback(
    async (amount: number, transactionType: string, description?: string) => {
      if (!userId) return false

      // For negative amounts (spending), check if user has enough coins
      if (amount < 0 && coins + amount < 0) {
        console.log("Not enough coins for this transaction")
        return false
      }

      // Update local state immediately for responsive UI
      const newCoins = Math.max(0, coins + amount)
      setCoins(newCoins)

      // For league rewards, update database immediately
      if (transactionType === "league_reward") {
        try {
          const result = await updateUserCoins(userId, amount, transactionType, description)
          if (result !== null) {
            lastSavedCoins.current = result
            console.log(`League reward saved to database: ${amount} coins, new total: ${result}`)

            // Check for league update after saving
            checkAndUpdateLeague(result)
            return true
          }
          return false
        } catch (error) {
          console.error("Error saving league reward:", error)
          // Rollback local state on error
          setCoins(coins)
          return false
        }
      }

      // For other transactions, add to the queue for batch processing
      coinUpdateQueue.current.push({ amount, transactionType, description })
      return true
    },
    [userId, coins, checkAndUpdateLeague],
  )

  // Check and update league based on coin count - Moved up to avoid initialization errors

  // Seviyeyi değiştirmek için fonksiyon
  const setLeague = useCallback(
    (newLeague: number) => {
      if (newLeague !== league) {
        try {
          console.log(`[League Update] Setting league from ${league} to ${newLeague}`)
          setPreviousLeague(league)
          setIsLevelingUp(true)

          // Calculate league progression benefits
          // Her lig atlamada earn_per_tap 1 artsın
          const newEarnPerTap = earnPerTap + 1

          // Her lig atlamada max_energy 50 artsın
          const newMaxEnergy = maxEnergy + 50

          // Update database if userId exists
          if (userId) {
            supabase
              .from("users")
              .update({
                league: newLeague,
                earn_per_tap: newEarnPerTap,
                max_energy: newMaxEnergy,
                updated_at: new Date().toISOString(),
              })
              .eq("id", userId)
              .then(({ error }) => {
                if (error) console.error("Error updating league in database:", error)
              })
          }

          // Update state immediately for UI
          setLeagueState(newLeague)
          setEarnPerTap(newEarnPerTap)
          setMaxEnergy(newMaxEnergy)

          // Note: We don't award coins here anymore
          // Coins will be awarded when the user clicks the "Collect" button in the popup
        } catch (error) {
          console.error("Error setting league:", error)
          setIsLevelingUp(false)
          setPreviousLeague(null)
        }
      }
    },
    [league, userId, earnPerTap, maxEnergy],
  )

  // Initialize user data
  useEffect(() => {
    const initUser = async () => {
      try {
        // Get user ID from Telegram WebApp
        let telegramUserId = null
        let telegramUsername = null

        if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp.initDataUnsafe.user) {
          telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id.toString()
          telegramUsername =
            window.Telegram.WebApp.initDataUnsafe.user.username ||
            `${window.Telegram.WebApp.initDataUnsafe.user.first_name || ""} ${window.Telegram.WebApp.initDataUnsafe.user.last_name || ""}`.trim()
        }

        // Fallback for development testing
        if (!telegramUserId) {
          telegramUserId = "123456789"
          telegramUsername = "dev_user"
          console.warn("Using development Telegram user ID and username")
        }

        setTelegramId(telegramUserId)
        setUsername(telegramUsername)

        // Check if user exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUserId)
          .single()

        if (existingUser) {
          // User exists, load their data
          setUserId(existingUser.id)
          const existingCoins = Number(existingUser.coins) || 0
          setCoins(existingCoins)
          lastSavedCoins.current = existingCoins // Bu satırı güncelle
          setEnergy(existingUser.energy)
          setMaxEnergy(existingUser.max_energy)
          setEarnPerTap(existingUser.earn_per_tap)
          setHourlyEarn(existingUser.hourly_earn)
          setLeagueState(existingUser.league)
          setLastEnergyUpdate(new Date(existingUser.last_energy_regen))

          // Load user boosts
          const { data: userBoosts } = await supabase.from("user_boosts").select("*").eq("user_id", existingUser.id)

          // Check if we got any boost records
          if (userBoosts && userBoosts.length > 0) {
            const boost = userBoosts[0] // Use the first record if multiple exist
            setBoosts({
              multiTouch: {
                level: boost.multi_touch_level || 0,
                cost: 2000 * Math.pow(1.5, boost.multi_touch_level || 0),
              },
              energyLimit: {
                level: boost.energy_limit_level || 0,
                cost: 2000 * Math.pow(1.5, boost.energy_limit_level || 0),
              },
              chargeSpeed: {
                level: boost.charge_speed_level || 0,
                cost: 2000 * Math.pow(1.5, boost.charge_speed_level || 0),
              },
              dailyRockets: boost.daily_rockets,
              max_daily_rockets: boost.max_daily_rockets,
              energyFullUsed: boost.energy_full_used,
            })
          } else {
            // Create default boosts if none exist
            console.log("No boosts found, creating default boosts")
            await supabase.from("user_boosts").insert([
              {
                user_id: existingUser.id,
                multi_touch_level: 0,
                energy_limit_level: 0,
                charge_speed_level: 0,
                daily_rockets: 3,
                max_daily_rockets: 3,
                energy_full_used: false,
              },
            ])
          }

          // Load daily combo
          const dailyComboData = await getUserDailyCombo(existingUser.id)
          if (dailyComboData) {
            setDailyCombo({
              cardIds: dailyComboData.card_ids,
              foundCardIds: dailyComboData.found_card_ids,
              reward: dailyComboData.reward,
              isCompleted: dailyComboData.is_completed,
            })
          }
        } else {
          // Create new user
          const { data: newUser } = await supabase
            .from("users")
            .insert([
              {
                telegram_id: telegramUserId,
                username: telegramUsername,
                coins: 1000,
                league: 1,
                hourly_earn: 10,
                earn_per_tap: 1,
                energy: 100,
                max_energy: 100,
                last_energy_regen: new Date().toISOString(),
                last_hourly_collect: new Date().toISOString(),
                total_hourly_coins: 0,
              },
            ])
            .select()
            .single()

          if (newUser) {
            setUserId(newUser.id)
            setCoins(newUser.coins)
            lastSavedCoins.current = newUser.coins
            setEnergy(newUser.energy)
            setMaxEnergy(newUser.max_energy)
            setEarnPerTap(newUser.earn_per_tap)
            setHourlyEarn(newUser.hourly_earn)
            setLeagueState(newUser.league)
            setLastEnergyUpdate(new Date())

            // Create initial boosts
            await supabase.from("user_boosts").insert([
              {
                user_id: newUser.id,
                multi_touch_level: 0,
                energy_limit_level: 0,
                charge_speed_level: 0,
                daily_rockets: 3,
                max_daily_rockets: 3,
                energy_full_used: false,
              },
            ])

            // Create initial daily combo
            const dailyComboData = await getUserDailyCombo(newUser.id)
            if (dailyComboData) {
              setDailyCombo({
                cardIds: dailyComboData.card_ids,
                foundCardIds: dailyComboData.found_card_ids,
                reward: dailyComboData.reward,
                isCompleted: dailyComboData.is_completed,
              })
            }
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing user:", error)
        setIsLoading(false)
      }
    }

    initUser()
  }, [])

  const handleTap = useCallback(async () => {
    if (energy <= 0) return

    const now = Date.now()
    const timeSinceLastTap = now - lastTapTime.current

    if (timeSinceLastTap < tapCooldown) return

    lastTapTime.current = now

    // Ensure earnPerTap is a number
    const tapEarnAmount = isNaN(earnPerTap) ? 1 : earnPerTap

    // Update local state immediately
    setEnergy((prev) => Math.max(0, prev - 1))
    setCoins((prev) => prev + tapEarnAmount)

    // Queue updates
    coinUpdateQueue.current.push({
      amount: tapEarnAmount,
      transactionType: "tap",
      description: `Tap for ${tapEarnAmount} coins`,
    })

    energyUpdateQueue.current -= 1

    // Check for league update
    checkAndUpdateLeague(coins + tapEarnAmount)
  }, [energy, earnPerTap, coins, checkAndUpdateLeague, tapCooldown])

  // Update energy handler
  const updateEnergyHandler = useCallback(
    async (amount: number) => {
      if (!userId) return

      // Calculate new energy locally for immediate feedback
      const newEnergy = Math.max(0, Math.min(maxEnergy, energy + amount))
      setEnergy(newEnergy)
      setLastEnergyUpdate(new Date())

      // Queue energy update
      energyUpdateQueue.current += amount

      return newEnergy
    },
    [userId, energy, maxEnergy],
  )

  // Process coin update queue
  useEffect(() => {
    if (!userId || coinUpdateQueue.current.length === 0) return

    // Clear existing timer
    if (coinUpdateTimer.current) {
      clearTimeout(coinUpdateTimer.current)
    }

    // Set new timer to batch updates
    coinUpdateTimer.current = setTimeout(async () => {
      if (isUpdatingCoins.current || coinUpdateQueue.current.length === 0) return

      isUpdatingCoins.current = true
      const updates = [...coinUpdateQueue.current]
      coinUpdateQueue.current = []

      try {
        // Calculate total change
        const totalChange = updates.reduce((sum, update) => sum + update.amount, 0)

        // Only update if there's a significant change or it's been a while
        if (Math.abs(coins - lastSavedCoins.current) >= 10 || updates.length > 50) {
          const result = await updateUserCoins(
            userId,
            totalChange,
            "batch_update",
            `Batch update: ${updates.length} transactions`,
          )

          if (result !== null) {
            lastSavedCoins.current = result
            console.log(`Coins saved to database: ${result}`)

            // Check if user should be promoted to next league after saving
            checkAndUpdateLeague(result)
          }
        }
      } catch (error) {
        console.error("Error processing coin updates:", error)
        // Re-add failed updates to queue
        coinUpdateQueue.current = [...updates, ...coinUpdateQueue.current]
      } finally {
        isUpdatingCoins.current = false
      }
    }, 1000) // Wait 1 second before processing

    return () => {
      if (coinUpdateTimer.current) {
        clearTimeout(coinUpdateTimer.current)
      }
    }
  }, [userId, coins, coinUpdateQueue.current.length, checkAndUpdateLeague])

  // Process energy update queue
  useEffect(() => {
    if (!userId || energyUpdateQueue.current === 0) return

    // Clear existing timer
    if (energyUpdateTimer.current) {
      clearTimeout(energyUpdateTimer.current)
    }

    // Set new timer to batch updates
    energyUpdateTimer.current = setTimeout(async () => {
      if (isUpdatingEnergy.current || energyUpdateQueue.current === 0) return

      isUpdatingEnergy.current = true
      const energyChange = energyUpdateQueue.current
      energyUpdateQueue.current = 0

      try {
        await updateUserEnergy(userId, energyChange)
      } catch (error) {
        console.error("Error updating energy:", error)
        // Re-add failed update
        energyUpdateQueue.current += energyChange
      } finally {
        isUpdatingEnergy.current = false
      }
    }, 2000) // Wait 2 seconds before processing energy updates

    return () => {
      if (energyUpdateTimer.current) {
        clearTimeout(energyUpdateTimer.current)
      }
    }
  }, [userId, energy, energyUpdateQueue.current])

  // Saatlik kazanç sistemi - Hamster Kombat tarzı
  useEffect(() => {
    if (!userId || !hourlyEarn || hourlyEarn <= 0) return

    const coinsPerSecond = hourlyEarn / 3600
    let accumulatedCoins = 0

    // Her saniye coin ekle
    const interval = setInterval(() => {
      accumulatedCoins += coinsPerSecond
      setCoins((prev) => {
        // Round to 2 decimal places to avoid floating point precision issues
        const newCoins = Math.round((prev + coinsPerSecond) * 100) / 100
        // Check for league update
        checkAndUpdateLeague(newCoins)
        return newCoins
      })
    }, 1000)

    // Her 30 saniyede bir veritabanına kaydet
    const saveInterval = setInterval(async () => {
      if (!userId || isUpdatingCoins.current || accumulatedCoins < 1) return

      try {
        console.log(`[Hourly Earnings] Saving ${accumulatedCoins.toFixed(2)} coins to database...`)

        const result = await updateUserCoins(
          userId,
          Math.floor(accumulatedCoins),
          "hourly_earnings",
          "Automatic hourly earnings",
        )

        if (result !== null) {
          console.log(
            `[Hourly Earnings] Successfully saved ${Math.floor(accumulatedCoins)} coins. New total: ${result}`,
          )
          lastSavedCoins.current = result
          accumulatedCoins = accumulatedCoins - Math.floor(accumulatedCoins) // Sadece tam sayı kısmını sıfırla
        } else {
          console.log(`[Hourly Earnings] Failed to save coins to database`)
        }
      } catch (error) {
        console.error("[Hourly Earnings] Error saving:", error)
      }
    }, 30000) // 30 saniye

    return () => {
      clearInterval(interval)
      clearInterval(saveInterval)

      // Cleanup'ta birikmiş coinleri kaydet
      if (accumulatedCoins >= 1) {
        updateUserCoins(userId, Math.floor(accumulatedCoins), "hourly_earnings", "Hourly earnings on cleanup")
      }
    }
  }, [userId, hourlyEarn, checkAndUpdateLeague])

  // Energy regeneration
  useEffect(() => {
    if (!userId || energy >= maxEnergy) return

    const regenRate = 1 + boosts.chargeSpeed.level * 0.2 // 20% faster per level
    const regenInterval = 1000 / regenRate // milliseconds per energy point

    const interval = setInterval(() => {
      setEnergy((prev) => {
        const newEnergy = Math.min(maxEnergy, prev + 1)
        if (newEnergy !== prev) {
          energyUpdateQueue.current += 1
        }
        return newEnergy
      })
    }, regenInterval)

    return () => clearInterval(interval)
  }, [userId, energy, maxEnergy, boosts.chargeSpeed.level])

  // Save coins on unmount or page change
  useEffect(() => {
    return () => {
      if (userId && coinUpdateQueue.current.length > 0) {
        // Force save any pending updates
        const totalChange = coinUpdateQueue.current.reduce((sum, update) => sum + update.amount, 0)
        updateUserCoins(userId, totalChange, "batch_update", "Final save on unmount")
      }
    }
  }, [userId])

  // Collect hourly earnings handler (kept for compatibility but not used in new system)
  const collectHourlyEarningsHandler = useCallback(async () => {
    return { success: true, coins: 0, message: "Hourly earnings are now automatic!" }
  }, [])

  const useRocketBoostInner = useCallback(async (userId: string) => {
    try {
      const result = await useRocketBoost(userId)

      return result.success
        ? { success: true, rocketsLeft: result.rocketsLeft }
        : { success: false, message: result.message || "Failed to use rocket boost" }
    } catch (error) {
      console.error("Error using rocket boost:", error)
      return { success: false, message: "Failed to use rocket boost" }
    }
  }, [])

  const useFullEnergyBoostInner = useCallback(async (userId: string) => {
    try {
      const result = await useFullEnergyBoost(userId)

      return result.success
        ? { success: true }
        : { success: false, message: result.message || "Failed to use full energy boost" }
    } catch (error) {
      console.error("Error using full energy boost:", error)
      return { success: false, message: "Failed to use full energy boost" }
    }
  }, [])

  // Upgrade boost handler
  const upgradeBoostHandler = useCallback(
    async (boostType: string) => {
      if (!userId) return { success: false, message: "User not found" }

      try {
        const currentBoost = boosts[boostType as keyof typeof boosts] as { level: number; cost: number }

        if (!currentBoost) {
          return { success: false, message: "Invalid boost type" }
        }

        if (currentBoost.level >= 2) {
          return { success: false, message: "Boost is already at maximum level!" }
        }

        if (coins < currentBoost.cost) {
          return { success: false, message: "Not enough coins" }
        }

        const result = await upgradeBoost(userId, boostType)

        if (!result.success) {
          return { success: false, message: result.message || "Failed to upgrade boost" }
        }

        // Update local state on success
        setCoins((prevCoins) => Math.max(0, prevCoins - currentBoost.cost))

        // Update boost levels
        const newLevel = currentBoost.level + 1
        const newCost = Math.floor(2000 * Math.pow(1.5, newLevel))

        setBoosts((prevBoosts) => ({
          ...prevBoosts,
          [boostType]: { level: newLevel, cost: newCost },
        }))

        // Update related stats based on the server response
        if (boostType === "multiTouch" && result.newStats) {
          setEarnPerTap(result.newStats)
        } else if (boostType === "energyLimit" && result.newStats) {
          setMaxEnergy(result.newStats)
        }

        return {
          success: true,
          message: "Boost upgraded successfully",
          statChange: result.statChange,
        }
      } catch (error) {
        console.error("Error upgrading boost:", error)
        return { success: false, message: "Failed to upgrade boost" }
      }
    },
    [userId, boosts, coins],
  )

  // Use rocket boost handler
  const useRocketBoostHandler = useCallback(async () => {
    if (!userId) return { success: false, message: "User not found" }

    // Check if user has rockets left
    if (boosts.dailyRockets <= 0) {
      return { success: false, message: "No rockets left" }
    }

    try {
      // Call the server function
      const result = await useRocketBoost(userId)

      if (!result.success) {
        return { success: false, message: result.message || "Failed to use rocket boost" }
      }

      // Update local state with server values
      setBoosts((prevBoosts) => ({
        ...prevBoosts,
        dailyRockets: result.rocketsLeft,
      }))

      // Use the energy value returned from the server
      if (result.newEnergy !== undefined) {
        setEnergy(result.newEnergy)
      } else {
        // Fallback to local calculation if server doesn't return energy
        setEnergy((prev) => Math.min(maxEnergy, prev + 500))
      }

      return { success: true, rocketsLeft: result.rocketsLeft }
    } catch (error) {
      console.error("Error using rocket boost:", error)
      return { success: false, message: "Failed to use rocket boost" }
    }
  }, [userId, boosts.dailyRockets, maxEnergy])

  // Use full energy boost handler
  const useFullEnergyBoostHandler = useCallback(async () => {
    if (!userId) return { success: false, message: "User not found" }

    // Check if already used
    if (boosts.energyFullUsed) {
      return { success: false, message: "Full energy already used today" }
    }

    const useFullEnergyBoostInnerResult = await useFullEnergyBoostInner(userId)

    // Update UI immediately
    setBoosts((prevBoosts) => ({
      ...prevBoosts,
      energyFullUsed: true,
    }))

    const energyToAdd = maxEnergy - energy
    setEnergy(maxEnergy)

    if (!useFullEnergyBoostInnerResult.success) {
      // Rollback optimistic updates if the server call fails
      setBoosts((prevBoosts) => ({
        ...prevBoosts,
        energyFullUsed: false,
      }))

      setEnergy((prevEnergy) => Math.max(0, prevEnergy - energyToAdd))

      return { success: false, message: useFullEnergyBoostInnerResult.message || "Failed to use full energy boost" }
    }

    return { success: true }
  }, [boosts.energyFullUsed, energy, maxEnergy, useFullEnergyBoostInner, userId])

  // Find combo card handler
  const findComboCardHandler = async (cardIndex: number) => {
    if (!userId) return { success: false, message: "User not found" }

    const result = await findDailyComboCard(userId, cardIndex)

    if (result.success) {
      const updatedDailyCombo = { ...dailyCombo }
      updatedDailyCombo.foundCardIds = result.foundCardIds || dailyCombo.foundCardIds
      updatedDailyCombo.isCompleted = result.isCompleted || dailyCombo.isCompleted

      setDailyCombo(updatedDailyCombo)
      refreshUserData()

      return {
        success: true,
        cardId: result.cardId,
        isCompleted: result.isCompleted,
        reward: result.reward,
      }
    }

    return { success: false, message: result.message || "Failed to find combo card" }
  }

  // Ban check on route change
  useEffect(() => {
    if (userId) {
      supabase
        .from("users")
        .select("is_banned")
        .eq("id", userId)
        .single()
        .then(({ data }) => {
          setIsBanned(!!data?.is_banned)
        })
    }
  }, [pathname, userId])

  if (isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-center">
        <div className="bg-gray-900 p-8 rounded-xl shadow-xl border border-gray-800 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Hesabınız Banlandı</h2>
          <p className="text-gray-300 mb-2">Bu hesap yöneticiler tarafından engellenmiştir.</p>
          <p className="text-gray-500 text-sm">Destek için admin ile iletişime geçin.</p>
        </div>
      </div>
    )
  }

  return (
    <UserContext.Provider
      value={{
        userId,
        telegramId,
        username,
        coins,
        energy,
        maxEnergy,
        earnPerTap,
        hourlyEarn,
        league,
        isLoading,
        isLevelingUp,
        previousLeague,
        dailyCombo,
        boosts,
        updateCoins: updateCoinsHandler,
        updateEnergy: updateEnergyHandler,
        refreshUserData,
        setLeague,
        handleTap,
        collectHourlyEarnings: collectHourlyEarningsHandler,
        upgradeBoost: upgradeBoostHandler,
        useRocketBoost: useRocketBoostHandler,
        useFullEnergyBoost: useFullEnergyBoostHandler,
        findComboCard: findComboCardHandler,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

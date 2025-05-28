"use client"

import { useState, useEffect, useCallback } from "react"
import Navbar from "@/components/navbar"
import Header from "@/components/header"
import CentralButton from "@/components/central-button"
import CoinDisplay from "@/components/coin-display"
import EnergyBar from "@/components/energy-bar"
import LeagueOverlay from "@/components/league-overlay"
import BoostOverlay from "@/components/boost-overlay"
import LeagueUpPopup from "@/components/league-up-popup"
import MainPageSkeletonLoading from "@/components/skeleton-main"
import Popup from "@/components/popup"
import { useUser } from "@/contexts/UserContext"
import { useLeagues } from "@/hooks/useLeagues"

export default function Home() {
  const {
    userId,
    coins,
    energy,
    maxEnergy,
    earnPerTap,
    hourlyEarn,
    league,
    isLoading,
    isLevelingUp,
    previousLeague,
    boosts,
    handleTap,
    upgradeBoost,
    useRocketBoost,
    useFullEnergyBoost,
    collectHourlyEarnings,
    refreshUserData,
    updateCoins,
  } = useUser()

  const { getLeagueById, loading: leaguesLoading } = useLeagues()

  // Game state
  const [coinsToLevelUp, setCoinsToLevelUp] = useState(10000)
  const [localCoins, setLocalCoins] = useState(coins)

  // Update local coins when coins change
  useEffect(() => {
    setLocalCoins(coins)
  }, [coins])

  // Visual state
  const [showTapEffect, setShowTapEffect] = useState(false)
  const [comboCounter, setComboCounter] = useState(0)
  const [tapMultiplier, setTapMultiplier] = useState(1)

  // UI state
  const [showLeagueOverlay, setShowLeagueOverlay] = useState(false)
  const [showBoostOverlay, setShowBoostOverlay] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState<{
    show: boolean
    title: string
    message: string
    image: string
  }>({
    show: false,
    title: "",
    message: "",
    image: "",
  })

  const [rocketBoostUsed, setRocketBoostUsed] = useState(false)
  const [fullEnergyUsed, setFullEnergyUsed] = useState(false)

  // Ödül toplama işlemi
  const handleCollectReward = useCallback(async () => {
    if (league > 1) {
      const leagueReward = calculateLeagueReward(league)
      if (leagueReward > 0) {
        // Immediately update local coins for UI responsiveness
        setLocalCoins((prevCoins) => prevCoins + leagueReward)

        // Update server-side coins and wait for it to complete
        const success = await updateCoins(leagueReward, "league_reward", `Reached ${league} League`)

        if (success) {
          // Force a refresh to ensure database is in sync
          setTimeout(() => {
            refreshUserData()
          }, 500)

          // Ödül alındığında bildirim göster
          setShowSuccessPopup({
            show: true,
            title: "League Reward Collected!",
            message: `You received ${formatReward(league)} coins!`,
            image: "/reward-collected.png",
          })
        } else {
          // Rollback local coins if database update failed
          setLocalCoins((prevCoins) => prevCoins - leagueReward)

          setShowSuccessPopup({
            show: true,
            title: "Error",
            message: "Failed to collect reward. Please try again.",
            image: "/error.png",
          })
        }
      }
    }
  }, [league, updateCoins, refreshUserData])

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

  // Helper to format reward
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

  // Initialize Telegram WebApp
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp &&
      typeof window.Telegram.WebApp.ready === "function" &&
      typeof window.Telegram.WebApp.expand === "function"
    ) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
  }, [])

  // Calculate coins needed for next league
  useEffect(() => {
    const leagueThresholds = [
      0, // League 1 (Wooden)
      10000, // League 2 (Bronze)
      100000, // League 3 (Iron)
      1000000, // League 4 (Steel)
      10000000, // League 5 (Adamantite)
      100000000, // League 6 (Legendary)
      1000000000, // League 7 (Dragon)
    ]

    if (league < leagueThresholds.length) {
      setCoinsToLevelUp(leagueThresholds[league] - localCoins)
    }
  }, [league, localCoins])

  // Saatlik kazancı otomatik olarak toplayan useEffect
  useEffect(() => {
    const autoCollectHourly = async () => {
      if (!userId) return
      try {
        const result = await collectHourlyEarnings()
        if (result.success && result.coins) {
          await refreshUserData()
        }
      } catch (error) {
        console.error("Error auto-collecting hourly earnings:", error)
      }
    }
    autoCollectHourly()
    const interval = setInterval(autoCollectHourly, 60000)
    return () => clearInterval(interval)
  }, [userId, collectHourlyEarnings, refreshUserData])

  // Combo system
  useEffect(() => {
    if (comboCounter > 0) {
      const comboTimeout = setTimeout(() => {
        setComboCounter(0)
        setTapMultiplier(1)
      }, 2000)

      return () => clearTimeout(comboTimeout)
    }
  }, [comboCounter])

  const handleCentralButtonClick = async () => {
    if (energy <= 0) {
      setShowSuccessPopup({
        show: true,
        title: "No Energy!",
        message: "Wait for energy to regenerate or use a boost.",
        image: "/energy-empty.png",
      })
      return
    }

    // Update combo
    const newCombo = comboCounter + 1
    setComboCounter(newCombo)

    // Calculate multiplier
    let multiplier = 1
    if (newCombo > 50) multiplier = 3
    else if (newCombo > 25) multiplier = 2
    else if (newCombo > 10) multiplier = 1.5

    setTapMultiplier(multiplier)

    // Show tap effect
    setShowTapEffect(true)
    setTimeout(() => setShowTapEffect(false), 200)

    // Handle tap
    await handleTap()
  }

  // app/page.tsx'teki handleBoostUpgrade fonksiyonunu güncelle
  const handleBoostUpgrade = async (boostType: string) => {
    // Show loading state immediately
    let message = ""
    switch (boostType) {
      case "multiTouch":
        message = `Multi-Touch upgrading...`
        break
      case "energyLimit":
        message = `Energy Limit upgrading...`
        break
      case "chargeSpeed":
        message = `Charge Speed upgrading...`
        break
    }

    try {
      // Call the upgrade function
      const result = await upgradeBoost(boostType)

      if (result.success) {
        // Update success message
        switch (boostType) {
          case "multiTouch":
            message = `Multi-Touch upgraded! Now earning ${earnPerTap + 2} coins per tap.`
            break
          case "energyLimit":
            message = `Energy Limit upgraded! Max energy is now ${maxEnergy + 500}.`
            break
          case "chargeSpeed":
            message = `Charge Speed upgraded! Energy regenerates ${(boosts.chargeSpeed.level + 1) * 20}% faster.`
            break
        }

        setShowSuccessPopup({
          show: true,
          title: "Boost Upgraded!",
          message,
          image: "/boost-success.png",
        })
      } else {
        setShowSuccessPopup({
          show: true,
          title: "Upgrade Failed",
          message: result.message || "Not enough coins!",
          image: "/error.png",
        })
      }
    } catch (error) {
      console.error("Error in handleBoostUpgrade:", error)
      setShowSuccessPopup({
        show: true,
        title: "Upgrade Failed",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        image: "/error.png",
      })
    }
  }

  const handleUseRocket = async () => {
    setShowBoostOverlay(false)

    if (rocketBoostUsed) {
      setShowSuccessPopup({
        show: true,
        title: "Boost Failed",
        message: "You have already used the rocket boost today!",
        image: "/error.png",
      })
      return
    }

    let rocketResult
    try {
      rocketResult = await useRocketBoost()
    } catch (error: any) {
      setShowSuccessPopup({
        show: true,
        title: "Boost Failed",
        message: error.message || "Rocket boost failed!",
        image: "/error.png",
      })
      return
    }

    if (rocketResult.success) {
      setShowSuccessPopup({
        show: true,
        title: "Rocket Boost Used!",
        message: "You gained +500 energy instantly!",
        image: "/rocket-boost.png",
      })
      setRocketBoostUsed(true)
    } else {
      setShowSuccessPopup({
        show: true,
        title: "Boost Failed",
        message: rocketResult.message || "Rocket boost failed!",
        image: "/error.png",
      })
    }
  }

  const handleUseFullEnergy = async () => {
    // Show visual feedback immediately
    setShowBoostOverlay(false)

    if (fullEnergyUsed) {
      setShowSuccessPopup({
        show: true,
        title: "Already Used",
        message: "You've already used full energy today!",
        image: "/error.png",
      })
      return
    }

    let fullEnergyResult
    try {
      fullEnergyResult = await useFullEnergyBoost()
    } catch (error: any) {
      setShowSuccessPopup({
        show: true,
        title: "Boost Failed",
        message: error.message || "Full energy boost failed!",
        image: "/error.png",
      })
      return
    }

    if (fullEnergyResult.success) {
      setShowSuccessPopup({
        show: true,
        title: "Energy Fully Restored!",
        message: "Your energy has been completely refilled!",
        image: "/energy-full.png",
      })
      setFullEnergyUsed(true)
    } else {
      setShowSuccessPopup({
        show: true,
        title: "Already Used",
        message: fullEnergyResult.message || "You've already used full energy today!",
        image: "/error.png",
      })
    }
  }

  if (isLoading || leaguesLoading) return <MainPageSkeletonLoading />

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Main content */}
      <div className="flex flex-col min-h-screen px-4 pb-20 max-w-md mx-auto">
        {/* Header section */}
        <div className="mt-4">
          <Header earnPerTap={earnPerTap} coinsToLevelUp={coinsToLevelUp} hourlyEarn={hourlyEarn} />
        </div>

        {/* Coin display section */}
        <div className="mt-4">
          <CoinDisplay coins={localCoins} league={league} onclick={() => setShowLeagueOverlay(true)} />
        </div>

        {/* Combo counter */}
        {comboCounter > 0 && energy > 0 && (
          <div className="my-2 text-center">
            <span className="text-sm font-bold text-yellow-400">
              {comboCounter}x Combo
              {tapMultiplier > 1 && <span className="ml-2 text-yellow-400">({tapMultiplier}x Multiplier)</span>}
            </span>
          </div>
        )}

        {/* Central button section */}
        <div className="flex-grow flex items-center justify-center py-8 relative">
          {showTapEffect && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-52 bg-yellow-500 rounded-full animate-pulse opacity-10"></div>
            </div>
          )}
          <CentralButton onClick={handleCentralButtonClick} league={league} />
        </div>

        {/* Energy bar section */}
        <div className="mb-20">
          <EnergyBar
            energy={energy}
            maxEnergy={maxEnergy}
            boost={handleUseRocket}
            onOpenBoostOverlay={() => setShowBoostOverlay(true)}
            league={league}
          />
        </div>
      </div>

      {/* Overlays */}
      {showLeagueOverlay && <LeagueOverlay onClose={() => setShowLeagueOverlay(false)} coins={localCoins} />}

      {showBoostOverlay && (
        <BoostOverlay
          onClose={() => setShowBoostOverlay(false)}
          coins={localCoins}
          dailyRockets={boosts.dailyRockets}
          maxDailyRockets={boosts.maxDailyRockets}
          energyFull={boosts.energyFullUsed}
          boosts={boosts}
          onBoostUpgrade={handleBoostUpgrade}
          onUseRocket={handleUseRocket}
          onUseFullEnergy={handleUseFullEnergy}
        />
      )}

      {/* League Up Popup */}
      {isLevelingUp && previousLeague && (
        <LeagueUpPopup
          previousLeague={previousLeague}
          newLeague={league}
          onCollect={handleCollectReward}
          onClose={() => refreshUserData()}
        />
      )}

      {/* Success popups */}
      {showSuccessPopup.show && (
        <Popup
          title={showSuccessPopup.title}
          message={showSuccessPopup.message}
          image={showSuccessPopup.image}
          onClose={() => setShowSuccessPopup({ ...showSuccessPopup, show: false })}
        />
      )}

      {/* Fixed navigation */}
      <Navbar />
    </main>
  )
}

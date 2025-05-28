"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import HeaderCard from "@/components/header-card"
import Navbar from "@/components/navbar"
import SkeletonLoading from "@/components/skeleton-mine"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useLeagues } from "@/hooks/useLeagues"
import { useCards } from "@/hooks/useCards"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/contexts/UserContext"
// Import the TimeBar component at the top of the file
import TimeBar from "@/components/time-bar"
import { getAllItems } from "@/lib/db-actions"

interface Item {
  id: number
  name: string
  category: string
  image: string
  description: string
  base_hourly_income: number
  base_upgrade_cost: number
}

interface CardItem {
  id: number
  name: string
  image: string
  level: number
  hourlyIncome: number
  upgradeCost: number
  description: string
  category: string
  userItemId?: string
}

interface UpgradePopupProps {
  card: CardItem | null
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

// Upgrade Popup Component
const UpgradePopup = ({ card, onClose, onConfirm, isLoading }: UpgradePopupProps) => {
  if (!card) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700 shadow-xl transform transition-all">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Upgrade {card.name}</h3>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
              <img src={card.image || "/placeholder.svg"} alt={card.name} className="w-12 h-12 object-contain" />
            </div>
          </div>
          <div className="text-sm text-gray-300 mb-2">
            Level {card.level} → {card.level + 1}
          </div>
          <div className="flex justify-center items-center space-x-4 mb-2">
            <div className="flex items-center">
              <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1" />
              <span className="text-yellow-300 font-bold">{card.hourlyIncome}</span>
            </div>
            <FontAwesomeIcon icon={icons.arrowRight} className="text-gray-500" />
            <div className="flex items-center">
              <FontAwesomeIcon icon={icons.coins} className="text-green-400 mr-1" />
              <span className="text-green-300 font-bold">{Math.floor(card.hourlyIncome * 1.5)}</span>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2 text-xl" />
            <span className="text-white text-xl font-bold">{card.upgradeCost.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Upgrade"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Success Popup Component
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700 shadow-xl transform transition-all">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={icons.check} className="text-green-500 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Upgrade Successful!</h3>
          <p className="text-gray-300">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  )
}

// Card Found Popup Component
const CardFoundPopup = ({
  card,
  onClose,
}: { card: { id: number; name: string; image: string }; onClose: () => void }) => {
  const { getLeagueColors } = useLeagues()
  const { league } = useUser()
  const colors = getLeagueColors(league)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700 shadow-xl transform transition-all">
        <div className="text-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 0 15px ${colors.glow}`,
            }}
          >
            <FontAwesomeIcon icon={icons.check} className="text-white text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Daily Combo Card Found!</h3>
          <div className="mb-4">
            <img
              src={card.image || "/placeholder.svg"}
              alt={card.name}
              className="w-24 h-24 object-contain mx-auto"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.src = "/placeholder-j0tzm.png"
              }}
            />
            <p className="text-white font-bold mt-2">{card.name}</p>
          </div>
          <p className="text-gray-300">You found a card from today's Daily Combo!</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 px-4 text-white rounded-lg transition-colors"
          style={{
            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            boxShadow: `0 4px 10px ${colors.glow}40`,
          }}
        >
          Awesome!
        </button>
      </div>
    </div>
  )
}

// Daily Combo Completed Popup Component
const ComboCompletedPopup = ({ reward, onClose }: { reward: number; onClose: () => void }) => {
  const { getLeagueColors } = useLeagues()
  const { league } = useUser()
  const colors = getLeagueColors(league)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700 shadow-xl transform transition-all">
        <div className="text-center mb-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 0 25px ${colors.glow}`,
            }}
          >
            <FontAwesomeIcon icon={icons.trophy} className="text-white text-4xl" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Daily Combo Completed!</h3>
          <div className="mb-4 flex items-center justify-center space-x-2">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 text-2xl" />
            <span className="text-yellow-300 font-bold text-2xl">+{reward.toLocaleString()}</span>
          </div>
          <p className="text-gray-300">Congratulations! You've found all cards in today's Daily Combo!</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 px-4 text-white rounded-lg transition-colors text-lg font-bold"
          style={{
            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            boxShadow: `0 4px 10px ${colors.glow}40`,
          }}
        >
          Claim Reward!
        </button>
      </div>
    </div>
  )
}

export default function MinePage() {
  const {
    userId,
    coins,
    hourlyEarn,
    league,
    isLoading: userLoading,
    updateCoins,
    refreshUserData,
    dailyCombo,
    findComboCard,
  } = useUser()

  // Use refs to prevent unnecessary re-renders
  const isInitialLoadRef = useRef(true)
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("Equipment")
  const [cardList, setCardList] = useState<CardItem[]>([])
  const [allCards, setAllCards] = useState<Record<string, CardItem[]>>({
    Equipment: [],
    Workers: [],
    Isekai: [],
    Special: [],
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<"level" | "income" | "cost">("level")
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [upgradeInProgress, setUpgradeInProgress] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const { getLeagueColors } = useLeagues()
  const colors = getLeagueColors(league)
  const [showCardFoundPopup, setShowCardFoundPopup] = useState(false)
  const [foundComboCard, setFoundComboCard] = useState<{ id: number; name: string; image: string } | null>(null)
  const [showComboCompletedPopup, setShowComboCompletedPopup] = useState(false)
  const [comboReward, setComboReward] = useState(0)

  // Daily combo state
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00")
  const [dailyComboCards, setDailyComboCards] = useState([1, 2, 3]) // Card IDs for daily combo
  const [foundCards, setFoundCards] = useState<number[]>([1]) // Found card IDs

  // Map Turkish category names to English - memoize to prevent re-creation
  const categoryMapping = useMemo(
    () =>
      ({
        Ekipman: "Equipment",
        İşçiler: "Workers",
        Isekai: "Isekai",
        Özel: "Special",
      }) as const,
    [],
  )

  const categories = useMemo(() => ["Equipment", "Workers", "Isekai", "Special"], [])

  // Calculate time left for daily combo
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
      const timeRemaining = Math.floor((endOfDay.getTime() - now.getTime()) / 1000)

      const h = Math.floor(timeRemaining / 3600)
      const m = Math.floor((timeRemaining % 3600) / 60)
      const s = timeRemaining % 60

      setTimeLeft(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  const { cards: availableCards, loading: cardsLoading } = useCards()

  const loadUserItems = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const items = (await getAllItems()) as Item[]
      const { data: userItems, error } = await supabase.from("user_items").select("*").eq("user_id", userId)

      if (error) throw error

      const processedCards: Record<string, CardItem[]> = {}

      // Initialize categories
      Object.keys(categoryMapping).forEach((category) => {
        processedCards[categoryMapping[category as keyof typeof categoryMapping]] = []
      })

      // Process each item
      items.forEach((item) => {
        const englishCategory = categoryMapping[item.category as keyof typeof categoryMapping] || item.category
        const englishName = item.name

        // Find user's item if it exists
        const userItem = userItems?.find((ui) => ui.item_id === item.id)

        // Find base card data from available cards
        const baseCard = availableCards.find((c) => c.id === item.id)

        const cardItem: CardItem = {
          id: item.id,
          name: englishName,
          image: baseCard?.image || item.image,
          category: englishCategory,
          description: item.description,
          level: userItem ? userItem.level : 1,
          hourlyIncome: userItem ? userItem.hourly_income : baseCard?.hourlyIncome || item.base_hourly_income,
          upgradeCost: userItem ? userItem.upgrade_cost : baseCard?.upgradeCost || item.base_upgrade_cost,
          userItemId: userItem ? userItem.id : undefined,
        }

        if (processedCards[englishCategory]) {
          processedCards[englishCategory].push(cardItem)
        }
      })

      // Sort cards by level
      Object.keys(processedCards).forEach((category) => {
        processedCards[category].sort((a, b) => b.level - a.level)
      })

      setAllCards(processedCards)
      setCardList(processedCards[activeCategory] || [])
    } catch (error) {
      console.error("Error loading items:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, categoryMapping, availableCards])

  // Load data when cards are available
  useEffect(() => {
    if (userId && !userLoading && !cardsLoading && isInitialLoadRef.current) {
      loadUserItems()
      isInitialLoadRef.current = false
    }
  }, [userId, userLoading, cardsLoading, loadUserItems])

  // Filter and sort cards when needed - use useMemo to prevent unnecessary recalculations
  const filteredAndSortedCards = useMemo(() => {
    if (!allCards[activeCategory]) return []

    let result = [...allCards[activeCategory]]

    // Apply search filter
    if (searchTerm) {
      result = result.filter((card) => card.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortOption) {
        case "level":
          comparison = a.level - b.level
          break
        case "income":
          comparison = a.hourlyIncome - b.hourlyIncome
          break
        case "cost":
          comparison = a.upgradeCost - b.upgradeCost
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [allCards, activeCategory, searchTerm, sortOption, sortDirection])

  // Update cardList when filtered results change
  useEffect(() => {
    setCardList(filteredAndSortedCards)
  }, [filteredAndSortedCards])

  // Handle category change without reloading data
  const handleCategoryChange = useCallback(
    (category: string) => {
      if (category !== activeCategory) {
        setActiveCategory(category)
      }
    },
    [activeCategory],
  )

  // Handle upgrade action
  const handleUpgradeClick = useCallback(
    (card: CardItem) => {
      if (coins < card.upgradeCost) return
      setSelectedCard(card)
    },
    [coins],
  )

  // Update user's hourly earnings in the database
  const updateUserHourlyEarnings = useCallback(
    async (newHourlyIncome: number, oldHourlyIncome: number) => {
      if (!userId) return

      try {
        // Calculate the difference in hourly income
        const hourlyIncomeDifference = newHourlyIncome - oldHourlyIncome

        // First, get the current hourly_earn value
        const { data: userData, error: fetchError } = await supabase
          .from("users")
          .select("hourly_earn")
          .eq("id", userId)
          .single()

        if (fetchError) {
          console.error("Error fetching user hourly earnings:", fetchError)
          return
        }

        // Calculate the new hourly_earn value
        const newHourlyEarn = (userData.hourly_earn || 0) + hourlyIncomeDifference

        // Update the user's hourly_earn in the database with the new value
        const { error } = await supabase
          .from("users")
          .update({
            hourly_earn: newHourlyEarn,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)

        if (error) {
          console.error("Error updating user hourly earnings:", error)
        }
      } catch (error) {
        console.error("Error in updateUserHourlyEarnings:", error)
      }
    },
    [userId],
  )

  const handleUpgradeConfirm = useCallback(async () => {
    if (!userId || !selectedCard || upgradeInProgress) return

    // Check if user has enough coins
    if (coins < selectedCard.upgradeCost) {
      // Show a message or alert that user doesn't have enough coins
      setSuccessMessage("Not enough coins to upgrade this item!")
      setShowSuccessPopup(true)
      setSelectedCard(null)
      return
    }

    try {
      setUpgradeInProgress(true)

      // Store the old hourly income for later comparison
      const oldHourlyIncome = selectedCard.hourlyIncome

      // If user doesn't own this item yet, create it
      if (!selectedCard.userItemId) {
        const { data: newUserItem, error: insertError } = await supabase
          .from("user_items")
          .insert([
            {
              user_id: userId,
              item_id: selectedCard.id,
              level: 1,
              hourly_income: selectedCard.hourlyIncome,
              upgrade_cost: selectedCard.upgradeCost,
            },
          ])
          .select()
          .single()

        if (insertError) {
          console.error("Error creating user item:", insertError)
          setUpgradeInProgress(false)
          setSelectedCard(null)
          return
        }

        selectedCard.userItemId = newUserItem.id
      }

      // Calculate new values
      const newLevel = selectedCard.level + 1
      const newHourlyIncome = Math.floor(selectedCard.hourlyIncome * 1.5)
      const newUpgradeCost = Math.floor(selectedCard.upgradeCost * 2)

      // Update user item in database
      const { error: updateError } = await supabase
        .from("user_items")
        .update({
          level: newLevel,
          hourly_income: newHourlyIncome,
          upgrade_cost: newUpgradeCost,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedCard.userItemId)

      if (updateError) {
        console.error("Error upgrading item:", updateError)
        setUpgradeInProgress(false)
        setSelectedCard(null)
        return
      }

      // Update the user's hourly earnings
      await updateUserHourlyEarnings(newHourlyIncome, oldHourlyIncome)

      // Deduct coins from user - check for success
      const success = await updateCoins(
        -selectedCard.upgradeCost,
        "item_upgrade",
        `Upgraded item ${selectedCard.id} to level ${newLevel}`,
      )

      if (!success) {
        // If update fails (not enough coins), show error message
        setSuccessMessage("Transaction failed. Not enough coins!")
        setShowSuccessPopup(true)
        setSelectedCard(null)
        setUpgradeInProgress(false)
        return
      }

      // Check if the upgraded card is part of today's daily combo
      if (dailyCombo.cardIds.includes(selectedCard.id) && !dailyCombo.foundCardIds.includes(selectedCard.id)) {
        // Mark card as found in daily combo
        const comboIndex = dailyCombo.cardIds.indexOf(selectedCard.id)
        const result = await findComboCard(comboIndex)

        if (result.success) {
          // Show card found popup
          setFoundComboCard({
            id: selectedCard.id,
            name: selectedCard.name,
            image: selectedCard.image || "/placeholder-j0tzm.png",
          })
          setShowCardFoundPopup(true)

          // Check if all cards are found and combo is completed
          if (result.isCompleted && result.reward) {
            setComboReward(result.reward)
            // We'll show the combo completed popup after the card found popup is closed
          }
        }
      }

      // Update all cards state with the updated card
      setAllCards((prevAllCards) => {
        const updatedCards = { ...prevAllCards }

        // Find and update the card in its category
        if (updatedCards[selectedCard.category]) {
          updatedCards[selectedCard.category] = updatedCards[selectedCard.category].map((c) =>
            c.id === selectedCard.id
              ? {
                  ...c,
                  level: newLevel,
                  hourlyIncome: newHourlyIncome,
                  upgradeCost: newUpgradeCost,
                }
              : c,
          )
        }

        return updatedCards
      })

      // Refresh user data in context to update hourly earnings
      await refreshUserData()

      // Show success popup
      setSuccessMessage(
        `${selectedCard.name} is now level ${newLevel}! Hourly income increased to ${newHourlyIncome}/hour.`,
      )
      setSelectedCard(null)
      setShowSuccessPopup(true)
    } catch (error) {
      console.error("Error upgrading item:", error)
    } finally {
      setUpgradeInProgress(false)
    }
  }, [
    userId,
    selectedCard,
    upgradeInProgress,
    coins,
    updateCoins,
    refreshUserData,
    dailyCombo,
    findComboCard,
    updateUserHourlyEarnings,
  ])

  const toggleSortOptions = useCallback(() => {
    setShowSortOptions((prev) => !prev)
  }, [])

  const handleSort = useCallback((option: "level" | "income" | "cost") => {
    setSortOption((prevOption) => {
      if (prevOption === option) {
        // Toggle direction if same option
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"))
        return prevOption
      } else {
        // Set new option with default desc direction
        setSortDirection("desc")
        return option
      }
    })
    setShowSortOptions(false)
  }, [])

  const getSortIcon = useCallback(
    (option: "level" | "income" | "cost") => {
      if (sortOption !== option) return null
      return sortDirection === "asc" ? (
        <FontAwesomeIcon icon={icons.chevronUp} className="ml-1 text-xs" />
      ) : (
        <FontAwesomeIcon icon={icons.chevronDown} className="ml-1 text-xs" />
      )
    },
    [sortOption, sortDirection],
  )

  const closeSuccessPopup = useCallback(() => {
    setShowSuccessPopup(false)
  }, [])

  const closeCardFoundPopup = useCallback(() => {
    setShowCardFoundPopup(false)

    // Check if we should show the combo completed popup
    if (comboReward > 0) {
      setTimeout(() => {
        setShowComboCompletedPopup(true)
      }, 300)
    }
  }, [comboReward])

  const closeComboCompletedPopup = useCallback(() => {
    setShowComboCompletedPopup(false)
    setComboReward(0)
  }, [])

  if (isLoading || userLoading) {
    return <SkeletonLoading />
  }

  return (
    <main className="min-h-screen bg-[#111827] text-white pb-24">
      <HeaderCard coins={coins} league={league} />

      {/* Daily Combo Section */}
      <div className="px-4 mb-4">
        <TimeBar />
      </div>

      {/* Category Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-[#1f2937] rounded-full flex justify-between">
          {categories.map((category) => (
            <button
              key={category}
              className={`flex-1 py-3 text-center text-sm ${
                activeCategory === category ? "text-white font-medium" : "text-gray-400"
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Card Grid - New Design */}
      <div className="px-4 mb-20">
        <div className="max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
          {cardList.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 pb-4">
              {cardList.map((card) => (
                <div key={card.id} className="bg-[#1f2937] rounded-xl overflow-hidden h-[240px] flex flex-col">
                  {/* Card Image */}
                  <div className="w-full h-28 overflow-hidden flex-shrink-0">
                    <img
                      src={card.image || "/placeholder-j0tzm.png"}
                      alt={card.name}
                      className="w-full h-28 object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Info */}
                  <div className="p-2 flex flex-col flex-grow">
                    <h3 className="font-bold text-white text-center mb-0.5 truncate text-sm">{card.name}</h3>
                    <div className="flex items-center justify-center mb-1">
                      <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-xs" />
                      <span className="text-yellow-400 font-bold text-sm">+{card.hourlyIncome}/Hour</span>
                    </div>
                    <div className="text-center text-gray-300 mb-1 text-xs">Level {card.level}</div>
                    <div className="mt-auto">
                      <button
                        onClick={() => handleUpgradeClick(card)}
                        disabled={coins < card.upgradeCost}
                        className={`w-full py-1.5 rounded-lg font-medium flex items-center justify-center text-sm ${
                          coins < card.upgradeCost
                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-500"
                        }`}
                      >
                        <FontAwesomeIcon icon={icons.coins} className="mr-2" />
                        <span>{card.upgradeCost.toLocaleString()}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1f2937] rounded-lg p-6 text-center">
              <FontAwesomeIcon icon={icons.search} className="text-3xl text-gray-600 mb-2" />
              <p className="text-gray-400">
                {searchTerm ? `No results found for "${searchTerm}"` : "No equipment found"}
              </p>
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="mt-2 text-yellow-500 text-sm hover:underline">
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Popup */}
      {selectedCard && (
        <UpgradePopup
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onConfirm={handleUpgradeConfirm}
          isLoading={upgradeInProgress}
        />
      )}

      {/* Success Popup */}
      {showSuccessPopup && <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />}

      {/* Card Found Popup */}
      {showCardFoundPopup && foundComboCard && <CardFoundPopup card={foundComboCard} onClose={closeCardFoundPopup} />}

      {/* Daily Combo Completed Popup */}
      {showComboCompletedPopup && comboReward > 0 && (
        <ComboCompletedPopup reward={comboReward} onClose={closeComboCompletedPopup} />
      )}

      <Navbar />
    </main>
  )
}

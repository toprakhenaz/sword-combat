"use server"

import { createServerClient } from "./supabase"

// User related actions
export async function getUserByTelegramId(telegramId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

export async function createUser(telegramId: string, username: string) {
  const supabase = createServerClient()

  // Create user with default values
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        telegram_id: telegramId,
        username,
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

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  // Create initial boosts for the user
  await supabase.from("user_boosts").insert([
    {
      user_id: data.id,
      multi_touch_level: 1,
      energy_limit_level: 1,
      charge_speed_level: 1,
      daily_rockets: 3,
      max_daily_rockets: 3,
      energy_full_used: false,
    },
  ])

  // Create initial daily combo
  await getOrCreateDailyCombo(data.id)

  return data
}

export async function getOrCreateUser(telegramId: string, username: string) {
  let user = await getUserByTelegramId(telegramId)

  if (!user) {
    user = await createUser(telegramId, username)
  }

  return user
}

// getOrCreateDailyCombo fonksiyonunu değiştir (satır 1070-1150 civarı)
export async function getOrCreateDailyCombo(userId?: string) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    // Get or create global daily combo for today
    let { data: globalCombo, error: globalError } = await supabase
      .from("global_daily_combo")
      .select("*")
      .eq("combo_date", today)
      .single()

    if (globalError && globalError.code === "PGRST116") {
      // Create new global combo
      const { data: items } = await supabase.from("items").select("id")

      const validCardIds = items ? items.map((item) => item.id) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

      // Select 3 random cards
      const selectedCardIds: number[] = []
      const tempIds = [...validCardIds]

      for (let i = 0; i < 3 && tempIds.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * tempIds.length)
        selectedCardIds.push(tempIds[randomIndex])
        tempIds.splice(randomIndex, 1)
      }

      const { data: newCombo, error: createError } = await supabase
        .from("global_daily_combo")
        .insert([
          {
            combo_date: today,
            card_ids: selectedCardIds,
            reward: 100000,
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Error creating global daily combo:", createError)
        return null
      }

      globalCombo = newCombo
    }

    if (!globalCombo) return null

    // If userId provided, get user's progress
    if (userId) {
      const { data: userProgress } = await supabase
        .from("user_daily_combo_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("combo_date", today)
        .single()

      return {
        card_ids: globalCombo.card_ids,
        found_card_ids: userProgress?.found_card_ids || [],
        reward: globalCombo.reward,
        is_completed: userProgress?.is_completed || false,
      }
    }

    return {
      card_ids: globalCombo.card_ids,
      found_card_ids: [],
      reward: globalCombo.reward,
      is_completed: false,
    }
  } catch (error) {
    console.error("Error in getOrCreateDailyCombo:", error)
    return null
  }
}

// Task'ları veritabanından çek
export async function getAllTasks() {
  const supabase = createServerClient()

  const { data: tasks, error } = await supabase.from("tasks").select("*").order("id", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return tasks
}

// Cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached) return null

  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }

  return cached.data as T
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

// Optimized getAllItems with caching
export interface Item {
  id: number
  name: string
  image: string
  base_hourly_income: number
  base_upgrade_cost: number
}

export async function getAllItems() {
  const cacheKey = "all_items"
  const cached = getCached<Item[]>(cacheKey)
  if (cached) return cached

  const supabase = createServerClient()

  const { data: items, error } = await supabase.from("items").select("*").order("id", { ascending: true })

  if (error) {
    console.error("Error fetching items:", error)
    return []
  }

  setCache(cacheKey, items)
  return items
}

// Batch coin updates
export async function batchUpdateCoins(
  updates: Array<{
    userId: string
    amount: number
    type: string
    description: string
  }>,
) {
  const supabase = createServerClient()

  // Group by user
  const userUpdates = updates.reduce(
    (acc, update) => {
      if (!acc[update.userId]) {
        acc[update.userId] = { total: 0, transactions: [] }
      }
      acc[update.userId].total += update.amount
      acc[update.userId].transactions.push({
        amount: update.amount,
        type: update.type,
        description: update.description,
      })
      return acc
    },
    {} as Record<string, { total: number; transactions: any[] }>,
  )

  // Execute batch updates
  const promises = Object.entries(userUpdates).map(async ([userId, data]) => {
    const { error } = await supabase
      .from("users")
      .update({
        coins: supabase.raw(`coins + ${data.total}`),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (!error) {
      // Log transactions
      await supabase.from("coin_transactions").insert(
        data.transactions.map((t) => ({
          user_id: userId,
          amount: t.amount,
          transaction_type: t.type,
          description: t.description,
        })),
      )
    }

    return { userId, error }
  })

  return Promise.all(promises)
}

// updateUserCoins fonksiyonunu güncelle - daha detaylı log ekle
export async function updateUserCoins(userId: string, amount: number, transactionType: string, description?: string) {
  const supabase = createServerClient()

  console.log(`[updateUserCoins] Starting update - userId: ${userId}, amount: ${amount}, type: ${transactionType}`)

  try {
    // Get current user coins
    const { data: userData, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

    if (userError) {
      console.error("[updateUserCoins] Error fetching user:", userError)
      return null
    }

    // coins değerini number olarak al
    const currentCoins = Number(userData.coins) || 0
    console.log(`[updateUserCoins] Current coins: ${currentCoins}`)

    // Yeni coin miktarını hesapla ve tam sayıya yuvarla
    const newCoins = Math.floor(Math.max(0, currentCoins + amount))
    console.log(`[updateUserCoins] New coins will be: ${newCoins}`)

    const { error: updateError } = await supabase
      .from("users")
      .update({
        coins: newCoins,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      // Rate limit kontrolü
      if (updateError.message && updateError.message.includes("Too Many Requests")) {
        console.warn("[updateUserCoins] Rate limit hit. Using local value.")
        return null
      }

      console.error("[updateUserCoins] Error updating user coins:", updateError)
      return null
    }

    console.log(`[updateUserCoins] Successfully updated coins to: ${newCoins}`)

    // Transaction kaydı - opsiyonel
    try {
      await supabase.from("coin_transactions").insert([
        {
          user_id: userId,
          amount,
          transaction_type: transactionType,
          description: description || transactionType,
        },
      ])
      console.log(`[updateUserCoins] Transaction logged successfully`)
    } catch (transactionError) {
      console.error("[updateUserCoins] Error logging coin transaction:", transactionError)
    }

    return newCoins
  } catch (error) {
    if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
      console.warn("[updateUserCoins] Rate limit hit (JSON parse error). Using local value.")
      return null
    }

    console.error("[updateUserCoins] Error in updateUserCoins:", error)
    throw error
  }
}

// updateUserEnergy fonksiyonunu güncelle (satır 175 civarı):
export async function updateUserEnergy(userId: string, amount: number) {
  const supabase = createServerClient()
  try {
    // First, get current energy
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("energy, max_energy")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user energy:", userError)
      return null
    }

    // Calculate new energy (never below 0 or above max)
    const newEnergy = Math.max(0, Math.min(userData.max_energy, userData.energy + amount))

    const { error: updateError } = await supabase
      .from("users")
      .update({
        energy: newEnergy,
      })
      .eq("id", userId)

    if (updateError) {
      // Check if this is a rate limit error
      if (updateError.message && updateError.message.includes("Too Many Requests")) {
        console.warn("Rate limit hit when updating energy. Using local value.")
        return null // Return null to indicate rate limiting
      }

      console.error("Error updating user energy:", updateError)
      return null
    }

    return newEnergy
  } catch (error) {
    // Handle JSON parsing errors that occur with rate limiting
    if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
      console.warn("Rate limit hit when updating energy (JSON parse error). Using local value.")
      return null // Return null to indicate rate limiting
    }

    console.error("Error in updateUserEnergy:", error)
    throw error
  }
}

// upgradeBoost fonksiyonunu güncelle
// Upgrade boost function
export async function upgradeBoost(userId: string, boostType: string) {
  try {
    const supabase = createServerClient()
    console.log(`Upgrading ${boostType} for user ${userId}`)

    // First, check if user has a boost record
    const { data: userBoost, error: fetchError } = await supabase.from("user_boosts").select("*").eq("user_id", userId)

    if (fetchError) {
      console.error("Error fetching user boosts:", fetchError)
      return { success: false, message: "Failed to fetch user boosts" }
    }

    // If no boost record exists, create one
    if (!userBoost || userBoost.length === 0) {
      console.log("No boost record found, creating one...")
      const { error: insertError } = await supabase.from("user_boosts").insert([
        {
          user_id: userId,
          multi_touch_level: 1,
          energy_limit_level: 1,
          charge_speed_level: 1,
          daily_rockets: 3,
          max_daily_rockets: 3,
          energy_full_used: false,
        },
      ])

      if (insertError) {
        console.error("Error creating user boosts:", insertError)
        return { success: false, message: "Failed to create user boosts" }
      }

      // Fetch the newly created boost record
      const { data: newBoost, error: newFetchError } = await supabase
        .from("user_boosts")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (newFetchError || !newBoost) {
        console.error("Error fetching new user boosts:", newFetchError)
        return { success: false, message: "Failed to fetch new user boosts" }
      }

      const userBoost = [newBoost]
    }

    // Get the first boost record (there should be only one, but just in case)
    const boost = userBoost[0]

    // Determine which field to update based on boostType
    let fieldToUpdate = ""
    let currentLevel = 1

    if (boostType === "multiTouch") {
      fieldToUpdate = "multi_touch_level"
      currentLevel = boost.multi_touch_level
    } else if (boostType === "energyLimit") {
      fieldToUpdate = "energy_limit_level"
      currentLevel = boost.energy_limit_level
    } else if (boostType === "chargeSpeed") {
      fieldToUpdate = "charge_speed_level"
      currentLevel = boost.charge_speed_level
    } else {
      return { success: false, message: "Invalid boost type" }
    }

    // Check if boost is already at max level (3)
    if (currentLevel >= 3) {
      return { success: false, message: "Boost is already at maximum level" }
    }

    // Calculate new level and cost
    const newLevel = currentLevel + 1
    const cost = Math.floor(2000 * Math.pow(1.5, currentLevel - 1))

    // Get user's current coins
    const { data: user, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

    if (userError || !user) {
      console.error("Error fetching user:", userError)
      return { success: false, message: "Failed to fetch user" }
    }

    // Check if user has enough coins
    if (user.coins < cost) {
      return { success: false, message: "Not enough coins" }
    }

    // Begin transaction
    // 1. Update boost level
    const { error: updateBoostError } = await supabase
      .from("user_boosts")
      .update({ [fieldToUpdate]: newLevel })
      .eq("user_id", userId)

    if (updateBoostError) {
      console.error("Error updating boost:", updateBoostError)
      return { success: false, message: "Failed to update boost" }
    }

    // 2. Deduct coins from user
    const { error: updateCoinsError } = await supabase
      .from("users")
      .update({ coins: user.coins - cost })
      .eq("id", userId)

    if (updateCoinsError) {
      console.error("Error updating coins:", updateCoinsError)
      // Try to rollback boost update
      await supabase
        .from("user_boosts")
        .update({ [fieldToUpdate]: currentLevel })
        .eq("user_id", userId)
      return { success: false, message: "Failed to update coins" }
    }

    // 3. Record transaction - Use coin_transactions table instead of transactions
    const { error: transactionError } = await supabase.from("coin_transactions").insert([
      {
        user_id: userId,
        amount: -cost,
        transaction_type: "boost_upgrade",
        description: `Upgraded ${boostType} to level ${newLevel}`,
      },
    ])

    if (transactionError) {
      console.error("Error recording transaction:", {
        error: transactionError,
        message: transactionError.message,
        details: transactionError.details,
        hint: transactionError.hint,
        code: transactionError.code,
      })
      // Transaction record failed, but boost upgrade succeeded
      // We'll still return success since the core functionality worked
    }

    // 4. Update user's earn_per_tap or max_energy if needed
    if (boostType === "multiTouch") {
      const { error: updateEarnError } = await supabase
        .from("users")
        .update({
          earn_per_tap: 1 + (newLevel - 1) * 2,
        })
        .eq("id", userId)

      if (updateEarnError) {
        console.error("Error updating earn_per_tap:", updateEarnError)
      }
    }

    if (boostType === "energyLimit") {
      const { error: updateEnergyError } = await supabase
        .from("users")
        .update({
          max_energy: 100 + (newLevel - 1) * 500,
        })
        .eq("id", userId)

      if (updateEnergyError) {
        console.error("Error updating max_energy:", updateEnergyError)
      }
    }

    return {
      success: true,
      message: `Successfully upgraded ${boostType} to level ${newLevel}`,
      newLevel,
      cost,
    }
  } catch (error) {
    console.error("Unexpected error in upgradeBoost:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function useRocketBoost(userId: string) {
  const supabase = createServerClient()

  // Get user boosts
  const { data: boost, error: boostError } = await supabase
    .from("user_boosts")
    .select("daily_rockets")
    .eq("user_id", userId)
    .single()

  if (boostError) {
    console.error("Error fetching user boosts:", boostError)
    return { success: false, message: "Boosts not found" }
  }

  // Check if user has rockets left
  if (boost.daily_rockets <= 0) {
    return { success: false, message: "No rockets left" }
  }

  // Update rockets count
  const { error: updateError } = await supabase
    .from("user_boosts")
    .update({
      daily_rockets: boost.daily_rockets - 1,
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("Error using rocket:", updateError)
    return { success: false, message: "Error using rocket" }
  }

  // Add energy to user
  await updateUserEnergy(userId, 500)

  return { success: true, rocketsLeft: boost.daily_rockets - 1 }
}

export async function useFullEnergyBoost(userId: string) {
  const supabase = createServerClient()

  // Get user boosts
  const { data: boost, error: boostError } = await supabase
    .from("user_boosts")
    .select("energy_full_used")
    .eq("user_id", userId)
    .single()

  if (boostError) {
    console.error("Error fetching user boosts:", boostError)
    return { success: false, message: "Boosts not found" }
  }

  // Check if user has already used full energy today
  if (boost.energy_full_used) {
    return { success: false, message: "Full energy already used today" }
  }

  // Update energy_full_used
  const { error: updateError } = await supabase
    .from("user_boosts")
    .update({
      energy_full_used: true,
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("Error using full energy:", updateError)
    return { success: false, message: "Error using full energy" }
  }

  // Get user's max energy
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("energy, max_energy")
    .eq("id", userId)
    .single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return { success: false, message: "User not found" }
  }

  // Fill user's energy to max
  await updateUserEnergy(userId, user.max_energy - user.energy)

  return { success: true }
}

// Kullanıcının saatlik kazancını dinamik olarak hesapla (item ve boost'lar dahil)
export async function calculateUserHourlyIncome(userId: string) {
  const supabase = createServerClient()

  // Kullanıcının item'larını al
  const { data: userItems, error: itemsError } = await supabase
    .from("user_items")
    .select("hourly_income")
    .eq("user_id", userId)

  if (itemsError) {
    console.error("Error fetching user items for hourly income:", itemsError)
    return 0
  }

  // Toplam item kazancı
  let totalIncome = userItems.reduce((sum, item) => sum + (item.hourly_income || 0), 0)

  // Boost çarpanı uygula (örnek: multi_touch_level her seviye %5 bonus)
  const { data: boosts } = await supabase.from("user_boosts").select("multi_touch_level").eq("user_id", userId).single()

  if (boosts && boosts.multi_touch_level) {
    const multiplier = 1 + (boosts.multi_touch_level - 1) * 0.05 // Her seviye %5 bonus
    totalIncome = Math.floor(totalIncome * multiplier)
  }

  return totalIncome
}

export async function collectHourlyEarnings(userId: string) {
  const supabase = createServerClient()

  // Kullanıcıyı al
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("last_hourly_collect")
    .eq("id", userId)
    .single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return { success: false, message: "User not found" }
  }

  const now = new Date()
  const lastCollect = new Date(user.last_hourly_collect)
  const hoursPassed = (now.getTime() - lastCollect.getTime()) / (1000 * 60 * 60)

  // En az 1 saat geçmiş mi?
  if (hoursPassed < 1) {
    console.log(
      `[collectHourlyEarnings] userId=${userId} <1 saat, kazanç yok, timeLeft=${60 - Math.floor(hoursPassed * 60)}`,
    )
    return {
      success: false,
      message: "Not enough time has passed",
      timeLeft: 60 - Math.floor(hoursPassed * 60),
    }
  }

  // Saatlik kazancı dinamik hesapla
  const hourlyIncome = await calculateUserHourlyIncome(userId)
  const hoursToCount = Math.min(hoursPassed, 24)
  const coinsToCollect = Math.floor(hourlyIncome * hoursToCount)

  // Son toplama zamanını güncelle
  const { error: updateError } = await supabase
    .from("users")
    .update({ last_hourly_collect: now.toISOString() })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating last collect time:", updateError)
    return { success: false, message: "Error updating last collect time" }
  }

  // Kazancı ekle
  await updateUserCoins(
    userId,
    coinsToCollect,
    "hourly_earnings",
    `Collected ${hoursToCount.toFixed(1)} hours of earnings (Hamster Kombat style)`,
  )

  console.log(
    `[collectHourlyEarnings] userId=${userId} kazanç=${coinsToCollect}, saatlik=${hourlyIncome}, hours=${hoursToCount}`,
  )

  return { success: true, coins: coinsToCollect, hours: hoursToCount, hourlyIncome }
}

// Item related actions
export async function getUserItems(userId: string) {
  const supabase = createServerClient()
  try {
    const { data, error } = await supabase
      .from("user_items")
      .select(`
      *,
      items (*)
    `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching user items:", error)
      return []
    }

    return data
  } catch (error) {
    console.error("Error in getUserItems:", error)
    return []
  }
}

// Calculate and update user's total hourly earn
export async function updateUserHourlyEarn(userId: string) {
  const supabase = createServerClient()

  try {
    // Get all user items
    const { data: userItems, error: itemsError } = await supabase
      .from("user_items")
      .select("hourly_income")
      .eq("user_id", userId)

    if (itemsError) {
      console.error("Error fetching user items:", itemsError)
      return 0
    }

    // Calculate total hourly earn
    const totalHourlyEarn = userItems.reduce((total, item) => total + item.hourly_income, 0)

    // Update user
    const { error: updateError } = await supabase
      .from("users")
      .update({ hourly_earn: totalHourlyEarn, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating hourly earn:", updateError)
    }

    return totalHourlyEarn
  } catch (error) {
    console.error("Error in updateUserHourlyEarn:", error)
    return 0
  }
}

export async function upgradeItem(userId: string, itemId: number) {
  const supabase = createServerClient()

  try {
    // Get user and item details
    const { data: userItem, error: itemError } = await supabase
      .from("user_items")
      .select("*")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .single()

    // If user doesn't have this item yet, create it
    if (itemError) {
      // Get base item details
      const { data: baseItem, error: baseItemError } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single()

      if (baseItemError) {
        console.error("Error fetching base item:", baseItemError)
        return { success: false, message: "Item not found" }
      }

      // Get user coins
      const { data: user, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

      if (userError) {
        console.error("Error fetching user:", userError)
        return { success: false, message: "User not found" }
      }

      // Check if user has enough coins
      if (user.coins < baseItem.base_upgrade_cost) {
        return { success: false, message: "Not enough coins" }
      }

      // Create user item
      const { data: newUserItem, error: createError } = await supabase
        .from("user_items")
        .insert([
          {
            user_id: userId,
            item_id: itemId,
            level: 1,
            hourly_income: baseItem.base_hourly_income,
            upgrade_cost: baseItem.base_upgrade_cost,
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Error creating user item:", createError)
        return { success: false, message: "Error creating item" }
      }

      // Deduct coins from user
      await updateUserCoins(userId, -baseItem.base_upgrade_cost, "item_purchase", `Purchased item ${itemId}`)

      // Update user hourly earn
      const newHourlyEarn = await updateUserHourlyEarn(userId)

      return {
        success: true,
        level: 1,
        hourlyIncome: baseItem.base_hourly_income,
        upgradeCost: baseItem.base_upgrade_cost * 2,
        hourlyEarn: newHourlyEarn,
      }
    }

    // User already has this item, upgrade it
    const { data: user, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return { success: false, message: "User not found" }
    }

    // Check if user has enough coins
    if (user.coins < userItem.upgrade_cost) {
      return { success: false, message: "Not enough coins" }
    }

    // Calculate new values
    const newLevel = userItem.level + 1
    const newHourlyIncome = Math.floor(userItem.hourly_income * 1.5)
    const newUpgradeCost = Math.floor(userItem.upgrade_cost * 2)

    // Update user item
    const { error: updateError } = await supabase
      .from("user_items")
      .update({
        level: newLevel,
        hourly_income: newHourlyIncome,
        upgrade_cost: newUpgradeCost,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userItem.id)

    if (updateError) {
      console.error("Error upgrading item:", updateError)
      return { success: false, message: "Error upgrading item" }
    }

    // Deduct coins from user
    await updateUserCoins(
      userId,
      -userItem.upgrade_cost,
      "item_upgrade",
      `Upgraded item ${itemId} to level ${newLevel}`,
    )

    // Update user hourly earn and return the new value
    const newHourlyEarn = await updateUserHourlyEarn(userId)

    return {
      success: true,
      level: newLevel,
      hourlyIncome: newHourlyIncome,
      upgradeCost: newUpgradeCost,
      hourlyEarn: newHourlyEarn,
    }
  } catch (error) {
    console.error("Error in upgradeItem:", error)
    return { success: false, message: "An error occurred while upgrading the item" }
  }
}

// Task related actions
export async function getUserTasks(userId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("user_tasks")
    .select(`
    *,
    tasks (*)
  `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching user tasks:", error)
    return []
  }

  return data
}

export async function startTask(userId: string, taskId: number, taskUrl?: string) {
  const supabase = createServerClient()

  // Check if user task exists
  const { data: existingTask, error: checkError } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Error checking task:", checkError)
    return { success: false, message: "Error checking task" }
  }

  if (existingTask) {
    // Task exists, update progress
    const newProgress = Math.min(100, existingTask.progress + 50)

    const { error: updateError } = await supabase
      .from("user_tasks")
      .update({
        progress: newProgress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingTask.id)

    if (updateError) {
      console.error("Error updating task:", updateError)
      return { success: false, message: "Error updating task" }
    }

    return { success: true, progress: newProgress, userTaskId: existingTask.id, url: taskUrl }
  } else {
    // Create new user task
    const { data: newTask, error: createError } = await supabase
      .from("user_tasks")
      .insert([
        {
          user_id: userId,
          task_id: taskId,
          progress: 50,
        },
      ])
      .select()
      .single()

    if (createError) {
      console.error("Error creating task:", createError)
      return { success: false, message: "Error creating task" }
    }

    return { success: true, progress: 50, userTaskId: newTask.id, url: taskUrl }
  }
}

export async function completeTask(userId: string, taskId: number) {
  const supabase = createServerClient()

  // Get user task
  const { data: userTask, error: taskError } = await supabase
    .from("user_tasks")
    .select("*, tasks (reward)")
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .single()

  if (taskError || !userTask) {
    // Kayıt yoksa, hata döndür
    return { success: false, message: "Görev başlatılmadan tamamlanamaz." }
  }

  // Zaten tamamlandıysa
  if (userTask.is_completed) {
    return { success: false, message: "Task already completed" }
  }

  // Progress 100 değilse
  if (userTask.progress < 100) {
    return { success: false, message: "Görev tamamlanmaya hazır değil. Lütfen önce görevi başlat." }
  }

  // Tamamla ve ödül ver
  const { error: updateError } = await supabase
    .from("user_tasks")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", userTask.id)

  if (updateError) {
    return { success: false, message: "Error completing task" }
  }

  const reward = userTask.tasks.reward
  await updateUserCoins(userId, reward, "task_reward", `Completed task ${taskId}`)

  return { success: true, reward }
}

// Daily rewards actions
export async function getUserDailyRewards(userId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("user_daily_rewards")
    .select(`
    *,
    daily_rewards (*)
  `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching user daily rewards:", error)
    return []
  }

  return data
}

// Boost related actions
export async function getUserBoosts(userId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("user_boosts").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching user boosts:", error)
    return null
  }

  return data
}

// Referral system
export async function createReferral(referrerId: string, referredId: string) {
  const supabase = createServerClient()

  // Check if referral already exists
  const { data: existingReferral, error: checkError } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", referrerId)
    .eq("referred_id", referredId)
    .single()

  if (!checkError && existingReferral) {
    return { success: false, message: "Referral already exists" }
  }

  // Create referral
  const { error: createError } = await supabase.from("referrals").insert([
    {
      referrer_id: referrerId,
      referred_id: referredId,
      reward_amount: 100000,
      is_claimed: false,
    },
  ])

  if (createError) {
    console.error("Error creating referral:", createError)
    return { success: false, message: "Error creating referral" }
  }

  return { success: true }
}

export async function claimReferralReward(userId: string, referralId: string) {
  const supabase = createServerClient()

  // Get referral details
  const { data: referral, error: referralError } = await supabase
    .from("referrals")
    .select("*")
    .eq("id", referralId)
    .eq("referrer_id", userId)
    .single()

  if (referralError) {
    console.error("Error fetching referral:", referralError)
    return { success: false, message: "Referral not found" }
  }

  // Check if already claimed
  if (referral.is_claimed) {
    return { success: false, message: "Reward already claimed" }
  }

  // Update referral
  const { error: updateError } = await supabase
    .from("referrals")
    .update({
      is_claimed: true,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", referralId)

  if (updateError) {
    console.error("Error claiming referral:", updateError)
    return { success: false, message: "Error claiming referral" }
  }

  // Add coins to user
  await updateUserCoins(userId, referral.reward_amount, "referral_reward", `Claimed referral reward`)

  return { success: true, reward: referral.reward_amount }
}

// Reset daily boosts
export async function resetDailyBoosts() {
  const supabase = createServerClient()

  // Reset all users' daily rockets and energy_full_used
  const { error } = await supabase.from("user_boosts").update({
    daily_rockets: 3,
    energy_full_used: false,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error resetting daily boosts:", error)
    return { success: false }
  }

  return { success: true }
}

// Add these new functions for the daily combo system

// Get user's daily combo
export async function getUserDailyCombo(userId: string) {
  return getOrCreateDailyCombo(userId)
}

// findDailyComboCard fonksiyonunu güncelle (satır 1200 civarı)
export async function findDailyComboCard(userId: string, cardIndex: number) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    // Get global combo
    const { data: globalCombo } = await supabase.from("global_daily_combo").select("*").eq("combo_date", today).single()

    if (!globalCombo) {
      return { success: false, message: "Daily combo not found" }
    }

    const cardId = globalCombo.card_ids[cardIndex]

    // Get or create user progress
    let { data: userProgress } = await supabase
      .from("user_daily_combo_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("combo_date", today)
      .single()

    if (!userProgress) {
      // Create new progress
      const { data: newProgress } = await supabase
        .from("user_daily_combo_progress")
        .insert([
          {
            user_id: userId,
            combo_date: today,
            found_card_ids: [],
          },
        ])
        .select()
        .single()

      userProgress = newProgress
    }

    if (!userProgress) {
      return { success: false, message: "Failed to create progress" }
    }

    // Check if already found
    if (userProgress.found_card_ids.includes(cardId)) {
      return {
        success: false,
        message: "Card already found",
        cardId,
        foundCardIds: userProgress.found_card_ids,
        isCompleted: userProgress.is_completed,
      }
    }

    // Add to found cards
    const newFoundCards = [...userProgress.found_card_ids, cardId]
    const isCompleted = newFoundCards.length === globalCombo.card_ids.length

    // Update progress
    const { error: updateError } = await supabase
      .from("user_daily_combo_progress")
      .update({
        found_card_ids: newFoundCards,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq("id", userProgress.id)

    if (updateError) {
      console.error("Error updating progress:", updateError)
      return { success: false, message: "Error updating progress" }
    }

    // Give reward if completed
    if (isCompleted) {
      await updateUserCoins(userId, globalCombo.reward, "daily_combo", "Completed daily combo")
    }

    return {
      success: true,
      cardId,
      foundCardIds: newFoundCards,
      isCompleted,
      reward: isCompleted ? globalCombo.reward : 0,
    }
  } catch (error) {
    console.error("Error in findDailyComboCard:", error)
    return { success: false, message: "An error occurred" }
  }
}

// Get token listing countdown date
export async function getTokenListingDate() {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.from("app_settings").select("value").eq("key", "token_listing_date").single()

    if (error) {
      console.error("Error fetching token listing date:", error)

      // Return a default date (3 months from now) if there's an error
      const defaultDate = new Date()
      defaultDate.setMonth(defaultDate.getMonth() + 3)
      return { date: defaultDate.toISOString() }
    }

    return { date: data.value }
  } catch (error) {
    console.error("Error in getTokenListingDate:", error)

    // Return a default date (3 months from now) if there's an error
    const defaultDate = new Date()
    defaultDate.setMonth(defaultDate.getMonth() + 3)
    return { date: defaultDate.toISOString() }
  }
}

export async function getUserDailyStreak(userId: string) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    // Check if user has claimed today's reward
    const { data: todayReward, error: todayError } = await supabase
      .from("user_daily_rewards")
      .select("*")
      .eq("user_id", userId)
      .eq("claimed_at::date", today)
      .maybeSingle()

    const canCheckIn = !todayReward

    // Get user's streak by counting consecutive days
    const { data: recentRewards, error: recentError } = await supabase
      .from("user_daily_rewards")
      .select("claimed_at")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(30)

    if (recentError) {
      console.error("Error fetching recent rewards:", recentError)
      return { streak: 0, canCheckIn: true, lastCheckIn: null, reward: 500 }
    }

    // Calculate streak based on consecutive days
    let streak = 0
    if (recentRewards && recentRewards.length > 0) {
      // Create a Set of unique dates (YYYY-MM-DD format)
      const uniqueDates = new Set(
        recentRewards.map((reward) => new Date(reward.claimed_at).toISOString().split("T")[0]),
      )

      // Convert to array and sort in descending order
      const sortedDates = Array.from(uniqueDates).sort().reverse()

      // Start with the most recent day
      if (sortedDates.length > 0) {
        let lastDate = new Date(sortedDates[0])
        streak = 1 // Start with 1 for the most recent day

        // Check for consecutive days
        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i])
          const dayDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

          // If the difference is 1 day, increment streak
          if (dayDiff === 1) {
            streak++
            lastDate = currentDate
          } else {
            // Break the streak if not consecutive
            break
          }
        }
      }
    }

    // Get the reward for the current streak day
    const nextStreakDay = (streak % 7) + 1
    const { data: rewardData } = await supabase
      .from("daily_rewards")
      .select("reward")
      .eq("day", nextStreakDay)
      .maybeSingle()

    // Default rewards if daily_rewards table doesn't exist
    const defaultRewards = [
      { day: 1, reward: 100 },
      { day: 2, reward: 200 },
      { day: 3, reward: 300 },
      { day: 4, reward: 400 },
      { day: 5, reward: 500 },
      { day: 6, reward: 600 },
      { day: 7, reward: 2000 },
    ]

    // Use default reward if table doesn't exist
    const reward = rewardData?.reward || defaultRewards.find((r) => r.day === nextStreakDay)?.reward || 500

    return {
      streak,
      canCheckIn,
      lastCheckIn: recentRewards && recentRewards.length > 0 ? new Date(recentRewards[0].claimed_at) : null,
      reward,
    }
  } catch (error) {
    console.error("Error in getUserDailyStreak:", error)
    return { streak: 0, canCheckIn: true, lastCheckIn: null, reward: 500 }
  }
}

// claimDailyReward fonksiyonunu tamamen değiştir (satır 1100 civarı):
export async function claimDailyReward(userId: string) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    // Aynı gün için zaten kayıt var mı kontrol et
    const { data: todayReward } = await supabase
      .from("user_daily_rewards")
      .select("*")
      .eq("user_id", userId)
      .eq("day_date", today)
      .maybeSingle()

    if (todayReward) {
      return { success: false, message: "Already claimed today's reward" }
    }

    // Get user's current streak
    const { streak } = await getUserDailyStreak(userId)

    // New streak will be current streak + 1
    const newStreak = streak + 1

    // Calculate which day of the week (1-7) this is
    const streakDay = ((newStreak - 1) % 7) + 1

    // Get the reward amount from daily_rewards table
    const { data: rewardData } = await supabase
      .from("daily_rewards")
      .select("reward")
      .eq("day", streakDay)
      .maybeSingle()

    const rewardAmount = rewardData?.reward || 500

    // Insert new record with day_date value
    const { error: insertError } = await supabase.from("user_daily_rewards").insert([
      {
        user_id: userId,
        day: streakDay,
        reward: rewardAmount,
        claimed: true,
        claimed_at: new Date().toISOString(),
        day_date: today,
      },
    ])

    if (insertError) {
      console.error("Error recording reward claim:", insertError)
      return { success: false, message: "Error recording reward claim" }
    }

    // Update user's streak and last claim date
    const { error: updateError } = await supabase
      .from("users")
      .update({
        daily_streak: newStreak,
        last_daily_claim: today,
        last_daily_claimed: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating user streak:", updateError)
    }

    // Add coins to user
    await updateUserCoins(userId, rewardAmount, "daily_reward", `Day ${streakDay} streak reward`)

    return {
      success: true,
      reward: rewardAmount,
      streak: newStreak,
      streakDay,
    }
  } catch (error) {
    console.error("Error claiming daily reward:", error)
    return { success: false, message: "Error processing reward claim" }
  }
}

// Get tasks with their URLs
export async function getTasksWithUrls() {
  const supabase = createServerClient()

  // Get tasks from database
  const { data: tasks, error } = await supabase.from("tasks").select("*").order("id", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return tasks
}

export async function checkAndUpdateUserLeague(userId: string) {
  const supabase = createServerClient()

  try {
    // Get user
    const { data: user } = await supabase.from("users").select("coins, league").eq("id", userId).single()

    if (!user) return

    // Get leagues from StaticLeagues instead of database
    const leagues = [
      { id: 1, coin_requirement: 0 }, // Wooden
      { id: 2, coin_requirement: 10000 }, // Bronze
      { id: 3, coin_requirement: 100000 }, // Iron
      { id: 4, coin_requirement: 1000000 }, // Steel
      { id: 5, coin_requirement: 10000000 }, // Adamantite
      { id: 6, coin_requirement: 100000000 }, // Legendary
      { id: 7, coin_requirement: 1000000000 }, // Dragon
    ]

    // Determine user's new league
    let newLeague = 1
    for (const league of leagues) {
      if (user.coins >= league.coin_requirement) {
        newLeague = league.id
      }
    }

    // Update if league changed
    if (newLeague !== user.league) {
      console.log(`[Server] Updating user ${userId} league from ${user.league} to ${newLeague} (coins: ${user.coins})`)
      await supabase.from("users").update({ league: newLeague }).eq("id", userId)
      return { success: true, oldLeague: user.league, newLeague }
    }

    return { success: false, message: "No league change needed" }
  } catch (error) {
    console.error("Error checking user league:", error)
    return { success: false, message: "Error checking league" }
  }
}

// Saatlik kazanç güncelleme fonksiyonu ekle (satır 500 civarına)
export async function syncHourlyEarnings(userId: string, totalHourlyCoins: number) {
  const supabase = createServerClient()

  try {
    const { error } = await supabase
      .from("users")
      .update({
        total_hourly_coins: totalHourlyCoins,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error syncing hourly earnings:", error)
      return { success: false }
    }

    console.log(`[syncHourlyEarnings] userId=${userId}, totalHourlyCoins=${totalHourlyCoins}`)
    return { success: true }
  } catch (error) {
    console.error("Error in syncHourlyEarnings:", error)
    return { success: false }
  }
}

// Her 5 saniyede coin güncelleme fonksiyonu ekle
export async function syncUserCoins(userId: string) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.from("users").select("coins, total_hourly_coins").eq("id", userId).single()

    if (error) {
      console.error("Error syncing user coins:", error)
      return null
    }

    console.log(`[syncUserCoins] userId=${userId}, coins=${data.coins}, totalHourlyCoins=${data.total_hourly_coins}`)
    return data
  } catch (error) {
    console.error("Error in syncUserCoins:", error)
    return null
  }
}

// Cards tablosundan veri çekme fonksiyonu ekle
export async function getAllCards() {
  const supabase = createServerClient()

  try {
    // "cards" tablosu yerine "items" tablosunu kullan
    const { data, error } = await supabase.from("items").select("*").order("id")

    if (error) {
      console.error("Error fetching items as cards:", error)
      return []
    }

    // items tablosundan gelen veriyi CardData formatına dönüştür
    const formattedCards = data.map((item) => ({
      id: item.id,
      name: item.name || `Item ${item.id}`,
      image: item.image || "/placeholder.svg",
      level: 1,
      hourlyIncome: item.base_hourly_income || 0,
      upgradeCost: item.base_upgrade_cost || 100,
    }))

    return formattedCards
  } catch (error) {
    console.error("Error in getAllCards:", error)
    return []
  }
}

// Leagues tablosundan veri çekme fonksiyonu ekle
export async function getAllLeagues() {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.from("leagues").select("*").order("id")

    if (error) {
      console.error("Error fetching leagues:", error)
      return []
    }

    return data
  } catch (error) {
    console.error("Error in getAllLeagues:", error)
    return []
  }
}

// getUserReferrals fonksiyonunu düzelt (satır 1400 civarı)
export async function getUserReferrals(userId: string) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from("referrals")
      .select(`
        *,
        referred:users!referrals_referred_id_fkey(id, username)
      `)
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching referrals:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getUserReferrals:", error)
    return []
  }
}

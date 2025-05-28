"use server"

import { createServerClient } from "./supabase"

export async function seedDailyRewards() {
  const supabase = createServerClient()

  // Check if daily rewards already exist
  const { data: existingRewards } = await supabase.from("daily_rewards").select("id").limit(1)

  if (existingRewards && existingRewards.length > 0) {
    console.log("Daily rewards already seeded")
    return
  }

  // Seed daily rewards
  const dailyRewards = [
    { day: 1, reward: 100 },
    { day: 2, reward: 200 },
    { day: 3, reward: 300 },
    { day: 4, reward: 400 },
    { day: 5, reward: 500 },
    { day: 6, reward: 600 },
    { day: 7, reward: 2000 },
  ]

  const { error } = await supabase.from("daily_rewards").insert(dailyRewards)

  if (error) {
    console.error("Error seeding daily rewards:", error)
  } else {
    console.log("Daily rewards seeded successfully")
  }
}

export async function seedItems() {
  const supabase = createServerClient()

  // Check if items already exist
  const { data: existingItems } = await supabase.from("items").select("id").limit(1)

  if (existingItems && existingItems.length > 0) {
    console.log("Items already seeded")
    return
  }

  // Seed items
  const items = [
    {
      name: "Wooden Sword",
      category: "Equipment",
      image: "/equipment/wooden-sword.png",
      base_hourly_income: 10,
      base_upgrade_cost: 100,
      description: "A simple wooden sword. Ideal for beginners.",
    },
    {
      name: "Iron Sword",
      category: "Equipment",
      image: "/equipment/iron-sword.png",
      base_hourly_income: 30,
      base_upgrade_cost: 300,
      description: "A durable iron sword. Suitable for mid-level adventures.",
    },
    {
      name: "Steel Sword",
      category: "Equipment",
      image: "/equipment/steel-sword.png",
      base_hourly_income: 100,
      base_upgrade_cost: 1000,
      description: "A high-quality steel sword. Ideal for fighting powerful enemies.",
    },
    {
      name: "Dragon Sword",
      category: "Equipment",
      image: "/equipment/dragon-sword.png",
      base_hourly_income: 500,
      base_upgrade_cost: 5000,
      description: "A legendary dragon sword. One of the most powerful weapons.",
    },
    {
      name: "Novice Warrior",
      category: "Workers",
      image: "/novice-warrior.png",
      base_hourly_income: 20,
      base_upgrade_cost: 200,
      description: "A beginner warrior. Helps with basic tasks.",
    },
    {
      name: "Experienced Warrior",
      category: "Workers",
      image: "/placeholder-e3etl.png",
      base_hourly_income: 60,
      base_upgrade_cost: 600,
      description: "An experienced warrior. Supports you in challenging tasks.",
    },
    {
      name: "Knight",
      category: "Workers",
      image: "/fantasy-knight.png",
      base_hourly_income: 150,
      base_upgrade_cost: 1500,
      description: "A trained knight. Provides high income and can fight powerful enemies.",
    },
    {
      name: "Magic Crystal",
      category: "Isekai",
      image: "/magic-crystal-fantasy.png",
      base_hourly_income: 50,
      base_upgrade_cost: 500,
      description: "A magical crystal. Provides passive income and increases your magic power.",
    },
    {
      name: "Soul Stone",
      category: "Isekai",
      image: "/soul-stone-fantasy.png",
      base_hourly_income: 120,
      base_upgrade_cost: 1200,
      description: "A powerful soul stone. Provides high passive income.",
    },
    {
      name: "Treasure Map",
      category: "Special",
      image: "/placeholder-o1gkq.png",
      base_hourly_income: 40,
      base_upgrade_cost: 400,
      description: "A map showing hidden treasures. Provides extra income.",
    },
    {
      name: "Golden Compass",
      category: "Special",
      image: "/golden-compass-fantasy.png",
      base_hourly_income: 90,
      base_upgrade_cost: 900,
      description: "A rare golden compass. Helps find valuable resources.",
    },
  ]

  const { error } = await supabase.from("items").insert(items)

  if (error) {
    console.error("Error seeding items:", error)
  } else {
    console.log("Items seeded successfully")
  }
}

export async function seedTasks() {
  const supabase = createServerClient()

  // Check if tasks already exist
  const { data: existingTasks } = await supabase.from("tasks").select("id").limit(1)

  if (existingTasks && existingTasks.length > 0) {
    console.log("Tasks already seeded")
    return
  }

  // Seed tasks
  const tasks = [
    {
      title: "Bitcoin News",
      description: "Read the latest Bitcoin news",
      reward: 500,
      category: "Crypto",
    },
    {
      title: "Ethereum Survey",
      description: "Complete the Ethereum survey",
      reward: 1000,
      category: "Crypto",
    },
    {
      title: "Crypto Education",
      description: "Watch the crypto education video",
      reward: 1500,
      category: "Crypto",
    },
    {
      title: "Bank Account",
      description: "Verify your bank account",
      reward: 2000,
      category: "Bank",
    },
    {
      title: "Sponsor Video",
      description: "Watch the sponsor video",
      reward: 800,
      category: "Sponsor",
    },
    {
      title: "Watch Ad",
      description: "Watch the daily ad",
      reward: 300,
      category: "Ads",
    },
  ]

  const { error } = await supabase.from("tasks").insert(tasks)

  if (error) {
    console.error("Error seeding tasks:", error)
  } else {
    console.log("Tasks seeded successfully")
  }
}

export async function seedDatabase() {
  await seedDailyRewards()
  await seedItems()
  await seedTasks()

  return { success: true }
}

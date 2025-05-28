"use server"

import { createServerClient } from "./supabase"

export async function setupDailyRewardsTable() {
  const supabase = createServerClient()

  try {
    // Check if the daily_rewards table exists
    const { data: tableExists, error: checkError } = await supabase
      .from("daily_rewards")
      .select("day")
      .limit(1)
      .maybeSingle()

    // If we got an error that's not just "no rows returned", the table might not exist
    if (checkError && checkError.code !== "PGRST116") {
      console.log("Daily rewards table might not exist, attempting to create it...")

      // Create the table (this would normally be done in a migration)
      // Note: This is just a fallback and might not work if the user doesn't have the right permissions
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS daily_rewards (
          id SERIAL PRIMARY KEY,
          day INTEGER NOT NULL UNIQUE,
          reward INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `

      // We can't execute raw SQL directly with the Supabase JS client
      // This is just a placeholder - in a real app, you'd use a migration tool
      console.log("Table creation SQL (execute manually if needed):", createTableSQL)
    }

    // Check if we need to seed the daily rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from("daily_rewards")
      .select("*")
      .order("day", { ascending: true })

    if (!rewards || rewards.length === 0) {
      // Seed the default rewards
      const defaultRewards = [
        { day: 1, reward: 100 },
        { day: 2, reward: 200 },
        { day: 3, reward: 300 },
        { day: 4, reward: 400 },
        { day: 5, reward: 500 },
        { day: 6, reward: 600 },
        { day: 7, reward: 2000 },
      ]

      // Insert the default rewards
      const { error: insertError } = await supabase.from("daily_rewards").insert(defaultRewards)

      if (insertError) {
        console.error("Error seeding daily rewards:", insertError)
        return { success: false, message: "Error seeding daily rewards" }
      }

      return { success: true, message: "Daily rewards table created and seeded" }
    }

    return { success: true, message: "Daily rewards table already exists" }
  } catch (error) {
    console.error("Error setting up daily rewards table:", error)
    return { success: false, message: "Error setting up daily rewards table" }
  }
}

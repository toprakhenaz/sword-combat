import { NextResponse } from "next/server"
import { setupDailyRewardsTable } from "@/lib/setup-daily-rewards"

export async function GET() {
  try {
    const result = await setupDailyRewardsTable()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in setup-daily-rewards API route:", error)
    return NextResponse.json({ success: false, message: "Error setting up daily rewards" }, { status: 500 })
  }
}

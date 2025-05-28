import { NextResponse } from "next/server"
import { collectHourlyEarnings } from "@/lib/db-actions"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ success: false, message: "userId is required" }, { status: 400 })
    }
    const result = await collectHourlyEarnings(userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in collect-hourly API route:", error)
    return NextResponse.json({ success: false, message: "Error collecting hourly earnings" }, { status: 500 })
  }
}

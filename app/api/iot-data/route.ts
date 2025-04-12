import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get user_id from query params
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get latest IoT data for user
    const { data, error } = await supabase
      .from("iot_data")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is the error code for no rows returned
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching IoT data:", error)
    return NextResponse.json({ error: "Failed to fetch IoT data" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await req.json()

    const { userId, heartRate, steps, temperature, sleepHours, bloodOxygen } = body

    // Insert IoT data
    const { data, error } = await supabase
      .from("iot_data")
      .insert({
        user_id: userId,
        heart_rate: heartRate,
        steps,
        temperature,
        sleep_hours: sleepHours,
        blood_oxygen: bloodOxygen,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: "IoT data recorded successfully",
    })
  } catch (error) {
    console.error("Error recording IoT data:", error)
    return NextResponse.json({ error: "Failed to record IoT data" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // For development purposes, allow requests without authentication
    // In production, you would want to uncomment this check
    /*
    // Get the current authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    */

    // If userId is not provided, try to get from query params
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("Fetching records for user ID:", userId)

    // Get health records for the user
    const { data: records, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    console.log(`Found ${records?.length || 0} records for user ${userId}`)
    return NextResponse.json({ records })
  } catch (error) {
    console.error("Error fetching health records:", error)
    return NextResponse.json({ error: "Failed to fetch health records", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // For development purposes, allow requests without authentication
    // In production, you would want to uncomment this check
    /*
    // Get the current authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    */

    const body = await request.json()
    const {
      user_id,
      userId,
      title,
      diagnosis,
      riskLevel,
      risk_level,
      summary,
      ipfsHash,
      ipfs_hash,
      ipfsUrl,
      ipfs_url,
      txHash,
      tx_hash,
      wellnessScore,
      wellness_score,
      possibleCauses,
      suggestions,
    } = body

    // Use the provided user_id or userId
    const targetUserId = user_id || userId

    if (!targetUserId || !title || !diagnosis || !(riskLevel || risk_level)) {
      return NextResponse.json({ error: "Missing required fields", body }, { status: 400 })
    }

    console.log("Creating health record with user ID:", targetUserId)

    // Insert health record
    const { data: record, error } = await supabase
      .from("health_records")
      .insert({
        user_id: targetUserId,
        title,
        diagnosis,
        risk_level: risk_level || riskLevel,
        summary,
        ipfs_hash: ipfs_hash || ipfsHash,
        ipfs_url: ipfs_url || ipfsUrl,
        tx_hash: tx_hash || txHash,
        wellness_score: wellness_score || wellnessScore,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    console.log("Record created successfully:", record)

    // Insert health record details if available
    if (record && (possibleCauses || suggestions)) {
      const { error: detailsError } = await supabase.from("health_record_details").insert({
        health_record_id: record.id,
        possible_causes: possibleCauses,
        suggestions,
      })

      if (detailsError) {
        console.error("Error inserting health record details:", detailsError)
      }
    }

    return NextResponse.json({ record, success: true })
  } catch (error) {
    console.error("Error creating health record:", error)
    return NextResponse.json({ error: "Failed to create health record", details: error.message }, { status: 500 })
  }
}

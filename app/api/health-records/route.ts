import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get health records for the user
    const { data: records, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ records })
  } catch (error) {
    console.error("Error fetching health records:", error)
    return NextResponse.json({ error: "Failed to fetch health records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const {
      userId,
      title,
      diagnosis,
      riskLevel,
      summary,
      ipfsHash,
      ipfsUrl,
      txHash,
      wellnessScore,
      possibleCauses,
      suggestions,
    } = body

    if (!userId || !title || !diagnosis || !riskLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert health record
    const { data: record, error } = await supabase
      .from("health_records")
      .insert({
        user_id: userId,
        title,
        diagnosis,
        risk_level: riskLevel,
        summary,
        ipfs_hash: ipfsHash,
        ipfs_url: ipfsUrl,
        tx_hash: txHash,
        wellness_score: wellnessScore,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

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
    return NextResponse.json({ error: "Failed to create health record" }, { status: 500 })
  }
}

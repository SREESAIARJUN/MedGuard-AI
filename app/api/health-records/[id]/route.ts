import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // Get health record
    const { data: record, error } = await supabase.from("health_records").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    // Get health record details
    const { data: details, error: detailsError } = await supabase
      .from("health_record_details")
      .select("*")
      .eq("health_record_id", id)
      .single()

    if (detailsError && detailsError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine
      console.error("Error fetching health record details:", detailsError)
    }

    return NextResponse.json({ record, details })
  } catch (error) {
    console.error("Error fetching health record:", error)
    return NextResponse.json({ error: "Failed to fetch health record" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id
    const body = await request.json()

    // Update health record
    const { data: record, error } = await supabase.from("health_records").update(body).eq("id", id).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({ record, success: true })
  } catch (error) {
    console.error("Error updating health record:", error)
    return NextResponse.json({ error: "Failed to update health record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // Delete health record (details will be deleted via cascade)
    const { error } = await supabase.from("health_records").delete().eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting health record:", error)
    return NextResponse.json({ error: "Failed to delete health record" }, { status: 500 })
  }
}

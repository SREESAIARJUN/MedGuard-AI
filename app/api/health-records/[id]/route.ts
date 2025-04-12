import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // Get the current authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get health record
    const { data: record, error } = await supabase.from("health_records").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    // Verify the record belongs to the authenticated user
    if (record.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
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

    // Get the current authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the record belongs to the authenticated user
    const { data: record, error: fetchError } = await supabase
      .from("health_records")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    if (record.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update health record
    const { data: updatedRecord, error } = await supabase
      .from("health_records")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ record: updatedRecord, success: true })
  } catch (error) {
    console.error("Error updating health record:", error)
    return NextResponse.json({ error: "Failed to update health record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // Get the current authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the record belongs to the authenticated user
    const { data: record, error: fetchError } = await supabase
      .from("health_records")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    if (record.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

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

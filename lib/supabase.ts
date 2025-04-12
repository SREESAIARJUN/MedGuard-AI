import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Supabase client for server-side operations
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ""

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Singleton pattern for client-side Supabase client
let clientSupabaseClient: ReturnType<typeof createClient<Database>> | null = null

// Supabase client for client-side operations
export const getClientSupabaseClient = () => {
  if (clientSupabaseClient) return clientSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  clientSupabaseClient = createClient<Database>(supabaseUrl, supabaseKey)
  return clientSupabaseClient
}

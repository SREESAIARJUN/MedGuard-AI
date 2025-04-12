export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wallet_address?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string | null
          email?: string | null
          created_at?: string
        }
      }
      health_records: {
        Row: {
          id: string
          user_id: string
          title: string
          diagnosis: string
          risk_level: string
          summary: string | null
          ipfs_hash: string | null
          ipfs_url: string | null
          tx_hash: string | null
          wellness_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          diagnosis: string
          risk_level: string
          summary?: string | null
          ipfs_hash?: string | null
          ipfs_url?: string | null
          tx_hash?: string | null
          wellness_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          diagnosis?: string
          risk_level?: string
          summary?: string | null
          ipfs_hash?: string | null
          ipfs_url?: string | null
          tx_hash?: string | null
          wellness_score?: number | null
          created_at?: string
        }
      }
      health_record_details: {
        Row: {
          id: string
          health_record_id: string
          possible_causes: Json | null
          suggestions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          health_record_id: string
          possible_causes?: Json | null
          suggestions?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          health_record_id?: string
          possible_causes?: Json | null
          suggestions?: Json | null
          created_at?: string
        }
      }
      iot_data: {
        Row: {
          id: string
          user_id: string
          heart_rate: number | null
          steps: number | null
          temperature: number | null
          sleep_hours: number | null
          blood_oxygen: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          heart_rate?: number | null
          steps?: number | null
          temperature?: number | null
          sleep_hours?: number | null
          blood_oxygen?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          heart_rate?: number | null
          steps?: number | null
          temperature?: number | null
          sleep_hours?: number | null
          blood_oxygen?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

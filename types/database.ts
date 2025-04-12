export type User = {
  id: string
  wallet_address?: string
  email?: string
  created_at: string
}

export type HealthRecord = {
  id: string
  user_id: string
  title: string
  diagnosis: string
  risk_level: string
  summary?: string
  ipfs_hash?: string
  ipfs_url?: string
  tx_hash?: string
  wellness_score?: number
  created_at: string
}

export type HealthRecordDetails = {
  id: string
  health_record_id: string
  possible_causes: string[]
  suggestions: string[]
  created_at: string
}

export type IoTData = {
  id: string
  user_id: string
  heart_rate: number
  steps: number
  temperature: number
  sleep_hours: number
  blood_oxygen: number
  created_at: string
}

// src/types/index.ts
export interface User {
  id: string
  email: string
  username: string
  role: 'user' | 'admin'
  is_active: boolean
  totp_enabled: boolean
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface CapacityInfo {
  max_payload_bytes: number
}

export interface ExtractResponse {
  secret: string
  encrypted: boolean
  compressed: boolean
  bytes: number
}

export interface HistoryEntry {
  id: string
  module: string
  action: string
  filename: string
  output_filename: string | null
  message_length: number
  file_size: number
  status: string
  created_at: string
}

export interface HistoryList {
  total: number
  limit: number
  offset: number
  items: HistoryEntry[]
}

export interface HistoryStats {
  total_operations: number
  hides: number
  extracts: number
  failures: number
}

export type HistoryItem = HistoryEntry
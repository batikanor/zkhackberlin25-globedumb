import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton pattern for client-side Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
})()

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          nationality: string | null
          year: number | null
          score: number
          games_played: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          nationality?: string | null
          year?: number | null
          score?: number
          games_played?: number
        }
        Update: {
          id?: string
          username?: string
          nationality?: string | null
          year?: number | null
          score?: number
          games_played?: number
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string | null
          target_country: string
          target_lat: number
          target_lng: number
          guess_lat: number | null
          guess_lng: number | null
          distance_km: number | null
          points_earned: number
          completed_at: string | null
          created_at: string
        }
        Insert: {
          user_id?: string | null
          target_country: string
          target_lat: number
          target_lng: number
          guess_lat?: number | null
          guess_lng?: number | null
          distance_km?: number | null
          points_earned?: number
          completed_at?: string | null
        }
        Update: {
          user_id?: string | null
          target_country?: string
          target_lat?: number
          target_lng?: number
          guess_lat?: number | null
          guess_lng?: number | null
          distance_km?: number | null
          points_earned?: number
          completed_at?: string | null
        }
      }
    }
  }
}

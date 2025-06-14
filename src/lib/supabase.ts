import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Development fallback configuration
const DEVELOPMENT_CONFIG = {
  url: 'https://demo.supabase.co', // Demo URL for development
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTU2NzI0MCwiZXhwIjoxOTYxMTQzMjQwfQ.demo-key' // Demo key
}

// Get environment variables with fallbacks (check both regular and EXPO_PUBLIC_ prefixed)
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || DEVELOPMENT_CONFIG.url
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || DEVELOPMENT_CONFIG.key

// Log configuration status for debugging
if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️  EXPO_PUBLIC_SUPABASE_URL not found in environment variables. Using development fallback.')
  console.warn('📝 To fix this: Create a .env file with your Supabase project credentials')
}

if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️  EXPO_PUBLIC_SUPABASE_ANON_KEY not found in environment variables. Using development fallback.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export type SupabaseClient = typeof supabase 
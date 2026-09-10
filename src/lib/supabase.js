// supabase client — the single place the app connects to Supabase.
//
// Credentials come from Vite env vars (see .env.example). These are PUBLIC
// (anon) values and are safe to ship in the client bundle. Row Level Security
// (see supabase/schema.sql) is what actually protects the data.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

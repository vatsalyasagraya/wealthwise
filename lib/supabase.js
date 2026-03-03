import { createClient } from '@supabase/supabase-js'

// In Next.js, env vars that are available in the browser MUST start with NEXT_PUBLIC_
// (Vite used VITE_ prefix - same concept, different name)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

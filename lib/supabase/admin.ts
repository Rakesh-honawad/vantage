import 'server-only'
import { createClient } from '@supabase/supabase-js'

/** Bypasses row-level security. Server code only, and only after validating input. */
export const supabaseAdmin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })

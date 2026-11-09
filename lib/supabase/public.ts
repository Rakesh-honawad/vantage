import { createClient } from '@supabase/supabase-js'

/** Read-only client for the public site. Row-level security limits it to published data. */
export const supabasePublic = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  })

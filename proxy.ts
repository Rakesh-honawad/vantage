import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

// Only staff areas and login use sessions, so public pages pay no extra latency.
export const config = { matcher: ['/admin/:path*', '/preview/:path*', '/login'] }

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Refreshes the session cookie and sends signed-out visitors from /admin and /preview to /login. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  let signedIn = false
  try {
    const { data } = await supabase.auth.getClaims()
    signedIn = !!data?.claims
  } catch {
    // If Supabase is unreachable, treat as signed out rather than failing the request.
  }

  const path = request.nextUrl.pathname
  if (!signedIn && (path.startsWith('/admin') || path.startsWith('/preview'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('next', path.startsWith('/admin') ? path : '/admin')
    return NextResponse.redirect(url)
  }
  return response
}

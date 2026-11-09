import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type Role = 'admin' | 'editor' | 'consultant'
export type Staff = { id: string; email: string; name: string; role: Role }

export const ROLE_LABEL: Record<Role, string> = { admin: 'Admin', editor: 'Editor', consultant: 'Consultant' }

/** The signed-in staff member, or null. A signed-in user without a profile is not staff. */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser() // verifies the token with Supabase on every call
  if (!data.user) return null
  const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', data.user.id).maybeSingle()
  if (!profile) return null
  return { id: data.user.id, email: data.user.email ?? '', name: profile.full_name as string, role: profile.role as Role }
})

/** Call at the top of every admin page. The layout alone is not a security boundary. */
export async function requireStaff(roles?: Role[]): Promise<Staff> {
  const staff = await getStaff()
  if (!staff) redirect('/login')
  if (roles && !roles.includes(staff.role)) redirect('/admin')
  return staff
}

export const homeFor = (role: Role) => (role === 'consultant' ? '/admin/enquiries' : '/admin/packages')

import { redirect } from 'next/navigation'
import { homeFor, requireStaff } from '@/lib/auth'

export default async function AdminHome() {
  const staff = await requireStaff()
  redirect(homeFor(staff.role))
}

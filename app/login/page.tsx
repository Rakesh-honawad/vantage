import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getStaff, homeFor } from '@/lib/auth'
import { LoginForm } from './login-form'
import './login.css'

export const metadata: Metadata = { title: 'Staff sign in', robots: { index: false } }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const staff = await getStaff()
  if (staff) redirect(homeFor(staff.role))
  const { next } = await searchParams
  return (
    <main className="login">
      <div className="login-card">
        <span className="eyebrow">Kasavu Studio</span>
        <h1>Staff sign in</h1>
        <p className="sub">For editors and consultants. Travellers do not need an account.</p>
        <LoginForm next={typeof next === 'string' ? next : ''} />
        <Link href="/" className="login-back">Back to the website</Link>
      </div>
    </main>
  )
}

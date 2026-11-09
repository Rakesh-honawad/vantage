import type { Metadata } from 'next'
import Link from 'next/link'
import { signOut } from '@/app/login/actions'
import { AdminNav, type NavItem } from '@/components/admin/admin-nav'
import { ROLE_LABEL, requireStaff, type Role } from '@/lib/auth'
import './admin.css'

export const metadata: Metadata = { title: { default: 'Kasavu Studio', template: '%s | Kasavu Studio' }, robots: { index: false } }

const NAV: (NavItem & { roles: Role[] })[] = [
  { href: '/admin/packages', label: 'Packages', roles: ['admin', 'editor'] },
  { href: '/admin/enquiries', label: 'Enquiries', roles: ['admin', 'consultant'] },
  { href: '/admin/activity', label: 'Activity', roles: ['admin'] },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff()
  const items = NAV.filter((i) => i.roles.includes(staff.role)).map(({ href, label }) => ({ href, label }))
  return (
    <div className="admin">
      <header className="header">
        <Link href="/admin" className="brand">KASAVU<span>STUDIO</span></Link>
        <div className="header-right"><Link href="/" className="mono">View site</Link></div>
      </header>
      <div className="admin-shell">
        <aside className="sidebar">
          <span className="mono">Workspace</span>
          <AdminNav items={items} />
          <div className="user-menu">
            <strong>{staff.name}</strong>
            <span>{ROLE_LABEL[staff.role]}</span>
            <form action={signOut}><button type="submit" className="signout">Sign out</button></form>
          </div>
        </aside>
        <section className="admin-content">
          <nav className="admin-tabs" aria-label="Admin">
            <AdminNav items={items} />
            <form action={signOut}><button type="submit" className="signout">Sign out</button></form>
          </nav>
          {children}
        </section>
      </div>
    </div>
  )
}

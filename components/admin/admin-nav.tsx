'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavItem = { href: string; label: string }

export function AdminNav({ items }: { items: NavItem[] }) {
  const path = usePathname()
  return (
    <>
      {items.map((i) => {
        const active = path === i.href || path.startsWith(`${i.href}/`)
        return <Link key={i.href} href={i.href} className={active ? 'side-active' : ''} aria-current={active ? 'page' : undefined}>{i.label}</Link>
      })}
    </>
  )
}

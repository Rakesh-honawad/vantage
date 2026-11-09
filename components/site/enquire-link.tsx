'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function EnquireLink() {
  const onPackage = usePathname().startsWith('/packages/')
  return <Link href={onPackage ? '#enquire' : '/enquire'} className="btn header-cta">Enquire</Link>
}
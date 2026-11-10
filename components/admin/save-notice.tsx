'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SaveNotice({ slug }: { slug?: string }) {
  const saved = useSearchParams().get('saved')
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!saved) return
    setOpen(true)
    const t = setTimeout(() => { setOpen(false); router.replace(pathname, { scroll: false }) }, 8000)
    return () => clearTimeout(t)
  }, [saved, pathname, router])

  if (!open) return null
  return (
    <p className="save-notice" role="status">
      {saved === 'published' ? (
        <>Saved and published. It is now live on the blog.{slug && <> <Link href={`/blog/${slug}`} target="_blank">View post</Link></>}</>
      ) : (
        <>Saved as a draft. Visitors cannot see it yet. Set the status to Publish when it is ready.</>
      )}
    </p>
  )
}
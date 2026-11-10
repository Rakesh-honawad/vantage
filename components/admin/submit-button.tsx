'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ label = 'Save blog post' }: { label?: string }) {
  const { pending } = useFormStatus()
  return <button type="submit" className="btn" disabled={pending}>{pending ? 'Saving…' : label}</button>
}
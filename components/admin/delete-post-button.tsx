'use client'

import { useFormStatus } from 'react-dom'

export function DeletePostButton({ title }: { title: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="danger-btn"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) e.preventDefault()
      }}
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
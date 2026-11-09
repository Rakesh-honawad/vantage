'use client'

import { Btn } from '@/components/site/btn'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="listing">
      <div className="empty" role="alert">
        <h3>Something went wrong on our side.</h3>
        <p>Please try again in a moment.</p>
        <Btn onClick={reset}>Try again</Btn>
      </div>
    </main>
  )
}

'use client'

import { Btn } from '@/components/site/btn'

export default function PackagesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="listing">
      <div className="empty" role="alert">
        <h3>We could not load the packages.</h3>
        <p>This is on our side. Please try again in a moment.</p>
        <Btn onClick={reset}>Try again</Btn>
      </div>
    </main>
  )
}

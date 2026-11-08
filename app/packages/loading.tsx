import { Header } from '@/components/site/header'

export default function Loading() {
  return (
    <>
      <Header />
      <main className="listing" aria-busy="true">
        <div className="pkg-grid list-grid">{[0, 1, 2].map((i) => <div key={i} className="pkg-skeleton" />)}</div>
      </main>
    </>
  )
}

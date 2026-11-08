import { Btn } from '@/components/site/btn'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="listing">
        <div className="empty">
          <span className="eyebrow">Page not found</span>
          <h3>This page has moved or never existed.</h3>
          <p>Browse our journeys instead.</p>
          <Btn href="/packages">See all packages</Btn>
        </div>
      </main>
      <Footer />
    </>
  )
}

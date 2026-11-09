import type { Metadata } from 'next'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import './prose.css'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How Kasavu Travel collects, uses and protects your personal data.',
}

// Draft wording for the Digital Personal Data Protection Act, 2023. The client's counsel must review it.
// The 12-month retention period and the contact email are ASSUMPTIONS (label them in the TDD).
export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="listing prose">
        <span className="eyebrow">Your data</span>
        <h1>Privacy</h1>
        <p className="lede">We only ask for what we need to plan your trip, and we do not sell it.</p>

        <h2>What we collect</h2>
        <p>When you send an enquiry we collect your name, phone number, the message you write and the package you were looking at. That is all. We do not ask for passport or payment details on this website.</p>

        <h2>Why we use it</h2>
        <p>To reply to your enquiry, prepare a quote and plan your journey. Our consultants read your message, and we use software that helps them read it faster. A person always checks and approves a reply before it is sent to you.</p>

        <h2>WhatsApp</h2>
        <p>We message you on WhatsApp only if you tick the box on the enquiry form. It is optional, it starts unticked, and ticking it does not change your quote. You can say stop at any time and we will use phone or email instead.</p>

        <h2>How long we keep it</h2>
        <p>We keep enquiries that do not become bookings for 12 months, then delete them. Booking records are kept as long as the law requires.</p>

        <h2>Your rights</h2>
        <p>You can ask us to show you the data we hold about you, correct it, delete it, or withdraw your consent. Write to <a href="mailto:privacy@kasavutravel.in">privacy@kasavutravel.in</a> and we will respond within a reasonable time. If you are not satisfied, you may complain to the Data Protection Board of India.</p>

        <h2>Who can see it</h2>
        <p>Only our staff who handle enquiries. Access is limited by role and every change is recorded.</p>
      </main>
      <Footer />
    </>
  )
}

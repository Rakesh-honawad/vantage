import type { Metadata } from 'next'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import '../inbox.css'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What personal data Rocky Travel collects, why, who sees it, how long we keep it, and your rights.',
}

// DRAFT for the client's lawyer to review. Items marked CONFIRM are assumptions, not facts.
export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="ib-track ib-legal">
        <span className="eyebrow">Privacy</span>
        <h1>Your data stays yours.</h1>
        <p className="ib-track-status">This explains what we do with the details you give us, in plain words. We follow India&apos;s Digital Personal Data Protection Act, 2023.</p>

        <section>
          <h2>What we collect</h2>
          <p>When you send an enquiry we collect your name, your phone number and the message you write. If you tick the box, we also record that you agreed to a WhatsApp reply, and when. We do not ask for payment details or documents on this website.</p>
        </section>
        <section>
          <h2>Why we use it</h2>
          <p>Only to answer your enquiry and plan your trip. A consultant reads your message and replies, usually within the hour during working hours (9am to 7pm IST). We do not sell your details and we do not use them for unrelated marketing.</p>
        </section>
        <section>
          <h2>WhatsApp</h2>
          <p>We message you on WhatsApp only if you ticked the box. You can withdraw that at any time by telling us, and we will stop.</p>
        </section>
        <section>
          <h2>AI that helps us read your message</h2>
          <p>To reply faster, we may use an AI service to pick out the dates, number of travellers, destination and budget from your message and to suggest packages. Only the text of your message is sent to it. Your name and phone number are not. A person always reads and approves a reply before it is sent to you.</p>
        </section>
        <section>
          <h2>Who can see it</h2>
          <p>Our consultants and administrators, and the service providers that host this website and its database. Each of them can use it only to run our service.</p>
        </section>
        <section>
          <h2>How long we keep it</h2>
          <p>We keep an enquiry for 24 months after our last contact with you, then delete it. CONFIRM: retention period.</p>
        </section>
        <section>
          <h2>Your rights</h2>
          <p>You can ask to see what we hold about you, correct it, delete it, or withdraw a consent you gave. You can also name someone to exercise these rights for you. Write to us and we will respond within 30 days. CONFIRM: response time.</p>
        </section>
        <section>
          <h2>Questions or complaints</h2>
          <p>Write to our grievance contact at privacy@Rockytravel.in. CONFIRM: name and email of the grievance officer. If you are not satisfied, you may complain to the Data Protection Board of India.</p>
        </section>
        <section>
          <h2>Your enquiry page</h2>
          <p>After you send an enquiry you get a private link where our replies appear. Anyone with that link can read the page, so please do not share it. Search engines are told not to list it.</p>
        </section>
      </main>
      <Footer />
    </>
  )
}

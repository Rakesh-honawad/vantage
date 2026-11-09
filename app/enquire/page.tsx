import type { Metadata } from 'next'
import { EnquiryForm } from '@/components/site/enquiry-form'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'

export const metadata: Metadata = {
  title: 'Enquire',
  description: 'Tell us about your trip and a consultant will reply within the hour.',
}

export default function EnquirePage() {
  return (
    <>
      <Header />
      <main><EnquiryForm /></main>
      <Footer />
    </>
  )
}
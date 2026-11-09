import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { PackageView } from '@/components/site/package-view'
import { requireStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { PackageContent } from '@/lib/types'
import '../../admin/packages/[id]/editor.css'

export const metadata: Metadata = { title: 'Preview', robots: { index: false, follow: false } }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff(['admin', 'editor'])
  const { id } = await params
  if (!UUID.test(id)) notFound()
  const supabase = await createClient()
  const { data } = await supabase.from('packages').select('draft').eq('id', id).maybeSingle()
  if (!data) notFound()
  return (
    <>
      <div className="preview-banner">
        <span>Preview of the saved draft. The public cannot see this.</span>
        <Link href={`/admin/packages/${id}`}>Back to editor</Link>
      </div>
      <Header />
      <PackageView p={{ ...(data.draft as PackageContent), status: 'draft' }} preview />
      <Footer />
    </>
  )
}

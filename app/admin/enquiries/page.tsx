import { requireStaff } from '@/lib/auth'

export default async function Page() {
  await requireStaff(['admin', 'consultant'])
  return (
    <div className="admin-title">
      <div><span className="eyebrow">Coming next</span><h1>Enquiries</h1><p className="admin-sub">The enquiry inbox is built after the package editor.</p></div>
    </div>
  )
}

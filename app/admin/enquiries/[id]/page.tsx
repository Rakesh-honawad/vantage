import { requireStaff } from '@/lib/auth'

export default async function Page() {
  await requireStaff(['admin', 'consultant'])
  return (
    <div className="admin-title">
      <div><span className="eyebrow">Coming next</span><h1>Enquiry</h1><p className="admin-sub">The enquiry detail and AI panel are built after the inbox.</p></div>
    </div>
  )
}

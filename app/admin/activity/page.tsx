import { requireStaff } from '@/lib/auth'

export default async function Page() {
  await requireStaff(['admin'])
  return (
    <div className="admin-title">
      <div><span className="eyebrow">Coming next</span><h1>Activity</h1><p className="admin-sub">The activity log is built after the package editor.</p></div>
    </div>
  )
}

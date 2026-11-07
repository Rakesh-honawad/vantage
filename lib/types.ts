export type PackageStatus = 'Published' | 'Draft' | 'Scheduled'
export type Season = 'Peak' | 'Monsoon'
export type Package = {
  id: string
  slug: string
  title: string
  location: string
  days: number
  stars: number
  status: PackageStatus
  price: number
  monsoonPrice?: number
  image: string
  tag: string
}
export type Enquiry = { id: string; name: string; channel: string; preview: string; status: string; assignee: string; time: string; unread?: boolean }

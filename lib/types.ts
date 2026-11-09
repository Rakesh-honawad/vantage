export type PackageStatus = 'draft' | 'scheduled' | 'published'

/** Months are 1-12 so a season repeats every year (Oct to Mar = 10 to 3). */
export type SeasonPrice = { name: string; fromMonth: number; toMonth: number; pricePerPerson: number }
export type ItineraryDay = { day: number; title: string; description: string; stay: string; meals: string[] }
export type Hotel = { name: string; city: string; stars: number }
export type RouteStop = { name: string; lat: number; lng: number }

export type TourPackage = {
  code: string
  slug: string
  title: string
  summary: string
  tag: string
  days: number
  nights: number
  hotelStars: number
  destinations: string[]
  status: PackageStatus
  coverImage: string
  gallery: string[]
  seasons: SeasonPrice[]
  itinerary: ItineraryDay[]
  inclusions: string[]
  exclusions: string[]
  hotels: Hotel[]
  routeStops: RouteStop[]
  cancellationNote: string
  updatedAt: string
  updatedBy: string
}

/** What is stored in packages.draft and package_versions.content (status lives on the packages row). */
export type PackageContent = Omit<TourPackage, 'status'>

export type Enquiry = {
  id: string
  name: string
  channel: string
  preview: string
  status: string
  assignee: string
  time: string
  unread?: boolean
}

import type { Enquiry, ItineraryDay, SeasonPrice, TourPackage } from './types'

// PKG-KL-07 and PKG-SI-12 come from the brief. Every other package, hotel name,
// itinerary and inclusion is an INVENTED assumption (label it in the TDD).
const u = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`
export const photo = {
  munnar: u('photo-1500534623283-312aade485b7'),
  houseboat: u('photo-1602303481506-3b2e4f6e1cf4'),
  hills: u('photo-1593693397690-362cb9666fc2'),
  forest: u('photo-1602216056096-3b40cc0c9944'),
  sea: u('photo-1530789253388-582c481c54b0'),
  temple: u('photo-1582510003544-4d00b7f74220'),
  peak: u('photo-1544735716-392fe2489ffa'),
}

const seasons = (peak: number, monsoon: number): SeasonPrice[] => [
  { name: 'Peak', fromMonth: 10, toMonth: 3, pricePerPerson: peak },
  { name: 'Monsoon', fromMonth: 6, toMonth: 9, pricePerPerson: monsoon },
]
const plan = (rows: [string, string, string][]): ItineraryDay[] =>
  rows.map(([title, description, stay], i) => ({ day: i + 1, title, description, stay, meals: i === 0 || i === rows.length - 1 ? ['Dinner'] : ['Breakfast', 'Dinner'] }))

const common = {
  inclusions: ['Accommodation on twin sharing', 'Daily breakfast and dinner', 'Private air-conditioned vehicle with driver', 'Airport or station transfers', 'Tolls, parking and driver allowance'],
  exclusions: ['Flights and train fares', 'Lunch and personal expenses', 'Entry fees and camera charges', 'Travel insurance'],
  cancellationNote: 'Dates can be changed free of charge up to 30 days before travel. Cancellation charges apply after that and are confirmed in your quote.',
  updatedAt: '2026-11-07T09:30:00+05:30',
  updatedBy: 'Meera Nair',
}
const stop = (name: string, lat: number, lng: number) => ({ name, lat, lng })

export const packages: TourPackage[] = [
  {
    ...common, code: 'PKG-KL-07', slug: 'munnar-thekkady-alleppey-houseboat', title: 'Munnar, Thekkady and Alleppey houseboat', tag: 'Most loved',
    summary: 'Tea estates at first light, a quiet forest road, and one unhurried night on the water. Kerala in six generous days.',
    days: 6, nights: 5, hotelStars: 4, destinations: ['Munnar', 'Thekkady', 'Alleppey', 'Kochi'], status: 'published',
    coverImage: photo.munnar, gallery: [photo.munnar, photo.houseboat, photo.hills, photo.forest], seasons: seasons(32500, 24900),
    itinerary: plan([
      ['Arrive in Kochi, drive to Munnar', 'Meet your driver at the airport and follow the hills north, stopping at a waterfall on the way.', 'Munnar'],
      ['Tea hills and the art of doing less', 'A slow morning among the tea estates, then Mattupetty lake in the afternoon.', 'Munnar'],
      ['Into the forest at Thekkady', 'Drive south through cardamom hills. Evening walk through a spice plantation.', 'Thekkady'],
      ['Down to the backwaters', 'A morning boat ride on Periyar lake, then on to Alleppey and your houseboat.', 'Houseboat, Alleppey'],
      ['Sunrise on the water, then Kochi', 'Cruise the canals before breakfast, then an easy drive to Kochi.', 'Kochi'],
      ['Return, slowly', 'Time for Fort Kochi before your transfer to the airport.', 'Departure'],
    ]),
    hotels: [{ name: 'Tea Valley Resort', city: 'Munnar', stars: 4 }, { name: 'Periyar Woods Hotel', city: 'Thekkady', stars: 4 }, { name: 'Premium AC houseboat', city: 'Alleppey', stars: 4 }, { name: 'Harbour View Hotel', city: 'Kochi', stars: 4 }],
    routeStops: [stop('Kochi', 9.9312, 76.2673), stop('Munnar', 10.0889, 77.0595), stop('Thekkady', 9.6, 77.17), stop('Alleppey', 9.4981, 76.3388)],
  },
  {
    ...common, code: 'PKG-SI-12', slug: 'madurai-rameswaram-kanyakumari', title: 'Madurai, Rameswaram and Kanyakumari', tag: 'South India',
    summary: 'Temple cities, the Pamban bridge and sunrise at the southern tip of India.',
    days: 5, nights: 4, hotelStars: 3, destinations: ['Madurai', 'Rameswaram', 'Kanyakumari'], status: 'draft',
    coverImage: photo.temple, gallery: [photo.temple, photo.sea], seasons: [{ name: 'All year', fromMonth: 1, toMonth: 12, pricePerPerson: 18750 }],
    itinerary: plan([
      ['Arrive in Madurai', 'Settle in and walk the lanes around the temple at dusk.', 'Madurai'],
      ['The temple and the old city', 'Morning at Meenakshi temple, afternoon in the flower and spice markets.', 'Madurai'],
      ['Across the Pamban bridge', 'Drive to Rameswaram and visit the corridors of the Ramanathaswamy temple.', 'Rameswaram'],
      ['Dhanushkodi, then south', 'A morning at the sandbar, then a long coastal drive to Kanyakumari.', 'Kanyakumari'],
      ['Sunrise at the cape', 'Watch the sun rise over three seas before your onward journey.', 'Departure'],
    ]),
    hotels: [{ name: 'Temple View Inn', city: 'Madurai', stars: 3 }, { name: 'Island Grand', city: 'Rameswaram', stars: 3 }, { name: 'Cape Residency', city: 'Kanyakumari', stars: 3 }],
    routeStops: [stop('Madurai', 9.9252, 78.1198), stop('Rameswaram', 9.2876, 79.3129), stop('Kanyakumari', 8.0883, 77.5385)],
  },
  {
    ...common, code: 'PKG-KL-03', slug: 'kochi-munnar-weekend', title: 'Kochi and Munnar, a quiet weekend', tag: 'Short escape',
    summary: 'Three days that fit around a working week: harbour mornings, then green hills.',
    days: 3, nights: 2, hotelStars: 4, destinations: ['Kochi', 'Munnar'], status: 'published',
    coverImage: photo.hills, gallery: [photo.hills, photo.munnar, photo.sea], seasons: seasons(16900, 13900),
    itinerary: plan([
      ['Fort Kochi, then the hills', 'See the harbour in the morning light and drive up to Munnar by evening.', 'Munnar'],
      ['A quiet day among tea', 'Walk the estates, visit a tea museum and keep the afternoon free.', 'Munnar'],
      ['Down the ghat, home', 'A leisurely drive back to Kochi for your onward travel.', 'Departure'],
    ]),
    hotels: [{ name: 'Tea Valley Resort', city: 'Munnar', stars: 4 }],
    routeStops: [stop('Kochi', 9.9312, 76.2673), stop('Munnar', 10.0889, 77.0595)],
  },
  {
    ...common, code: 'PKG-KL-11', slug: 'kerala-for-two-kumarakom', title: 'Kerala for two, with Kumarakom', tag: 'For two',
    summary: 'Lake mornings, a beach to yourselves and nothing scheduled that you did not ask for.',
    days: 5, nights: 4, hotelStars: 5, destinations: ['Kumarakom', 'Marari', 'Kochi'], status: 'scheduled',
    coverImage: photo.houseboat, gallery: [photo.houseboat, photo.sea, photo.forest], seasons: seasons(48900, 39900),
    itinerary: plan([
      ['Kochi to Kumarakom', 'A short transfer to your lakeside resort and a sunset boat ride.', 'Kumarakom'],
      ['Lake mornings', 'Birdwatching at dawn, an Ayurvedic massage in the afternoon.', 'Kumarakom'],
      ['On to Marari beach', 'A coastal drive and a private beach dinner.', 'Marari'],
      ['Sand and sea, slowly', 'A free day: village cycling, fishing boats or just the beach.', 'Marari'],
      ['Departure from Kochi', 'A relaxed drive to the airport.', 'Departure'],
    ]),
    hotels: [{ name: 'Lakeside Retreat', city: 'Kumarakom', stars: 5 }, { name: 'Marari Sands Resort', city: 'Marari', stars: 5 }],
    routeStops: [stop('Kochi', 9.9312, 76.2673), stop('Kumarakom', 9.6175, 76.43), stop('Marari', 9.604, 76.301)],
  },
  {
    ...common, code: 'PKG-KL-14', slug: 'wayanad-coorg', title: 'Wayanad and Coorg, in the green', tag: 'New route',
    summary: 'Caves, waterfalls and coffee country, over the ghats and back again.',
    days: 5, nights: 4, hotelStars: 4, destinations: ['Wayanad', 'Coorg'], status: 'published',
    coverImage: photo.forest, gallery: [photo.forest, photo.hills, photo.munnar], seasons: seasons(28500, 21900),
    itinerary: plan([
      ['Arrive in Wayanad', 'Settle into a forest-edge resort and walk the estate at dusk.', 'Wayanad'],
      ['Caves, falls and spice farms', 'Edakkal caves in the morning, a spice farm lunch and Soochipara falls.', 'Wayanad'],
      ['Over the ghats to Coorg', 'A scenic drive through coffee country to your homestay.', 'Coorg'],
      ['Coffee estates and Abbey Falls', 'A plantation walk and an unhurried afternoon at the falls.', 'Coorg'],
      ['Departure', 'Breakfast, then your transfer onward.', 'Departure'],
    ]),
    hotels: [{ name: 'Forest Edge Resort', city: 'Wayanad', stars: 4 }, { name: 'Coffee Hill Homestay', city: 'Coorg', stars: 4 }],
    routeStops: [stop('Wayanad', 11.6854, 76.132), stop('Coorg', 12.4244, 75.7382)],
  },
]

// Sample enquiry text is from the brief; the other people and messages are invented.
export const enquiries: Enquiry[] = [
  { id: 'ENQ-1042', name: 'Ananya Menon', channel: 'WhatsApp', preview: 'Hi, 2 adults and 1 kid, Kerala 5-6 nights in December, budget around 1.2 lakh total, houseboat a must', status: 'New', assignee: 'Meera', time: '10:42', unread: true },
  { id: 'ENQ-1041', name: 'Rohit Sharma', channel: 'Web form', preview: 'Looking for a relaxed honeymoon itinerary around Kumarakom.', status: 'Quoted', assignee: 'Arun', time: '09:18' },
  { id: 'ENQ-1040', name: 'Elena Garcia', channel: 'Email', preview: 'Could you share your best monsoon rates for 4 nights?', status: 'Contacted', assignee: 'Devika', time: 'Yesterday' },
  { id: 'ENQ-1039', name: 'Vivek Krishnan', channel: 'Phone', preview: 'Family of five, prefer 4 star hotels and an easy pace.', status: 'Won', assignee: 'Meera', time: 'Yesterday' },
  { id: 'ENQ-1038', name: 'Maya and Liam', channel: 'Chat', preview: 'Is the Alleppey houseboat private? We travel in October.', status: 'Lost', assignee: 'Arun', time: 'Tue' },
]

export const activity: [string, string, string][] = [
  ['Meera Nair', 'Published PKG-KL-07, version 4', '2 hours ago'],
  ['Arun Pillai', 'Assigned ENQ-1042 to Meera', '3 hours ago'],
  ['Devika Rao', 'Duplicated PKG-KL-14 as a draft', 'Yesterday'],
  ['Meera Nair', 'Changed Monsoon price on PKG-KL-03', 'Yesterday'],
]

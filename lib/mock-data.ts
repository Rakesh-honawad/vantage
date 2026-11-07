import type { Enquiry, Package } from './types'

const photos = {
  munnar: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=85',
  houseboat: 'https://images.unsplash.com/photo-1602303481506-3b2e4f6e1cf4?auto=format&fit=crop&w=1200&q=85',
  hills: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=85',
  forest: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85',
  sea: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=85',
  temple: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85',
}
export const packages: Package[] = [
  { id:'PKG-KL-07', slug:'munnar-thekkady-alleppey', title:'Munnar, Thekkady and Alleppey Houseboat', location:'Munnar · Thekkady · Alleppey', days:6, stars:4, status:'Published', price:32500, monsoonPrice:24900, image:photos.munnar, tag:'Most loved' },
  { id:'PKG-SI-12', slug:'madurai-rameswaram-kanyakumari', title:'Madurai, Rameswaram and Kanyakumari', location:'Madurai · Rameswaram · Kanyakumari', days:5, stars:3, status:'Draft', price:18750, image:photos.temple, tag:'South India' },
  { id:'PKG-KL-03', slug:'kochi-munnar-weekend', title:'Kochi and Munnar, a quiet weekend', location:'Kochi · Munnar', days:3, stars:4, status:'Published', price:16900, monsoonPrice:13900, image:photos.hills, tag:'Short escape' },
  { id:'PKG-KL-11', slug:'kerala-honeymoon-kumarakom', title:'Kerala for two, with Kumarakom', location:'Kumarakom · Marari · Kochi', days:7, stars:5, status:'Scheduled', price:48900, monsoonPrice:39900, image:photos.houseboat, tag:'For two' },
  { id:'PKG-KL-14', slug:'wayanad-coorg', title:'Wayanad and Coorg, in the green', location:'Wayanad · Coorg', days:6, stars:4, status:'Published', price:28500, monsoonPrice:21900, image:photos.forest, tag:'New route' },
  { id:'PKG-KL-18', slug:'kerala-family-fortnight', title:'A Kerala family fortnight', location:'Kochi · Munnar · Alleppey · Kovalam', days:12, stars:4, status:'Draft', price:59200, image:photos.sea, tag:'Family' },
]
export const enquiries: Enquiry[] = [
  {id:'ENQ-1042',name:'Ananya Menon',channel:'WhatsApp',preview:'Hi, 2 adults and 1 kid, Kerala 5-6 nights in December, budget around 1.2 lakh total, houseboat a must',status:'New',assignee:'Meera',time:'10:42',unread:true},
  {id:'ENQ-1041',name:'Rohit Sharma',channel:'Web form',preview:'Looking for a relaxed honeymoon itinerary around Kumarakom.',status:'Quoted',assignee:'Arun',time:'09:18'},
  {id:'ENQ-1040',name:'Elena Garcia',channel:'Email',preview:'Could you share your best monsoon rates for 4 nights?',status:'Contacted',assignee:'Devika',time:'Yesterday'},
  {id:'ENQ-1039',name:'Vivek Krishnan',channel:'Phone',preview:'Family of five, prefer 4 star hotels and an easy pace.',status:'Won',assignee:'Meera',time:'Yesterday'},
  {id:'ENQ-1038',name:'Maya & Liam',channel:'Chat',preview:'Is the Alleppey houseboat private? We travel in October.',status:'Lost',assignee:'Arun',time:'Tue'},
]
export const activity = [
  ['Meera Nair','Published “Wayanad and Coorg”','12 minutes ago'],['Arun Joseph','Moved ENQ-1041 to Quoted','42 minutes ago'],['Devika Rao','Edited peak season price','1 hour ago'],['Meera Nair','Added a new gallery photo','Yesterday'],['Arun Joseph','Restored version 3','Yesterday'],['Admin','Scheduled “Kerala for two”','Mon, 4 Nov']
]
export { photos }

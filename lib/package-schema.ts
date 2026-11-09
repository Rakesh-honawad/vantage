import { z } from 'zod'

const text = (n: number) => z.string().trim().max(n)
const url = z.string().max(500).regex(/^(\/|https:\/\/)[^\s"'()<>]+$/, 'Use a full https:// link or a /path')
const month = z.number().int().min(1).max(12)

/** Structure and limits only. Whether a package is complete enough to publish is publishIssues(). */
export const packageSchema = z.object({
  code: text(30),
  slug: z.string().trim().max(80).regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, 'Use lowercase letters, numbers and dashes'),
  title: text(120), summary: text(600), tag: text(30),
  days: z.number().int().min(0).max(60), nights: z.number().int().min(0).max(60), hotelStars: z.number().int().min(1).max(5),
  destinations: z.array(text(40)).max(10),
  coverImage: z.union([url, z.literal('')]),
  gallery: z.array(url).max(12),
  seasons: z.array(z.object({ name: text(40), fromMonth: month, toMonth: month, pricePerPerson: z.number().int().min(0).max(1_000_000) })).max(8),
  itinerary: z.array(z.object({
    day: z.number().int(), title: text(120), description: text(1000), stay: text(80),
    meals: z.array(z.enum(['Breakfast', 'Lunch', 'Dinner'])).max(3),
  })).max(30),
  inclusions: z.array(text(160)).max(20), exclusions: z.array(text(160)).max(20),
  hotels: z.array(z.object({ name: text(80), city: text(60), stars: z.number().int().min(1).max(5) })).max(10),
  routeStops: z.array(z.object({ name: text(40), lat: z.number(), lng: z.number() })).max(10),
  cancellationNote: text(600), updatedAt: z.string().max(40), updatedBy: z.string().max(80),
})

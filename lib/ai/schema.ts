import { z } from 'zod'

/** What the AI (or the rules fallback) pulls out of an enquiry. A consultant can correct every field. */
export const extractionSchema = z.object({
  adults: z.number().int().min(0).max(50).nullable(),
  children: z.number().int().min(0).max(50).nullable(),
  month: z.number().int().min(1).max(12).nullable(),
  nights: z.number().int().min(1).max(30).nullable(),
  nightsMax: z.number().int().min(1).max(30).nullable(),
  budgetTotal: z.number().int().min(0).max(100_000_000).nullable(),
  destinations: z.array(z.string().trim().min(1).max(40)).max(8),
  interests: z.array(z.string().trim().min(1).max(30)).max(8),
})
export type Extraction = z.infer<typeof extractionSchema>

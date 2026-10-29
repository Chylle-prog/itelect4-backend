import { z } from 'zod'

export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, 'Describe the item report in at least 20 characters.')
    .max(2000, 'Keep the description under 2000 characters.'),
})

export const reviewSchema = z.object({
  summary: z.string().describe('One sentence restating the item report.'),
  strengths: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe('One to three clear and useful details in the report.'),
  improvements: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe('One to three specific improvements for the report.'),
  readiness: z
    .enum(['ready', 'almost', 'not-yet'])
    .describe('Whether the report is clear enough to post.'),
})

export type Review = z.infer<typeof reviewSchema>

export const reviewJsonSchema = z.toJSONSchema(reviewSchema)
import { GoogleGenAI, type Content } from '@google/genai'
import { EXAMPLES, MODEL, SYSTEM_PROMPT, wrap } from './prompt.js'
import { reviewJsonSchema, reviewSchema, type Review } from '../schemas/review.js'

let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Add it to .env, and to Vercel.')
  }

  if (client === null) {
    client = new GoogleGenAI({ apiKey })
  }

  return client
}

export class AiReplyError extends Error {}

function buildContents(description: string): Content[] {
  const examples: Content[] = EXAMPLES.flatMap((example) => [
    { role: 'user', parts: [{ text: wrap(example.description) }] },
    { role: 'model', parts: [{ text: JSON.stringify(example.review) }] },
  ])

  return [...examples, { role: 'user', parts: [{ text: wrap(description) }] }]
}

export async function reviewLostFoundReport(description: string): Promise<Review> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(description),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseJsonSchema: reviewJsonSchema,
    },
  })

  const text = response.text
  if (!text) {
    throw new AiReplyError('Gemini sent back no text')
  }

  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new AiReplyError("Gemini's reply was not JSON")
  }

  const result = reviewSchema.safeParse(data)
  if (!result.success) {
    throw new AiReplyError("Gemini's reply did not match the schema")
  }

  return result.data
}
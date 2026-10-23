import 'dotenv/config'
import { reviewLostFoundReport } from './ai/gemini.js'

async function tryAi() {
  const review = await reviewLostFoundReport(
    'Found a navy blue umbrella with a curved wooden handle by the library entrance after lunch.',
  )
  console.log(JSON.stringify(review, null, 2))
}

tryAi().catch((error: unknown) => {
  console.error('Gemini call failed:', error)
  process.exitCode = 1
})
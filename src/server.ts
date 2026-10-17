import 'dotenv/config'
import { setServers } from 'node:dns'
import app from './app.js'
import { connectDB } from './config/db.js'

const dnsServers = process.env.DNS_SERVERS?.split(',').map((server) => server.trim()).filter(Boolean)
if (dnsServers?.length) setServers(dnsServers)

const port = Number(process.env.PORT) || 4000

async function startServer() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Copy .env.example to .env and fill it in.')
  }

  await connectDB()
  app.listen(port, () => console.log(`API on http://localhost:${port}`))
}

startServer().catch((error: unknown) => {
  console.error('Could not start:', error)
  process.exit(1)
})
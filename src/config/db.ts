import mongoose from 'mongoose'

let cachedConnection: Promise<typeof mongoose> | null = null

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return
  }

  if (mongoose.connection.readyState === 2 && cachedConnection) {
    await cachedConnection
    return
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Copy .env.example to .env and fill it in.')
  }

  cachedConnection = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  await cachedConnection
  console.log('MongoDB connected:', mongoose.connection.name)
}
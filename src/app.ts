import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import { claimRouter } from './routes/claims.js'
import { authRouter } from './routes/auth.js'
import { itemRouter } from './routes/items.js'
import { userRouter } from './routes/users.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    next(error)
  }
})

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'itelect4-backend API is running', ok: true })
})

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 })
})
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 })
})

app.use('/api/auth', authRouter)
app.use('/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/users', userRouter)
app.use('/api/items', itemRouter)
app.use('/items', itemRouter)
app.use('/api/claims', claimRouter)
app.use('/claims', claimRouter)

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` })
})

app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(err.errors).map((error) => error.message),
      })
      return
    }

    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: `"${err.value}" is not a valid id` })
      return
    }

    if ('code' in err && err.code === 11000) {
      res.status(409).json({ message: 'That email is already registered' })
      return
    }

    console.error(err)
    res.status(500).json({ message: 'Something went wrong' })
  },
)

export default app
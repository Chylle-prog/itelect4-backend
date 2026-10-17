import { Router, type Request, type Response } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { User } from '../models/User.js'

export const userRouter = Router()

userRouter.use(requireAuth)

userRouter.get('/', async (_req: Request, res: Response) => {
  const users = await User.find({ isActive: true })
    .select('name email role isActive score')
    .sort({ name: 1 })
  res.json(users)
})
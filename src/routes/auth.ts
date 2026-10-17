import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

interface RegisterBody {
  name: string
  email: string
  password: string
}

interface LoginBody {
  email: string
  password: string
}

export const authRouter = Router()

authRouter.post(
  '/register',
  async (req: Request<unknown, unknown, RegisterBody>, res: Response) => {
    const { name, email, password } = req.body ?? {}
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      name.trim().length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 8
    ) {
      res.status(400).json({
        message: 'Name, valid email, and password of at least 8 characters are required',
      })
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (await User.findOne({ email: normalizedEmail })) {
      res.status(409).json({ message: 'That email is already registered' })
      return
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    })
    res.status(201).json(user.toJSON())
  },
)

authRouter.post(
  '/login',
  async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
    const { email, password } = req.body ?? {}
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ message: 'Email and password are required' })
      return
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
    if (
      !user ||
      !user.isActive ||
      !(await bcrypt.compare(password, user.password))
    ) {
      res.status(401).json({ message: 'Email or password is incorrect' })
      return
    }

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is missing')

    const token = jwt.sign({ userId: String(user._id) }, secret, { expiresIn: '2h' })
    res.json({ token, user: user.toJSON() })
  },
)
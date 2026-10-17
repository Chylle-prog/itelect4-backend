import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

interface TokenPayload extends jwt.JwtPayload {
  userId: string
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token. Send Authorization: Bearer <token>' })
    return
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is missing')

    const payload = jwt.verify(header.slice('Bearer '.length), secret)
    if (typeof payload === 'string' || typeof payload.userId !== 'string') {
      res.status(401).json({ message: 'Token is invalid or has expired' })
      return
    }

    req.userId = (payload as TokenPayload).userId
    next()
  } catch {
    res.status(401).json({ message: 'Token is invalid or has expired' })
  }
}
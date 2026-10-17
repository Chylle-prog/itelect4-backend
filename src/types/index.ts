import type { Types } from 'mongoose'

export interface User {
  id: number
  name: string
  email: string
  role: 'student' | 'admin' | 'instructor'
  isActive: boolean
  score?: number
}

export interface LostFoundItem {
  id: number
  title: string
  description: string
  category: string
  status: 'lost' | 'found'
  location: string
  postedByUserId: string
  claimedByUserId?: string
  verifiedByUserId?: string
  createdAt: Date
}

export interface Claim {
  id: number
  itemId: number
  claimantUserId: number
  notes: string
  status: 'pending' | 'approved' | 'rejected'
  verifiedByUserId?: number
  createdAt: Date
}

export type UserDoc = Omit<User, 'id'> & { password: string }

export type LostFoundItemDoc = Omit<
  LostFoundItem,
  'id' | 'postedByUserId' | 'claimedByUserId' | 'verifiedByUserId'
> & {
  postedByUserId: Types.ObjectId
  claimedByUserId?: Types.ObjectId
  verifiedByUserId?: Types.ObjectId
}

export interface ClaimDoc {
  itemId: Types.ObjectId
  claimantUserId: Types.ObjectId
  notes: string
  status: 'pending' | 'approved' | 'rejected'
  verifiedByUserId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type NewLostFoundItemBody = Pick<
  LostFoundItem,
  'title' | 'description' | 'category' | 'status' | 'location'
>
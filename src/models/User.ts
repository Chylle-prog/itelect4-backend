import bcrypt from 'bcryptjs'
import { model, Schema } from 'mongoose'
import type { UserDoc } from '../types/index.js'

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'instructor'],
      default: 'student',
    },
    isActive: { type: Boolean, default: true },
    score: { type: Number, min: 0, max: 100 },
    password: { type: String, required: true, minlength: 8, select: false },
  },
  { timestamps: true },
)

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.set('toJSON', {
  transform(_document, result: Record<string, unknown>) {
    result.id = String(result._id)
    delete result._id
    delete result.__v
    delete result.password
    return result
  },
})

export const User = model<UserDoc>('User', userSchema)
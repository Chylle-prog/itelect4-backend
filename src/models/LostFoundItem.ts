import { model, Schema } from 'mongoose'
import type { LostFoundItemDoc } from '../types/index.js'

const lostFoundItemSchema = new Schema<LostFoundItemDoc>(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 80 },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      enum: ['Accessories', 'Personal Items'],
      trim: true,
    },
    status: { type: String, required: true, enum: ['lost', 'found'] },
    location: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    postedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

lostFoundItemSchema.set('toJSON', {
  transform(_document, result: Record<string, unknown>) {
    result.id = String(result._id)
    result.postedByUserId = String(result.postedByUserId)
    if (result.claimedByUserId) result.claimedByUserId = String(result.claimedByUserId)
    if (result.verifiedByUserId) result.verifiedByUserId = String(result.verifiedByUserId)
    delete result._id
    delete result.__v
    return result
  },
})

export const LostFoundItemModel = model<LostFoundItemDoc>(
  'LostFoundItem',
  lostFoundItemSchema,
)
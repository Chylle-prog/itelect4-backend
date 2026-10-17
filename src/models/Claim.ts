import { model, Schema } from 'mongoose'
import type { ClaimDoc } from '../types/index.js'

const claimSchema = new Schema<ClaimDoc>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'LostFoundItem',
      required: true,
    },
    claimantUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: { type: String, required: true, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verifiedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

claimSchema.set('toJSON', {
  transform(_document, result) {
    const serialized = result as unknown as Record<string, unknown>
    serialized.id = String(serialized._id)
    serialized.itemId = String(serialized.itemId)
    serialized.claimantUserId = String(serialized.claimantUserId)
    if (serialized.verifiedByUserId) {
      serialized.verifiedByUserId = String(serialized.verifiedByUserId)
    }
    delete serialized._id
    delete serialized.__v
    return serialized
  },
})

export const ClaimModel = model<ClaimDoc>('Claim', claimSchema)
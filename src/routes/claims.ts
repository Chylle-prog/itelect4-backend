import { Router, type Request, type Response } from 'express'
import mongoose from 'mongoose'
import { requireAuth } from '../middleware/auth.js'
import { ClaimModel } from '../models/Claim.js'
import { LostFoundItemModel } from '../models/LostFoundItem.js'
import { User } from '../models/User.js'

interface IdParam {
  id: string
}

export const claimRouter = Router()

claimRouter.use(requireAuth)

function isObjectBody(body: unknown): body is Record<string, unknown> {
  return typeof body === 'object' && body !== null && !Array.isArray(body)
}

claimRouter.get('/', async (req: Request, res: Response) => {
  const ownedItemIds = await LostFoundItemModel.find({ postedByUserId: req.userId }).distinct('_id')
  const claims = await ClaimModel.find({
    $or: [
      { claimantUserId: req.userId },
      { itemId: { $in: ownedItemIds } },
    ],
  }).sort({ createdAt: -1 })
  res.json(claims)
})

claimRouter.post('/', async (req: Request, res: Response) => {
  if (!isObjectBody(req.body)) {
    res.status(400).json({ message: 'A JSON object is required' })
    return
  }

  const { itemId, notes } = req.body
  if (
    typeof itemId !== 'string' ||
    !mongoose.Types.ObjectId.isValid(itemId) ||
    typeof notes !== 'string' ||
    notes.trim().length === 0 ||
    notes.trim().length > 500
  ) {
    res.status(400).json({ message: 'A valid item id and claim evidence are required' })
    return
  }

  const item = await LostFoundItemModel.findById(itemId)
  if (!item) {
    res.status(404).json({ message: 'No item with that id' })
    return
  }

  const existingClaim = await ClaimModel.findOne({
    itemId,
    claimantUserId: req.userId,
    status: 'pending',
  })
  if (existingClaim) {
    res.status(409).json({ message: 'You already have a pending claim for this item' })
    return
  }

  const claim = await ClaimModel.create({
    itemId,
    claimantUserId: req.userId,
    notes: notes.trim(),
    status: 'pending',
  })
  res.status(201).json(claim)
})

claimRouter.patch('/:id', async (req: Request<IdParam>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id) || !isObjectBody(req.body)) {
    res.status(400).json({ message: 'A valid claim id and decision are required' })
    return
  }

  const { status } = req.body
  if (status !== 'approved' && status !== 'rejected') {
    res.status(400).json({ message: 'Claim status must be approved or rejected' })
    return
  }

  const claim = await ClaimModel.findById(req.params.id)
  if (!claim) {
    res.status(404).json({ message: 'No claim with that id' })
    return
  }

  const [item, reviewer] = await Promise.all([
    LostFoundItemModel.findById(claim.itemId),
    User.findById(req.userId).select('role'),
  ])
  if (!item) {
    res.status(404).json({ message: 'The claimed item no longer exists' })
    return
  }

  const isItemOwner = item.postedByUserId.toString() === req.userId
  const canReviewAll = reviewer?.role === 'admin' || reviewer?.role === 'instructor'
  if (!isItemOwner && !canReviewAll) {
    res.status(403).json({ message: 'Only the item owner or staff can review this claim' })
    return
  }

  claim.status = status
  claim.verifiedByUserId = new mongoose.Types.ObjectId(req.userId)
  await claim.save()

  if (status === 'approved') {
    await LostFoundItemModel.findByIdAndUpdate(item._id, {
      claimedByUserId: claim.claimantUserId,
    })
  }

  res.json(claim)
})
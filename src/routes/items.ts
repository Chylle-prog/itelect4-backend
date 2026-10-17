import { Router, type Request, type Response } from 'express'
import { LostFoundItemModel } from '../models/LostFoundItem.js'
import { requireAuth } from '../middleware/auth.js'
import type { NewLostFoundItemBody } from '../types/index.js'

interface IdParam {
  id: string
}

export const itemRouter = Router()

itemRouter.use(requireAuth)

function isObjectBody(body: unknown): body is Record<string, unknown> {
  return typeof body === 'object' && body !== null && !Array.isArray(body)
}

function pickItemFields(body: Record<string, unknown>): Partial<NewLostFoundItemBody> {
  const fields: Partial<NewLostFoundItemBody> = {}
  if (typeof body.title === 'string') fields.title = body.title
  if (typeof body.description === 'string') fields.description = body.description
  if (typeof body.category === 'string') fields.category = body.category
  if (body.status === 'lost' || body.status === 'found') fields.status = body.status
  if (typeof body.location === 'string') fields.location = body.location
  return fields
}

itemRouter.get('/', async (req: Request, res: Response) => {
  const items = await LostFoundItemModel.find({ postedByUserId: req.userId }).sort({
    createdAt: -1,
  })
  res.json(items)
})

itemRouter.get('/:id', async (req: Request<IdParam>, res: Response) => {
  const item = await LostFoundItemModel.findOne({
    _id: req.params.id,
    postedByUserId: req.userId,
  })
  if (!item) {
    res.status(404).json({ message: 'No item with that id' })
    return
  }

  res.json(item)
})

itemRouter.post(
  '/',
  async (req: Request<unknown, unknown, NewLostFoundItemBody>, res: Response) => {
    if (!isObjectBody(req.body)) {
      res.status(400).json({ message: 'A JSON object is required' })
      return
    }

    const item = await LostFoundItemModel.create({
      ...pickItemFields(req.body),
      postedByUserId: req.userId,
    })
    res.status(201).json(item)
  },
)

itemRouter.patch(
  '/:id',
  async (req: Request<IdParam, unknown, Partial<NewLostFoundItemBody>>, res: Response) => {
    if (!isObjectBody(req.body)) {
      res.status(400).json({ message: 'A JSON object is required' })
      return
    }

    const updates = pickItemFields(req.body)
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: 'At least one editable item field is required' })
      return
    }

    const item = await LostFoundItemModel.findOneAndUpdate(
      { _id: req.params.id, postedByUserId: req.userId },
      updates,
      { new: true, runValidators: true },
    )
    if (!item) {
      res.status(404).json({ message: 'No item with that id' })
      return
    }

    res.json(item)
  },
)

itemRouter.delete('/:id', async (req: Request<IdParam>, res: Response) => {
  const item = await LostFoundItemModel.findOneAndDelete({
    _id: req.params.id,
    postedByUserId: req.userId,
  })
  if (!item) {
    res.status(404).json({ message: 'No item with that id' })
    return
  }

  res.status(204).send()
})
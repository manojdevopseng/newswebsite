import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import ArticleModel from '@/lib/db/models/Article'
import { isRateLimited, getIP } from '@/lib/rate-limit'

const VALID_TYPES = ['like', 'love', 'fire', 'wow'] as const
type ReactionType = typeof VALID_TYPES[number]

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Rate limit: 10 reactions per minute per IP
  const ip = getIP(req)
  if (await isRateLimited(`react:${ip}`, 10, 60 * 1000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const body = await req.json().catch(() => ({}))
  const type  = body.type as ReactionType
  const undo  = body.undo === true  // true = remove reaction

  if (!VALID_TYPES.includes(type))
    return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })

  await dbConnect()

  const inc = undo ? -1 : 1
  const article = await ArticleModel.findOneAndUpdate(
    { _id: id, status: 'published' },
    { $inc: { [`reactions.${type}`]: inc } },
    { new: true, select: 'reactions' }
  ).lean()

  if (!article)
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })

  return NextResponse.json({ reactions: (article as any).reactions })
}

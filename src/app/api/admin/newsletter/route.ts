export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import NewsletterModel from '@/lib/db/models/Newsletter'
import { escapeRegex } from '@/lib/sanitize'

// GET /api/admin/newsletter — list subscribers with optional filters
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const { searchParams } = new URL(req.url)
  const status  = searchParams.get('status') || ''
  const page    = parseInt(searchParams.get('page') || '1')
  const limit   = parseInt(searchParams.get('limit') || '50')
  const search  = searchParams.get('search') || ''

  const filter: Record<string, any> = {}
  if (status && status !== 'all') filter.status = status
  if (search) filter.email = { $regex: escapeRegex(search.slice(0, 100)), $options: 'i' }

  const [subscribers, total, activeCount, unsubCount] = await Promise.all([
    NewsletterModel.find(filter).sort({ subscribedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    NewsletterModel.countDocuments(filter),
    NewsletterModel.countDocuments({ status: 'active' }),
    NewsletterModel.countDocuments({ status: 'unsubscribed' }),
  ])

  return NextResponse.json({
    data: subscribers.map((s: any) => ({ ...s, _id: s._id.toString() })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: { active: activeCount, unsubscribed: unsubCount, total: activeCount + unsubCount },
  })
}

// DELETE /api/admin/newsletter — delete a subscriber by id
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await dbConnect()
  await NewsletterModel.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}

// PATCH /api/admin/newsletter — update status
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'ID and status required' }, { status: 400 })

  await dbConnect()
  const updated = await NewsletterModel.findByIdAndUpdate(id, { status }, { new: true }).lean()
  return NextResponse.json({ data: { ...(updated as any), _id: (updated as any)._id.toString() } })
}

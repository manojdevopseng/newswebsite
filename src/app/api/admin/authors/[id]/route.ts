import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import AuthorModel from '@/lib/db/models/Author'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await dbConnect()
  try {
    const body   = await req.json()
    const author = await AuthorModel.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })
    if (!author) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: author })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await dbConnect()
  await AuthorModel.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}

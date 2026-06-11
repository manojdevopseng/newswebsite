import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import ArticleModel from '@/lib/db/models/Article'
import '@/lib/db/models/Author'   // register Author schema for populate()
import '@/lib/db/models/Category' // register Category schema for populate()
import { logActivity } from '@/lib/admin/activity'
import { sanitizeHtml } from '@/lib/sanitize'
import { notifyPublished } from '@/lib/indexnow'
import { bustArticleCaches } from '@/lib/cache'

export const dynamic = 'force-dynamic'

function calcReadingTime(html: string): number {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

// GET — single article
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await dbConnect()

  const article = await ArticleModel.findById(id)
    .populate('category', 'name color slug')
    .populate('author', 'name slug')
    .lean()

  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: article })
}

// PATCH — update article
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // auth/params/dbConnect are inside try/catch so any failure returns JSON (not HTML 500)
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await dbConnect()

    const body = await req.json()

    // Strip immutable / server-only fields — MongoDB throws if _id is in $set
    delete body._id
    delete body.__v
    delete body.createdAt
    delete body.tweetOnPublish // editor-only flag, not a schema field

    // Sanitize HTML content before saving (XSS prevention)
    if (body.contentHtml)    body.contentHtml    = sanitizeHtml(body.contentHtml)
    if (body.contentHtml_hi) body.contentHtml_hi = sanitizeHtml(body.contentHtml_hi)

    // Auto reading time on content update
    if (body.contentHtml) body.readingTime = calcReadingTime(body.contentHtml)

    // Auto publishedAt on first publish
    if (body.status === 'published') {
      const existing = await ArticleModel.findById(id).select('publishedAt').lean() as any
      if (existing && !existing.publishedAt) body.publishedAt = new Date()
    }

    const article = await ArticleModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('category', 'name color slug').populate('author', 'name slug')

    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Bust Next.js data cache so edits appear immediately on the frontend
    const catSlug = (article as any).category?.slug
    const artSlug = (article as any).slug
    if (catSlug && artSlug) {
      revalidatePath(`/${catSlug}/${artSlug}`) // article page
      revalidatePath(`/${catSlug}`)            // category listing
    }
    revalidatePath('/', 'layout')              // homepage + all cached pages
    revalidatePath('/sitemap.xml')             // sitemap — force immediate regeneration

    // Bust Redis cache
    bustArticleCaches(artSlug, id).catch(() => {})

    // Notify IndexNow + ping Google/Bing sitemaps whenever article is published/updated
    if (body.status === 'published' && catSlug && artSlug) {
      notifyPublished(catSlug, artSlug).catch(() => {})
    }

    logActivity({
      action:      body.status === 'published' ? 'article.published'
                 : body.status === 'archived'  ? 'article.archived'
                 : 'article.updated',
      entityType:  'article',
      entityId:    id,
      entityTitle: (article as any).title,
    })

    return NextResponse.json({ data: article })
  } catch (err: any) {
    console.error('[PATCH /api/admin/articles/[id]]', err?.message ?? err)
    const status = typeof err?.status === 'number' ? err.status : 500
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status }
    )
  }
}

// DELETE — delete article
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await dbConnect()

  // Fetch before deleting so we can revalidate the right paths
  const article = await ArticleModel.findById(id)
    .populate('category', 'slug')
    .lean() as any

  await ArticleModel.findByIdAndDelete(id)

  // Bust cache for all affected pages
  if (article) {
    const catSlug = article.category?.slug
    const artSlug = article.slug
    if (catSlug && artSlug) {
      revalidatePath(`/${catSlug}/${artSlug}`) // article page
      revalidatePath(`/${catSlug}`)            // category listing
    }
    bustArticleCaches(artSlug, id).catch(() => {})
  }
  revalidatePath('/', 'layout')              // homepage + all cached pages

  logActivity({
    action:      'article.deleted',
    entityType:  'article',
    entityId:    id,
    entityTitle: article?.title ?? id,
  })

  return NextResponse.json({ success: true })
}

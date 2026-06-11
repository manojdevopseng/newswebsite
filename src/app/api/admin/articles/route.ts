export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import ArticleModel from '@/lib/db/models/Article'
import CategoryModel from '@/lib/db/models/Category'
import '@/lib/db/models/Author'   // register Author schema for populate()
import { logActivity } from '@/lib/admin/activity'
import { sanitizeHtml, escapeRegex } from '@/lib/sanitize'
import { isRateLimited, getIP } from '@/lib/rate-limit'
import { notifyPublished } from '@/lib/indexnow'
import { bustArticleCaches } from '@/lib/cache'

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

function calcReadingTime(html: string): number {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

// GET — list all articles
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')
  const category = searchParams.get('category')
  const search   = searchParams.get('search')
  const page     = parseInt(searchParams.get('page') || '1')
  const limit    = parseInt(searchParams.get('limit') || '20')

  await dbConnect()

  const filter: any = {}
  if (status)   filter.status   = status
  if (category) filter.category = category
  if (search) {
    const safe = escapeRegex(search.slice(0, 100)) // cap length + escape special chars
    filter.$or = [
      { title: { $regex: safe, $options: 'i' } },
      { slug:  { $regex: safe, $options: 'i' } },
    ]
  }

  const [articles, total] = await Promise.all([
    ArticleModel.find(filter)
      .populate('category', 'name color slug')
      .populate('author', 'name')
      .select('title slug status category author publishedAt createdAt views readingTime')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ArticleModel.countDocuments(filter),
  ])

  return NextResponse.json({ data: articles, total, page, pages: Math.ceil(total / limit) })
}

// POST — create article
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 30 article creates per hour per IP
  const ip = getIP(req)
  if (await isRateLimited(`admin:article:create:${ip}`, 30, 60 * 60 * 1000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await dbConnect()
    const body = await req.json()

    // Auto-generate slug
    if (!body.slug && body.title) body.slug = slugify(body.title)

    // Ensure unique slug
    const existing = await ArticleModel.findOne({ slug: body.slug })
    if (existing) body.slug = `${body.slug}-${Date.now().toString(36)}`

    // Sanitize HTML content before saving (XSS prevention)
    if (body.contentHtml)    body.contentHtml    = sanitizeHtml(body.contentHtml)
    if (body.contentHtml_hi) body.contentHtml_hi = sanitizeHtml(body.contentHtml_hi)

    // Auto reading time
    if (body.contentHtml) body.readingTime = calcReadingTime(body.contentHtml)

    // Auto publishedAt
    if (body.status === 'published' && !body.publishedAt) body.publishedAt = new Date()

    const article = await ArticleModel.create(body)

    // Bust Next.js data cache + notify search engines when published
    if (body.status === 'published') {
      const cat = await CategoryModel.findById(body.category).select('slug name').lean() as any
      if (cat?.slug) {
        revalidatePath(`/${cat.slug}`)
        revalidatePath(`/${cat.slug}/${body.slug}`)
        // Notify IndexNow + ping Google/Bing sitemaps — fire-and-forget
        notifyPublished(cat.slug, body.slug).catch(() => {})
      }
      revalidatePath('/', 'layout')
      revalidatePath('/sitemap.xml')
      // Bust Redis listing caches so new article appears immediately
      bustArticleCaches(article.slug, article._id.toString()).catch(() => {})
    }

    logActivity({
      action:      body.status === 'published' ? 'article.published' : 'article.created',
      entityType:  'article',
      entityId:    article._id.toString(),
      entityTitle: article.title,
    })

    return NextResponse.json({ data: article }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

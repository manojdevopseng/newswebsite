import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import ArticleModel from '@/lib/db/models/Article'
import '@/lib/db/models/Category'
import { siteConfig } from '@/config/site'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await dbConnect()

    const articles = await ArticleModel.find({
      status:        'published',
      featuredImage: { $exists: true, $ne: '' },
    })
      .populate('category', 'slug')
      .select('title slug excerpt category featuredImage publishedAt')
      .sort({ publishedAt: -1 })
      .limit(2000)
      .lean()
      .exec()

    const urls = articles
      .filter((a: any) => a.category?.slug && a.slug && a.featuredImage)
      .map((a: any) => {
        const url     = `${siteConfig.url}/${a.category.slug}/${a.slug}`
        const imgUrl  = escapeXml(a.featuredImage)
        const title   = escapeXml(a.title ?? '')
        const caption = escapeXml((a.excerpt ?? '').slice(0, 200))

        return `  <url>
    <loc>${url}</loc>
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${title}</image:title>
      ${caption ? `<image:caption>${caption}</image:caption>` : ''}
    </image:image>
  </url>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${urls}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type':  'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
      },
    })
  } catch {
    return new NextResponse('Error generating image sitemap', { status: 500 })
  }
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

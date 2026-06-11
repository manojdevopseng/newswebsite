import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import ArticleModel from '@/lib/db/models/Article'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ArticlesTable } from '@/components/admin/articles/ArticlesTable'
import { AdminPaginationLinks } from '@/components/admin/shared/AdminPaginationLinks'

export const metadata: Metadata = { title: 'Articles' }
export const dynamic = 'force-dynamic'

interface SearchParams { status?: string; page?: string }

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const sp     = await searchParams
  const status = sp.status || ''
  const page   = parseInt(sp.page || '1')
  const limit  = 20

  await dbConnect()

  const filter: any = {}
  if (status) filter.status = status

  const [articles, total, counts] = await Promise.all([
    ArticleModel.find(filter)
      .populate('category', 'name color slug')
      .populate('author', 'name')
      .select('title slug status category author publishedAt createdAt views')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ArticleModel.countDocuments(filter),
    ArticleModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ])

  const countMap: Record<string, number> = {}
  counts.forEach((c: any) => { countMap[c._id] = c.count })
  const totalCount = Object.values(countMap).reduce((a: number, b: number) => a + b, 0)
  const pages      = Math.ceil(total / limit)

  const serialized = JSON.parse(JSON.stringify(articles))

  return (
    <div className="max-w-6xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Articles</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} articles</p>
        </div>
        <Link href="/admin/articles/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
          <Plus className="w-4 h-4" /> New Article
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-1">
        {[
          { label: 'All',       value: '',          count: totalCount },
          { label: 'Published', value: 'published', count: countMap.published || 0 },
          { label: 'Draft',     value: 'draft',     count: countMap.draft     || 0 },
          { label: 'Archived',  value: 'archived',  count: countMap.archived  || 0 },
        ].map(tab => (
          <Link key={tab.value} href={`/admin/articles?status=${tab.value}`}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all',
              status === tab.value ? 'bg-white/[0.08] text-white font-medium' : 'text-slate-400 hover:text-white'
            )}>
            {tab.label}
            <span className="text-xs bg-white/[0.06] px-1.5 py-0.5 rounded-full">{tab.count}</span>
          </Link>
        ))}
      </div>

      {/* Client table — bulk actions + duplicate + scheduled badge */}
      <ArticlesTable articles={serialized} status={status} />

      {/* Pagination */}
      <AdminPaginationLinks
        page={page}
        totalPages={pages}
        baseHref="/admin/articles"
        extraQuery={status ? `&status=${status}` : ''}
      />
    </div>
  )
}

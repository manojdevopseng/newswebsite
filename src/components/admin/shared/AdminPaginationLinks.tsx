import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  page:       number
  totalPages: number
  /** Base URL, e.g. "/admin/articles"  */
  baseHref:   string
  /** Extra query params to append, e.g. "&status=published" */
  extraQuery?: string
}

function buildRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const shown = new Set<number>([
    1, 2,
    ...Array.from({ length: 5 }, (_, i) => current - 2 + i).filter(p => p >= 1 && p <= total),
    total - 1, total,
  ])

  const sorted = [...shown].sort((a, b) => a - b)
  const result: (number | '...')[] = []
  let prev = 0

  for (const p of sorted) {
    if (p - prev > 1) result.push('...')
    result.push(p)
    prev = p
  }

  return result
}

/** Server-safe (no 'use client') pagination using <Link> — for Server Components. */
export function AdminPaginationLinks({ page, totalPages, baseHref, extraQuery = '' }: Props) {
  if (totalPages <= 1) return null

  const range = buildRange(page, totalPages)

  function href(p: number) {
    return `${baseHref}?page=${p}${extraQuery}`
  }

  function Item({
    targetPage,
    disabled,
    children,
  }: {
    targetPage: number
    disabled?:  boolean
    children:   React.ReactNode
  }) {
    const isActive = targetPage === page
    const cls = cn(
      'min-w-[2rem] h-8 px-2 rounded-lg text-sm flex items-center justify-center transition-all select-none font-medium',
      isActive   ? 'bg-blue-600 text-white pointer-events-none'
      : disabled ? 'opacity-30 cursor-not-allowed text-slate-500 pointer-events-none'
      : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white'
    )

    if (disabled || isActive) {
      return <span className={cls}>{children}</span>
    }

    return <Link href={href(targetPage)} className={cls}>{children}</Link>
  }

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {/* ← Prev */}
      <Item targetPage={page - 1} disabled={page <= 1}>
        <ChevronLeft className="w-4 h-4" />
      </Item>

      {/* Page numbers + ellipsis */}
      {range.map((p, i) =>
        p === '...'
          ? (
            <span
              key={`dots-${i}`}
              className="w-8 h-8 flex items-center justify-center text-slate-600 text-sm select-none"
            >
              …
            </span>
          )
          : (
            <Item key={p} targetPage={p}>
              {p}
            </Item>
          )
      )}

      {/* Next → */}
      <Item targetPage={page + 1} disabled={page >= totalPages}>
        <ChevronRight className="w-4 h-4" />
      </Item>
    </div>
  )
}

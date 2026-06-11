'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, Eye, Mail, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap = {
  FileText, Eye, Mail, TrendingUp,
} as const

interface Stat {
  label:    string
  value:    number
  sub:      string
  delta:    number
  icon:     keyof typeof iconMap
  color:    string
  bgColor:  string
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    const start     = performance.now()
    const duration  = 1200
    const startVal  = 0

    function tick(now: number) {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      const ease     = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
      setCount(Math.floor(startVal + (target - startVal) * ease))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target])

  return <span>{count.toLocaleString()}</span>
}

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon      = iconMap[stat.icon]
        const isPos     = stat.delta >= 0
        const DeltaIcon = isPos ? ArrowUpRight : ArrowDownRight

        return (
          <div
            key={stat.label}
            className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5 relative overflow-hidden group hover:border-white/[0.10] transition-all"
          >
            {/* Glow bg */}
            <div className={cn('absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity', stat.bgColor)} />

            <div className="flex items-start justify-between relative z-10">
              <div className={cn('p-2 rounded-lg', stat.bgColor + '/20')}>
                <Icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                isPos
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              )}>
                <DeltaIcon className="w-3 h-3" />
                {Math.abs(stat.delta)}%
              </div>
            </div>

            <div className="mt-4 relative z-10">
              <div className="text-3xl font-bold text-white tracking-tight">
                <AnimatedCounter target={stat.value} />
              </div>
              <div className="text-sm text-slate-400 mt-0.5">{stat.label}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.sub}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

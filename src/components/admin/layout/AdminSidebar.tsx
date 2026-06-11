'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, FileText, FolderOpen, Users, Image,
  BarChart2, Mail, Settings, LogOut, Zap, PenSquare, ChevronRight, ExternalLink,
  MessageCircle, Activity, Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard',    href: '/admin',            icon: LayoutDashboard },
  { label: 'Articles',     href: '/admin/articles',   icon: FileText        },
  { label: 'Categories',   href: '/admin/categories', icon: FolderOpen      },
  { label: 'Authors',      href: '/admin/authors',    icon: Users           },
  { label: 'Tags',         href: '/admin/tags',       icon: Tag             },
  { label: 'Media',        href: '/admin/media',      icon: Image           },
  { label: 'Analytics',    href: '/admin/analytics',  icon: BarChart2       },
  { label: 'Comments',     href: '/admin/comments',   icon: MessageCircle   },
  { label: 'Newsletter',   href: '/admin/newsletter', icon: Mail            },
  { label: 'Activity Log', href: '/admin/activity',   icon: Activity        },
  { label: 'Settings',     href: '/admin/settings',   icon: Settings        },
]

export function AdminSidebar() {
  const pathname      = usePathname()
  const [pending, setPending] = useState(0)

  // Poll pending comment count every 60s
  useEffect(() => {
    async function fetchPending() {
      try {
        const res  = await fetch('/api/admin/comments?status=pending&page=1')
        const json = await res.json()
        setPending(json.pendingCount || 0)
      } catch { /* ignore */ }
    }
    fetchPending()
    const interval = setInterval(fetchPending, 60_000)
    return () => clearInterval(interval)
  }, [])

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#080810] border-r border-white/[0.06] flex flex-col z-40">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-400" fill="currentColor" />
            </div>
            <div className="absolute inset-0 rounded-lg bg-blue-400/10 blur-sm" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">TechPulseGlobe</p>
            <p className="text-[10px] text-slate-500 mt-0.5">CMS Dashboard</p>
          </div>
        </Link>
      </div>

      {/* New Article Quick Button */}
      <div className="px-3 py-3 border-b border-white/[0.06]">
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 w-full bg-blue-600/90 hover:bg-blue-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition-all"
        >
          <PenSquare className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon    = item.icon
          const active  = isActive(item.href)
          const isComments = item.href === '/admin/comments'
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group',
                active
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} />
              <span className="flex-1">{item.label}</span>
              {isComments && pending > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400">
                  {pending}
                </span>
              )}
              {active && !isComments && <ChevronRight className="w-3 h-3 text-blue-400/60" />}
              {active &&  isComments && pending === 0 && <ChevronRight className="w-3 h-3 text-blue-400/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/[0.06] space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <ExternalLink className="w-4 h-4 text-slate-500" />
          View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}


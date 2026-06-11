'use client'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Providers }   from './Providers'
import { Header }      from './Header'
import { Footer }      from './Footer'

// Lazy load — SearchModal is never visible on initial render
const SearchModal = dynamic(
  () => import('@/components/search/SearchModal').then(m => ({ default: m.SearchModal })),
  { ssr: false }
)

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Admin panel gets no site chrome — Payload has its own UI
  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <Providers>
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <SearchModal />
    </Providers>
  )
}

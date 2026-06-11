import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminTopbar } from '@/components/admin/layout/AdminTopbar'
import { AdminProvider } from '@/components/admin/layout/AdminProvider'
import { auth } from '@/lib/admin/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: { default: 'CMS Dashboard', template: '%s — TechPulseGlobe CMS' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Login page — no shell
  return (
    <AdminProvider>
      {session ? (
        <div className="min-h-screen bg-[#080810] text-white flex">
          <AdminSidebar />
          <div className="flex-1 ml-60 flex flex-col min-h-screen">
            <AdminTopbar />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      ) : (
        // Login page — no sidebar/topbar
        <div className="min-h-screen bg-[#080810]">
          {children}
        </div>
      )}
    </AdminProvider>
  )
}


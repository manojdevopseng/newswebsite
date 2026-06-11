'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

export function AdminProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#0f0f1a',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#f1f5f9',
          },
        }}
      />
    </SessionProvider>
  )
}

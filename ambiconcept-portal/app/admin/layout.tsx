'use client'
import { useAuth } from '@/lib/auth-context'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-950">
        <div className="w-8 h-8 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (!appUser || appUser.role !== 'admin') return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  )
}

'use client'
import { useAuth } from '@/lib/auth-context'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading } = useAuth()

  // ✅ Sem router.replace aqui — o AuthProvider em lib/auth-context.tsx
  // já trata de todos os redirects por role (admin → /admin, não-auth → /login).
  // Ter redirect aqui E no AuthContext causava race condition.

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  // Guarda de segurança: se de alguma forma chegou aqui sem auth,
  // mostra spinner enquanto o AuthContext faz o redirect
  if (!appUser || appUser.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

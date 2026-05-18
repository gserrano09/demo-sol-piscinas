'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/dashboard',         label: 'Início',    icon: 'home' },
  { href: '/dashboard/library', label: 'Recursos',  icon: 'library' },
]

function Icon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    home:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    library: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    logout:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  }
  return <span className="w-[18px] h-[18px] flex-shrink-0">{icons[name]}</span>
}

export function DashboardSidebar() {
  const pathname  = usePathname()
  const { appUser, signOut } = useAuth()
  const router    = useRouter()

  async function handleLogout() {
    await signOut()
    router.replace('/login')
    toast.success('Sessão terminada')
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L4 7l2.5 2.5L9 6l2.5 3.5L14 7Z" fill="#6EC43A"/>
              <path d="M6.5 9.5L9 13.5l2.5-4" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div>
            <div className="text-xs font-700 text-brand-900 leading-none">AMBICONCEPT</div>
            <div className="text-[10px] text-gray-400 font-500">Portal</div>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      {appUser && (
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-xs text-gray-500 mb-1">{appUser.name}</div>
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-700 uppercase tracking-wider',
            appUser.role === 'distribuidor' ? 'bg-blue-50 text-blue-600' : 'bg-brand-50 text-brand-600',
          )}>
            {appUser.role}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-500 transition-all duration-150',
                active
                  ? 'bg-brand-50 text-brand-700 font-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-500 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <Icon name="logout" />
          Terminar sessão
        </button>
      </div>
    </aside>
  )
}

'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/admin',           label: 'Dashboard',   icon: 'grid' },
  { href: '/admin/products',  label: 'Produtos',     icon: 'box' },
  { href: '/admin/upload',    label: 'Upload',       icon: 'upload' },
  { href: '/admin/users',     label: 'Utilizadores', icon: 'users' },
  { href: '/admin/settings',  label: 'Definições',   icon: 'settings' },
]

const ICONS: Record<string, JSX.Element> = {
  grid:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  box:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  upload:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  users:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14M19.07 19.07A10 10 0 0 1 4.93 4.93M4.93 19.07A10 10 0 0 0 19.07 4.93"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { appUser, signOut } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await signOut()
    router.replace('/login')
    toast.success('Sessão terminada')
  }

  return (
    <aside className="w-56 bg-brand-950 flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L4 7l2.5 2.5L9 6l2.5 3.5L14 7Z" fill="#6EC43A"/>
              <path d="M6.5 9.5L9 13.5l2.5-4" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div>
            <div className="text-xs font-700 text-white leading-none">AMBICONCEPT</div>
            <div className="text-[10px] text-white/40 font-500 mt-0.5">Admin</div>
          </div>
        </Link>
      </div>

      {/* User */}
      {appUser && (
        <div className="px-5 py-3.5 border-b border-white/10">
          <div className="text-xs text-white/50 truncate">{appUser.email}</div>
          <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-700 uppercase bg-accent/20 text-accent">
            Admin
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href ||
                        (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-500 transition-all duration-150',
                active
                  ? 'bg-white/12 text-white font-600'
                  : 'text-white/55 hover:bg-white/8 hover:text-white/80',
              )}
            >
              <span className="w-[16px] h-[16px]">{ICONS[item.icon]}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-500 text-white/40 hover:bg-white/8 hover:text-white/70 transition-all"
        >
          <span className="w-[16px] h-[16px]">{ICONS.logout}</span>
          Sair
        </button>
      </div>
    </aside>
  )
}

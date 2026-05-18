'use client'
import {
  createContext, useContext, useEffect, useState, ReactNode
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  onAuthStateChanged, User,
  signInWithEmailAndPassword, signOut as fbSignOut,
} from 'firebase/auth'
import { auth }    from '@/firebase'
import { getUser } from '@/firestore'
import type { AppUser } from '@/types'

interface AuthContextValue {
  user:    User | null
  appUser: AppUser | null
  loading: boolean
  signIn:  (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Paths where we should NOT redirect (public pages)
const PUBLIC_PATHS = ['/', '/login', '/products']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const router   = useRouter()
  const pathname = usePathname()

  // ── 1. Auth state listener ──────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      if (fbUser) {
        const data = await getUser(fbUser.uid)
        setAppUser(data)
      } else {
        setAppUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // ── 2. Role-based redirect (runs whenever appUser or pathname changes) ──
  useEffect(() => {
    if (loading) return  // wait for auth state to resolve

    const isPublic = PUBLIC_PATHS.some(
      p => pathname === p || pathname.startsWith('/products/')
    )

    if (!appUser) {
      // Not logged in → send to login (except if already on a public page)
      if (!isPublic && pathname !== '/login') {
        router.replace('/login')
      }
      return
    }

    // Logged in → role-based redirect
    if (appUser.role === 'admin') {
      // Admin trying to access non-admin area
      if (!pathname.startsWith('/admin')) {
        router.replace('/admin')
      }
    } else {
      // Distribuidor / parceiro trying to access admin or login/public
      if (pathname.startsWith('/admin') || pathname === '/login') {
        router.replace('/dashboard')
      }
    }
  }, [loading, appUser, pathname, router])

  // ── 3. Auth actions ─────────────────────────────────────
  async function signIn(email: string, password: string) {
    // Just authenticate — the useEffect above handles the redirect
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signOut() {
    await fbSignOut(auth)
    router.replace('/login')
  }

  return (
    <AuthContext.Provider value={{ user, appUser, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

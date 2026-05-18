'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function PublicNav() {
  const { appUser, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const dashPath = appUser?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm'
        : 'bg-transparent',
    )}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L4 7l2.5 2.5L9 6l2.5 3.5L14 7Z" fill="#6EC43A"/>
              <path d="M6.5 9.5L9 13.5l2.5-4" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <span className="font-700 text-brand-900 text-sm tracking-tight">
            AMBI<span className="text-brand-500">CONCEPT</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-500 text-gray-600 hover:text-brand-600 transition-colors">
            Início
          </Link>
          <Link href="/products" className="text-sm font-500 text-gray-600 hover:text-brand-600 transition-colors">
            Produtos
          </Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {!loading && (
            appUser ? (
              <Link href={dashPath}>
                <Button size="sm">Portal</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm">Entrar no Portal</Button>
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  )
}

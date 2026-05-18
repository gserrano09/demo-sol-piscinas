'use client'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const { signIn } = useAuth()
  // ✅ Sem router, sem redirect aqui — o AuthContext trata disso

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      // O AuthProvider detecta o novo utilizador via onAuthStateChanged
      // e redireciona automaticamente: admin → /admin, outros → /dashboard
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'E-mail ou password incorrectos.'
        : err.code === 'auth/user-not-found'
        ? 'Utilizador não encontrado.'
        : err.code === 'auth/wrong-password'
        ? 'Password incorrecta.'
        : err.message || 'Erro ao iniciar sessão.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 to-brand-800 flex items-center justify-center p-4">
      {/* Background dots */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(110,196,58,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fade-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-4 shadow-brand">
              <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
                <path d="M9 1L4 7l2.5 2.5L9 6l2.5 3.5L14 7Z" fill="#6EC43A"/>
                <path d="M6.5 9.5L9 13.5l2.5-4" stroke="white" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Acesso ao Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Ambiconcept Waste Solutions</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@empresa.pt"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Entrar
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Sem acesso?{' '}
              <a href="mailto:it@ambiconcept.pt" className="text-brand-500 hover:underline">
                Solicitar ao administrador
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-white/50 hover:text-white text-xs transition-colors">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}

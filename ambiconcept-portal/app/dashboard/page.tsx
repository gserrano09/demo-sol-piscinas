'use client'
import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { getProducts, getResourcesByCompany } from '@/firestore'
import { ROLE_PERMISSIONS, RESOURCE_TYPE_LABELS } from '@/types'
import type { Product, Resource } from '@/types'
import Link from 'next/link'

export default function DashboardHome() {
  const { appUser } = useAuth()
  const [products,  setProducts]  = useState<Product[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!appUser) return
    Promise.all([
      getProducts(appUser.companyId),
      getResourcesByCompany(appUser.companyId),
    ]).then(([p, r]) => {
      setProducts(p)
      // Filter by role
      const allowed = ROLE_PERMISSIONS[appUser.role]
      setResources(r.filter(res => allowed.includes(res.type)))
    }).finally(() => setLoading(false))
  }, [appUser])

  if (!appUser) return null

  const isDist    = appUser.role === 'distribuidor'
  const greeting  = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'
  const allowedTypes = ROLE_PERMISSIONS[appUser.role]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-700 text-gray-900">
          {greeting}, {appUser?.name?.split(' ')[0] || 'Utilizador'} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Aqui está um resumo dos seus recursos disponíveis.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
          <div className="text-2xl font-800 text-brand-500">{products.length}</div>
          <div className="text-xs text-gray-500 font-500 mt-1 uppercase tracking-wide">Produtos</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
          <div className="text-2xl font-800 text-brand-500">{resources.length}</div>
          <div className="text-xs text-gray-500 font-500 mt-1 uppercase tracking-wide">Ficheiros disponíveis</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
          <div className="text-2xl font-800 text-brand-500">{allowedTypes.length}</div>
          <div className="text-xs text-gray-500 font-500 mt-1 uppercase tracking-wide">Categorias de acesso</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
          <div className={`text-2xl font-800 ${isDist ? 'text-blue-500' : 'text-brand-500'}`}>
            {isDist ? 'Dist.' : 'Parceiro'}
          </div>
          <div className="text-xs text-gray-500 font-500 mt-1 uppercase tracking-wide">Perfil</div>
        </div>
      </div>

      {/* Access */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Allowed types */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <h2 className="font-700 text-gray-900 mb-4">O seu acesso</h2>
          <div className="space-y-2">
            {allowedTypes.map(type => (
              <div key={type} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
                <span className="text-sm text-gray-700">{RESOURCE_TYPE_LABELS[type]}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {resources.filter(r => r.type === type).length} ficheiros
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/library"
            className="mt-4 inline-flex items-center gap-1 text-brand-500 text-sm font-600 hover:underline"
          >
            Ver todos os recursos →
          </Link>
        </div>

        {/* Products list */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <h2 className="font-700 text-gray-900 mb-4">Produtos disponíveis</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">Nenhum produto atribuído.</p>
          ) : (
            <div className="space-y-2">
              {products.slice(0,6).map(p => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 hover:text-brand-600 transition-colors group"
                >
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-xs font-700 text-brand-500">
                    {p.name.slice(0,2).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-brand-600">{p.name}</span>
                  <svg className="w-4 h-4 ml-auto text-gray-300 group-hover:text-brand-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

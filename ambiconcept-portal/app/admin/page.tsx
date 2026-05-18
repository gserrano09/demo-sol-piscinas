'use client'
import { useEffect, useState } from 'react'
import { getProducts, getUsers, getResourcesByCompany } from '@/firestore'
import { getCompanies } from '@/firestore'
import type { Product, AppUser, Company } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminDashboard() {
  const [products,   setProducts]   = useState<Product[]>([])
  const [users,      setUsers]      = useState<AppUser[]>([])
  const [companies,  setCompanies]  = useState<Company[]>([])
  const [totalFiles, setTotalFiles] = useState(0)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      getProducts(),
      getUsers(),
      getCompanies(),
    ]).then(async ([p, u, c]) => {
      setProducts(p)
      setUsers(u)
      setCompanies(c)
      // Sum files across all companies
      const allFiles = await Promise.all(c.map(co => getResourcesByCompany(co.id)))
      setTotalFiles(allFiles.flat().length)
      setLoading(false)
    })
  }, [])

  const admins = users.filter(u => u.role === 'admin').length
  const dists  = users.filter(u => u.role === 'distribuidor').length
  const parts  = users.filter(u => u.role === 'parceiro').length

  const STATS = [
    { label: 'Produtos',       value: products.length,  color: 'bg-brand-50 text-brand-600',  icon: '📦' },
    { label: 'Utilizadores',   value: users.length - admins, color: 'bg-blue-50 text-blue-600',   icon: '👥' },
    { label: 'Empresas',       value: companies.length, color: 'bg-amber-50 text-amber-600',  icon: '🏢' },
    { label: 'Ficheiros',      value: totalFiles,       color: 'bg-purple-50 text-purple-600', icon: '📁' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-700 text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Visão geral da plataforma Ambiconcept.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-800 text-gray-900">
              {loading ? <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" /> : s.value}
            </div>
            <div className="text-xs text-gray-500 font-500 mt-1 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent products */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-700 text-gray-900">Produtos recentes</h2>
            <a href="/admin/products" className="text-xs text-brand-500 font-600 hover:underline">Ver todos</a>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i=><div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>)}
            </div>
          ) : products.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">Nenhum produto criado.</p>
          ) : (
            <div className="space-y-3">
              {products.slice(0,5).map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-xs font-700 text-brand-500 flex-shrink-0">
                    {p.name.slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User breakdown */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <h2 className="font-700 text-gray-900 mb-5">Utilizadores por perfil</h2>
          <div className="space-y-4">
            {[
              { label: 'Distribuidores', count: dists, color: 'bg-blue-500',   pct: users.length > 0 ? Math.round(dists/(users.length-admins||1)*100) : 0 },
              { label: 'Parceiros',      count: parts, color: 'bg-brand-500',  pct: users.length > 0 ? Math.round(parts/(users.length-admins||1)*100) : 0 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-500 text-gray-700">{item.label}</span>
                  <span className="font-700 text-gray-900">{item.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <a href="/admin/users" className="mt-6 inline-flex items-center gap-1 text-sm text-brand-500 font-600 hover:underline">
            Gerir utilizadores →
          </a>
        </div>
      </div>
    </div>
  )
}

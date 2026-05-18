'use client'
import { useEffect, useState } from 'react'
import { getProducts, getCompanies } from '@/firestore'
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '@/lib/actions'
import { useAuth } from '@/lib/auth-context'
import type { Product, Company } from '@/types'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const { user } = useAuth()
  const [products,  setProducts]  = useState<Product[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]   = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', description: '', companyId: '', tags: '' })
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    Promise.all([getProducts(), getCompanies()]).then(([p, c]) => {
      setProducts(p)
      setCompanies(c)
      setLoading(false)
    })
  }, [])

  function openCreate() {
    setEditing(null)
    setForm({ name: '', description: '', companyId: companies[0]?.id || '', tags: '' })
    setError('')
    setShowModal(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, description: p.description, companyId: p.companyId, tags: p.tags?.join(', ') || '' })
    setError('')
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    setSaving(true)
    setError('')

    try {
      const token = user ? await user.getIdToken() : undefined
      const data = {
        name:        form.name.trim(),
        description: form.description.trim(),
        companyId:   form.companyId,
        tags:        form.tags.split(',').map(t => t.trim()).filter(Boolean),
        active:      true,
      }

      if (editing) {
        const result = await updateProductAction(editing.id, data, token)
        if (!result.success) {
          setError(result.error || 'Erro ao atualizar produto')
          return
        }
        toast.success('Produto atualizado com sucesso')
      } else {
        const result = await createProductAction(data, token)
        if (!result.success) {
          setError(result.error || 'Erro ao criar produto')
          return
        }
        toast.success('Produto criado com sucesso')
      }

      const updated = await getProducts()
      setProducts(updated)
      setShowModal(false)
    } catch (e: any) {
      setError(e.message || 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Eliminar "${p.name}"?`)) return

    try {
      const token = user ? await user.getIdToken() : undefined
      const result = await deleteProductAction(p.id, token)

      if (!result.success) {
        toast.error(result.error || 'Erro ao eliminar produto')
        return
      }

      setProducts(prev => prev.filter(x => x.id !== p.id))
      toast.success('Produto eliminado com sucesso')
    } catch (e: any) {
      toast.error(e.message || 'Erro ao eliminar produto')
    }
  }

  const companyName = (id: string) => companies.find(c => c.id === id)?.name || id

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-700 text-gray-900">Produtos</h1>
          <p className="text-gray-500 mt-1 text-sm">{products.length} produto(s) registado(s)</p>
        </div>
        <Button onClick={openCreate} className="bg-brand-600 hover:bg-brand-700">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Produto
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p>Nenhum produto criado ainda.</p>
          <Button onClick={openCreate} className="mt-4">Criar primeiro produto</Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-700 text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="text-left px-5 py-3.5 text-xs font-700 text-gray-500 uppercase tracking-wider hidden md:table-cell">Empresa</th>
                <th className="text-left px-5 py-3.5 text-xs font-700 text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tags</th>
                <th className="text-left px-5 py-3.5 text-xs font-700 text-gray-500 uppercase tracking-wider hidden md:table-cell">Criado</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-xs font-700 text-brand-500 flex-shrink-0">
                        {p.name.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-600 text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 hidden md:table-cell">{companyName(p.companyId)}</td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.slice(0,3).map(t => (
                        <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400 hidden md:table-cell">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(p)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7 animate-fade-up">
            <h2 className="text-lg font-700 text-gray-900 mb-5">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Nome *"
                value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="Ex: Ambi 2.5"
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 tracking-wide uppercase">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  placeholder="Descrição do produto..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 tracking-wide uppercase">Empresa</label>
                <select
                  value={form.companyId}
                  onChange={e => setForm(f => ({...f, companyId: e.target.value}))}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <Input
                label="Tags (separadas por vírgula)"
                value={form.tags}
                onChange={e => setForm(f => ({...f, tags: e.target.value}))}
                placeholder="Ex: ecoponto, carga vertical, urban"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">
                {editing ? 'Guardar' : 'Criar Produto'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { getCompanies } from '@/firestore'
import {
  createCompanyAction,
  updateCompanyAction,
} from '@/lib/actions'
import { useAuth } from '@/lib/auth-context'
import type { Company } from '@/types'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]   = useState<Company | null>(null)
  const [form,      setForm]      = useState({ name: '', country: '' })
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    getCompanies().then(c => {
      setCompanies(c)
      setLoading(false)
    })
  }, [])

  function openCreate() {
    setEditing(null)
    setForm({ name:'', country:'' })
    setError('')
    setShowModal(true)
  }

  function openEdit(c: Company) {
    setEditing(c)
    setForm({ name: c.name, country: c.country })
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

      if (editing) {
        const result = await updateCompanyAction(
          editing.id,
          { name: form.name.trim(), country: form.country.trim() },
          token
        )

        if (!result.success) {
          setError(result.error || 'Erro ao atualizar empresa')
          return
        }

        toast.success('Empresa atualizada com sucesso')
      } else {
        const result = await createCompanyAction(
          { name: form.name.trim(), country: form.country.trim(), active: true },
          token
        )

        if (!result.success) {
          setError(result.error || 'Erro ao criar empresa')
          return
        }

        toast.success('Empresa criada com sucesso')
      }

      setCompanies(await getCompanies())
      setShowModal(false)
    } catch (e: any) {
      setError(e.message || 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-700 text-gray-900">Definições</h1>
        <p className="text-gray-500 mt-1 text-sm">Gestão de empresas e configurações da plataforma.</p>
      </div>

      {/* Companies */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-700 text-gray-900">Empresas / Marcas</h2>
          <Button size="sm" onClick={openCreate} className="bg-brand-600 hover:bg-brand-700">
            + Nova empresa
          </Button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2].map(i=><div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>)}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <p>Nenhuma empresa registada.</p>
            <Button onClick={openCreate} className="mt-3" size="sm">Criar primeira empresa</Button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-700 text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-700 text-gray-500 uppercase tracking-wider">País</th>
                <th className="text-left px-5 py-3 text-xs font-700 text-gray-500 uppercase tracking-wider">Criada</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {companies.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-600 text-sm text-gray-900">{c.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{c.country || '—'}</td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Storage structure info */}
      <div className="bg-brand-950 rounded-2xl p-6 text-white">
        <h2 className="font-700 mb-3 text-accent">Estrutura de Storage</h2>
        <pre className="text-xs text-white/60 leading-relaxed font-mono">
{`companies/{companyId}/products/{productId}/
├── renders/
├── doc_tecnica/
├── doc_comercial/
├── material_redes_sociais/
├── campanhas_sensibilizacao/
└── catalogos/`}
        </pre>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 animate-fade-up">
            <h2 className="text-lg font-700 text-gray-900 mb-5">
              {editing ? 'Editar Empresa' : 'Nova Empresa'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Nome *"
                value={form.name}
                onChange={e => setForm(f=>({...f,name:e.target.value}))}
                placeholder="Ex: Ambiconcept"
              />
              <Input
                label="País"
                value={form.country}
                onChange={e => setForm(f=>({...f,country:e.target.value}))}
                placeholder="Ex: Portugal"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">
                {editing ? 'Guardar' : 'Criar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

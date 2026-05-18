'use client'

import { useEffect, useState } from 'react'
import {
  getUsers,
  getCompanies,
} from '@/firestore'
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from '@/lib/actions'
import { useAuth } from '@/lib/auth-context'

import type { AppUser, Company, UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const ROLE_BADGE: Record<UserRole, 'blue' | 'brand' | 'purple'> = {
  admin: 'purple',
  distribuidor: 'blue',
  parceiro: 'brand',
}

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  distribuidor: 'Distribuidor',
  parceiro: 'Parceiro',
}

export default function AdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AppUser | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'distribuidor' as UserRole,
    companyId: '',
  })

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    Promise.all([getUsers(), getCompanies()]).then(([u, c]) => {
      setUsers(u)
      setCompanies(c)
      setLoading(false)

      if (c.length && !form.companyId) {
        setForm(f => ({ ...f, companyId: c[0].id }))
      }
    })
  }, [])

  const filtered = users.filter(u => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())

    const matchRole = roleFilter === 'all' || u.role === roleFilter

    return matchSearch && matchRole
  })

  function openCreate() {
    setEditing(null)
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'distribuidor',
      companyId: companies[0]?.id || '',
    })
    setFormError('')
    setShowModal(true)
  }

  function openEdit(u: AppUser) {
    setEditing(u)
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      companyId: u.companyId,
    })
    setFormError('')
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Nome e e-mail são obrigatórios.')
      return
    }

    if (!editing && form.password.length < 6) {
      setFormError('A password deve ter pelo menos 6 caracteres.')
      return
    }

    setSaving(true)
    setFormError('')

    try {
      const token = user ? await user.getIdToken() : undefined

      if (editing) {
        const result = await updateUserAction(
          editing.uid,
          {
            name: form.name.trim(),
            role: form.role,
            companyId: form.companyId,
          },
          token
        )

        if (!result.success) {
          setFormError(result.error || 'Erro ao atualizar utilizador')
          return
        }

        toast.success('Utilizador atualizado com sucesso')
      } else {
        const result = await createUserAction(
          form.email.trim(),
          form.password,
          {
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            companyId: form.companyId,
            active: true,
          },
          token
        )

        if (!result.success) {
          setFormError(result.error || 'Erro ao criar utilizador')
          return
        }

        toast.success('Utilizador criado com sucesso')
      }

      const updated = await getUsers()
      setUsers(updated)
      setShowModal(false)
    } catch (e: any) {
      setFormError(e.message || 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(u: AppUser) {
    if (!confirm(`Eliminar "${u.name}"?`)) return

    try {
      const token = user ? await user.getIdToken() : undefined
      const result = await deleteUserAction(u.uid, token)

      if (!result.success) {
        toast.error(result.error || 'Erro ao eliminar utilizador')
        return
      }

      setUsers(prev => prev.filter(x => x.uid !== u.uid))
      toast.success('Utilizador eliminado com sucesso')
    } catch (e: any) {
      toast.error(e.message || 'Erro ao eliminar utilizador')
    }
  }

  const companyName = (id: string) =>
    companies.find(c => c.id === id)?.name || '—'

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Utilizadores</h1>
        <Button onClick={openCreate} className="bg-brand-600 hover:bg-brand-700">
          + Novo Utilizador
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as UserRole | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">Todos os Papéis</option>
          <option value="admin">Administrador</option>
          <option value="distribuidor">Distribuidor</option>
          <option value="parceiro">Parceiro</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">E-mail</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Papel</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Empresa</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Criado em</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum utilizador encontrado
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.uid} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge color={ROLE_BADGE[u.role]}>
                        {ROLE_LABEL[u.role]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{companyName(u.companyId)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(u)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(u)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editing ? 'Editar Utilizador' : 'Novo Utilizador'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="ex: João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="ex: joao@example.com"
                  disabled={!!editing}
                />
              </div>

              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Papel
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="distribuidor">Distribuidor</option>
                  <option value="parceiro">Parceiro</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <select
                  value={form.companyId}
                  onChange={e => setForm({ ...form, companyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                loading={saving}
                className="flex-1"
              >
                {editing ? 'Guardar' : 'Criar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

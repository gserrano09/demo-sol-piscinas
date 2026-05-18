'use client'
import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '@/lib/auth-context'
import { getProducts, getCompanies } from '@/firestore'
import { uploadResource } from '@/lib/storage-helpers'
import { createResourceAction } from '@/lib/actions'
import type { Product, Company, ResourceType } from '@/types'
import { RESOURCE_TYPE_LABELS, ROLE_PERMISSIONS } from '@/types'
import { Button } from '@/components/ui/button'
import { formatBytes } from '@/lib/utils'
import toast from 'react-hot-toast'

interface QueueItem {
  id:       string
  file:     File
  name:     string
  type:     ResourceType
  productId:string
  progress: number
  status:   'pending' | 'uploading' | 'done' | 'error'
  error?:   string
  url?:     string
}

export default function AdminUpload() {
  const { appUser, user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [products,  setProducts]  = useState<Product[]>([])
  const [companyId, setCompanyId] = useState('')
  const [queue,     setQueue]     = useState<QueueItem[]>([])
  const [uploading, setUploading] = useState(false)

  const allowedResourceTypes = appUser ? ROLE_PERMISSIONS[appUser.role] : []

  useEffect(() => {
    Promise.all([getCompanies(), getProducts()]).then(([c, p]) => {
      setCompanies(c)
      setProducts(p)
      if (c.length) setCompanyId(c[0].id)
    })
  }, [])

  const filteredProducts = products.filter(p => p.companyId === companyId)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: QueueItem[] = acceptedFiles.map(file => ({
      id:        Math.random().toString(36).slice(2),
      file,
      name:      file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
      type:      allowedResourceTypes[0] || 'renders' as ResourceType,
      productId: filteredProducts[0]?.id || '',
      progress:  0,
      status:    'pending',
    }))
    setQueue(prev => [...prev, ...newItems])
  }, [filteredProducts, allowedResourceTypes])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*':       [],
      'video/*':       [],
      'application/pdf': [],
      'application/zip': [],
    },
    maxSize: 500 * 1024 * 1024, // 500MB
  })

  function updateItem(id: string, patch: Partial<QueueItem>) {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item))
  }

  async function startUpload() {
    const pending = queue.filter(i => i.status === 'pending')
    if (!pending.length || !appUser || !user) return

    setUploading(true)
    const token = await user.getIdToken()

    for (const item of pending) {
      if (!item.productId) {
        updateItem(item.id, { status: 'error', error: 'Seleccione um produto' })
        continue
      }

      // Validate resource type is allowed for this role
      if (!allowedResourceTypes.includes(item.type)) {
        updateItem(item.id, { status: 'error', error: `Não tem permissão para este tipo` })
        continue
      }

      updateItem(item.id, { status: 'uploading' })

      try {
        await new Promise<void>((resolve, reject) => {
          uploadResource(item.file, companyId, item.productId, item.type, async (progress) => {
            updateItem(item.id, { progress: progress.progress })

            if (progress.url && progress.path) {
              try {
                // Use server action to create resource with auth check
                const result = await createResourceAction({
                  name:        item.name,
                  type:        item.type,
                  url:         progress.url,
                  storagePath: progress.path,
                  productId:   item.productId,
                  companyId,
                  mimeType:    item.file.type,
                  size:        item.file.size,
                }, token)

                if (!result.success) {
                  reject(new Error(result.error || 'Erro ao criar recurso'))
                  return
                }

                updateItem(item.id, { status: 'done', url: progress.url })
                resolve()
              } catch (e: any) {
                reject(e)
              }
            }

            if (progress.error) {
              reject(new Error(progress.error))
            }
          })
        })
      } catch (err: any) {
        updateItem(item.id, { status: 'error', error: err.message })
      }
    }

    setUploading(false)
    const successCount = queue.filter(i => i.status === 'done').length
    const errorCount = queue.filter(i => i.status === 'error').length

    if (successCount > 0) {
      toast.success(`${successCount} ficheiro(s) carregado(s)`)
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} ficheiro(s) falharam`)
    }
  }

  const pendingCount  = queue.filter(i => i.status === 'pending').length
  const uploadingCount = queue.filter(i => i.status === 'uploading').length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-700 text-gray-900">Upload de Ficheiros</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Tipos permitidos: {allowedResourceTypes.map(t => RESOURCE_TYPE_LABELS[t]).join(', ')}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Settings + Drop */}
        <div className="lg:col-span-2 space-y-5">
          {/* Company/Context */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
            <h2 className="text-sm font-700 text-gray-700 mb-4">Contexto</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-600 text-gray-500 uppercase tracking-wide">Empresa</label>
                <select
                  value={companyId}
                  onChange={e => setCompanyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-brand-400 bg-brand-50'
                : 'border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/40'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-3">📂</div>
            <p className="text-sm font-600 text-gray-700 mb-1">
              {isDragActive ? 'Soltar ficheiros aqui' : 'Arraste ficheiros ou clique para seleccionar'}
            </p>
            <p className="text-xs text-gray-400">
              Imagens, vídeos, PDFs, ZIPs · Máx. 500 MB por ficheiro
            </p>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
            <h2 className="text-sm font-700 text-gray-700 mb-4">Resumo</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Na fila</span><span className="font-600">{pendingCount}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">A carregar</span><span className="font-600 text-amber-600">{uploadingCount}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Concluídos</span><span className="font-600 text-brand-600">{queue.filter(i=>i.status==='done').length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Erros</span><span className="font-600 text-red-500">{queue.filter(i=>i.status==='error').length}</span></div>
            </div>
            <div className="mt-4 space-y-2">
              <Button
                onClick={startUpload}
                disabled={pendingCount === 0 || uploading}
                loading={uploading}
                className="w-full"
              >
                Iniciar upload ({pendingCount})
              </Button>
              {queue.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setQueue([])}
                  disabled={uploading}
                  className="w-full"
                >
                  Limpar tudo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-700 text-gray-900">Fila de upload</h2>
            <span className="text-xs text-gray-400">{queue.length} ficheiro(s)</span>
          </div>
          <div className="divide-y divide-gray-50">
            {queue.map(item => (
              <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                {/* File icon / preview */}
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                  {item.file.type.startsWith('image/') ? '🖼' :
                   item.file.type.startsWith('video/') ? '🎬' :
                   item.file.type === 'application/pdf' ? '📄' : '📁'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <input
                      value={item.name}
                      onChange={e => updateItem(item.id, {name: e.target.value})}
                      disabled={item.status !== 'pending'}
                      className="flex-1 min-w-0 text-sm font-500 text-gray-800 bg-transparent border-0 outline-none focus:bg-gray-50 rounded px-1 -mx-1 truncate"
                    />
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <select
                      value={item.type}
                      onChange={e => updateItem(item.id, {type: e.target.value as ResourceType})}
                      disabled={item.status !== 'pending'}
                      className="text-xs bg-gray-100 border-0 rounded-lg px-2 py-1 text-gray-600 focus:outline-none"
                    >
                      {allowedResourceTypes.map(t => (
                        <option key={t} value={t}>
                          {RESOURCE_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={item.productId}
                      onChange={e => updateItem(item.id, {productId: e.target.value})}
                      disabled={item.status !== 'pending'}
                      className="text-xs bg-gray-100 border-0 rounded-lg px-2 py-1 text-gray-600 focus:outline-none"
                    >
                      <option value="">Seleccionar produto</option>
                      {filteredProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-400">{formatBytes(item.file.size)}</span>
                  </div>

                  {/* Progress */}
                  {item.status === 'uploading' && (
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">{item.error}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  {item.status === 'pending' && (
                    <button
                      onClick={() => setQueue(prev => prev.filter(x => x.id !== item.id))}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                  {item.status === 'uploading' && (
                    <span className="text-xs text-amber-500 font-600">{item.progress}%</span>
                  )}
                  {item.status === 'done' && <span className="text-brand-500">✓</span>}
                  {item.status === 'error' && <span className="text-red-500">✗</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

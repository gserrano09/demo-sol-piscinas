'use client'
import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { getProducts, getResources } from '@/firestore'
import { ROLE_PERMISSIONS, RESOURCE_TYPE_LABELS, RESOURCE_TYPE_LABELS as RTL } from '@/types'
import type { Product, Resource, ResourceType } from '@/types'
import { formatBytes, getMimeIcon } from '@/lib/utils'

export default function LibraryPage() {
  const { appUser } = useAuth()
  const [products,       setProducts]       = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [selectedType,    setSelectedType]    = useState<ResourceType | 'all'>('all')
  const [resources,      setResources]       = useState<Resource[]>([])
  const [loading,        setLoading]         = useState(true)

  const allowedTypes = appUser ? ROLE_PERMISSIONS[appUser.role] : []

  useEffect(() => {
    if (!appUser) return
    getProducts(appUser.companyId).then(p => {
      setProducts(p)
      if (p.length > 0) loadResources(p.map(x => x.id))
    })
  }, [appUser])

  async function loadResources(productIds: string[]) {
    setLoading(true)
    const all = await Promise.all(productIds.map(id => getResources(id)))
    const flat = all.flat().filter(r => allowedTypes.includes(r.type))
    setResources(flat)
    setLoading(false)
  }

  const filtered = resources.filter(r =>
    (selectedProduct === 'all' || r.productId === selectedProduct) &&
    (selectedType    === 'all' || r.type       === selectedType),
  )

  const productName = (id: string) => products.find(p => p.id === id)?.name || id

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-700 text-gray-900">Biblioteca de Recursos</h1>
        <p className="text-gray-500 mt-1 text-sm">Todos os ficheiros disponíveis para o seu perfil.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-card flex flex-wrap gap-3 items-center">
        {/* Product filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedProduct('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-600 transition-all ${
              selectedProduct === 'all'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos os produtos
          </button>
          {products.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-600 transition-all ${
                selectedProduct === p.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Type filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-600 transition-all ${
              selectedType === 'all'
                ? 'bg-slate text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos os tipos
          </button>
          {allowedTypes.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-600 transition-all ${
                selectedType === t
                  ? 'bg-slate text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {RESOURCE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-gray-400 font-500">{filtered.length} ficheiro(s)</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({length:10}).map((_,i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📁</div>
          <p className="font-500">Nenhum ficheiro encontrado</p>
          <p className="text-xs mt-1">Ajuste os filtros ou contacte o administrador</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(res => (
            <ResourceCard key={res.id} resource={res} productName={productName(res.productId)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ResourceCard({ resource, productName }: { resource: Resource; productName: string }) {
  const isImage = resource.mimeType.startsWith('image/')

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200 group">
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resource.url}
            alt={resource.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl">{getMimeIcon(resource.mimeType)}</span>
          </div>
        )}

        {/* Download overlay */}
        <a
          href={resource.url}
          download={resource.name}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 bg-brand-950/0 group-hover:bg-brand-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
        </a>
      </div>

      {/* Meta */}
      <div className="p-3">
        <p className="text-xs font-600 text-gray-800 truncate">{resource.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-gray-400">{RESOURCE_TYPE_LABELS[resource.type]}</span>
          <span className="text-[10px] text-gray-400">{formatBytes(resource.size)}</span>
        </div>
      </div>
    </div>
  )
}

import { getProduct, getResources } from '@/firestore'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { RESOURCE_TYPE_LABELS } from '@/types'
import type { ResourceType } from '@/types'

export const revalidate = 60

interface Props {
  params: { id: string }
}

type Resource = {
  id: string
  name: string
  type: ResourceType
  url: string
  storagePath: string
  productId: string
  companyId: string
  mimeType?: string
  size?: number
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  let resources: Resource[] = []

  try {
    const data = await getResources(params.id)
    resources = Array.isArray(data) ? data : []
  } catch {
    resources = []
  }

  const byType = resources.reduce((acc, r) => {
    if (!r?.type) return acc

    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)

    return acc
  }, {} as Record<ResourceType, Resource[]>)

  const publicTypes: ResourceType[] = ['renders']

  const publicResources = publicTypes
    .filter((t) => byType[t]?.length)
    .map((t) => ({
      type: t,
      items: byType[t],
    }))

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/products" className="hover:text-brand-500 transition-colors">
            Produtos
          </Link>
          <span>/</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        {/* Product hero */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden relative">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-8"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">
                📦
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-800 text-gray-900 mb-4">
              {product.name}
            </h1>

            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-brand-50 text-brand-600 text-xs font-600 rounded-full border border-brand-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <button className="px-6 py-3 bg-brand-500 text-white rounded-xl font-600 text-sm hover:bg-brand-600 transition-colors shadow-md">
                  Aceder aos Recursos Técnicos →
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Public renders */}
        {publicResources.length > 0 && (
          <div>
            <h2 className="text-xl font-700 text-gray-900 mb-6">
              Imagens do Produto
            </h2>

            {publicResources.map(({ type, items }) => (
              <div key={type} className="mb-8">
                <h3 className="text-sm font-600 text-gray-500 uppercase tracking-wider mb-4">
                  {RESOURCE_TYPE_LABELS[type]}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((item) =>
                    item.mimeType?.startsWith('image/') ? (
                      <div
                        key={item.id}
                        className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative group"
                      >
                        <Image
                          src={item.url}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-brand-950 to-brand-800 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-700 text-white mb-3">
            Aceda à documentação completa
          </h2>

          <p className="text-white/60 mb-6 text-sm">
            Ficheiros técnicos, catálogos e material de marketing disponíveis
            no portal de distribuidores e parceiros.
          </p>

          <Link href="/login">
            <button className="px-8 py-3 bg-accent text-brand-950 rounded-xl font-700 text-sm hover:bg-accent/90 transition-colors">
              Entrar no Portal
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}
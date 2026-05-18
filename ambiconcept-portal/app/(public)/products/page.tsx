import { getProducts } from '@/firestore'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 60

type Product = {
  id: string
  name: string
  description?: string
  imageUrl?: string
}

export default async function ProductsPage() {
  let products: Product[] = []

  try {
    const data = await getProducts()
    products = Array.isArray(data) ? data : []
  } catch {
    products = []
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-600 text-brand-500 uppercase tracking-widest mb-4">
            <span className="w-4 h-px bg-brand-500" />
            Gama de Produtos
          </div>

          <h1 className="text-4xl font-800 text-gray-900">
            Equipamentos Ambiconcept
          </h1>

          <p className="text-gray-500 mt-3 max-w-lg">
            Sistemas de deposição seletiva, ecopontos e contentores para gestão
            inteligente de resíduos urbanos.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📦</div>
            <p>Produtos em breve</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white border border-gray-100 rounded-2xl shadow-card hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
                      📦
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-700 text-gray-900 mb-1.5">
                    {product.name}
                  </h3>

                  <p className="text-gray-500 text-sm line-clamp-2">
                    {product.description ?? 'Sem descrição'}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-brand-500 text-sm font-600">
                    Ver produto
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}

          </div>
        )}

      </div>
    </div>
  )
}
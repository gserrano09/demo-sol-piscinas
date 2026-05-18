import Link from 'next/link'
import { Button } from '@/components/ui/button'

const FEATURES = [
  { icon: '🏗️', title: 'Ecopontos de Carga Vertical',   desc: 'Sistemas modulares para deposição seletiva em espaço urbano.' },
  { icon: '🌊', title: 'Soluções para Praias e Espaços', desc: 'Equipamentos resistentes para ambientes exigentes.' },
  { icon: '🏠', title: 'Recolha Doméstica',              desc: 'Contentores para separação na origem com design integrado.' },
  { icon: '🔄', title: 'Economia Circular',              desc: 'Infraestruturas que maximizam a taxa de retoma de materiais.' },
]

const STATS = [
  { value: '500+', label: 'Municípios servidos' },
  { value: '25+',  label: 'Anos de experiência' },
  { value: '15',   label: 'Países europeus' },
  { value: '98%',  label: 'Satisfação de clientes' },
]

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
        {/* background mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(110,196,58,0.4) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent text-xs font-600 tracking-wider uppercase mb-8 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Plataforma de Recursos Digitais 2025
            </div>

            <h1 className="text-5xl md:text-7xl font-800 text-white leading-[1.05] mb-6 animate-fade-up animation-delay-100">
              Infraestrutura para
              <span className="block text-accent">uma cidade circular</span>
            </h1>

            <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-xl animate-fade-up animation-delay-200">
              Contentores, ecopontos e sistemas de deposição seletiva que
              transformam a gestão de resíduos municipais. Soluções para
              distribuidores e municípios em toda a Europa.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up animation-delay-300">
              <Link href="/login">
                <Button size="xl" className="bg-accent text-brand-950 hover:bg-accent/90 font-700 shadow-lg">
                  Aceder ao Portal
                </Button>
              </Link>
              <Link href="/products">
                <Button size="xl" variant="secondary" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  Ver Produtos
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-fade-up animation-delay-400">
            {STATS.map(s => (
              <div key={s.label} className="border-l border-white/20 pl-4">
                <div className="text-3xl font-800 text-white">{s.value}</div>
                <div className="text-sm text-white/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-800 text-gray-900 mb-4">Soluções para cada desafio</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Equipamentos certificados e testados para os exigentes critérios
              europeus de gestão de resíduos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-700 text-gray-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-24 bg-brand-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-800 text-white mb-4">
            Aceda aos recursos do seu produto
          </h2>
          <p className="text-white/70 mb-10 text-lg">
            Distribuidores e parceiros têm acesso a renders, documentação
            técnica, catálogos e materiais de campanha.
          </p>
          <Link href="/login">
            <Button size="xl" className="bg-white text-brand-600 hover:bg-gray-50 font-700 shadow-lg">
              Entrar no Portal →
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="bg-brand-950 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M9 1L4 7l2.5 2.5L9 6l2.5 3.5L14 7Z" fill="#6EC43A"/>
                <path d="M6.5 9.5L9 13.5l2.5-4" stroke="white" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <span className="text-white/60 text-sm">© 2025 Ambiconcept Waste Solutions</span>
          </div>
          <div className="text-white/40 text-xs">
            it@ambiconcept.pt
          </div>
        </div>
      </footer>
    </div>
  )
}

import * as React from 'react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Percent,
  Sparkles,
  Zap,
} from 'lucide-react'
import type { PortalCartItem, PortalProduct } from '../types/portal.types'
import { ProductCard } from './ProductCard'

interface OffersShowcaseProps {
  products: PortalProduct[]
  cart: PortalCartItem[]
  onAddProduct: (product: PortalProduct) => void
  onUpdateQty: (productId: string, delta: number) => void
  onViewAllOffers?: () => void
  primaryColor: string
}

export function OffersShowcase({
  products,
  cart,
  onAddProduct,
  onUpdateQty,
  onViewAllOffers,
  primaryColor,
}: OffersShowcaseProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Seleciona os itens de destaque em oferta
  const offerProducts = React.useMemo(() => {
    // Ordena por menor preço ou seleciona uma fatia atrativa
    return [...products].slice(0, 10)
  }, [products])

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -320 : 320
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  if (offerProducts.length === 0) return null

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Cabeçalho da Seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <Flame className="h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Ofertas da Semana
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-700 dark:text-rose-400">
                <Percent className="h-3 w-3" /> Preços Especiais
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Economize nos itens mais frescos selecionados diretamente para você:
            </p>
          </div>
        </div>

        {/* Controles de Navegação do Carrossel */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs"
            title="Rolar para esquerda"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs"
            title="Rolar para direita"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid Principal: Imagem Preparada à Esquerda + Slider de Produtos à Direita (Padrão Oba) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
        {/* 1. Card / Imagem Preparada Bonita à Esquerda */}
        <div className="lg:col-span-4 rounded-3xl overflow-hidden relative shadow-md flex flex-col justify-between p-6 sm:p-7 min-h-[360px] lg:min-h-full bg-gradient-to-br from-rose-950 via-slate-950 to-amber-950 text-white border border-rose-900/40">
          <img
            src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80"
            alt="Ofertas Hortifruti"
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
          />

          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
              <Zap className="h-3.5 w-3.5 fill-white" />
              <span>OFERTAS IMBATÍVEIS</span>
            </span>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug drop-shadow-sm">
              Qualidade Gourmet com Preço de Feira
            </h3>

            <p className="text-xs text-rose-100/90 leading-relaxed font-medium">
              Aproveite os descontos exclusivos da semana em frutas selecionadas, morangos, melões e legumes colhidos no ponto certo.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <div className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 space-y-1.5 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                Vantagem Exclusiva
              </span>
              <p className="text-xs font-semibold text-slate-200">
                Baixa imediata no estoque e pesagem conferida para você não pagar nada a mais.
              </p>
            </div>

            {onViewAllOffers && (
              <button
                type="button"
                onClick={onViewAllOffers}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white text-slate-950 text-xs font-black shadow-md hover:bg-rose-50 transition active:scale-98"
              >
                <span>Explorar Todas as Ofertas</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Slider Horizontal de Produtos à Direita */}
        <div className="lg:col-span-8 flex flex-col justify-center min-w-0">
          <div
            ref={scrollRef}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {offerProducts.map((product) => {
              const cartItem = cart.find((c) => c.product.id === product.id)

              return (
                <div
                  key={product.id}
                  className="w-[200px] sm:w-[220px] md:w-[230px] shrink-0 snap-start flex flex-col"
                >
                  <ProductCard
                    product={product}
                    cartItem={cartItem}
                    onAdd={onAddProduct}
                    onUpdateQty={onUpdateQty}
                    primaryColor={primaryColor}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

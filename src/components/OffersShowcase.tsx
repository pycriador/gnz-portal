import * as React from 'react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
} from 'lucide-react'
import type { PortalCartItem, PortalProduct } from '../types/portal.types'
import { resolveEffectiveProductPrice } from '../utils/portalFormatters'
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

  // Seleciona os itens de destaque em oferta (priorizando produtos com promoção ativa)
  const offerProducts = React.useMemo(() => {
    const activePromos = products.filter((p) => resolveEffectiveProductPrice(p).isPromoActive)
    if (activePromos.length >= 10) {
      return activePromos.slice(0, 12)
    }
    const nonPromos = products.filter((p) => !resolveEffectiveProductPrice(p).isPromoActive)
    return [...activePromos, ...nonPromos].slice(0, 10)
  }, [products])

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -320 : 320
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  if (offerProducts.length === 0) return null

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-6 shadow-2xs space-y-5">
      {/* Cabeçalho da Seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-craft/15 text-brand-craft flex items-center justify-center">
            <Tag className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-brand-charcoal dark:text-white tracking-tight">
                Ofertas da Semana
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-craft/15 text-brand-charcoal dark:text-brand-craft">
                Preços Especiais
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Itens selecionados com condições especiais para esta semana
            </p>
          </div>
        </div>

        {/* Controles de Navegação do Carrossel */}
        <div className="hidden md:flex items-center gap-1.5">
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
        {/* 1. Card Editorial de Ofertas à Esquerda */}
        <div className="lg:col-span-4 rounded-2xl overflow-hidden relative shadow-sm flex flex-col justify-between p-6 sm:p-7 min-h-[320px] lg:min-h-full bg-brand-charcoal text-white border border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80"
            alt="Ofertas Hortifruti"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/70 to-brand-charcoal/40" />

          <div className="relative z-10 space-y-2.5">
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-brand-craft text-brand-charcoal">
              Seleção da Semana
            </span>

            <h3 className="text-2xl sm:text-[26px] font-extrabold tracking-tight leading-snug">
              Qualidade de feira com preços especiais
            </h3>

            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
              Frutas, verduras e legumes colhidos no ponto certo com estoque atualizado em tempo real.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            {onViewAllOffers && (
              <button
                type="button"
                onClick={onViewAllOffers}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-brand-charcoal text-xs font-bold shadow-sm hover:bg-neutral-100 transition active:scale-[0.98]"
              >
                <span>Ver todas as ofertas</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Grade 2 em 2 no Mobile + Slider Horizontal no Desktop */}
        <div className="lg:col-span-8 flex flex-col justify-center min-w-0">
          <div
            ref={scrollRef}
            className="grid grid-cols-2 gap-2.5 sm:gap-3 md:flex md:items-stretch md:gap-4 md:overflow-x-auto md:pb-3 md:pt-1 no-scrollbar scroll-smooth md:snap-x md:snap-mandatory"
          >
            {offerProducts.map((product) => {
              const cartItem = cart.find((c) => c.product.id === product.id)

              return (
                <div
                  key={product.id}
                  className="min-w-0 md:w-[220px] lg:w-[230px] md:shrink-0 md:snap-start flex flex-col"
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

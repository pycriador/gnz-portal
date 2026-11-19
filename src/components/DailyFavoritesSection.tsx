import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PortalCartItem, PortalProduct } from '../types/portal.types'
import { ProductCard } from './ProductCard'

interface DailyFavoritesSectionProps {
  products: PortalProduct[]
  cart: PortalCartItem[]
  onAddProduct: (product: PortalProduct) => void
  onUpdateQty: (productId: string, delta: number) => void
  primaryColor: string
}

export function DailyFavoritesSection({
  products,
  cart,
  onAddProduct,
  onUpdateQty,
  primaryColor,
}: DailyFavoritesSectionProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Filtra itens favoritos (frutas e itens essenciais do dia a dia)
  const favoriteProducts = React.useMemo(() => {
    // Busca itens com banana, morango, melão, ovo, tomate, etc., ou pega uma fatia representativa
    const keywords = ['banana', 'morango', 'melão', 'melancia', 'ovo', 'kiwi', 'cogumelo']
    const matched = products.filter((p) =>
      keywords.some((k) => p.name.toLowerCase().includes(k))
    )
    return matched.length >= 4 ? matched.slice(0, 10) : products.slice(0, 10)
  }, [products])

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -300 : 300
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  if (favoriteProducts.length === 0) return null

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-6 shadow-2xs space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-brand-craft shrink-0" aria-hidden="true" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-brand-charcoal dark:text-white tracking-tight">
                Favoritos do Dia a Dia
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Mais pedidos
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Os itens essenciais para a sua fruteira e despensa
            </p>
          </div>
        </div>

        {/* Setas de rolagem */}
        <div className="hidden md:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs"
            title="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs"
            title="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grade 2 em 2 no Mobile + Slider Horizontal no Desktop */}
      <div
        ref={scrollRef}
        className="grid grid-cols-2 gap-2.5 sm:gap-3 md:flex md:items-stretch md:gap-4 md:overflow-x-auto md:pb-3 md:pt-1 no-scrollbar scroll-smooth md:snap-x md:snap-mandatory"
      >
        {favoriteProducts.map((product) => {
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
    </section>
  )
}

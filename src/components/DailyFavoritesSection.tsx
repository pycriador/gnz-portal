import * as React from 'react'
import { ChevronLeft, ChevronRight, Heart, Sparkles, Star } from 'lucide-react'
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
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Heart className="h-4 w-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Favoritos do Dia a Dia
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-400">
                <Star className="h-3 w-3 fill-amber-500" /> Mais Pedidos
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Os itens essenciais que não podem faltar na sua fruteira e despensa:
            </p>
          </div>
        </div>

        {/* Setas de rolagem */}
        <div className="flex items-center gap-1.5">
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

      {/* Slider Horizontal de Produtos Favoritos */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {favoriteProducts.map((product) => {
          const cartItem = cart.find((c) => c.product.id === product.id)

          return (
            <div
              key={product.id}
              className="w-[190px] sm:w-[210px] md:w-[220px] lg:w-[230px] shrink-0 snap-start flex flex-col"
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

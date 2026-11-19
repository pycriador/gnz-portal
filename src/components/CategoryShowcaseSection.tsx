import * as React from 'react'
import {
  Apple,
  ArrowRight,
  Carrot,
  ChevronLeft,
  ChevronRight,
  Clock,
  Egg,
  Leaf,
  Salad,
  Sparkles,
} from 'lucide-react'
import type {
  PortalCartItem,
  PortalCategory,
  PortalProduct,
} from '../types/portal.types'
import { ProductCard } from './ProductCard'

interface CategoryShowcaseSectionProps {
  category: PortalCategory
  products: PortalProduct[]
  cart: PortalCartItem[]
  onAddProduct: (product: PortalProduct) => void
  onUpdateQty: (productId: string, delta: number) => void
  onSelectCategory: (categoryId: string) => void
  primaryColor: string
}

function getCategoryIcon(name: string): React.ReactNode {
  const lower = name.toLowerCase()
  if (lower.includes('fruta')) return <Apple className="h-4 w-4" />
  if (lower.includes('verdura') || lower.includes('legume'))
    return <Carrot className="h-4 w-4" />
  if (lower.includes('cogumelo')) return <Sparkles className="h-4 w-4" />
  if (lower.includes('ovo')) return <Egg className="h-4 w-4" />
  if (lower.includes('praticidade')) return <Clock className="h-4 w-4" />
  if (lower.includes('tempero')) return <Leaf className="h-4 w-4" />
  return <Salad className="h-4 w-4" />
}

export function CategoryShowcaseSection({
  category,
  products,
  cart,
  onAddProduct,
  onUpdateQty,
  onSelectCategory,
  primaryColor,
}: CategoryShowcaseSectionProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -300 : 300
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Cabeçalho da Categoria */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-xl text-white flex items-center justify-center shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            {getCategoryIcon(category.name)}
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {category.name}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              {products.length} itens
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Ver Todos desta Categoria */}
          <button
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mr-2"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

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
      </div>

      {/* Slider de Produtos da Categoria */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {products.map((product) => {
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

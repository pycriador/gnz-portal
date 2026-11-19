import * as React from 'react'
import {
  Apple,
  ArrowRight,
  Carrot,
  ChevronLeft,
  ChevronRight,
  Clock,
  Croissant,
  CupSoda,
  Egg,
  Leaf,
  Salad,
  Sprout,
  Wheat,
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
  if (lower.includes('fruta')) return <Apple className="h-4 w-4" aria-hidden="true" />
  if (lower.includes('verdura') || lower.includes('legume'))
    return <Carrot className="h-4 w-4" aria-hidden="true" />
  if (lower.includes('cogumelo')) return <Sprout className="h-4 w-4" aria-hidden="true" />
  if (lower.includes('ovo') || lower.includes('queijo') || lower.includes('laticinio'))
    return <Egg className="h-4 w-4" aria-hidden="true" />
  if (lower.includes('praticidade') || lower.includes('pronto'))
    return <Clock className="h-4 w-4" aria-hidden="true" />
  if (lower.includes('tempero') || lower.includes('erva'))
    return <Leaf className="h-4 w-4" aria-hidden="true" />
  if (lower.includes('mercearia') || lower.includes('grão') || lower.includes('cereal'))
    return <Wheat className="h-4 w-4" aria-hidden="true" />
  if (lower.includes('padaria') || lower.includes('pão'))
    return <Croissant className="h-4 w-4" aria-hidden="true" />
  if (lower.includes('bebida') || lower.includes('suco'))
    return <CupSoda className="h-4 w-4" aria-hidden="true" />
  return <Salad className="h-4 w-4" aria-hidden="true" />
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
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-6 shadow-2xs space-y-4">
      {/* Cabeçalho da Categoria */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-light flex items-center justify-center">
            {getCategoryIcon(category.name)}
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-base sm:text-lg font-bold text-brand-charcoal dark:text-white tracking-tight">
              {category.name}
            </h2>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              ({products.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Ver Todos desta Categoria */}
          <button
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary dark:text-brand-light hover:underline md:mr-2"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

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
      </div>

      {/* Grade 2 em 2 no Mobile + Slider Horizontal no Desktop */}
      <div
        ref={scrollRef}
        className="grid grid-cols-2 gap-2.5 sm:gap-3 md:flex md:items-stretch md:gap-4 md:overflow-x-auto md:pb-3 md:pt-1 no-scrollbar scroll-smooth md:snap-x md:snap-mandatory"
      >
        {products.map((product) => {
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

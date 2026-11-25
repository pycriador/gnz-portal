import * as React from 'react'
import {
  Apple,
  Carrot,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Croissant,
  CupSoda,
  Egg,
  LayoutGrid,
  Leaf,
  Salad,
  Sprout,
  Tag,
  Wheat,
} from 'lucide-react'
import type { PortalCategory } from '../types/portal.types'

interface CategoryNavProps {
  categories: PortalCategory[]
  selectedCategory: string
  onSelectCategory: (id: string) => void
  onlyPromotions?: boolean
  onSelectPromotions?: () => void
  promoCount?: number
  totalProducts: number
  primaryColor: string
}

function getCategoryIcon(name: string, className = 'h-4 w-4'): React.ReactNode {
  const lower = name.toLowerCase()
  if (lower.includes('fruta')) return <Apple className={className} aria-hidden="true" />
  if (lower.includes('verdura') || lower.includes('legume') || lower.includes('raiz') || lower.includes('tubérculo'))
    return <Carrot className={className} aria-hidden="true" />
  if (lower.includes('cogumelo')) return <Sprout className={className} aria-hidden="true" />
  if (lower.includes('ovo') || lower.includes('laticinio') || lower.includes('queijo'))
    return <Egg className={className} aria-hidden="true" />
  if (lower.includes('praticidade') || lower.includes('pronto'))
    return <Clock className={className} aria-hidden="true" />
  if (lower.includes('tempero') || lower.includes('erva') || lower.includes('especiaria'))
    return <Leaf className={className} aria-hidden="true" />
  if (lower.includes('mercearia') || lower.includes('grão') || lower.includes('cereal'))
    return <Wheat className={className} aria-hidden="true" />
  if (lower.includes('padaria') || lower.includes('pão'))
    return <Croissant className={className} aria-hidden="true" />
  if (lower.includes('bebida') || lower.includes('suco') || lower.includes('agua'))
    return <CupSoda className={className} aria-hidden="true" />
  return <Salad className={className} aria-hidden="true" />
}

export function CategoryNav({
  categories,
  selectedCategory,
  onSelectCategory,
  onlyPromotions = false,
  onSelectPromotions,
  promoCount = 0,
  totalProducts,
  primaryColor,
}: CategoryNavProps) {
  const [isMobileListOpen, setIsMobileListOpen] = React.useState(true)
  const listId = React.useId()

  const activeCategoryName = onlyPromotions
    ? 'Promoções & Ofertas'
    : categories.find((c) => c.id === selectedCategory)?.name || 'Todos os Produtos'

  return (
    <nav
      aria-label="Departamentos"
      className="bg-white dark:bg-brand-charcoal border-b border-slate-200/80 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Cabeçalho compacto no mobile/tablet para recolher ou expandir a lista vertical */}
        <div className="flex lg:hidden items-center justify-between py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Departamentos
            </span>
            {selectedCategory && (
              <span className="text-xs font-semibold text-brand-primary dark:text-brand-light truncate">
                · {activeCategoryName}
              </span>
            )}
          </div>

          <button
            type="button"
            aria-expanded={isMobileListOpen}
            aria-controls={listId}
            onClick={() => setIsMobileListOpen((open) => !open)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <span>{isMobileListOpen ? 'Ocultar' : 'Ver categorias'}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isMobileListOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Lista única semântica: vertical elegante no mobile/tablet e horizontal limpa no desktop */}
        <ul
          id={listId}
          className={`${
            isMobileListOpen ? 'flex' : 'hidden'
          } lg:flex flex-col lg:flex-row lg:items-center lg:gap-1.5 pb-3 lg:py-2.5 divide-y divide-slate-100 dark:divide-slate-800/80 lg:divide-y-0 lg:overflow-x-auto no-scrollbar scroll-smooth`}
        >
          {/* Item: Todos os Produtos */}
          <li className="lg:shrink-0">
            <button
              type="button"
              aria-current={selectedCategory === '' && !onlyPromotions ? 'page' : undefined}
              onClick={() => onSelectCategory('')}
              className={`w-full lg:w-auto flex items-center justify-between lg:justify-start gap-3 lg:gap-2 px-2.5 lg:px-3.5 py-2.5 lg:py-2 rounded-xl text-sm lg:text-xs font-semibold whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                selectedCategory === '' && !onlyPromotions
                  ? 'bg-brand-primary/8 lg:bg-brand-primary text-brand-primary dark:text-brand-light lg:text-white lg:shadow-2xs'
                  : 'text-brand-charcoal dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 lg:hover:bg-slate-100'
              }`}
              style={
                selectedCategory === '' && !onlyPromotions
                  ? ({ '--active-bg': primaryColor } as React.CSSProperties)
                  : undefined
              }
            >
              <span
                className={`flex items-center gap-3 lg:gap-2 lg:px-0 ${
                  selectedCategory === '' && !onlyPromotions
                    ? 'lg:text-white'
                    : ''
                }`}
              >
                <span
                  className={`h-9 w-9 lg:h-auto lg:w-auto rounded-xl lg:rounded-none flex items-center justify-center shrink-0 transition-colors ${
                    selectedCategory === '' && !onlyPromotions
                      ? 'bg-brand-primary text-white lg:bg-transparent lg:text-current'
                      : 'bg-slate-100 dark:bg-slate-800 text-brand-primary dark:text-brand-light lg:bg-transparent lg:text-slate-500 dark:lg:text-slate-400'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="truncate">
                  Todos os Produtos
                  <span className="ml-1.5 text-xs font-normal opacity-75">
                    ({totalProducts})
                  </span>
                </span>
              </span>

              <span className="lg:hidden shrink-0 text-slate-400">
                {selectedCategory === '' && !onlyPromotions ? (
                  <Check className="h-4 w-4 text-brand-primary dark:text-brand-light" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
            </button>
          </li>

          {/* Item: Promoções & Ofertas */}
          {onSelectPromotions && (
            <li className="lg:shrink-0">
              <button
                type="button"
                aria-current={onlyPromotions ? 'page' : undefined}
                onClick={onSelectPromotions}
                className={`w-full lg:w-auto flex items-center justify-between lg:justify-start gap-3 lg:gap-2 px-2.5 lg:px-3.5 py-2.5 lg:py-2 rounded-xl text-sm lg:text-xs font-bold whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  onlyPromotions
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'text-red-600 dark:text-red-400 bg-red-500/8 hover:bg-red-500/15'
                }`}
              >
                <span className="flex items-center gap-3 lg:gap-2 min-w-0">
                  <span
                    className={`h-9 w-9 lg:h-auto lg:w-auto rounded-xl lg:rounded-none flex items-center justify-center shrink-0 transition-colors ${
                      onlyPromotions
                        ? 'bg-white/20 text-white lg:bg-transparent lg:text-white'
                        : 'bg-red-500/15 text-red-600 dark:text-red-400 lg:bg-transparent'
                    }`}
                  >
                    <Tag className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="truncate">
                    Promoções
                    <span className="ml-1.5 text-xs font-extrabold">
                      ({promoCount})
                    </span>
                  </span>
                </span>

                <span className="lg:hidden shrink-0">
                  {onlyPromotions ? (
                    <Check className="h-4 w-4 text-white" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-red-400" aria-hidden="true" />
                  )}
                </span>
              </button>
            </li>
          )}

          <li aria-hidden="true" className="hidden lg:block h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0 mx-1" />

          {/* Itens das Categorias */}
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id

            return (
              <li key={cat.id} className="lg:shrink-0">
                <button
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onSelectCategory(isActive ? '' : cat.id)}
                  className={`w-full lg:w-auto flex items-center justify-between lg:justify-start gap-3 lg:gap-2 px-2.5 lg:px-3.5 py-2.5 lg:py-2 rounded-xl text-sm lg:text-xs font-semibold whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                    isActive
                      ? 'bg-brand-primary/8 lg:bg-brand-primary text-brand-primary dark:text-brand-light lg:text-white lg:shadow-2xs'
                      : 'text-brand-charcoal dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 lg:hover:bg-slate-100 lg:text-slate-700 dark:lg:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-3 lg:gap-2 min-w-0">
                    <span
                      className={`h-9 w-9 lg:h-auto lg:w-auto rounded-xl lg:rounded-none flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-brand-primary text-white lg:bg-transparent lg:text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-brand-primary dark:text-brand-light lg:bg-transparent lg:text-slate-500 dark:lg:text-slate-400'
                      }`}
                    >
                      {getCategoryIcon(cat.name, 'h-4 w-4')}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </span>

                  <span className="lg:hidden shrink-0 text-slate-400">
                    {isActive ? (
                      <Check className="h-4 w-4 text-brand-primary dark:text-brand-light" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

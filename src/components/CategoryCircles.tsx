import * as React from 'react'
import {
  Apple,
  Carrot,
  Clock,
  Croissant,
  CupSoda,
  Egg,
  Leaf,
  Salad,
  Sprout,
  Wheat,
} from 'lucide-react'
import type { PortalCategory } from '../types/portal.types'

interface CategoryVisual {
  icon: React.ReactNode
  tone: 'green' | 'craft'
}

function getCategoryVisual(name: string): CategoryVisual {
  const lower = name.toLowerCase()
  const iconClass = 'h-6 w-6 sm:h-6 sm:w-6 stroke-[1.75]'

  if (lower.includes('fruta')) {
    return { icon: <Apple className={iconClass} aria-hidden="true" />, tone: 'craft' }
  }
  if (lower.includes('verdura') || lower.includes('legume') || lower.includes('folha')) {
    return { icon: <Carrot className={iconClass} aria-hidden="true" />, tone: 'green' }
  }
  if (lower.includes('cogumelo')) {
    return { icon: <Sprout className={iconClass} aria-hidden="true" />, tone: 'craft' }
  }
  if (lower.includes('ovo') || lower.includes('queijo') || lower.includes('laticinio')) {
    return { icon: <Egg className={iconClass} aria-hidden="true" />, tone: 'craft' }
  }
  if (lower.includes('praticidade') || lower.includes('pronto')) {
    return { icon: <Clock className={iconClass} aria-hidden="true" />, tone: 'green' }
  }
  if (lower.includes('tempero') || lower.includes('erva')) {
    return { icon: <Leaf className={iconClass} aria-hidden="true" />, tone: 'green' }
  }
  if (lower.includes('mercearia') || lower.includes('grão') || lower.includes('cereal')) {
    return { icon: <Wheat className={iconClass} aria-hidden="true" />, tone: 'craft' }
  }
  if (lower.includes('padaria') || lower.includes('pão')) {
    return { icon: <Croissant className={iconClass} aria-hidden="true" />, tone: 'craft' }
  }
  if (lower.includes('bebida') || lower.includes('suco')) {
    return { icon: <CupSoda className={iconClass} aria-hidden="true" />, tone: 'green' }
  }

  return { icon: <Salad className={iconClass} aria-hidden="true" />, tone: 'green' }
}

interface CategoryCirclesProps {
  categories: PortalCategory[]
  selectedCategory: string
  onSelectCategory: (id: string) => void
  productCountByCategory?: Record<string, number>
}

export function CategoryCircles({
  categories,
  selectedCategory,
  onSelectCategory,
  productCountByCategory = {},
}: CategoryCirclesProps) {
  if (categories.length === 0) return null

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
      <div className="flex items-end justify-between mb-5 px-0.5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-brand-charcoal dark:text-white tracking-tight">
            Compre por departamento
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Escolha uma categoria para ver os itens disponíveis hoje
          </p>
        </div>

        {selectedCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory('')}
            className="text-xs font-semibold text-brand-primary dark:text-brand-light hover:underline"
          >
            Ver todas
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id
          const visual = getCategoryVisual(cat.name)
          const count = productCountByCategory[cat.id]

          const iconContainerTone = isActive
            ? 'bg-brand-primary text-white shadow-xs'
            : visual.tone === 'craft'
            ? 'bg-brand-craft/12 text-brand-craft group-hover:bg-brand-craft/20'
            : 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-light group-hover:bg-brand-primary/15'

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isActive ? '' : cat.id)}
              className={`group p-4 rounded-xl border transition-all duration-200 flex flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                isActive
                  ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/15 shadow-xs'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-brand-primary/40 hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
              }`}
            >
              <div
                className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${iconContainerTone}`}
              >
                {visual.icon}
              </div>

              <h3 className="mt-3 text-xs sm:text-sm font-semibold text-brand-charcoal dark:text-white line-clamp-1">
                {cat.name}
              </h3>

              {typeof count === 'number' && count > 0 && (
                <span className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {count} {count === 1 ? 'item' : 'itens'}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

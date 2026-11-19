import * as React from 'react'
import {
  Apple,
  Carrot,
  Clock,
  Egg,
  Leaf,
  Salad,
  Sparkles,
} from 'lucide-react'
import type { PortalCategory } from '../types/portal.types'

interface CategoryTheme {
  icon: React.ReactNode
  gradient: string
  borderColor: string
  textColor: string
  tagline: string
}

function getCategoryTheme(name: string): CategoryTheme {
  const lower = name.toLowerCase()

  if (lower.includes('fruta')) {
    return {
      icon: <Apple className="h-6 w-6 sm:h-7 sm:w-7" />,
      gradient: 'from-rose-500 to-amber-500',
      borderColor: 'border-rose-200 dark:border-rose-900/60',
      textColor: 'text-rose-600 dark:text-rose-400',
      tagline: 'Frescas & Doces',
    }
  }

  if (lower.includes('verdura') || lower.includes('legume')) {
    return {
      icon: <Carrot className="h-6 w-6 sm:h-7 sm:w-7" />,
      gradient: 'from-emerald-500 to-green-600',
      borderColor: 'border-emerald-200 dark:border-emerald-900/60',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      tagline: 'Colheita do Dia',
    }
  }

  if (lower.includes('cogumelo')) {
    return {
      icon: <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />,
      gradient: 'from-amber-600 to-stone-700',
      borderColor: 'border-amber-200 dark:border-amber-900/60',
      textColor: 'text-amber-700 dark:text-amber-400',
      tagline: 'Linha Gourmet',
    }
  }

  if (lower.includes('ovo')) {
    return {
      icon: <Egg className="h-6 w-6 sm:h-7 sm:w-7" />,
      gradient: 'from-amber-400 to-orange-500',
      borderColor: 'border-amber-200 dark:border-amber-900/60',
      textColor: 'text-amber-600 dark:text-amber-400',
      tagline: 'Granja & Caipira',
    }
  }

  if (lower.includes('praticidade') || lower.includes('pronto')) {
    return {
      icon: <Clock className="h-6 w-6 sm:h-7 sm:w-7" />,
      gradient: 'from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-200 dark:border-cyan-900/60',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      tagline: 'Prontos pro Consumo',
    }
  }

  if (lower.includes('tempero') || lower.includes('erva')) {
    return {
      icon: <Leaf className="h-6 w-6 sm:h-7 sm:w-7" />,
      gradient: 'from-teal-500 to-emerald-600',
      borderColor: 'border-teal-200 dark:border-teal-900/60',
      textColor: 'text-teal-600 dark:text-teal-400',
      tagline: 'Aromas & Frescor',
    }
  }

  return {
    icon: <Salad className="h-6 w-6 sm:h-7 sm:w-7" />,
    gradient: 'from-emerald-600 to-teal-700',
    borderColor: 'border-slate-200 dark:border-slate-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    tagline: 'Hortifruti',
  }
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
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            Navegue por Categorias
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Selecione uma categoria para explorar os produtos frescos:
          </p>
        </div>

        {selectedCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory('')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Ver Todas
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id
          const theme = getCategoryTheme(cat.name)
          const count = productCountByCategory[cat.id]

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isActive ? '' : cat.id)}
              className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center ${
                isActive
                  ? 'border-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/20 shadow-md ring-2 ring-emerald-500/30'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:-translate-y-1 hover:shadow-md'
              }`}
            >
              {/* Ícone estilizado com gradiente */}
              <div
                className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-108 bg-gradient-to-br ${theme.gradient}`}
              >
                {theme.icon}
              </div>

              {/* Título e Subtítulo */}
              <h3 className="mt-3 text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                {cat.name}
              </h3>

              <span className="text-[10px] font-semibold text-slate-400 mt-0.5 line-clamp-1">
                {theme.tagline}
              </span>

              {/* Badge de Contagem se disponível */}
              {typeof count === 'number' && count > 0 && (
                <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  {count} itens
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

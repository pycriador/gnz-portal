import * as React from 'react'
import { LayoutGrid, Sparkles } from 'lucide-react'
import type { PortalCategory } from '../types/portal.types'

interface CategoryNavProps {
  categories: PortalCategory[]
  selectedCategory: string
  onSelectCategory: (id: string) => void
  totalProducts: number
  primaryColor: string
}

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('fruta')) return '🍎'
  if (lower.includes('verdura') || lower.includes('folha') || lower.includes('salada')) return '🥬'
  if (lower.includes('legume') || lower.includes('raiz') || lower.includes('tubérculo')) return '🥕'
  if (lower.includes('tempero') || lower.includes('erva') || lower.includes('especiaria')) return '🌿'
  if (lower.includes('mercearia') || lower.includes('grão') || lower.includes('cereal')) return '🫒'
  if (lower.includes('organico') || lower.includes('orgânico')) return '🌱'
  if (lower.includes('bebida') || lower.includes('suco') || lower.includes('agua')) return '🥤'
  if (lower.includes('ovo') || lower.includes('laticinio') || lower.includes('queijo')) return '🧀'
  if (lower.includes('padaria') || lower.includes('pão')) return '🥖'
  return '🥦'
}

export function CategoryNav({
  categories,
  selectedCategory,
  onSelectCategory,
  totalProducts,
  primaryColor,
}: CategoryNavProps) {
  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar scroll-smooth">
          {/* Botão Todos os Departamentos */}
          <button
            type="button"
            onClick={() => onSelectCategory('')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 ${
              selectedCategory === ''
                ? 'text-white shadow-2xs'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            style={selectedCategory === '' ? { backgroundColor: primaryColor } : undefined}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Todos os Produtos ({totalProducts})</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0 mx-1" />

          {/* Links das Categorias */}
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id
            const icon = getCategoryIcon(cat.name)

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(isActive ? '' : cat.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 ${
                  isActive
                    ? 'text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={isActive ? { backgroundColor: primaryColor } : undefined}
              >
                <span className="text-sm">{icon}</span>
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

import * as React from 'react'
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package,
  RotateCcw,
  Scale,
  Tag,
} from 'lucide-react'
import type { PortalCartItem, PortalProduct } from '../types/portal.types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: PortalProduct[]
  totalProducts: number
  loading: boolean
  cart: PortalCartItem[]
  onAddProduct: (product: PortalProduct) => void
  onUpdateQty: (productId: string, delta: number) => void
  sortBy: string
  onSortChange: (sort: string) => void
  onlyKg: boolean
  onToggleOnlyKg: () => void
  onlyPromotions?: boolean
  onToggleOnlyPromotions?: () => void
  page: number
  totalPages: number
  onPageChange: (newPage: number) => void
  pageSize: number
  onPageSizeChange: (newPageSize: number) => void
  search: string
  onClearFilters: () => void
  primaryColor: string
}

export function ProductGrid({
  products,
  totalProducts,
  loading,
  cart,
  onAddProduct,
  onUpdateQty,
  sortBy,
  onSortChange,
  onlyKg,
  onToggleOnlyKg,
  onlyPromotions = false,
  onToggleOnlyPromotions,
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  search,
  onClearFilters,
  primaryColor,
}: ProductGridProps) {
  return (
    <div className="space-y-4">
      {/* 1. Barra de Controles e Ordenação no Topo da Vitrine */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
            {loading ? (
              'Carregando produtos...'
            ) : (
              <>
                Exibindo <strong className="text-brand-primary dark:text-brand-light">{products.length}</strong> de{' '}
                <strong>{totalProducts}</strong> produtos
              </>
            )}
          </span>
          {search && (
            <span className="text-xs text-slate-500 truncate max-w-[200px]">
              para &quot;{search}&quot;
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Rápido: Somente em Promoção */}
          {onToggleOnlyPromotions && (
            <button
              type="button"
              onClick={onToggleOnlyPromotions}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                onlyPromotions
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Em Promoção</span>
            </button>
          )}

          {/* Filtro Rápido: Somente Pesáveis (Kg) */}
          <button
            type="button"
            onClick={onToggleOnlyKg}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              onlyKg
                ? 'bg-brand-craft text-brand-charcoal border-brand-craft shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Por Quilo (Kg)</span>
          </button>

          {/* Ordenação */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="default">Destaques</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="name_asc">Nome (A - Z)</option>
            </select>
          </div>

          {/* Quantidade por página */}
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value={24}>24 / pág</option>
            <option value={36}>36 / pág</option>
            <option value={48}>48 / pág</option>
            <option value={96}>96 / pág</option>
          </select>
        </div>
      </div>

      {/* 2. Grid de Produtos Amplo (2 colunas mobile até 6 colunas em telas grandes) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="h-80 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-2 pt-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-1/2" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4 shadow-2xs">
          <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Package className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Nenhum produto encontrado
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Não encontramos nenhum item correspondente aos critérios atuais. Tente buscar por outro termo ou limpar os filtros.
            </p>
          </div>
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition hover:opacity-95"
            style={{ backgroundColor: primaryColor }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Limpar Todos os Filtros</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
          {products.map((product) => {
            const cartItem = cart.find((c) => c.product.id === product.id)
            return (
              <ProductCard
                key={product.id}
                product={product}
                cartItem={cartItem}
                onAdd={onAddProduct}
                onUpdateQty={onUpdateQty}
                primaryColor={primaryColor}
              />
            )
          })}
        </div>
      )}

      {/* 3. Paginação */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex items-center justify-between shadow-2xs">
          <span className="text-xs font-medium text-slate-500">
            Página <strong className="text-slate-800 dark:text-slate-200">{page}</strong> de{' '}
            <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong> ({totalProducts} produtos)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Próxima <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

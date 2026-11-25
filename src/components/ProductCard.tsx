import * as React from 'react'
import { Clock, Minus, Package, Plus, Scale, Tag } from 'lucide-react'
import type { PortalCartItem, PortalProduct } from '../types/portal.types'
import {
  formatCurrency,
  formatProductWeight,
  formatPromoShortDate,
  isWeighedProduct,
  resolveEffectiveProductPrice,
} from '../utils/portalFormatters'

interface ProductCardProps {
  product: PortalProduct
  cartItem?: PortalCartItem
  onAdd: (product: PortalProduct) => void
  onUpdateQty: (productId: string, delta: number) => void
  primaryColor: string
}

export function ProductCard({
  product,
  cartItem,
  onAdd,
  onUpdateQty,
  primaryColor,
}: ProductCardProps) {
  const isKg = isWeighedProduct(product)
  const inCart = Boolean(cartItem)
  const {
    effectivePrice,
    originalPrice,
    isPromoActive,
    discountPercent,
    promoEndsAt,
    promoLabel,
  } = resolveEffectiveProductPrice(product)

  return (
    <article className="group h-full min-w-0 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs hover:shadow-lg hover:border-brand-primary/40 dark:hover:border-brand-light/40 transition-all duration-200 flex flex-col justify-between">
      {/* 1. Imagem e Badges */}
      <div className="relative aspect-square bg-slate-50 dark:bg-slate-800/60 overflow-hidden flex items-center justify-center p-2 sm:p-3">
        {product.primary_image_url ? (
          <img
            src={product.primary_image_url}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 gap-1">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 stroke-[1.5]" />
            <span className="text-[10px] font-semibold">Sem foto</span>
          </div>
        )}

        {/* Badges Superiores Esquerda: Promoção ou Categoria */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 max-w-[calc(100%-3.5rem)] flex flex-col items-start gap-1">
          {isPromoActive ? (
            <div className="flex flex-wrap items-center gap-1">
              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] font-black bg-red-600 text-white shadow-2xs">
                <Tag className="h-2.5 w-2.5" />
                <span>-{discountPercent}% OFF</span>
              </span>
              {promoLabel && (
                <span className="truncate max-w-[110px] px-1.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wide bg-amber-400 text-slate-950 shadow-2xs">
                  {promoLabel}
                </span>
              )}
            </div>
          ) : (
            product.category_name && (
              <span className="truncate max-w-full px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 dark:bg-brand-charcoal/90 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs backdrop-blur-xs">
                {product.category_name}
              </span>
            )
          )}
        </div>

        {/* Badge de Produto Pesável */}
        {isKg && (
          <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] font-black bg-brand-craft text-brand-charcoal shadow-2xs">
            <Scale className="h-3 w-3" />
            <span>Kg</span>
          </span>
        )}

        {/* Data limite da promoção na base da imagem */}
        {isPromoActive && promoEndsAt && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-900/85 text-amber-300 backdrop-blur-xs">
            <Clock className="h-2.5 w-2.5" />
            <span>Até {formatPromoShortDate(promoEndsAt)}</span>
          </span>
        )}
      </div>

      {/* 2. Informações do Produto */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3">
        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-bold text-brand-charcoal dark:text-white line-clamp-2 leading-snug group-hover:text-brand-primary dark:group-hover:text-brand-light transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {product.description}
            </p>
          )}

          {product.sku && (
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
              Ref: {product.sku}
            </span>
          )}
        </div>

        {/* 3. Preço e Ação de Compra com Stepper Inline (Padrão Oba) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          {isPromoActive ? (
            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold text-slate-400 line-through">
                  De {formatCurrency(originalPrice)}
                </span>
                {promoEndsAt && (
                  <span className="text-[9px] font-bold text-red-600 dark:text-red-400">
                    Até {formatPromoShortDate(promoEndsAt)}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    Por
                  </span>
                  <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {formatCurrency(effectivePrice)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    /{(product.unit || 'UN').toLowerCase()}
                  </span>
                </div>
                {isKg && (
                  <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                    Aprox. 250g
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-black text-brand-primary dark:text-brand-light tracking-tight">
                  {formatCurrency(effectivePrice)}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  /{(product.unit || 'UN').toLowerCase()}
                </span>
              </div>

              {isKg && (
                <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                  Aprox. 250g
                </span>
              )}
            </div>
          )}

          {/* Stepper Inline: controle diretamente no card */}
          {inCart && cartItem ? (
            <div className="flex items-center justify-between gap-1 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/30 p-1">
              <button
                type="button"
                onClick={() => onUpdateQty(product.id, -1)}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-white dark:bg-brand-charcoal flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs active:scale-90 transition"
                title="Diminuir quantidade"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => isKg && onAdd(product)}
                className="text-xs font-black text-brand-primary dark:text-brand-light px-1 truncate hover:underline"
                title={isKg ? 'Clique para ajustar o peso exato' : undefined}
              >
                {isKg ? formatProductWeight(cartItem.quantity) : `${cartItem.quantity} un`}
              </button>

              <button
                type="button"
                onClick={() => onUpdateQty(product.id, 1)}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-white flex items-center justify-center shadow-2xs active:scale-90 transition hover:opacity-95"
                style={{ backgroundColor: primaryColor }}
                title="Aumentar quantidade"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAdd(product)}
              className="w-full inline-flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-white text-[11px] sm:text-xs font-bold shadow-2xs transition hover:opacity-95 active:scale-98 whitespace-nowrap"
              style={{ backgroundColor: primaryColor }}
            >
              {isKg ? <Scale className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{isKg ? 'Escolher Peso' : 'Adicionar'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

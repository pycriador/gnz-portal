import * as React from 'react'
import { CheckCircle2, Scale, Truck } from 'lucide-react'
import type { PortalCategory, PortalStore } from '../types/portal.types'
import { portalConfig } from '../config/portal.config'

interface HeroBannerProps {
  store: PortalStore
  categories: PortalCategory[]
  selectedCategory: string
  onSelectCategory: (id: string) => void
  primaryColor: string
}

function getCircleIcon(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('fruta')) return '🍎'
  if (lower.includes('verdura') || lower.includes('folha') || lower.includes('salada')) return '🥬'
  if (lower.includes('legume') || lower.includes('raiz')) return '🥕'
  if (lower.includes('tempero') || lower.includes('erva')) return '🌿'
  if (lower.includes('mercearia')) return '🫒'
  if (lower.includes('organico') || lower.includes('orgânico')) return '🌱'
  if (lower.includes('bebida') || lower.includes('suco')) return '🥤'
  return '🥦'
}

export function HeroBanner({
  store,
  categories,
  selectedCategory,
  onSelectCategory,
  primaryColor,
}: HeroBannerProps) {
  const bannerUrl = store.theme_config?.bannerUrl || null
  const customTitle = portalConfig.branding.customTitle || `${store.name} • Seleção Fresca do Dia`
  const subtitle =
    store.theme_config?.subtitle ||
    portalConfig.branding.heroSubtitle ||
    'Frutas, verduras, legumes e mercearia selecionados a mão. Faça seu pedido online com baixa imediata no estoque e acompanhe cada etapa em tempo real.'

  return (
    <div className="space-y-6">
      {/* 1. Banner Gourmet Principal com Badges de Confiança */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-brand-charcoal via-brand-charcoal to-brand-primary text-white shadow-md">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
        )}

        <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md text-brand-light border border-white/10">
            <span>{portalConfig.branding.heroBadge || 'Seleção Fresca do Dia • Pedido Online Direto'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
            {customTitle}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl font-medium">
            {subtitle}
          </p>

          {/* Selos de Confiança Estilo Oba */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold text-slate-200 backdrop-blur-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-light" />
              Estoque Validado ao Vivo
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold text-slate-200 backdrop-blur-xs">
              <Scale className="h-3.5 w-3.5 text-brand-craft" />
              Pesagem Justa por Grama/Kg
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold text-slate-200 backdrop-blur-xs">
              <Truck className="h-3.5 w-3.5 text-brand-light" />
              Rastreamento em Tempo Real
            </span>
          </div>
        </div>
      </section>

      {/* 2. Atalhos Rápidos Circulares por Categoria (Estilo App de Supermercado Oba) */}
      {categories.length > 0 && (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs sm:text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-wider">
              Navegue por Categorias
            </h2>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => onSelectCategory('')}
                className="text-xs font-bold text-brand-primary dark:text-brand-light hover:underline"
              >
                Ver Todas
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id
              const icon = getCircleIcon(cat.name)

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(isActive ? '' : cat.id)}
                  className={`group flex flex-col items-center p-2.5 rounded-2xl border transition text-center ${
                    isActive
                      ? 'border-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20 shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-brand-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 shadow-2xs ${
                      isActive
                        ? 'bg-brand-primary text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {icon}
                  </div>
                  <span
                    className={`mt-2 text-[11px] sm:text-xs font-bold truncate max-w-[90px] ${
                      isActive ? 'text-brand-primary dark:text-brand-light' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

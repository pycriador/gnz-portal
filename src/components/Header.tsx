import * as React from 'react'
import {
  Clock,
  MapPin,
  Moon,
  Phone,
  Search,
  ShoppingBag,
  Store as StoreIcon,
  Sun,
  Truck,
  X,
} from 'lucide-react'
import type { PortalStore } from '../types/portal.types'
import { formatCurrency } from '../utils/portalFormatters'
import { portalConfig } from '../config/portal.config'

interface HeaderProps {
  store: PortalStore
  search: string
  onSearchChange: (value: string) => void
  cartCount: number
  cartTotal: number
  onOpenCart: () => void
  onOpenOrdersModal: () => void
  isDark: boolean
  onToggleDark: () => void
  primaryColor: string
}

export function Header({
  store,
  search,
  onSearchChange,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenOrdersModal,
  isDark,
  onToggleDark,
  primaryColor,
}: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)

  const cityDisplay = store.address_city
    ? `${store.address_neighborhood ? `${store.address_neighborhood}, ` : ''}${store.address_city}`
    : 'Retirada ou Entrega'

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs">
      {/* 1. Barra Superior de Utilidades (Estilo Oba) */}
      <div
        className="text-white text-[11px] font-medium py-1.5 px-4 sm:px-6 lg:px-8 xl:px-12 transition-colors"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-[1536px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 font-bold tracking-wide">
              <Truck className="h-3.5 w-3.5 shrink-0" />
              <span>{portalConfig.branding.deliveryBannerText || 'Colheita fresca do dia • Entregas rápidas na região'}</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-white/90">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Loja Aberta • Peça Online
            </span>
            {(store.whatsapp || store.phone) && (
              <a
                href={`https://wa.me/${(store.whatsapp || store.phone || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] hover:underline"
              >
                <Phone className="h-3 w-3" />
                <span>Atendimento: {store.whatsapp || store.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. Barra Principal do Cabeçalho */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo e Nome da Loja */}
          <div className="flex items-center gap-3 shrink-0">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
              />
            ) : (
              <div
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center text-white shadow-2xs"
                style={{ backgroundColor: primaryColor }}
              >
                <StoreIcon className="h-6 w-6" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                  {store.name}
                </span>
              </div>
              <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Hortifruti & Mercado Fresco
              </span>
            </div>
          </div>

          {/* Barra de Busca Central Proeminente (Padrão Oba) */}
          <div className="flex-1 max-w-3xl hidden md:block">
            <div
              className={`relative flex items-center w-full transition-all rounded-full bg-slate-100/90 dark:bg-slate-800/90 border ${
                isSearchFocused
                  ? 'border-emerald-600 shadow-lg ring-2 ring-emerald-500/20 bg-white dark:bg-slate-900'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Search className="h-4 w-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={search}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="O que você procura hoje? (ex: banana, tomate, morango, batata...)"
                className="w-full pl-11 pr-10 py-3 bg-transparent rounded-full text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                  title="Limpar busca"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Ações da Direita: Localização, Meus Pedidos, DarkMode e Sacola */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Indicador de Entrega / Região */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-left">
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="block text-slate-400 text-[9px] uppercase font-bold">Entregar em:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px] block">
                  {cityDisplay}
                </span>
              </div>
            </div>

            {/* Botão Meus Pedidos / Rastreamento */}
            <button
              type="button"
              onClick={onOpenOrdersModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition shadow-2xs"
              title="Acompanhar pedidos em tempo real"
            >
              <Clock className="h-4 w-4 text-emerald-600" />
              <span className="hidden sm:inline">Meus Pedidos</span>
            </button>

            {/* Alternador de Tema Claro/Escuro */}
            <button
              type="button"
              onClick={onToggleDark}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Alternar tema Claro/Escuro"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Botão da Sacola com Total */}
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-black shadow-sm transition hover:opacity-95 active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="relative">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 h-4 w-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Sacola</span>
              {cartTotal > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-black/20 text-[11px] sm:text-xs font-extrabold tracking-tight">
                  {formatCurrency(cartTotal)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Barra de Busca no Mobile */}
        <div className="mt-3 block md:hidden">
          <div className="relative flex items-center w-full rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="O que você procura hoje?"
              className="w-full pl-9 pr-9 py-2 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-1 text-slate-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

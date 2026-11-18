import * as React from 'react'
import { Clock, ExternalLink, Package, Search, X } from 'lucide-react'
import type { PortalStoredOrderHistoryItem } from '../types/portal.types'
import { formatCurrency, formatDateTime } from '../utils/portalFormatters'

interface RecentOrdersModalProps {
  isOpen: boolean
  onClose: () => void
  orders: PortalStoredOrderHistoryItem[]
  onOpenOrderTracking: (orderId: string) => void
  primaryColor: string
}

export function RecentOrdersModal({
  isOpen,
  onClose,
  orders,
  onOpenOrderTracking,
  primaryColor,
}: RecentOrdersModalProps) {
  const [manualCode, setManualCode] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState('')

  if (!isOpen) return null

  const handleLookupManual = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = manualCode.trim()
    if (!clean) return

    // Se for UUID direto
    if (clean.length === 36) {
      onOpenOrderTracking(clean)
      onClose()
      return
    }

    // Se bater com algum orderNumber dos pedidos armazenados
    const found = orders.find(
      (o) => o.orderNumber.toLowerCase() === clean.replace('#', '').toLowerCase()
    )
    if (found) {
      onOpenOrderTracking(found.id)
      onClose()
      return
    }

    setErrorMsg('Código não encontrado no dispositivo. Insira o UUID completo de 36 caracteres gerado no pedido.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-emerald-600" />
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Meus Pedidos Recentes
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Consulta manual */}
          <form onSubmit={handleLookupManual} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Rastrear outro pedido por código ou UUID:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value)
                    setErrorMsg('')
                  }}
                  placeholder="Ex.: 1024 ou UUID do pedido..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-2xs hover:opacity-95 shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                Buscar
              </button>
            </div>
            {errorMsg && <p className="text-[11px] text-red-500 font-medium">{errorMsg}</p>}
          </form>

          {/* Lista de Pedidos Salvos no Aparelho */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pedidos realizados neste navegador ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <div className="py-8 text-center space-y-2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                <Package className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">
                  Nenhum pedido recente salvo neste dispositivo.
                </p>
                <p className="text-[11px] text-slate-400">
                  Ao finalizar seu primeiro pedido na vitrine, ele aparecerá aqui com rastreamento ao vivo.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          Pedido #{ord.orderNumber}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(ord.totalAmount)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatDateTime(ord.createdAt)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenOrderTracking(ord.id)
                        onClose()
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition shadow-2xs shrink-0"
                    >
                      <span>Rastrear</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

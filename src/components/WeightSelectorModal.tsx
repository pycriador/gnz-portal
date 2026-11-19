import * as React from 'react'
import { Scale, X, Check } from 'lucide-react'
import type { PortalProduct } from '../types/portal.types'
import { formatCurrency, formatProductWeight } from '../utils/portalFormatters'

interface WeightSelectorModalProps {
  product: PortalProduct | null
  initialWeightKg?: number
  onClose: () => void
  onConfirm: (weightInKg: number) => void
}

const PRESET_GRAMS = [100, 150, 200, 250, 300, 500, 750, 1000, 1500, 2000]

export function WeightSelectorModal({
  product,
  initialWeightKg = 0.25,
  onClose,
  onConfirm,
}: WeightSelectorModalProps) {
  const [grams, setGrams] = React.useState<number>(Math.round(initialWeightKg * 1000))

  React.useEffect(() => {
    if (product) {
      setGrams(Math.max(50, Math.round(initialWeightKg * 1000)))
    }
  }, [product, initialWeightKg])

  if (!product) return null

  const weightInKg = Math.max(0.05, Number((grams / 1000).toFixed(3)))
  const estimatedPrice = weightInKg * product.selling_price

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-brand-charcoal border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-brand-craft/15 text-brand-craft flex items-center justify-center">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-charcoal dark:text-white">{product.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preço por quilo: <strong className="text-brand-primary dark:text-brand-light">{formatCurrency(product.selling_price)}/kg</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Escolha rápida de peso:
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_GRAMS.map((preset) => {
                const active = grams === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGrams(preset)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                      active
                        ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-primary/50'
                    }`}
                  >
                    {preset >= 1000 ? `${preset / 1000}kg` : `${preset}g`}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Ou digite a quantidade em gramas (g):
            </label>
            <input
              type="number"
              min={50}
              step={50}
              value={grams}
              onChange={(e) => setGrams(Math.max(10, Number(e.target.value || 0)))}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div className="rounded-xl bg-brand-primary/10 border border-brand-primary/25 p-3.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] uppercase tracking-wider font-semibold text-brand-primary dark:text-brand-light">
                Peso Selecionado: {formatProductWeight(weightInKg)}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Valor proporcional calculado automaticamente
              </span>
            </div>
            <span className="text-lg font-extrabold text-brand-primary dark:text-brand-light">
              {formatCurrency(estimatedPrice)}
            </span>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(weightInKg)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary hover:opacity-95 text-white shadow-xs transition"
          >
            <Check className="h-4 w-4" />
            Confirmar Peso ({formatProductWeight(weightInKg)})
          </button>
        </div>
      </div>
    </div>
  )
}

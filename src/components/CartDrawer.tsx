import * as React from 'react'
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Tag,
  Ticket,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import type {
  CouponValidationResult,
  PortalCartItem,
  PortalPaymentMethod,
  PortalProduct,
  PortalStore,
} from '../types/portal.types'
import {
  formatCurrency,
  formatProductWeight,
  isWeighedProduct,
  resolveEffectiveProductPrice,
} from '../utils/portalFormatters'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: PortalCartItem[]
  cartTotal: number
  cartSubtotal: number
  store: PortalStore
  onUpdateQty: (productId: string, delta: number) => void
  onRemoveItem: (productId: string) => void
  onAddProduct: (product: PortalProduct) => void
  onSubmitCheckout: (alsoSendWhatsApp: boolean) => Promise<void>
  submitting: boolean
  customerName: string
  setCustomerName: (v: string) => void
  customerPhone: string
  setCustomerPhone: (v: string) => void
  customerAddress: string
  setCustomerAddress: (v: string) => void
  customerNotes: string
  setCustomerNotes: (v: string) => void
  paymentMethod: PortalPaymentMethod
  setPaymentMethod: (v: PortalPaymentMethod) => void
  couponCode: string
  setCouponCode: (v: string) => void
  appliedCoupon: CouponValidationResult | null
  couponError: string | null
  validatingCoupon: boolean
  onApplyCoupon: () => Promise<void>
  onRemoveCoupon: () => void
  checkoutError: string | null
  primaryColor: string
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  cartTotal,
  cartSubtotal,
  onUpdateQty,
  onRemoveItem,
  onAddProduct,
  onSubmitCheckout,
  submitting,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  customerNotes,
  setCustomerNotes,
  paymentMethod,
  setPaymentMethod,
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponError,
  validatingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  checkoutError,
  primaryColor,
}: CartDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-brand-charcoal h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Cabeçalho da Sacola */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-brand-primary dark:text-brand-light" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-brand-charcoal dark:text-white">
                Sua Sacola de Compras
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                {cart.length === 0
                  ? 'Nenhum item adicionado'
                  : `${cart.length} ${cart.length === 1 ? 'produto selecionado' : 'produtos selecionados'}`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Faixa Informativa de Entrega Fresca */}
        <div className="px-5 py-2.5 bg-brand-primary/10 dark:bg-brand-primary/20 border-b border-brand-primary/20 flex items-center gap-2 text-[11px] text-brand-charcoal dark:text-brand-light font-medium">
          <Truck className="h-3.5 w-3.5 shrink-0 text-brand-primary dark:text-brand-light" />
          <span>Separação imediata na loja e baixa em tempo real no estoque.</span>
        </div>

        {/* Lista de Itens ou Estado Vazio */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {cart.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto">
                <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Sua sacola está vazia</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore as categorias de hortifruti e adicione frutas, verduras e legumes frescos ao seu pedido.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-95 transition"
                style={{ backgroundColor: primaryColor }}
              >
                Voltar à Vitrine
              </button>
            </div>
          ) : (
            <>
              {/* Itens da Sacola */}
              <div className="space-y-2.5">
                {cart.map((item) => {
                  const isKg = isWeighedProduct(item.product)
                  const {
                    effectivePrice,
                    originalPrice,
                    isPromoActive,
                    discountPercent,
                  } = resolveEffectiveProductPrice(item.product)
                  const lineTotal = item.quantity * effectivePrice

                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50"
                    >
                      {/* Miniatura */}
                      <div className="relative h-12 w-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {item.product.primary_image_url ? (
                          <img
                            src={item.product.primary_image_url}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-slate-300" />
                        )}
                      </div>

                      {/* Informações */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.product.name}
                          </p>
                          {isPromoActive && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-red-600 text-white shrink-0">
                              <Tag className="h-2.5 w-2.5" />
                              -{discountPercent}% OFF
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {isPromoActive ? (
                            <>
                              <span className="line-through text-slate-400 mr-1">
                                De {formatCurrency(originalPrice)}
                              </span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                Por {formatCurrency(effectivePrice)}
                                {isKg ? '/kg' : ''}
                              </span>
                              {' • '}
                              {isKg ? formatProductWeight(item.quantity) : `${item.quantity} un`}
                            </>
                          ) : isKg ? (
                            `${formatProductWeight(item.quantity)} × ${formatCurrency(
                              effectivePrice
                            )}/kg`
                          ) : (
                            `${item.quantity} un × ${formatCurrency(effectivePrice)}`
                          )}
                        </p>
                      </div>

                      {/* Stepper e Ações */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.product.id, -1)}
                            className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Diminuir"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => isKg && onAddProduct(item.product)}
                            className="text-[11px] font-bold text-slate-800 dark:text-slate-200 px-1"
                            title={isKg ? 'Ajustar peso' : undefined}
                          >
                            {isKg ? formatProductWeight(item.quantity) : item.quantity}
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.product.id, 1)}
                            className="h-6 w-6 rounded-lg text-white flex items-center justify-center"
                            style={{ backgroundColor: primaryColor }}
                            title="Aumentar"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-brand-primary dark:text-brand-light min-w-[65px] text-right">
                          {formatCurrency(lineTotal)}
                        </span>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                          title="Remover produto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Cupom de Desconto */}
              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400">
                  <Ticket className="h-3.5 w-3.5 text-brand-primary dark:text-brand-light" />
                  <span>Cupom de Desconto</span>
                </label>

                {appliedCoupon && appliedCoupon.valid ? (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-start gap-2 min-w-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 truncate">
                          Cupom {appliedCoupon.code} ativo (-{formatCurrency(appliedCoupon.discount_amount)})
                        </p>
                        {appliedCoupon.message && (
                          <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90">
                            {appliedCoupon.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onRemoveCoupon}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition shrink-0"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Digite seu código promocional"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <button
                      type="button"
                      disabled={validatingCoupon || !couponCode.trim()}
                      onClick={onApplyCoupon}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shadow-2xs transition hover:opacity-95 disabled:opacity-50"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {validatingCoupon ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Validando...</span>
                        </>
                      ) : (
                        <span>Aplicar</span>
                      )}
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] font-bold text-red-600 dark:text-red-400">
                    {couponError}
                  </p>
                )}
              </div>

              {/* Formulário de Identificação & Entrega */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Dados para Entrega & Rastreamento
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex.: Maria Oliveira"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seu WhatsApp / Telefone *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Endereço de Entrega (ou deixe vazio para Retirada na loja)
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Rua, Número, Bairro, Complemento"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PortalPaymentMethod)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="PIX">PIX (Chave ou QR Code)</option>
                    <option value="CREDIT_CARD">Cartão de Crédito na Entrega</option>
                    <option value="DEBIT_CARD">Cartão de Débito na Entrega</option>
                    <option value="CASH">Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Observações do Pedido (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Ex.: Bananas mais maduras, avisar ao chegar no interfone, etc."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {checkoutError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 font-bold">
                    {checkoutError}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Rodapé com Resumo e Finalização */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {formatCurrency(cartSubtotal)}
                </span>
              </div>

              {appliedCoupon && appliedCoupon.valid && appliedCoupon.discount_amount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                  <span className="font-bold">
                    Desconto Cupom ({appliedCoupon.code}):
                  </span>
                  <span className="font-black">
                    -{formatCurrency(appliedCoupon.discount_amount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Total Final:
                </span>
                <span className="text-xl font-black text-brand-primary dark:text-brand-light">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => onSubmitCheckout(false)}
                className="w-full py-3 px-4 rounded-xl text-white text-xs font-black shadow-sm transition hover:opacity-95 active:scale-98 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? 'Registrando Pedido...' : 'Finalizar Pedido & Acompanhar ao Vivo'}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => onSubmitCheckout(true)}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-brand-primary dark:border-brand-light text-brand-primary dark:text-brand-light text-xs font-black hover:bg-brand-primary/10 transition active:scale-98 disabled:opacity-50"
              >
                <MessageCircle className="h-4 w-4" />
                Finalizar + Enviar no WhatsApp da Loja
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

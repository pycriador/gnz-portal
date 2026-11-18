import * as React from 'react'
import { supabasePortalApi, classifyPortalApiError } from '../api/supabasePortalClient'
import { portalConfig } from '../config/portal.config'
import type {
  PortalCartItem,
  PortalCategory,
  PortalCredentialStatus,
  PortalPaymentMethod,
  PortalProduct,
  PortalStore,
  PortalStoredOrderHistoryItem,
} from '../types/portal.types'
import {
  buildPortalOrderTrackingUrl,
  formatCurrency,
  formatPortalWhatsAppOrderMessage,
  formatProductWeight,
  getPortalOrderHistory,
  getResolvedWhatsAppTemplate,
  isWeighedProduct,
  normalizeWhatsAppPhone,
  savePortalOrderHistory,
} from '../utils/portalFormatters'
import { Header } from './Header'
import { CategoryNav } from './CategoryNav'
import { HeroBanner } from './HeroBanner'
import { ProductGrid } from './ProductGrid'
import { CartDrawer } from './CartDrawer'
import { RecentOrdersModal } from './RecentOrdersModal'
import { WeightSelectorModal } from './WeightSelectorModal'

interface CatalogViewProps {
  store: PortalStore
  isDark: boolean
  onToggleDark: () => void
  onOpenOrderTracking: (orderId: string) => void
  onCredentialInvalidated: (status: PortalCredentialStatus) => void
}

const CART_STORAGE_KEY = `olivelas_spa_portal_cart_${portalConfig.storeId}`

export function CatalogView({
  store,
  isDark,
  onToggleDark,
  onOpenOrderTracking,
  onCredentialInvalidated,
}: CatalogViewProps) {
  const [categories, setCategories] = React.useState<PortalCategory[]>([])
  const [products, setProducts] = React.useState<PortalProduct[]>([])
  const [totalProducts, setTotalProducts] = React.useState(0)
  const [loadingProducts, setLoadingProducts] = React.useState(true)

  // Filtros, ordenação e paginação
  const [search, setSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('')
  const [sortBy, setSortBy] = React.useState('default')
  const [onlyKg, setOnlyKg] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState<number>(
    store.theme_config?.catalogPageSize || portalConfig.branding.defaultPageSize || 24
  )

  // Carrinho persistido
  const [cart, setCart] = React.useState<PortalCartItem[]>(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // Modais e gavetas
  const [isCartOpen, setIsCartOpen] = React.useState(false)
  const [isOrdersModalOpen, setIsOrdersModalOpen] = React.useState(false)
  const [weighedProduct, setWeighedProduct] = React.useState<PortalProduct | null>(null)
  const [weighedInitialKg, setWeighedInitialKg] = React.useState(0.25)

  // Dados de checkout
  const [customerName, setCustomerName] = React.useState('')
  const [customerPhone, setCustomerPhone] = React.useState('')
  const [customerAddress, setCustomerAddress] = React.useState('')
  const [customerNotes, setCustomerNotes] = React.useState('')
  const [paymentMethod, setPaymentMethod] = React.useState<PortalPaymentMethod>('PIX')
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  // Histórico de pedidos no dispositivo
  const [recentOrders, setRecentOrders] = React.useState<PortalStoredOrderHistoryItem[]>(() =>
    getPortalOrderHistory(store.id)
  )

  const primaryColor =
    store.theme_config?.primaryColor || portalConfig.branding.primaryColor || '#16a34a'

  React.useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // ignore
    }
  }, [cart])

  // Carrega categorias da loja
  React.useEffect(() => {
    supabasePortalApi
      .fetchStoreCategories()
      .then(setCategories)
      .catch((err) => {
        const credErr = classifyPortalApiError(err)
        if (credErr) onCredentialInvalidated(credErr)
      })
  }, [onCredentialInvalidated])

  // Carrega produtos da vitrine
  React.useEffect(() => {
    let active = true
    setLoadingProducts(true)

    supabasePortalApi
      .fetchCatalogProducts({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        page,
        pageSize,
      })
      .then((res) => {
        if (!active) return
        setProducts(res.data)
        setTotalProducts(res.total)
      })
      .catch((err) => {
        if (!active) return
        const credErr = classifyPortalApiError(err)
        if (credErr) onCredentialInvalidated(credErr)
      })
      .finally(() => {
        if (active) setLoadingProducts(false)
      })

    return () => {
      active = false
    }
  }, [search, selectedCategory, page, pageSize, onCredentialInvalidated])

  // Filtro e ordenação dos produtos exibidos
  const displayedProducts = React.useMemo(() => {
    let list = [...products]

    if (onlyKg) {
      list = list.filter((p) => isWeighedProduct(p))
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.selling_price - b.selling_price)
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.selling_price - a.selling_price)
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    }

    return list
  }, [products, onlyKg, sortBy])

  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize))

  const cartTotal = React.useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity * item.product.selling_price, 0),
    [cart]
  )

  const cartCount = React.useMemo(
    () =>
      cart.reduce((acc, item) => {
        return acc + (isWeighedProduct(item.product) ? 1 : Math.round(item.quantity))
      }, 0),
    [cart]
  )

  const handleAddProduct = (product: PortalProduct) => {
    if (isWeighedProduct(product)) {
      const existing = cart.find((c) => c.product.id === product.id)
      setWeighedInitialKg(existing ? existing.quantity : 0.25)
      setWeighedProduct(product)
      return
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id)
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const handleConfirmWeight = (weightInKg: number) => {
    if (!weighedProduct) return
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === weighedProduct.id)
      if (existing) {
        return prev.map((c) =>
          c.product.id === weighedProduct.id ? { ...c, quantity: weightInKg } : c
        )
      }
      return [...prev, { product: weighedProduct, quantity: weightInKg }]
    })
    setWeighedProduct(null)
  }

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item
          const isKg = isWeighedProduct(item.product)
          const step = isKg ? (delta > 0 ? 0.05 : -0.05) : delta
          const nextQty = Number((item.quantity + step).toFixed(3))
          return { ...item, quantity: nextQty }
        })
        .filter((item) => item.quantity > 0.005)
    )
  }

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const handleClearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setOnlyKg(false)
    setSortBy('default')
    setPage(1)
  }

  const handleCheckoutSubmit = async (alsoSendWhatsApp: boolean) => {
    if (cart.length === 0 || submitting) return
    setCheckoutError(null)

    if (!customerName.trim()) {
      setCheckoutError('Informe seu nome para identificarmos o pedido.')
      return
    }
    if (!customerPhone.trim()) {
      setCheckoutError('Informe seu WhatsApp/Telefone para acompanhar o status do pedido.')
      return
    }

    setSubmitting(true)
    try {
      const created = await supabasePortalApi.createCatalogOrder({
        customerName,
        customerPhone,
        deliveryAddress: customerAddress,
        paymentMethod,
        notes: customerNotes,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.selling_price,
        })),
      })

      const entry: PortalStoredOrderHistoryItem = {
        id: created.id,
        orderNumber: created.order_number,
        storeId: store.id,
        storeName: store.name,
        totalAmount: created.total_amount,
        createdAt: created.created_at,
      }
      savePortalOrderHistory(entry)
      setRecentOrders(getPortalOrderHistory(store.id))

      const trackingUrl = buildPortalOrderTrackingUrl(created.id)

      if (alsoSendWhatsApp) {
        const storePhone = normalizeWhatsAppPhone(store.whatsapp || store.phone)
        const template = getResolvedWhatsAppTemplate(store.theme_config)
        const message = formatPortalWhatsAppOrderMessage({
          template,
          orderNumber: created.order_number,
          storeName: store.name,
          customerName,
          customerPhone,
          customerAddress,
          paymentMethod,
          notes: customerNotes,
          trackingUrl,
          totalAmount: created.total_amount,
          createdAt: created.created_at,
          items: cart.map((c) => ({
            name: c.product.name,
            quantity: c.quantity,
            unitPrice: c.product.selling_price,
            isWeighed: isWeighedProduct(c.product),
            weightLabel: isWeighedProduct(c.product)
              ? formatProductWeight(c.quantity)
              : undefined,
          })),
        })
        const encoded = encodeURIComponent(message)
        const waUrl = storePhone
          ? `https://wa.me/${storePhone}?text=${encoded}`
          : `https://wa.me/?text=${encoded}`
        window.open(waUrl, '_blank')
      }

      setCart([])
      setIsCartOpen(false)
      onOpenOrderTracking(created.id)
    } catch (err: any) {
      const credErr = classifyPortalApiError(err)
      if (credErr) {
        onCredentialInvalidated(credErr)
        return
      }
      setCheckoutError(err?.message || 'Erro ao enviar pedido. Verifique o estoque disponível.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* 1. Header E-commerce Estilo Oba com busca ampla e sacola */}
      <Header
        store={store}
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrdersModal={() => setIsOrdersModalOpen(true)}
        isDark={isDark}
        onToggleDark={onToggleDark}
        primaryColor={primaryColor}
      />

      {/* 2. Sub-Header de Departamentos & Categorias */}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(id) => {
          setSelectedCategory(id)
          setPage(1)
        }}
        totalProducts={totalProducts}
        primaryColor={primaryColor}
      />

      {/* 3. Área Principal de Conteúdo Ampla (Full-Width / Max 1440px) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Promocional & Atalhos Visuais (Ocultos quando houver busca ativa) */}
        {!search && (
          <HeroBanner
            store={store}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => {
              setSelectedCategory(id)
              setPage(1)
            }}
            primaryColor={primaryColor}
          />
        )}

        {/* Vitrine de Produtos com Grid Amplo de 2 a 6 colunas */}
        <ProductGrid
          products={displayedProducts}
          totalProducts={totalProducts}
          loading={loadingProducts}
          cart={cart}
          onAddProduct={handleAddProduct}
          onUpdateQty={handleUpdateQty}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onlyKg={onlyKg}
          onToggleOnlyKg={() => setOnlyKg((k) => !k)}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
          search={search}
          onClearFilters={handleClearFilters}
          primaryColor={primaryColor}
        />
      </main>

      {/* 4. Rodapé Limpo */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} <strong>{store.name}</strong> • Catálogo Online e Rastreamento de Pedidos em Tempo Real.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Desenvolvido com tecnologia de estoque ao vivo</span>
          </div>
        </div>
      </footer>

      {/* Modais e Gavetas */}
      <WeightSelectorModal
        product={weighedProduct}
        initialWeightKg={weighedInitialKg}
        onClose={() => setWeighedProduct(null)}
        onConfirm={handleConfirmWeight}
      />

      <RecentOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        orders={recentOrders}
        onOpenOrderTracking={onOpenOrderTracking}
        primaryColor={primaryColor}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        store={store}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onAddProduct={handleAddProduct}
        onSubmitCheckout={handleCheckoutSubmit}
        submitting={submitting}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        customerAddress={customerAddress}
        setCustomerAddress={setCustomerAddress}
        customerNotes={customerNotes}
        setCustomerNotes={setCustomerNotes}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        checkoutError={checkoutError}
        primaryColor={primaryColor}
      />
    </div>
  )
}

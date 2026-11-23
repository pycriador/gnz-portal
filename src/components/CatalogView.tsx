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
import { PromoSlider } from './PromoSlider'
import { CategoryCircles } from './CategoryCircles'
import { OffersShowcase } from './OffersShowcase'
import { DailyFavoritesSection } from './DailyFavoritesSection'
import { CategoryShowcaseSection } from './CategoryShowcaseSection'
import { ProductGrid } from './ProductGrid'
import { CartDrawer } from './CartDrawer'
import { RecentOrdersModal } from './RecentOrdersModal'
import { WeightSelectorModal } from './WeightSelectorModal'
import { CookieConsentBanner } from './CookieConsentBanner'
import { PwaInstallPrompt } from './PwaInstallPrompt'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { ArrowLeft, Download } from 'lucide-react'
import gnzLogo from '../assets/gnz-logo.png'

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
  const [allProducts, setAllProducts] = React.useState<PortalProduct[]>([])
  const [filteredProducts, setFilteredProducts] = React.useState<PortalProduct[]>([])
  const [totalProducts, setTotalProducts] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  // Filtros, ordenação e paginação
  const [search, setSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('')
  const [sortBy, setSortBy] = React.useState('default')
  const [onlyKg, setOnlyKg] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState<number>(24)

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

  const configuredPrimary = store.theme_config?.primaryColor
  const primaryColor =
    configuredPrimary &&
    configuredPrimary.toLowerCase() !== '#16a34a' &&
    configuredPrimary.toLowerCase() !== '#2e7d32'
      ? configuredPrimary
      : portalConfig.branding.primaryColor || '#1B6B1E'

  const offersRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // ignore
    }
  }, [cart])

  // Carrega categorias e catálogo completo da loja
  React.useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      supabasePortalApi.fetchStoreCategories(),
      supabasePortalApi.fetchCatalogProducts({ pageSize: 100 }),
    ])
      .then(([cats, prodsRes]) => {
        if (!active) return
        setCategories(cats)
        setAllProducts(prodsRes.data)
        setTotalProducts(prodsRes.total)
      })
      .catch((err) => {
        if (!active) return
        const credErr = classifyPortalApiError(err)
        if (credErr) onCredentialInvalidated(credErr)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [onCredentialInvalidated])

  // Mapeia produtos por categoria para as vitrines individuais
  const productsByCategory = React.useMemo(() => {
    const map: Record<string, PortalProduct[]> = {}
    for (const p of allProducts) {
      if (p.category_id) {
        if (!map[p.category_id]) map[p.category_id] = []
        map[p.category_id].push(p)
      }
    }
    return map
  }, [allProducts])

  const productCountByCategory = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const [catId, prods] of Object.entries(productsByCategory)) {
      map[catId] = prods.length
    }
    return map
  }, [productsByCategory])

  // Efeito de busca ou filtro por categoria específica
  React.useEffect(() => {
    let list = [...allProducts]

    if (search.trim()) {
      const term = search.toLowerCase().trim()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)) ||
          p.sku.toLowerCase().includes(term)
      )
    }

    if (selectedCategory) {
      list = list.filter((p) => p.category_id === selectedCategory)
    }

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

    setFilteredProducts(list)
  }, [allProducts, search, selectedCategory, onlyKg, sortBy])

  // Paginação dos produtos filtrados
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const paginatedProducts = React.useMemo(() => {
    const from = (page - 1) * pageSize
    return filteredProducts.slice(from, from + pageSize)
  }, [filteredProducts, page, pageSize])

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

  const handleScrollToOffers = () => {
    if (offersRef.current) {
      offersRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSelectCategoryByName = (categoryName: string) => {
    const found = categories.find((c) =>
      c.name.toLowerCase().includes(categoryName.toLowerCase())
    )
    if (found) {
      setSelectedCategory(found.id)
      setPage(1)
      window.scrollTo({ top: 380, behavior: 'smooth' })
    }
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

  const isBrowsingAll = !search && !selectedCategory
  const activeCategoryObj = categories.find((c) => c.id === selectedCategory)
  const { showInstallButton, triggerInstall } = usePwaInstall()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-brand-charcoal text-brand-charcoal dark:text-slate-100 flex flex-col selection:bg-brand-primary selection:text-white pwa-safe-bottom">
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
        showInstallButton={showInstallButton}
        onInstallApp={triggerInstall}
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

      {/* 3. Área Principal de Conteúdo Ampla (Full-Width / Max 1536px) */}
      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-8">
        {/* MODO 1: PÁGINA INICIAL RICA COM VITRINES E SEÇÕES INDIVIDUAIS (SEM BUSCA/FILTRO) */}
        {isBrowsingAll ? (
          <>
            {/* Slider de 5 Promoções do Mês (Padrão Oba) */}
            <PromoSlider
              onSelectCategory={handleSelectCategoryByName}
              onScrollToOffers={handleScrollToOffers}
              primaryColor={primaryColor}
            />

            {/* Navegue por Categorias com Ícones Elegantes e Contagens */}
            <CategoryCircles
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(id) => {
                setSelectedCategory(id)
                setPage(1)
              }}
              productCountByCategory={productCountByCategory}
            />

            {/* Bloco de Ofertas da Semana com Imagem Preparada à Esquerda e Slider à Direita */}
            <div ref={offersRef}>
              <OffersShowcase
                products={allProducts}
                cart={cart}
                onAddProduct={handleAddProduct}
                onUpdateQty={handleUpdateQty}
                onViewAllOffers={() => {
                  setSortBy('price_asc')
                  setSelectedCategory('')
                  window.scrollTo({ top: 900, behavior: 'smooth' })
                }}
                primaryColor={primaryColor}
              />
            </div>

            {/* Favoritos do Dia a Dia */}
            <DailyFavoritesSection
              products={allProducts}
              cart={cart}
              onAddProduct={handleAddProduct}
              onUpdateQty={handleUpdateQty}
              primaryColor={primaryColor}
            />

            {/* Vitrines Individuais por Categoria */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-2.5 px-0.5">
                <span className="h-5 w-1 rounded-full bg-brand-primary shrink-0" aria-hidden="true" />
                <h2 className="text-base sm:text-xl font-bold text-brand-charcoal dark:text-white tracking-tight">
                  Vitrines por Departamento
                </h2>
              </div>

              {categories.map((category) => {
                const catProducts = productsByCategory[category.id] || []
                if (catProducts.length === 0) return null

                return (
                  <CategoryShowcaseSection
                    key={category.id}
                    category={category}
                    products={catProducts}
                    cart={cart}
                    onAddProduct={handleAddProduct}
                    onUpdateQty={handleUpdateQty}
                    onSelectCategory={(catId) => {
                      setSelectedCategory(catId)
                      setPage(1)
                      window.scrollTo({ top: 300, behavior: 'smooth' })
                    }}
                    primaryColor={primaryColor}
                  />
                )
              })}
            </div>
          </>
        ) : (
          /* MODO 2: NAVEGAÇÃO FOCADA (BUSCA ATIVA OU CATEGORIA SELECIONADA) */
          <div className="space-y-6">
            {/* Barra de Retorno e Indicador de Filtro */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-primary dark:text-brand-light hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar à vitrine principal</span>
              </button>

              <div className="flex items-center gap-2">
                {activeCategoryObj && (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-primary/10 text-brand-primary dark:text-brand-light border border-brand-primary/30">
                    Categoria: {activeCategoryObj.name}
                  </span>
                )}
                {search && (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-craft/15 text-brand-charcoal dark:text-brand-craft border border-brand-craft/30">
                    Busca: &quot;{search}&quot;
                  </span>
                )}
              </div>
            </div>

            {/* Grid Amplo com Ordenação e Paginação */}
            <ProductGrid
              products={paginatedProducts}
              totalProducts={filteredProducts.length}
              loading={loading}
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
          </div>
        )}
      </main>

      {/* 4. Rodapé Limpo */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-charcoal py-8 text-center text-xs text-slate-500 dark:text-slate-400 mt-12">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-lg dark:bg-white/95 dark:px-2 dark:py-0.5">
              <img
                src={gnzLogo}
                alt={store.name || 'GNZ Hortifruti'}
                className="h-7 w-auto object-contain"
              />
            </span>
            <p className="text-left">
              © {new Date().getFullYear()} <strong>{store.name}</strong> • Catálogo Online e Rastreamento de Pedidos.
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            {showInstallButton && (
              <button
                type="button"
                onClick={triggerInstall}
                className="inline-flex items-center gap-1.5 text-brand-primary dark:text-brand-light font-bold hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Instalar Aplicativo (PWA)</span>
              </button>
            )}
            <span>Tecnologia de Estoque & Balança ao Vivo</span>
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

      {/* Sugestão e Modal de Instalação do PWA */}
      <PwaInstallPrompt primaryColor={primaryColor} />

      {/* Banner de Cookies com Gravação Real no Supabase */}
      <CookieConsentBanner primaryColor={primaryColor} />
    </div>
  )
}

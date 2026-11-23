import * as React from 'react'

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

let deferredPromptGlobal: BeforeInstallPromptEvent | null = null
let isInstalledGlobal = false
const subscribers = new Set<() => void>()

function notifySubscribers() {
  subscribers.forEach((fn) => fn())
}

export function resolvePwaBasePath(): string {
  if (typeof window === 'undefined') return '/hortifruti/pedidos'

  const pathname = window.location.pathname || '/'
  if (pathname === '/hortifruti/pedidos' || pathname.startsWith('/hortifruti/pedidos/')) {
    return '/hortifruti/pedidos'
  }

  const envBase = import.meta.env.BASE_URL || '/hortifruti/pedidos/'
  if (envBase && envBase !== './' && envBase !== '.') {
    return envBase.replace(/\/+$/, '') || ''
  }

  if (pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '')
  }

  const lastSlash = pathname.lastIndexOf('/')
  return lastSlash > 0 ? pathname.slice(0, lastSlash) : ''
}

export function getPwaIconUrl(
  file:
    | 'icon-192.png'
    | 'icon-512.png'
    | 'icon-maskable-512.png'
    | 'apple-touch-icon-180.png' = 'icon-192.png'
): string {
  const base = resolvePwaBasePath()
  return `${base}/icons/${file}`
}

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if (isInstalledGlobal) return true

  const nav = window.navigator as Navigator & { standalone?: boolean }
  if (nav.standalone === true) return true

  if (typeof window.matchMedia === 'function') {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches
    ) {
      return true
    }
  }

  return false
}

export function detectIsIOS(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent || ''
  const isIPhoneIPadIPod = /iPad|iPhone|iPod/.test(ua)
  const isIPadOS =
    window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1
  return isIPhoneIPadIPod || isIPadOS
}

// Captura global imediata do beforeinstallprompt (antes mesmo do bootstrap do React/Supabase terminar)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredPromptGlobal = e as BeforeInstallPromptEvent
    notifySubscribers()
  })

  window.addEventListener('appinstalled', () => {
    deferredPromptGlobal = null
    isInstalledGlobal = true
    notifySubscribers()
  })

  if (typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const onChange = () => notifySubscribers()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange)
    }
  }
}

/**
 * Registra o Service Worker em /hortifruti/pedidos/sw.js com scope '/hortifruti/pedidos'
 * (pois o site GNZ remove a barra final da URL), com fallback para o BASE_URL ativo.
 */
export function registerPwaServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    const pathname = window.location.pathname || '/'
    const isHortifrutiSubpath =
      pathname === '/hortifruti/pedidos' || pathname.startsWith('/hortifruti/pedidos/')

    if (isHortifrutiSubpath) {
      navigator.serviceWorker
        .register('/hortifruti/pedidos/sw.js', { scope: '/hortifruti/pedidos' })
        .catch(() => {
          navigator.serviceWorker
            .register('/hortifruti/pedidos/sw.js', { scope: '/hortifruti/pedidos/' })
            .catch(() => {})
        })
      return
    }

    const base = resolvePwaBasePath()
    const swUrl = `${base}/sw.js`
    const scope = base || '/'

    navigator.serviceWorker
      .register(swUrl, { scope })
      .catch(() => {
        navigator.serviceWorker.register(swUrl, { scope: `${base}/` }).catch(() => {})
      })
  })
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(
    () => deferredPromptGlobal
  )
  const [isStandalone, setIsStandalone] = React.useState<boolean>(() => checkIsStandalone())
  const [isInstructionModalOpen, setIsInstructionModalOpen] = React.useState(false)
  const isIOS = React.useMemo(() => detectIsIOS(), [])

  React.useEffect(() => {
    const syncState = () => {
      setDeferredPrompt(deferredPromptGlobal)
      setIsStandalone(checkIsStandalone())
    }
    subscribers.add(syncState)
    syncState()
    return () => {
      subscribers.delete(syncState)
    }
  }, [])

  const triggerInstall = React.useCallback(async () => {
    if (deferredPromptGlobal) {
      try {
        await deferredPromptGlobal.prompt()
        const choice = await deferredPromptGlobal.userChoice
        if (choice.outcome === 'accepted') {
          deferredPromptGlobal = null
          notifySubscribers()
        }
        return
      } catch {
        // Caso o prompt nativo não possa ser aberto, exibe instruções
      }
    }
    setIsInstructionModalOpen(true)
  }, [])

  return {
    isStandalone,
    isIOS,
    canPromptNatively: Boolean(deferredPrompt),
    showInstallButton: !isStandalone,
    isInstructionModalOpen,
    openInstructionModal: () => setIsInstructionModalOpen(true),
    closeInstructionModal: () => setIsInstructionModalOpen(false),
    triggerInstall,
  }
}

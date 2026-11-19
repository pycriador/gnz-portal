import * as React from 'react'
import { Check, Cookie, ShieldCheck, X } from 'lucide-react'
import { supabasePortalApi } from '../api/supabasePortalClient'

const COOKIE_STORAGE_KEY = 'gnz_portal_cookie_consent_v1'

interface CookieConsentBannerProps {
  primaryColor: string
}

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'visitor_ssr'
  let id = window.localStorage.getItem('gnz_portal_visitor_id')
  if (!id) {
    id = `vis_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`
    window.localStorage.setItem('gnz_portal_visitor_id', id)
  }
  return id
}

export function CookieConsentBanner({ primaryColor }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    try {
      const consent = window.localStorage.getItem(COOKIE_STORAGE_KEY)
      if (!consent) {
        // Exibe com breve atraso para entrada suave
        const timer = setTimeout(() => setIsVisible(true), 800)
        return () => clearTimeout(timer)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleConsent = async (analytics: boolean, marketing: boolean) => {
    setSaving(true)
    const visitorId = getOrCreateVisitorId()

    try {
      // 1. Grava no banco de dados Supabase (public.cookie_consents)
      await supabasePortalApi.recordCookieConsent({
        visitorId,
        analytics,
        marketing,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        metadata: {
          screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
          screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
          language: typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
          timestamp: new Date().toISOString(),
          decision: analytics && marketing ? 'ALL' : 'ESSENTIAL_ONLY',
        },
      })

      // 2. Persiste localmente para não exibir novamente
      window.localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({
          accepted: true,
          analytics,
          marketing,
          timestamp: new Date().toISOString(),
        })
      )
    } catch (e) {
      console.warn('Erro ao processar cookies:', e)
    } finally {
      setSaving(false)
      setIsVisible(false)
    }
  }

  if (!isVisible) return null

  return (
    <aside aria-label="Consentimento de Cookies" className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xl text-slate-900 dark:text-white space-y-3.5">
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            <Cookie className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-black tracking-tight">Privacidade & Cookies</h3>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="h-3 w-3" /> LGPD
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
              Utilizamos cookies para salvar sua sacola, memorizar preferências e coletar dados anônimos de navegação para aprimorar sua experiência de compra.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleConsent(false, false)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            Apenas Essenciais
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleConsent(true, true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shadow-xs hover:opacity-95 active:scale-95 transition disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            <Check className="h-3.5 w-3.5" />
            <span>{saving ? 'Gravando...' : 'Aceitar Todos'}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

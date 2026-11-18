/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_PORTAL_STORE_ID?: string
  readonly VITE_PORTAL_HBAC_TOKEN?: string
  readonly VITE_PORTAL_STORE_SLUG?: string
  readonly VITE_PORTAL_CUSTOM_TITLE?: string
  readonly VITE_PORTAL_HERO_BADGE?: string
  readonly VITE_PORTAL_DELIVERY_INFO?: string
  readonly VITE_PORTAL_BRAND_PRIMARY?: string
  readonly VITE_PORTAL_BRAND_ACCENT?: string
  readonly VITE_PORTAL_CARD_STYLE?: string
  readonly VITE_BASE_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

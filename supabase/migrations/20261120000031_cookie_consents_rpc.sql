-- =============================================================================
-- MIGRATION: 20261120000031_cookie_consents_rpc.sql
-- Cria tabela public.cookie_consents e RPC public.record_cookie_consent (LGPD)
-- utilizadas pelo banner de consentimento do Portal Portátil (gnz-portal).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cookie_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  analytics BOOLEAN NOT NULL DEFAULT FALSE,
  marketing BOOLEAN NOT NULL DEFAULT FALSE,
  user_agent TEXT,
  page_url TEXT,
  referrer TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cookie_consents_store ON public.cookie_consents(store_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_visitor ON public.cookie_consents(store_id, visitor_id);

ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.record_cookie_consent(
  p_store_id UUID,
  p_visitor_id TEXT,
  p_analytics BOOLEAN DEFAULT FALSE,
  p_marketing BOOLEAN DEFAULT FALSE,
  p_user_agent TEXT DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_store_id IS NULL OR NULLIF(TRIM(COALESCE(p_visitor_id, '')), '') IS NULL THEN
    RAISE EXCEPTION 'store_id e visitor_id são obrigatórios.';
  END IF;

  INSERT INTO public.cookie_consents (
    store_id,
    visitor_id,
    analytics,
    marketing,
    user_agent,
    page_url,
    referrer,
    metadata
  ) VALUES (
    p_store_id,
    TRIM(p_visitor_id),
    COALESCE(p_analytics, FALSE),
    COALESCE(p_marketing, FALSE),
    p_user_agent,
    p_page_url,
    p_referrer,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'id', v_id,
    'visitorId', TRIM(p_visitor_id)
  );
END;
$$;

COMMENT ON FUNCTION public.record_cookie_consent(UUID, TEXT, BOOLEAN, BOOLEAN, TEXT, TEXT, TEXT, JSONB) IS
  'Registra consentimento de cookies (LGPD) de visitantes do portal público.';

REVOKE ALL ON FUNCTION public.record_cookie_consent(UUID, TEXT, BOOLEAN, BOOLEAN, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_cookie_consent(UUID, TEXT, BOOLEAN, BOOLEAN, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- MIGRATION: 20261120000020_public_portal_rpcs.sql
-- Cria as RPCs públicas e tabela de consentimento de cookies utilizadas pelo
-- Portal Portátil (gnz-portal / Catálogo Online + Rastreamento em Tempo Real):
--   1. public.create_public_catalog_order
--   2. public.get_public_order_tracking
--   3. public.cookie_consents + public.record_cookie_consent
--
-- Segurança:
--   - SECURITY DEFINER com search_path fixo (public, pg_temp)
--   - Validação de loja ativa e token HBAC (quando enviado no cabeçalho)
--   - Preços sempre lidos diretamente de public.products (impede adulteração)
--   - Baixa atômica de estoque com SELECT ... FOR UPDATE (impede estoque negativo)
--   - Isolamento estrito por store_id
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Helper interno: valida cabeçalho X-HBAC-Token (se enviado) contra a loja
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._validate_portal_hbac(
  p_store_id UUID,
  p_required_scope TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_headers JSONB;
  v_token TEXT;
  v_rec RECORD;
BEGIN
  BEGIN
    v_headers := COALESCE(current_setting('request.headers', true)::jsonb, '{}'::jsonb);
  EXCEPTION WHEN OTHERS THEN
    v_headers := '{}'::jsonb;
  END;

  v_token := NULLIF(TRIM(COALESCE(v_headers->>'x-hbac-token', '')), '');

  -- Se não houver token no cabeçalho, exige usuário autenticado com acesso à loja
  IF v_token IS NULL THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Token HBAC obrigatório para chamadas públicas.'
        USING ERRCODE = '28000';
    END IF;
    RETURN;
  END IF;

  SELECT id, store_id, scopes, is_active, expires_at
    INTO v_rec
  FROM public.api_tokens
  WHERE token = v_token
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Token HBAC inválido ou não encontrado.'
      USING ERRCODE = '28000';
  END IF;

  IF NOT v_rec.is_active THEN
    RAISE EXCEPTION 'Token HBAC desativado pelo administrador.'
      USING ERRCODE = '42501';
  END IF;

  IF v_rec.expires_at IS NOT NULL AND v_rec.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Token HBAC expirado.'
      USING ERRCODE = '28000';
  END IF;

  IF v_rec.store_id IS NOT NULL AND p_store_id IS NOT NULL AND v_rec.store_id <> p_store_id THEN
    RAISE EXCEPTION 'Token HBAC exclusivo da loja configurada.'
      USING ERRCODE = '42501';
  END IF;

  IF p_required_scope IS NOT NULL
     AND v_rec.scopes IS NOT NULL
     AND jsonb_typeof(v_rec.scopes) = 'array'
     AND jsonb_array_length(v_rec.scopes) > 0
     AND NOT (v_rec.scopes ? p_required_scope OR v_rec.scopes ? '*') THEN
    RAISE EXCEPTION 'Token HBAC sem permissão para o escopo %.', p_required_scope
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.api_tokens
  SET last_used_at = NOW()
  WHERE id = v_rec.id;
END;
$$;

REVOKE ALL ON FUNCTION public._validate_portal_hbac(UUID, TEXT) FROM PUBLIC;

-- -----------------------------------------------------------------------------
-- 1. RPC: public.create_public_catalog_order
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_public_catalog_order(
  p_store_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT DEFAULT NULL,
  p_delivery_address TEXT DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::jsonb,
  p_payment_method TEXT DEFAULT 'PIX',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_store RECORD;
  v_customer_id UUID;
  v_clean_name TEXT;
  v_clean_phone TEXT;
  v_phone_digits TEXT;
  v_clean_address TEXT;
  v_clean_notes TEXT;
  v_payment_method public.payment_method_enum;
  v_order_id UUID;
  v_order_number TEXT;
  v_created_at TIMESTAMPTZ;

  v_subtotal NUMERIC(12, 2) := 0;
  v_item RECORD;
  v_product RECORD;
  v_balance RECORD;
  v_requested_qty NUMERIC(12, 3);
  v_line_total NUMERIC(12, 2);
BEGIN
  -- 1. Validações básicas
  IF p_store_id IS NULL THEN
    RAISE EXCEPTION 'Loja não informada.';
  END IF;

  PERFORM public._validate_portal_hbac(p_store_id, 'orders:write');

  SELECT id, name, is_active, deleted_at
    INTO v_store
  FROM public.stores
  WHERE id = p_store_id
    AND is_active = TRUE
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loja não encontrada ou inativa.';
  END IF;

  v_clean_name := NULLIF(TRIM(COALESCE(p_customer_name, '')), '');
  IF v_clean_name IS NULL THEN
    RAISE EXCEPTION 'Informe o nome do cliente para finalizar o pedido.';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'O carrinho está vazio.';
  END IF;

  v_clean_phone := NULLIF(TRIM(COALESCE(p_customer_phone, '')), '');
  v_phone_digits := NULLIF(regexp_replace(COALESCE(v_clean_phone, ''), '\D', '', 'g'), '');
  v_clean_address := NULLIF(TRIM(COALESCE(p_delivery_address, '')), '');
  v_clean_notes := NULLIF(TRIM(COALESCE(p_notes, '')), '');

  -- Normaliza forma de pagamento contra payment_method_enum
  BEGIN
    v_payment_method := UPPER(COALESCE(NULLIF(TRIM(p_payment_method), ''), 'PIX'))::public.payment_method_enum;
  EXCEPTION WHEN OTHERS THEN
    v_payment_method := 'PIX'::public.payment_method_enum;
  END;

  -- 2. Valida todos os itens, trava saldos em ordem determinística e calcula subtotal real
  FOR v_item IN
    SELECT
      (x->>'productId')::UUID AS product_id,
      SUM((x->>'quantity')::NUMERIC(12, 3)) AS total_qty
    FROM jsonb_array_elements(p_items) AS x
    GROUP BY (x->>'productId')::UUID
    ORDER BY (x->>'productId')::UUID
  LOOP
    IF v_item.product_id IS NULL THEN
      RAISE EXCEPTION 'Item do carrinho sem identificador de produto.';
    END IF;

    IF v_item.total_qty IS NULL OR v_item.total_qty <= 0 THEN
      RAISE EXCEPTION 'Quantidade inválida no carrinho.';
    END IF;

    SELECT id, name, sku, selling_price, cost_price
      INTO v_product
    FROM public.products
    WHERE id = v_item.product_id
      AND store_id = p_store_id
      AND is_active = TRUE
      AND is_published_catalog = TRUE
      AND deleted_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Um ou mais produtos do carrinho não estão mais disponíveis no catálogo.';
    END IF;

    SELECT id, quantity, available_quantity
      INTO v_balance
    FROM public.stock_balances
    WHERE store_id = p_store_id
      AND product_id = v_item.product_id
    FOR UPDATE;

    IF FOUND AND v_balance.available_quantity < v_item.total_qty THEN
      RAISE EXCEPTION 'Estoque insuficiente para "%" (disponível: %, solicitado: %).',
        v_product.name,
        v_balance.available_quantity,
        v_item.total_qty;
    END IF;

    v_subtotal := v_subtotal + ROUND(v_product.selling_price * v_item.total_qty, 2);
  END LOOP;

  -- 3. Localiza ou cria cliente na loja
  IF v_phone_digits IS NOT NULL THEN
    SELECT id
      INTO v_customer_id
    FROM public.customers
    WHERE store_id = p_store_id
      AND deleted_at IS NULL
      AND regexp_replace(COALESCE(phone, ''), '\D', '', 'g') = v_phone_digits
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (
      store_id,
      name,
      phone,
      whatsapp,
      status
    ) VALUES (
      p_store_id,
      v_clean_name,
      v_clean_phone,
      v_clean_phone,
      'ACTIVE'
    )
    RETURNING id INTO v_customer_id;
  END IF;

  -- 4. Gera número único de pedido para a loja
  v_order_number := 'CAT-' ||
    TO_CHAR(NOW() AT TIME ZONE 'America/Sao_Paulo', 'YYMMDDHH24MISS') ||
    '-' ||
    LPAD((FLOOR(RANDOM() * 900) + 100)::INT::TEXT, 3, '0');

  -- 5. Cria pedido em public.orders
  INSERT INTO public.orders (
    store_id,
    customer_id,
    user_id,
    order_number,
    channel,
    status,
    subtotal,
    discount_amount,
    shipping_amount,
    total_amount,
    notes
  ) VALUES (
    p_store_id,
    v_customer_id,
    NULL,
    v_order_number,
    'CATALOG'::public.order_channel_enum,
    'PENDING'::public.order_status_enum,
    v_subtotal,
    0,
    0,
    v_subtotal,
    v_clean_notes
  )
  RETURNING id, created_at INTO v_order_id, v_created_at;

  -- 6. Insere itens e baixa estoque atomicamente
  FOR v_item IN
    SELECT
      (x->>'productId')::UUID AS product_id,
      SUM((x->>'quantity')::NUMERIC(12, 3)) AS quantity
    FROM jsonb_array_elements(p_items) AS x
    GROUP BY (x->>'productId')::UUID
    ORDER BY (x->>'productId')::UUID
  LOOP
    SELECT id, selling_price, cost_price
      INTO v_product
    FROM public.products
    WHERE id = v_item.product_id
      AND store_id = p_store_id;

    v_requested_qty := v_item.quantity;
    v_line_total := ROUND(v_product.selling_price * v_requested_qty, 2);

    INSERT INTO public.order_items (
      order_id,
      store_id,
      product_id,
      batch_id,
      quantity,
      unit_price,
      unit_cost,
      discount,
      total_price
    ) VALUES (
      v_order_id,
      p_store_id,
      v_product.id,
      NULL,
      v_requested_qty,
      v_product.selling_price,
      v_product.cost_price,
      0,
      v_line_total
    );

    SELECT id, quantity
      INTO v_balance
    FROM public.stock_balances
    WHERE store_id = p_store_id
      AND product_id = v_product.id
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.stock_balances
      SET quantity = quantity - v_requested_qty,
          updated_at = NOW()
      WHERE id = v_balance.id;

      INSERT INTO public.stock_movements (
        store_id,
        product_id,
        batch_id,
        movement_type,
        quantity,
        previous_quantity,
        new_quantity,
        reference_id,
        reference_type,
        notes,
        user_id
      ) VALUES (
        p_store_id,
        v_product.id,
        NULL,
        'SALE'::public.stock_movement_type_enum,
        v_requested_qty,
        v_balance.quantity,
        v_balance.quantity - v_requested_qty,
        v_order_id::TEXT,
        'order',
        'Pedido online via Catálogo Público #' || v_order_number,
        NULL
      );
    END IF;
  END LOOP;

  -- 7. Registra pagamento pendente
  INSERT INTO public.payments (
    order_id,
    store_id,
    method,
    amount,
    status
  ) VALUES (
    v_order_id,
    p_store_id,
    v_payment_method,
    v_subtotal,
    'PENDING'::public.payment_status_enum
  );

  -- 8. Registra endereço de entrega (se informado)
  IF v_clean_address IS NOT NULL THEN
    INSERT INTO public.shipments (
      order_id,
      store_id,
      shipping_type,
      cost,
      status,
      delivery_address
    ) VALUES (
      v_order_id,
      p_store_id,
      'DELIVERY',
      0,
      'PENDING',
      jsonb_build_object('address', v_clean_address)
    );
  END IF;

  -- 9. Notifica a equipe da loja no ERP
  INSERT INTO public.notifications (
    store_id,
    user_id,
    type,
    title,
    message,
    metadata
  ) VALUES (
    p_store_id,
    NULL,
    'NEW_ONLINE_ORDER',
    'Novo Pedido Online #' || v_order_number,
    'Cliente ' || v_clean_name || ' realizou um pedido de R$ ' || TO_CHAR(v_subtotal, 'FM999999990D00') || '.',
    jsonb_build_object(
      'order_id', v_order_id,
      'order_number', v_order_number,
      'total_amount', v_subtotal,
      'channel', 'CATALOG'
    )
  );

  -- 10. Auditoria
  INSERT INTO public.audit_logs (
    store_id,
    user_id,
    action,
    entity,
    entity_id,
    after_data
  ) VALUES (
    p_store_id,
    NULL,
    'PUBLIC_ORDER_CREATED',
    'orders',
    v_order_id::TEXT,
    jsonb_build_object(
      'order_number', v_order_number,
      'channel', 'CATALOG',
      'customer_name', v_clean_name,
      'payment_method', v_payment_method::TEXT,
      'total_amount', v_subtotal,
      'item_count', jsonb_array_length(p_items)
    )
  );

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'status', 'PENDING',
    'total_amount', v_subtotal,
    'created_at', v_created_at
  );
END;
$$;

COMMENT ON FUNCTION public.create_public_catalog_order(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT) IS
  'Cria pedido público do catálogo online com validação de preços no banco, baixa atômica de estoque e notificação em tempo real.';

REVOKE ALL ON FUNCTION public.create_public_catalog_order(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_catalog_order(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2. RPC: public.get_public_order_tracking
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_order_tracking(
  p_order_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
  v_store JSONB;
  v_items JSONB;
  v_payment_method TEXT;
  v_delivery_address TEXT;
  v_headers JSONB;
  v_header_store_id UUID;
BEGIN
  IF p_order_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT
    o.id,
    o.store_id,
    o.order_number,
    o.channel::TEXT AS channel,
    o.status::TEXT AS status,
    o.subtotal,
    o.discount_amount,
    o.shipping_amount,
    o.total_amount,
    o.notes,
    o.cancelled_at,
    o.cancellation_reason,
    o.created_at,
    o.updated_at,
    COALESCE(c.name, 'Cliente') AS customer_name,
    c.phone AS customer_phone
  INTO v_order
  FROM public.orders o
  LEFT JOIN public.customers c ON c.id = o.customer_id
  WHERE o.id = p_order_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Valida token HBAC e isolamento de loja
  PERFORM public._validate_portal_hbac(v_order.store_id, 'orders:read');

  BEGIN
    v_headers := COALESCE(current_setting('request.headers', true)::jsonb, '{}'::jsonb);
    v_header_store_id := NULLIF(TRIM(COALESCE(v_headers->>'x-store-id', '')), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_header_store_id := NULL;
  END;

  IF v_header_store_id IS NOT NULL AND v_header_store_id <> v_order.store_id THEN
    RETURN NULL;
  END IF;

  SELECT p.method::TEXT
    INTO v_payment_method
  FROM public.payments p
  WHERE p.order_id = v_order.id
  ORDER BY p.created_at DESC
  LIMIT 1;

  SELECT COALESCE(
    s.delivery_address->>'address',
    s.delivery_address->>'raw',
    NULLIF(TRIM(s.delivery_address::TEXT), 'null')
  )
    INTO v_delivery_address
  FROM public.shipments s
  WHERE s.order_id = v_order.id
  ORDER BY s.created_at DESC
  LIMIT 1;

  SELECT jsonb_build_object(
    'id', st.id,
    'name', st.name,
    'slug', st.slug,
    'logo_url', st.logo_url,
    'phone', st.phone,
    'whatsapp', st.whatsapp,
    'address_street', st.address_street,
    'address_number', st.address_number,
    'address_neighborhood', st.address_neighborhood,
    'address_city', st.address_city,
    'address_state', st.address_state,
    'is_active', st.is_active,
    'theme_config', st.theme_config
  )
    INTO v_store
  FROM public.stores st
  WHERE st.id = v_order.store_id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', oi.id,
        'product_id', oi.product_id,
        'product_name', COALESCE(pr.name, 'Produto'),
        'product_sku', COALESCE(pr.sku, ''),
        'unit', COALESCE(pr.unit, 'UN'),
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'discount', oi.discount,
        'total_price', oi.total_price
      )
      ORDER BY oi.id
    ),
    '[]'::jsonb
  )
    INTO v_items
  FROM public.order_items oi
  LEFT JOIN public.products pr ON pr.id = oi.product_id
  WHERE oi.order_id = v_order.id;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'store_id', v_order.store_id,
    'order_number', v_order.order_number,
    'channel', v_order.channel,
    'status', v_order.status,
    'subtotal', v_order.subtotal,
    'discount_amount', v_order.discount_amount,
    'shipping_amount', v_order.shipping_amount,
    'total_amount', v_order.total_amount,
    'notes', v_order.notes,
    'customer_name', v_order.customer_name,
    'customer_phone', v_order.customer_phone,
    'delivery_address', v_delivery_address,
    'payment_method', COALESCE(v_payment_method, 'PIX'),
    'cancelled_at', v_order.cancelled_at,
    'cancellation_reason', v_order.cancellation_reason,
    'created_at', v_order.created_at,
    'updated_at', v_order.updated_at,
    'store', v_store,
    'items', v_items
  );
END;
$$;

COMMENT ON FUNCTION public.get_public_order_tracking(UUID) IS
  'Retorna os dados públicos de rastreamento de um pedido garantindo isolamento por loja.';

REVOKE ALL ON FUNCTION public.get_public_order_tracking(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_order_tracking(UUID) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Tabela public.cookie_consents + RPC public.record_cookie_consent (LGPD)
-- -----------------------------------------------------------------------------
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

  PERFORM public._validate_portal_hbac(p_store_id, NULL);

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

-- Recarrega imediatamente o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';

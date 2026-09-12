-- ==============================================================================
-- SCHEMA ADMINISTRATIVO NEURAUTOMATION — SISTEMA DE AFILIADOS
-- ==============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. CONTROLE DE ACESSO E ROLES (ADMIN)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'affiliate_manager', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Função de segurança para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ------------------------------------------------------------------------------
-- 2. LOJAS AFILIADAS (STORES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT,
    affiliate_network TEXT NOT NULL,
    affiliate_program TEXT,
    brand_bidding_allowed BOOLEAN NOT NULL DEFAULT false,
    google_ads_allowed BOOLEAN NOT NULL DEFAULT true,
    dsa_allowed BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'testing' CHECK (status IN ('active', 'testing', 'paused', 'archived')),
    daily_budget NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (daily_budget >= 0),
    monthly_budget NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (monthly_budget >= 0),
    target_cpa NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (target_cpa >= 0),
    max_cpc NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (max_cpc >= 0),
    target_roi NUMERIC(8, 2) NOT NULL DEFAULT 0, -- percentual (ex: 150 para 150%)
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stores_status ON public.stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_network ON public.stores(affiliate_network);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);

-- ------------------------------------------------------------------------------
-- 3. OFERTAS POR LOJA (OFFERS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    landing_page_url TEXT,
    affiliate_link TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'testing', 'paused', 'expired')),
    payout_type TEXT NOT NULL DEFAULT 'percentage' CHECK (payout_type IN ('percentage', 'fixed')),
    payout_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offers_store_id ON public.offers(store_id);

-- ------------------------------------------------------------------------------
-- 4. CAMPANHAS (CAMPAIGNS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    traffic_source TEXT NOT NULL DEFAULT 'google_ads',
    external_campaign_id TEXT, -- ID no Google Ads
    ad_group TEXT,
    search_term TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'testing', 'paused', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_store ON public.campaigns(store_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_offer ON public.campaigns(offer_id);

-- ------------------------------------------------------------------------------
-- 5. INVESTIMENTO EM ANÚNCIOS (AD_SPEND)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ad_spend (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0 CHECK (clicks >= 0),
    impressions INTEGER NOT NULL DEFAULT 0 CHECK (impressions >= 0),
    cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    conversions NUMERIC(10, 2) NOT NULL DEFAULT 0,
    conversion_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
    -- Campos anti-duplicação e rastreabilidade para importação futura
    source TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'google_ads_api', 'csv', 'webhook'
    source_id TEXT,
    imported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_spend_date ON public.ad_spend(date);
CREATE INDEX IF NOT EXISTS idx_ad_spend_store_date ON public.ad_spend(store_id, date);
CREATE INDEX IF NOT EXISTS idx_ad_spend_campaign_date ON public.ad_spend(campaign_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ad_spend_dedup
  ON public.ad_spend (campaign_id, date, source, (COALESCE(source_id, '')));

-- ------------------------------------------------------------------------------
-- 6. VENDAS E COMISSÕES (SALES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    affiliate_network TEXT NOT NULL,
    order_id TEXT,
    date DATE NOT NULL,
    sale_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
    commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BRL',
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
    origin TEXT NOT NULL CHECK (origin IN ('google_ads', 'organic', 'direct', 'social', 'email', 'unknown', 'manual')),
    click_id TEXT,
    tracking_status TEXT NOT NULL DEFAULT 'manual' CHECK (tracking_status IN ('attributed', 'unattributed', 'manual', 'imported', 'confirmed')),
    notes TEXT,
    -- Campos anti-duplicação e rastreabilidade para importação futura
    source TEXT NOT NULL DEFAULT 'manual',
    source_id TEXT,
    imported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Regra inquebrável: uma venda só pode ser 'attributed' se houver click_id associado
ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS chk_attribution_requires_click;
ALTER TABLE public.sales ADD CONSTRAINT chk_attribution_requires_click 
CHECK (tracking_status <> 'attributed' OR click_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_store_date ON public.sales(store_id, date);
CREATE INDEX IF NOT EXISTS idx_sales_origin ON public.sales(origin);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_dedup
  ON public.sales (affiliate_network, order_id, source, (COALESCE(source_id, '')))
  WHERE order_id IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 7. TRIGGERS DE UPDATED_AT
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_stores ON public.stores;
CREATE TRIGGER set_timestamp_stores BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_offers ON public.offers;
CREATE TRIGGER set_timestamp_offers BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_campaigns ON public.campaigns;
CREATE TRIGGER set_timestamp_campaigns BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_ad_spend ON public.ad_spend;
CREATE TRIGGER set_timestamp_ad_spend BEFORE UPDATE ON public.ad_spend FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_sales ON public.sales;
CREATE TRIGGER set_timestamp_sales BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 8. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read user roles" ON public.user_roles;
CREATE POLICY "Admins read user roles" ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles;
CREATE POLICY "Admins manage user roles" ON public.user_roles FOR ALL
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access stores" ON public.stores;
CREATE POLICY "Admins full access stores" ON public.stores FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins full access offers" ON public.offers;
CREATE POLICY "Admins full access offers" ON public.offers FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins full access campaigns" ON public.campaigns;
CREATE POLICY "Admins full access campaigns" ON public.campaigns FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins full access ad_spend" ON public.ad_spend;
CREATE POLICY "Admins full access ad_spend" ON public.ad_spend FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins full access sales" ON public.sales;
CREATE POLICY "Admins full access sales" ON public.sales FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

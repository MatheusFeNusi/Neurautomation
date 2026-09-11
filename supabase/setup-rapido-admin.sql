-- ==============================================================================
-- SETUP RÁPIDO NEURAUTOMATION — Rodar UMA VEZ no SQL Editor do Supabase
--   1. Confirma email do usuário admin
--   2. Cria todo o schema (tabelas, funções, RLS, triggers)
--   3. Concede papel 'admin' pro email informado
--   4. Popula dados demo (lojas, ofertas, campanhas, ad-spend, vendas)
-- ==============================================================================
--
-- ANTES DE RODAR:
--   1. Crie o usuário em Authentication → Users (ou use o comando:
--      curl -X POST 'https://SEU-PROJETO.supabase.co/auth/v1/signup' \
--        -H "apikey: ANON_KEY" \
--        -H "Content-Type: application/json" \
--        -d '{"email":"admin@neurautomation.com","password":"SENHA_AQUI"}')
--   2. Substitua o email abaixo pelo seu, se for diferente
-- ==============================================================================

\set admin_email '''admin@neurautomation.com'''

-- ==============================================================================
-- 1. CONFIRMA EMAIL DO USUÁRIO
-- ==============================================================================
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = :admin_email;

-- ==============================================================================
-- 2. SCHEMA COMPLETO
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2.1. user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'affiliate_manager', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

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

-- 2.2. stores
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
    target_roi NUMERIC(8, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stores_status ON public.stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_network ON public.stores(affiliate_network);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);

-- 2.3. offers
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

-- 2.4. campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    traffic_source TEXT NOT NULL DEFAULT 'google_ads',
    external_campaign_id TEXT,
    ad_group TEXT,
    search_term TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'testing', 'paused', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_store ON public.campaigns(store_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_offer ON public.campaigns(offer_id);

-- 2.5. ad_spend
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
    source TEXT NOT NULL DEFAULT 'manual',
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

-- 2.6. sales
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
    source TEXT NOT NULL DEFAULT 'manual',
    source_id TEXT,
    imported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_attribution_requires_click CHECK (tracking_status <> 'attributed' OR click_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_store_date ON public.sales(store_id, date);
CREATE INDEX IF NOT EXISTS idx_sales_origin ON public.sales(origin);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_dedup
  ON public.sales (affiliate_network, order_id, source, (COALESCE(source_id, '')))
  WHERE order_id IS NOT NULL;

-- 2.7. Triggers updated_at
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

-- 2.8. RLS
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

-- ==============================================================================
-- 3. CONCEDE ROLE ADMIN
-- ==============================================================================
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = :admin_email
ON CONFLICT (user_id, role) DO NOTHING;

-- ==============================================================================
-- 4. SEED DE DADOS DEMO (Lojas/Ofertas/Campanhas + AdSpend 7d + Vendas 7d)
-- ==============================================================================

INSERT INTO public.stores (id, name, slug, category, affiliate_network, affiliate_program, brand_bidding_allowed, google_ads_allowed, dsa_allowed, status, daily_budget, monthly_budget, target_cpa, max_cpc, target_roi, notes)
VALUES
('a1111111-1111-1111-1111-111111111111', 'Nike Brasil', 'nike-brasil', 'Moda & Esportes', 'Awin', 'Nike Oficial', false, true, false, 'active', 500.00, 15000.00, 45.00, 2.80, 180.00, 'Foco em lançamentos de tênis de corrida. Proibido Brand Bidding.'),
('a2222222-2222-2222-2222-222222222222', 'Kabum', 'kabum', 'Informática & Gamer', 'Lomadee', 'Kabum Hardware', false, true, true, 'active', 800.00, 24000.00, 60.00, 3.50, 150.00, 'Alta conversão em periféricos e placas de vídeo.'),
('a3333333-3333-3333-3333-333333333333', 'Sephora Brasil', 'sephora-brasil', 'Beleza & Perfumaria', 'Rakuten', 'Sephora Beauty Club', true, true, false, 'testing', 250.00, 7500.00, 35.00, 1.90, 200.00, 'Testando campanhas de perfumes importados masculinos.'),
('a4444444-4444-4444-4444-444444444444', 'Dell Computadores', 'dell-computadores', 'Tecnologia', 'CJ Affiliate', 'Dell Inspiron/Alienware', false, true, false, 'paused', 300.00, 9000.00, 120.00, 4.20, 120.00, 'Pausado temporariamente devido à alteração de comissão na rede.'),
('a5555555-5555-5555-5555-555555555555', 'Amazon Brasil', 'amazon-brasil', 'Geral & Eletrônicos', 'Amazon Associates', 'Associados BR', false, true, false, 'active', 1200.00, 36000.00, 25.00, 1.50, 160.00, 'Campanhas em livros, kindles e eletrônicos inteligentes.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.offers (id, store_id, name, description, landing_page_url, affiliate_link, status, payout_type, payout_value)
VALUES
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Tênis Air Zoom Pegasus', 'Linha de performance corrida 2026', 'https://nike.com.br/air-zoom', 'https://awin1.com/cread.php?s=nike1', 'active', 'percentage', 8.5),
('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Placa de Vídeo RTX 4070', 'Oferta promocional semanal de hardware', 'https://kabum.com.br/rtx4070', 'https://lomadee.com/c/kabum1', 'active', 'percentage', 4.0),
('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Perfume Sauvage Dior', 'Desconto especial de primeira compra', 'https://sephora.com.br/sauvage', 'https://rakuten.com/c/sephora1', 'testing', 'percentage', 10.0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.campaigns (id, store_id, offer_id, name, traffic_source, external_campaign_id, ad_group, search_term, status)
VALUES
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'GS_BR_Nike_Pegasus_Search', 'google_ads', '1982738491', 'Tenis Corrida Top', 'comprar tenis corrida amortecimento', 'active'),
('c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'GS_BR_Kabum_Hardware_Gamer', 'google_ads', '1982738492', 'RTX Serie 40', 'placa de video rtx 4070 menor preco', 'active'),
('c3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'GS_BR_Sephora_Perfumes_Luxo', 'google_ads', '1982738493', 'Dior Masculino', 'perfume sauvage dior original preco', 'testing')
ON CONFLICT (id) DO NOTHING;

-- Ad Spends demo (7 dias)
INSERT INTO public.ad_spend (campaign_id, store_id, date, clicks, impressions, cost, conversions, conversion_value, source)
SELECT
  (SELECT id FROM public.campaigns WHERE name LIKE '%Nike_Pegasus%' LIMIT 1),
  (SELECT id FROM public.stores WHERE slug = 'nike-brasil' LIMIT 1),
  d::date,
  floor(random() * 150 + 50)::int,
  floor(random() * 8000 + 3000)::int,
  round((random() * 120 + 40)::numeric, 2),
  round((random() * 6 + 1)::numeric, 2),
  round((random() * 1200 + 400)::numeric, 2),
  'manual'
FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') AS d
WHERE NOT EXISTS (
  SELECT 1 FROM public.ad_spend
  WHERE campaign_id = (SELECT id FROM public.campaigns WHERE name LIKE '%Nike_Pegasus%' LIMIT 1)
    AND date = d::date
);

INSERT INTO public.ad_spend (campaign_id, store_id, date, clicks, impressions, cost, conversions, conversion_value, source)
SELECT
  (SELECT id FROM public.campaigns WHERE name LIKE '%Kabum_Hardware%' LIMIT 1),
  (SELECT id FROM public.stores WHERE slug = 'kabum' LIMIT 1),
  d::date,
  floor(random() * 200 + 80)::int,
  floor(random() * 12000 + 5000)::int,
  round((random() * 180 + 70)::numeric, 2),
  round((random() * 9 + 2)::numeric, 2),
  round((random() * 2000 + 700)::numeric, 2),
  'manual'
FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') AS d
WHERE NOT EXISTS (
  SELECT 1 FROM public.ad_spend
  WHERE campaign_id = (SELECT id FROM public.campaigns WHERE name LIKE '%Kabum_Hardware%' LIMIT 1)
    AND date = d::date
);

-- Vendas demo (7 dias) — click_id SEMPRE preenchido (não viola CHECK)
INSERT INTO public.sales (store_id, offer_id, campaign_id, affiliate_network, order_id, date, sale_value, commission, status, origin, click_id, tracking_status, notes, source)
SELECT
  (SELECT id FROM public.stores WHERE slug = 'nike-brasil' LIMIT 1),
  (SELECT id FROM public.offers WHERE name = 'Tênis Air Zoom Pegasus' LIMIT 1),
  (SELECT id FROM public.campaigns WHERE name LIKE '%Nike_Pegasus%' LIMIT 1),
  'Awin',
  'NIKE-' || to_char(d::date, 'YYYYMMDD') || '-' || floor(random()*9999)::int,
  d::date,
  round((random() * 900 + 400)::numeric, 2),
  round((random() * 100 + 30)::numeric, 2),
  (CASE WHEN random() < 0.7 THEN 'approved' ELSE 'pending' END)::text,
  'google_ads',
  md5(random()::text || clock_timestamp()::text),
  'attributed',
  'Venda conciliada — Awin',
  'manual'
FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') AS d,
     generate_series(1, 3 + floor(random()*3)::int)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sales
  WHERE store_id = (SELECT id FROM public.stores WHERE slug = 'nike-brasil' LIMIT 1)
    AND date = d::date
);

INSERT INTO public.sales (store_id, offer_id, campaign_id, affiliate_network, order_id, date, sale_value, commission, status, origin, click_id, tracking_status, notes, source)
SELECT
  (SELECT id FROM public.stores WHERE slug = 'kabum' LIMIT 1),
  (SELECT id FROM public.offers WHERE name = 'Placa de Vídeo RTX 4070' LIMIT 1),
  (SELECT id FROM public.campaigns WHERE name LIKE '%Kabum_Hardware%' LIMIT 1),
  'Lomadee',
  'KBUM-' || to_char(d::date, 'YYYYMMDD') || '-' || floor(random()*9999)::int,
  d::date,
  round((random() * 3000 + 2000)::numeric, 2),
  round((random() * 180 + 60)::numeric, 2),
  (CASE WHEN random() < 0.6 THEN 'approved' ELSE 'pending' END)::text,
  'google_ads',
  md5(random()::text || clock_timestamp()::text),
  'attributed',
  'Comissão Lomadee — 48h',
  'manual'
FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') AS d,
     generate_series(1, 2 + floor(random()*4)::int)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sales
  WHERE store_id = (SELECT id FROM public.stores WHERE slug = 'kabum' LIMIT 1)
    AND date = d::date
);

INSERT INTO public.sales (store_id, offer_id, campaign_id, affiliate_network, order_id, date, sale_value, commission, status, origin, click_id, tracking_status, notes, source)
SELECT
  (SELECT id FROM public.stores WHERE slug = 'sephora-brasil' LIMIT 1),
  (SELECT id FROM public.offers WHERE name = 'Perfume Sauvage Dior' LIMIT 1),
  (SELECT id FROM public.campaigns WHERE name LIKE '%Sephora_Perfumes%' LIMIT 1),
  'Rakuten',
  'SPH-' || to_char(d::date, 'YYYYMMDD') || '-' || floor(random()*9999)::int,
  d::date,
  round((random() * 800 + 450)::numeric, 2),
  round((random() * 120 + 40)::numeric, 2),
  (CASE WHEN random() < 0.5 THEN 'approved' ELSE 'pending' END)::text,
  'google_ads',
  md5(random()::text || clock_timestamp()::text),
  'attributed',
  'Rakuten — período testing',
  'manual'
FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') AS d,
     generate_series(1, 2 + floor(random()*2)::int)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sales
  WHERE store_id = (SELECT id FROM public.stores WHERE slug = 'sephora-brasil' LIMIT 1)
    AND date = d::date
);

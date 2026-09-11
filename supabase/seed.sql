-- ==============================================================================
-- SEED DATA: NEURAUTOMATION ADMIN DASHBOARD
-- ==============================================================================
--
-- Depois de criar o usuário no Authentication → Users, conceda o papel admin:
--
--   INSERT INTO public.user_roles (user_id, role)
--   SELECT id, 'admin' FROM auth.users WHERE email = 'SEU_EMAIL_AQUI'
--   ON CONFLICT (user_id, role) DO NOTHING;
--

-- 1. Exemplo de Lojas (com dados realistas)
INSERT INTO public.stores (id, name, slug, category, affiliate_network, affiliate_program, brand_bidding_allowed, google_ads_allowed, dsa_allowed, status, daily_budget, monthly_budget, target_cpa, max_cpc, target_roi, notes)
VALUES
('a1111111-1111-1111-1111-111111111111', 'Nike Brasil', 'nike-brasil', 'Moda & Esportes', 'Awin', 'Nike Oficial', false, true, false, 'active', 500.00, 15000.00, 45.00, 2.80, 180.00, 'Foco em lançamentos de tênis de corrida. Proibido Brand Bidding.'),
('a2222222-2222-2222-2222-222222222222', 'Kabum', 'kabum', 'Informática & Gamer', 'Lomadee', 'Kabum Hardware', false, true, true, 'active', 800.00, 24000.00, 60.00, 3.50, 150.00, 'Alta conversão em periféricos e placas de vídeo.'),
('a3333333-3333-3333-3333-333333333333', 'Sephora Brasil', 'sephora-brasil', 'Beleza & Perfumaria', 'Rakuten', 'Sephora Beauty Club', true, true, false, 'testing', 250.00, 7500.00, 35.00, 1.90, 200.00, 'Testando campanhas de perfumes importados masculinos.'),
('a4444444-4444-4444-4444-444444444444', 'Dell Computadores', 'dell-computadores', 'Tecnologia', 'CJ Affiliate', 'Dell Inspiron/Alienware', false, true, false, 'paused', 300.00, 9000.00, 120.00, 4.20, 120.00, 'Pausado temporariamente devido à alteração de comissão na rede.'),
('a5555555-5555-5555-5555-555555555555', 'Amazon Brasil', 'amazon-brasil', 'Geral & Eletrônicos', 'Amazon Associates', 'Associados BR', false, true, false, 'active', 1200.00, 36000.00, 25.00, 1.50, 160.00, 'Campanhas em livros, kindles e eletrônicos inteligentes.')
ON CONFLICT (id) DO NOTHING;

-- 2. Ofertas de Teste
INSERT INTO public.offers (id, store_id, name, description, landing_page_url, affiliate_link, status, payout_type, payout_value)
VALUES
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Tênis Air Zoom Pegasus', 'Linha de performance corrida 2026', 'https://nike.com.br/air-zoom', 'https://awin1.com/cread.php?s=nike1', 'active', 'percentage', 8.5),
('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Placa de Vídeo RTX 4070', 'Oferta promocional semanal de hardware', 'https://kabum.com.br/rtx4070', 'https://lomadee.com/c/kabum1', 'active', 'percentage', 4.0),
('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Perfume Sauvage Dior', 'Desconto especial de primeira compra', 'https://sephora.com.br/sauvage', 'https://rakuten.com/c/sephora1', 'testing', 'percentage', 10.0)
ON CONFLICT (id) DO NOTHING;

-- 3. Campanhas
INSERT INTO public.campaigns (id, store_id, offer_id, name, traffic_source, external_campaign_id, ad_group, search_term, status)
VALUES
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'GS_BR_Nike_Pegasus_Search', 'google_ads', '1982738491', 'Tenis Corrida Top', 'comprar tenis corrida amortecimento', 'active'),
('c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'GS_BR_Kabum_Hardware_Gamer', 'google_ads', '1982738492', 'RTX Serie 40', 'placa de video rtx 4070 menor preco', 'active'),
('c3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'GS_BR_Sephora_Perfumes_Luxo', 'google_ads', '1982738493', 'Dior Masculino', 'perfume sauvage dior original preco', 'testing')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 4. AD SPEND DEMO (7 dias)
-- ==============================================================================
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

-- ==============================================================================
-- 5. VENDAS DEMO (7 dias) — CORRIGIDO: click_id SEMPRE preenchido
--   (tracking_status='attributed' EXIGE click_id NOT NULL)
-- ==============================================================================
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

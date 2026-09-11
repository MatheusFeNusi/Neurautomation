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

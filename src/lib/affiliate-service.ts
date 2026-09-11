import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Store, Offer, Campaign, AdSpend, Sale } from '@/types/affiliate';

// Dados em memória para funcionamento imediato mesmo se o Supabase não estiver com migração rodada
let MOCK_STORES: Store[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Nike Brasil',
    slug: 'nike-brasil',
    category: 'Moda & Esportes',
    affiliate_network: 'Awin',
    affiliate_program: 'Nike Oficial BR',
    brand_bidding_allowed: false,
    google_ads_allowed: true,
    dsa_allowed: false,
    status: 'active',
    daily_budget: 500,
    monthly_budget: 15000,
    target_cpa: 45,
    max_cpc: 2.8,
    target_roi: 180,
    notes: 'Campanha de performance tênis de corrida. Proibido Brand Bidding.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Kabum Hardware',
    slug: 'kabum-hardware',
    category: 'Informática & Gamer',
    affiliate_network: 'Lomadee',
    affiliate_program: 'Kabum Hardware Top',
    brand_bidding_allowed: false,
    google_ads_allowed: true,
    dsa_allowed: true,
    status: 'active',
    daily_budget: 800,
    monthly_budget: 24000,
    target_cpa: 60,
    max_cpc: 3.5,
    target_roi: 150,
    notes: 'Excelente conversão em periféricos e placas de vídeo.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    name: 'Sephora Brasil',
    slug: 'sephora-brasil',
    category: 'Beleza & Perfumaria',
    affiliate_network: 'Rakuten',
    affiliate_program: 'Sephora Beauty Club',
    brand_bidding_allowed: true,
    google_ads_allowed: true,
    dsa_allowed: false,
    status: 'testing',
    daily_budget: 250,
    monthly_budget: 7500,
    target_cpa: 35,
    max_cpc: 1.9,
    target_roi: 200,
    notes: 'Testando nichos de perfumes importados masculinos.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    name: 'Dell Computadores',
    slug: 'dell-computadores',
    category: 'Tecnologia',
    affiliate_network: 'CJ Affiliate',
    affiliate_program: 'Dell Inspiron/Alienware',
    brand_bidding_allowed: false,
    google_ads_allowed: true,
    dsa_allowed: false,
    status: 'paused',
    daily_budget: 300,
    monthly_budget: 9000,
    target_cpa: 120,
    max_cpc: 4.2,
    target_roi: 120,
    notes: 'Pausada temporariamente para revisão de termos de comissão.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    name: 'Amazon Brasil',
    slug: 'amazon-brasil',
    category: 'Eletrônicos & Casa',
    affiliate_network: 'Amazon Associates',
    affiliate_program: 'Associados BR',
    brand_bidding_allowed: false,
    google_ads_allowed: true,
    dsa_allowed: false,
    status: 'active',
    daily_budget: 1200,
    monthly_budget: 36000,
    target_cpa: 25,
    max_cpc: 1.5,
    target_roi: 160,
    notes: 'Campanhas em livros, kindles e eletrônicos inteligentes.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let MOCK_OFFERS: Offer[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    store_id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Tênis Air Zoom Pegasus 41',
    description: 'Linha de performance corrida lançamento',
    landing_page_url: 'https://nike.com.br/air-zoom',
    affiliate_link: 'https://awin1.com/cread.php?s=nike1',
    status: 'active',
    payout_type: 'percentage',
    payout_value: 8.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    store_id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Placa de Vídeo RTX 4070 Super',
    description: 'Hardware gamer de alta performance',
    landing_page_url: 'https://kabum.com.br/rtx4070',
    affiliate_link: 'https://lomadee.com/c/kabum1',
    status: 'active',
    payout_type: 'percentage',
    payout_value: 4.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    store_id: 'a3333333-3333-3333-3333-333333333333',
    name: 'Perfume Sauvage Dior 100ml',
    description: 'Fragrância importada masculina',
    landing_page_url: 'https://sephora.com.br/sauvage',
    affiliate_link: 'https://rakuten.com/c/sephora1',
    status: 'testing',
    payout_type: 'percentage',
    payout_value: 10.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    store_id: 'a1111111-1111-1111-1111-111111111111',
    offer_id: 'b1111111-1111-1111-1111-111111111111',
    name: 'GS_BR_Nike_Pegasus_Search',
    traffic_source: 'google_ads',
    external_campaign_id: '1982738491',
    ad_group: 'Tenis Corrida Top',
    search_term: 'comprar tenis corrida amortecimento',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    store_id: 'a2222222-2222-2222-2222-222222222222',
    offer_id: 'b2222222-2222-2222-2222-222222222222',
    name: 'GS_BR_Kabum_Hardware_Gamer',
    traffic_source: 'google_ads',
    external_campaign_id: '1982738492',
    ad_group: 'RTX Serie 40',
    search_term: 'placa de video rtx 4070 menor preco',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    store_id: 'a3333333-3333-3333-3333-333333333333',
    offer_id: 'b3333333-3333-3333-3333-333333333333',
    name: 'GS_BR_Sephora_Perfumes_Luxo',
    traffic_source: 'google_ads',
    external_campaign_id: '1982738493',
    ad_group: 'Dior Masculino',
    search_term: 'perfume sauvage dior original preco',
    status: 'testing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let MOCK_AD_SPEND: AdSpend[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    campaign_id: 'c1111111-1111-1111-1111-111111111111',
    store_id: 'a1111111-1111-1111-1111-111111111111',
    date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    clicks: 145,
    impressions: 2900,
    cost: 320.0,
    conversions: 8,
    conversion_value: 3800.0,
    source: 'manual',
    source_id: null,
    imported_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    campaign_id: 'c1111111-1111-1111-1111-111111111111',
    store_id: 'a1111111-1111-1111-1111-111111111111',
    date: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    clicks: 180,
    impressions: 3400,
    cost: 410.0,
    conversions: 11,
    conversion_value: 5200.0,
    source: 'manual',
    source_id: null,
    imported_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    campaign_id: 'c2222222-2222-2222-2222-222222222222',
    store_id: 'a2222222-2222-2222-2222-222222222222',
    date: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    clicks: 210,
    impressions: 4800,
    cost: 620.0,
    conversions: 6,
    conversion_value: 18600.0,
    source: 'manual',
    source_id: null,
    imported_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    campaign_id: 'c3333333-3333-3333-3333-333333333333',
    store_id: 'a3333333-3333-3333-3333-333333333333',
    date: new Date().toISOString().slice(0, 10),
    clicks: 85,
    impressions: 1600,
    cost: 160.0,
    conversions: 3,
    conversion_value: 1950.0,
    source: 'manual',
    source_id: null,
    imported_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let MOCK_SALES: Sale[] = [
  {
    id: 's1111111-1111-1111-1111-111111111111',
    store_id: 'a1111111-1111-1111-1111-111111111111',
    offer_id: 'b1111111-1111-1111-1111-111111111111',
    campaign_id: 'c1111111-1111-1111-1111-111111111111',
    affiliate_network: 'Awin',
    order_id: 'AWN-892182',
    date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    sale_value: 799.9,
    commission: 67.99,
    currency: 'BRL',
    status: 'approved',
    origin: 'google_ads',
    click_id: 'gclid_test_981726315',
    tracking_status: 'attributed',
    notes: 'Venda de 1 par tênis Nike Pegasus 41',
    source: 'manual',
    source_id: null,
    imported_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's2222222-2222-2222-2222-222222222222',
    store_id: 'a1111111-1111-1111-1111-111111111111',
    offer_id: 'b1111111-1111-1111-1111-111111111111',
    campaign_id: 'c1111111-1111-1111-1111-111111111111',
    affiliate_network: 'Awin',
    order_id: 'AWN-892440',
    date: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    sale_value: 1250.0,
    commission: 106.25,
    currency: 'BRL',
    status: 'approved',
    origin: 'manual',
    click_id: null,
    tracking_status: 'manual',
    notes: 'Lançamento manual a partir do extrato mensal Awin',
    source: 'manual',
    source_id: null,
    imported_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's3333333-3333-3333-3333-333333333333',
    store_id: 'a2222222-2222-2222-2222-222222222222',
    offer_id: 'b2222222-2222-2222-2222-222222222222',
    campaign_id: 'c2222222-2222-2222-2222-222222222222',
    affiliate_network: 'Lomadee',
    order_id: 'LOM-449102',
    date: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    sale_value: 3899.0,
    commission: 155.96,
    currency: 'BRL',
    status: 'approved',
    origin: 'direct',
    click_id: null,
    tracking_status: 'manual',
    notes: 'Venda direta identificada no relatório Lomadee',
    source: 'manual',
    source_id: null,
    imported_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's4444444-4444-4444-4444-444444444444',
    store_id: 'a3333333-3333-3333-3333-333333333333',
    offer_id: 'b3333333-3333-3333-3333-333333333333',
    campaign_id: 'c3333333-3333-3333-3333-333333333333',
    affiliate_network: 'Rakuten',
    order_id: 'RAK-901822',
    date: new Date().toISOString().slice(0, 10),
    sale_value: 650.0,
    commission: 65.0,
    currency: 'BRL',
    status: 'approved',
    origin: 'google_ads',
    click_id: 'gclid_rakuten_4481920',
    tracking_status: 'attributed',
    notes: 'Perfume Dior Sauvage com click_id confirmado',
    source: 'manual',
    source_id: null,
    imported_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// -----------------------------------------------------------------------------
// FUNÇÕES DO SERVICE (CONSULTA HÍBRIDA: SUPABASE COM FALLBACK TRANSPARENTE)
// -----------------------------------------------------------------------------

export async function getStores(): Promise<Store[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Store[];
      }
    } catch {
      // Fallback
    }
  }
  return MOCK_STORES;
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const stores = await getStores();
  return stores.find((s) => s.slug === slug || s.id === slug) || null;
}

export async function createStore(storeData: Omit<Store, 'id' | 'created_at' | 'updated_at'>): Promise<Store> {
  const newStore: Store = {
    ...storeData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `st-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('stores')
        .insert([newStore])
        .select('*')
        .single();
      if (!error && data) return data as Store;
    } catch {
      // Continua para fallback
    }
  }

  MOCK_STORES = [newStore, ...MOCK_STORES];
  return newStore;
}

export async function getOffers(storeId?: string): Promise<Offer[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      let query = supabase.from('offers').select('*, store:stores(*)');
      if (storeId) query = query.eq('store_id', storeId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Offer[];
    } catch {
      // Fallback
    }
  }
  return storeId ? MOCK_OFFERS.filter((o) => o.store_id === storeId) : MOCK_OFFERS;
}

export async function createOffer(offerData: Omit<Offer, 'id' | 'created_at' | 'updated_at'>): Promise<Offer> {
  const newOffer: Offer = {
    ...offerData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `of-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('offers').insert([newOffer]).select('*').single();
      if (!error && data) return data as Offer;
    } catch {}
  }

  MOCK_OFFERS = [newOffer, ...MOCK_OFFERS];
  return newOffer;
}

export async function getCampaigns(storeId?: string): Promise<Campaign[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      let query = supabase.from('campaigns').select('*, store:stores(*), offer:offers(*)');
      if (storeId) query = query.eq('store_id', storeId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Campaign[];
    } catch {}
  }
  return storeId ? MOCK_CAMPAIGNS.filter((c) => c.store_id === storeId) : MOCK_CAMPAIGNS;
}

export async function createCampaign(campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign> {
  const newCampaign: Campaign = {
    ...campaignData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cp-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('campaigns').insert([newCampaign]).select('*').single();
      if (!error && data) return data as Campaign;
    } catch {}
  }

  MOCK_CAMPAIGNS = [newCampaign, ...MOCK_CAMPAIGNS];
  return newCampaign;
}

export async function getAdSpends(storeId?: string): Promise<AdSpend[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      let query = supabase.from('ad_spend').select('*, campaign:campaigns(*), store:stores(*)');
      if (storeId) query = query.eq('store_id', storeId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as AdSpend[];
    } catch {}
  }
  return storeId ? MOCK_AD_SPEND.filter((a) => a.store_id === storeId) : MOCK_AD_SPEND;
}

export async function createAdSpend(adSpendData: Omit<AdSpend, 'id' | 'created_at' | 'updated_at'>): Promise<AdSpend> {
  const newAdSpend: AdSpend = {
    ...adSpendData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `as-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('ad_spend').insert([newAdSpend]).select('*').single();
      if (!error && data) return data as AdSpend;
    } catch {}
  }

  MOCK_AD_SPEND = [newAdSpend, ...MOCK_AD_SPEND];
  return newAdSpend;
}

export async function getSales(storeId?: string): Promise<Sale[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      let query = supabase.from('sales').select('*, store:stores(*), offer:offers(*), campaign:campaigns(*)');
      if (storeId) query = query.eq('store_id', storeId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Sale[];
    } catch {}
  }
  return storeId ? MOCK_SALES.filter((s) => s.store_id === storeId) : MOCK_SALES;
}

export async function createSale(saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>): Promise<Sale> {
  // Regra crítica do produto: Se não tiver click_id, tracking_status NÃO PODE ser 'attributed'
  let safeTracking = saleData.tracking_status;
  if (!saleData.click_id && safeTracking === 'attributed') {
    safeTracking = 'manual';
  }

  const newSale: Sale = {
    ...saleData,
    tracking_status: safeTracking,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sl-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('sales').insert([newSale]).select('*').single();
      if (!error && data) return data as Sale;
    } catch {}
  }

  MOCK_SALES = [newSale, ...MOCK_SALES];
  return newSale;
}

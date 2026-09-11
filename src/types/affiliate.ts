export type StoreStatus = 'active' | 'testing' | 'paused' | 'archived';
export type OfferStatus = 'active' | 'testing' | 'paused' | 'expired';
export type CampaignStatus = 'active' | 'testing' | 'paused' | 'archived';
export type SaleStatus = 'pending' | 'approved' | 'rejected' | 'refunded';
export type SaleOrigin = 'google_ads' | 'organic' | 'direct' | 'social' | 'email' | 'unknown' | 'manual';
export type TrackingStatus = 'attributed' | 'unattributed' | 'manual' | 'imported' | 'confirmed';
export type ImportSource = 'manual' | 'google_ads_api' | 'csv' | 'webhook' | 'postback' | 'similarweb';

export interface Store {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  affiliate_network: string;
  affiliate_program: string | null;
  brand_bidding_allowed: boolean;
  google_ads_allowed: boolean;
  dsa_allowed: boolean;
  status: StoreStatus;
  daily_budget: number;
  monthly_budget: number;
  target_cpa: number;
  max_cpc: number;
  target_roi: number; // Ex: 150 = 150%
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  landing_page_url: string | null;
  affiliate_link: string | null;
  status: OfferStatus;
  payout_type: 'percentage' | 'fixed';
  payout_value: number;
  created_at: string;
  updated_at: string;
  // Join opcional
  store?: Store;
}

export interface Campaign {
  id: string;
  store_id: string;
  offer_id: string | null;
  name: string;
  traffic_source: string;
  external_campaign_id: string | null;
  ad_group: string | null;
  search_term: string | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
  // Joins opcionais
  store?: Store;
  offer?: Offer;
}

export interface AdSpend {
  id: string;
  campaign_id: string;
  store_id: string;
  date: string; // YYYY-MM-DD
  clicks: number;
  impressions: number;
  cost: number;
  conversions: number;
  conversion_value: number;
  source: ImportSource;
  source_id: string | null;
  imported_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins opcionais
  campaign?: Campaign;
  store?: Store;
}

export interface Sale {
  id: string;
  store_id: string;
  offer_id: string | null;
  campaign_id: string | null;
  affiliate_network: string;
  order_id: string | null;
  date: string; // YYYY-MM-DD
  sale_value: number;
  commission: number;
  currency: string;
  status: SaleStatus;
  origin: SaleOrigin;
  click_id: string | null;
  tracking_status: TrackingStatus;
  notes: string | null;
  source: ImportSource;
  source_id: string | null;
  imported_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins opcionais
  store?: Store;
  offer?: Offer;
  campaign?: Campaign;
}

export interface CalculatedMetrics {
  clicks: number;
  impressions: number;
  ad_spend: number;
  sales_count: number;
  total_sales_value: number;
  total_commission: number;
  profit: number; // commission - ad_spend
  roi: number; // ((commission - ad_spend) / ad_spend) * 100
  roas: number; // commission / ad_spend (ou sale_value / ad_spend)
  cpa: number; // ad_spend / sales_count
  cpc: number; // ad_spend / clicks
  ctr: number; // (clicks / impressions) * 100
  epc: number; // commission / clicks (Earnings Per Click)
  conversion_rate: number; // (sales_count / clicks) * 100
}

export interface StoreBudgetAlert {
  id: string;
  store_id: string;
  store_name: string;
  type: 'budget_limit' | 'negative_profit' | 'high_cpa' | 'high_cpc' | 'positive_performance';
  title: string;
  message: string;
  severity: 'warning' | 'destructive' | 'info' | 'success';
}

export type DatePeriod = 'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'last_month' | 'custom';

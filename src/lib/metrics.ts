import { AdSpend, Sale, CalculatedMetrics, Store, StoreBudgetAlert } from '@/types/affiliate';

/**
 * Calcula métricas agregadas a partir de registros de gastos e vendas
 */
export function calculateMetrics(adSpends: AdSpend[], sales: Sale[]): CalculatedMetrics {
  const clicks = adSpends.reduce((acc, curr) => acc + (Number(curr.clicks) || 0), 0);
  const impressions = adSpends.reduce((acc, curr) => acc + (Number(curr.impressions) || 0), 0);
  const ad_spend = adSpends.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);

  // Consideramos vendas aprovadas para o cálculo financeiro principal
  const validSales = sales.filter((s) => s.status === 'approved');
  const sales_count = validSales.length;
  const total_sales_value = validSales.reduce((acc, curr) => acc + (Number(curr.sale_value) || 0), 0);
  const total_commission = validSales.reduce((acc, curr) => acc + (Number(curr.commission) || 0), 0);

  const profit = total_commission - ad_spend;
  const roi = ad_spend > 0 ? ((total_commission - ad_spend) / ad_spend) * 100 : total_commission > 0 ? 100 : 0;
  const roas = ad_spend > 0 ? total_commission / ad_spend : 0;
  const cpa = sales_count > 0 ? ad_spend / sales_count : 0;
  const cpc = clicks > 0 ? ad_spend / clicks : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const epc = clicks > 0 ? total_commission / clicks : 0;
  const conversion_rate = clicks > 0 ? (sales_count / clicks) * 100 : 0;

  return {
    clicks,
    impressions,
    ad_spend,
    sales_count,
    total_sales_value,
    total_commission,
    profit,
    roi,
    roas,
    cpa,
    cpc,
    ctr,
    epc,
    conversion_rate,
  };
}

/**
 * Gera alertas informativos de orçamento e performance para uma loja
 */
export function evaluateStoreAlerts(store: Store, metrics: CalculatedMetrics): StoreBudgetAlert[] {
  const alerts: StoreBudgetAlert[] = [];

  // 1. Alerta de Prejuízo (Lucro Negativo)
  if (metrics.profit < 0 && metrics.ad_spend > 0) {
    alerts.push({
      id: `${store.id}-loss`,
      store_id: store.id,
      store_name: store.name,
      type: 'negative_profit',
      title: 'Operando em Prejuízo',
      message: `A loja acumula R$ ${Math.abs(metrics.profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de prejuízo no período selecionado.`,
      severity: 'destructive',
    });
  }

  // 2. Alerta de Orçamento Diário ou Mensal próximo do limite
  if (store.daily_budget > 0 && metrics.ad_spend >= store.daily_budget * 0.85) {
    alerts.push({
      id: `${store.id}-budget`,
      store_id: store.id,
      store_name: store.name,
      type: 'budget_limit',
      title: 'Orçamento Quase Esgotado',
      message: `Gasto de R$ ${metrics.ad_spend.toFixed(2)} atingiu ${( (metrics.ad_spend / store.daily_budget) * 100 ).toFixed(0)}% do orçamento diário configurado (R$ ${store.daily_budget.toFixed(2)}).`,
      severity: 'warning',
    });
  }

  // 3. Alerta de CPA Acima da Meta
  if (store.target_cpa > 0 && metrics.sales_count > 0 && metrics.cpa > store.target_cpa) {
    alerts.push({
      id: `${store.id}-cpa`,
      store_id: store.id,
      store_name: store.name,
      type: 'high_cpa',
      title: 'CPA Acima da Meta',
      message: `CPA atual de R$ ${metrics.cpa.toFixed(2)} está acima da meta de R$ ${store.target_cpa.toFixed(2)}.`,
      severity: 'warning',
    });
  }

  // 4. Alerta de CPC Elevado
  if (store.max_cpc > 0 && metrics.clicks > 0 && metrics.cpc > store.max_cpc) {
    alerts.push({
      id: `${store.id}-cpc`,
      store_id: store.id,
      store_name: store.name,
      type: 'high_cpc',
      title: 'CPC Acima do Teto Máximo',
      message: `CPC médio de R$ ${metrics.cpc.toFixed(2)} ultrapassou o teto estipulado de R$ ${store.max_cpc.toFixed(2)}.`,
      severity: 'info',
    });
  }

  // 5. Alerta de Performance Positiva (Escala Recomendada)
  if (store.target_roi > 0 && metrics.roi >= store.target_roi && metrics.sales_count >= 3) {
    alerts.push({
      id: `${store.id}-positive`,
      store_id: store.id,
      store_name: store.name,
      type: 'positive_performance',
      title: 'Performance Positiva',
      message: `ROI de ${metrics.roi.toFixed(1)}% superou a meta (${store.target_roi.toFixed(1)}%) com ${metrics.sales_count} vendas confirmadas.`,
      severity: 'success',
    });
  }

  return alerts;
}

/**
 * Utilitário de formatação de moeda brasileira
 */
export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(value || 0);
}

/**
 * Utilitário de formatação de porcentagem
 */
export function formatPercent(value: number): string {
  return `${(value || 0).toFixed(1)}%`;
}

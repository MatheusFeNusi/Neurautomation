"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  MousePointerClick,
  Tag,
  Megaphone,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Store, Offer, Campaign, AdSpend, Sale } from "@/types/affiliate";
import { calculateMetrics, evaluateStoreAlerts, formatCurrency, formatPercent } from "@/lib/metrics";

interface StoreDetailClientProps {
  store: Store;
  offers: Offer[];
  campaigns: Campaign[];
  adSpends: AdSpend[];
  sales: Sale[];
}

export function StoreDetailClient({
  store,
  offers,
  campaigns,
  adSpends,
  sales,
}: StoreDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "offers" | "campaigns" | "sales">("overview");

  const metrics = useMemo(() => {
    return calculateMetrics(adSpends, sales);
  }, [adSpends, sales]);

  const alerts = useMemo(() => {
    return evaluateStoreAlerts(store, metrics);
  }, [store, metrics]);

  // Gráficos diários específicos desta loja
  const chartData = useMemo(() => {
    const dayMap = new Map<
      string,
      {
        date: string;
        cost: number;
        sales: number;
        commission: number;
        profit: number;
        clicks: number;
      }
    >();

    adSpends.forEach((s) => {
      const existing = dayMap.get(s.date) || {
        date: s.date.slice(5),
        cost: 0,
        sales: 0,
        commission: 0,
        profit: 0,
        clicks: 0,
      };
      existing.cost += Number(s.cost) || 0;
      existing.clicks += Number(s.clicks) || 0;
      dayMap.set(s.date, existing);
    });

    sales.forEach((sl) => {
      if (sl.status === "approved") {
        const existing = dayMap.get(sl.date) || {
          date: sl.date.slice(5),
          cost: 0,
          sales: 0,
          commission: 0,
          profit: 0,
          clicks: 0,
        };
        existing.sales += Number(sl.sale_value) || 0;
        existing.commission += Number(sl.commission) || 0;
        dayMap.set(sl.date, existing);
      }
    });

    const list = Array.from(dayMap.values()).map((d) => ({
      ...d,
      profit: d.commission - d.cost,
    }));

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [adSpends, sales]);

  return (
    <div className="space-y-6">
      {/* Back Navigation & Store Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <Link
            href="/admin/stores"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Lojas Afiliadas</span>
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{store.name}</h1>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                store.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : store.status === "testing"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              {store.status.toUpperCase()}
            </span>
          </div>

          <div className="text-xs text-white/50 mt-1 flex items-center gap-3">
            <span>Rede: <strong className="text-white">{store.affiliate_network}</strong></span>
            {store.affiliate_program && (
              <span>Programa: <strong className="text-white">{store.affiliate_program}</strong></span>
            )}
            <span>Categoria: <strong className="text-white">{store.category || "Geral"}</strong></span>
          </div>
        </div>
      </div>

      {/* Alertas específicos da Loja */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                alert.severity === "destructive"
                  ? "bg-red-500/10 border-red-500/30 text-red-300"
                  : alert.severity === "warning"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : alert.severity === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-300"
              }`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-semibold">{alert.title}: </strong>
                <span>{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Regras e Parâmetros Cadastrais */}
      <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Regras Contratuais & Metas de Campanha
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-lg">
            <span className="text-[10px] text-white/40 block">Brand Bidding</span>
            <div className="mt-1 flex items-center gap-1.5 font-semibold">
              {store.brand_bidding_allowed ? (
                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Permitido</span>
              ) : (
                <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Proibido</span>
              )}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-lg">
            <span className="text-[10px] text-white/40 block">Google Ads</span>
            <div className="mt-1 flex items-center gap-1.5 font-semibold">
              {store.google_ads_allowed ? (
                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Autorizado</span>
              ) : (
                <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Vetado</span>
              )}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-lg">
            <span className="text-[10px] text-white/40 block">DSA (Anúncios Dinâmicos)</span>
            <div className="mt-1 flex items-center gap-1.5 font-semibold">
              {store.dsa_allowed ? (
                <span className="text-teal-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Permitido</span>
              ) : (
                <span className="text-white/40 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Desativado</span>
              )}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-lg">
            <span className="text-[10px] text-white/40 block">Budget Diário</span>
            <div className="mt-1 font-bold text-white">
              {store.daily_budget > 0 ? formatCurrency(store.daily_budget) : "Sem limite"}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-lg">
            <span className="text-[10px] text-white/40 block">Target CPA / Max CPC</span>
            <div className="mt-1 font-mono text-white/90">
              {formatCurrency(store.target_cpa)} / {formatCurrency(store.max_cpc)}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-lg">
            <span className="text-[10px] text-white/40 block">Target ROI</span>
            <div className="mt-1 font-bold text-emerald-400">
              {store.target_roi > 0 ? `${store.target_roi}%` : "Livre"}
            </div>
          </div>
        </div>

        {store.notes && (
          <div className="mt-3 pt-3 border-t border-white/5 text-xs text-white/60">
            <span className="text-white/40 font-semibold">Observações internas: </span>
            {store.notes}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#121216] border border-white/10 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-semibold text-white/40">Gasto Ads</div>
          <div className="text-lg font-bold text-white mt-1">{formatCurrency(metrics.ad_spend)}</div>
          <div className="text-[10px] text-white/40 mt-0.5">{metrics.clicks} cliques</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-semibold text-white/40">Vendas (Volume)</div>
          <div className="text-lg font-bold text-white mt-1">{formatCurrency(metrics.total_sales_value)}</div>
          <div className="text-[10px] text-teal-400 mt-0.5">{metrics.sales_count} aprovadas</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-semibold text-white/40">Comissão</div>
          <div className="text-lg font-bold text-purple-300 mt-1">{formatCurrency(metrics.total_commission)}</div>
          <div className="text-[10px] text-white/40 mt-0.5">Líquida de afiliados</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-semibold text-white/40">Lucro Líquido</div>
          <div
            className={`text-lg font-bold mt-1 ${
              metrics.profit >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatCurrency(metrics.profit)}
          </div>
          <div className="text-[10px] text-white/40 mt-0.5">ROI: {formatPercent(metrics.roi)}</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-semibold text-white/40">CPA / CPC</div>
          <div className="text-lg font-bold text-white mt-1">{formatCurrency(metrics.cpa)}</div>
          <div className="text-[10px] text-white/40 mt-0.5">CPC: {formatCurrency(metrics.cpc)}</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-semibold text-white/40">EPC / Conv.</div>
          <div className="text-lg font-bold text-white mt-1">{formatCurrency(metrics.epc)}</div>
          <div className="text-[10px] text-white/40 mt-0.5">{formatPercent(metrics.conversion_rate)} conv.</div>
        </div>
      </div>

      {/* Gráfico Individual da Loja */}
      <div className="bg-[#121216] border border-white/10 rounded-xl p-5 space-y-3">
        <div className="text-sm font-bold text-white">Histórico Financeiro da Loja ({store.name})</div>
        {chartData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-white/30 text-xs border border-dashed border-white/10 rounded-lg">
            Nenhum investimento ou venda lançada para esta loja até o momento.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStoreSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorStoreComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} />
                <YAxis stroke="#ffffff40" fontSize={11} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#ffffff20", borderRadius: 8, fontSize: 12 }}
                  formatter={(val: unknown) => [formatCurrency(Number(val) || 0), ""]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="cost" name="Investimento em Ads" stroke="#f59e0b" fillOpacity={1} fill="url(#colorStoreSpend)" />
                <Area type="monotone" dataKey="commission" name="Comissão Recebida" stroke="#a855f7" fillOpacity={1} fill="url(#colorStoreComm)" />
                <Area type="monotone" dataKey="profit" name="Lucro Líquido" stroke="#10b981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tabs: Ofertas, Campanhas, Vendas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "overview" ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "offers" ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Ofertas ({offers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "campaigns" ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Campanhas ({campaigns.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "sales" ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Histórico de Vendas ({sales.length})</span>
          </button>
        </div>

        {/* Ofertas */}
        {activeTab === "offers" && (
          <div className="bg-[#121216] border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-white/50 border-b border-white/10 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Oferta</th>
                  <th className="py-3 px-3">Remuneração</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Landing Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-white/40">Nenhuma oferta vinculada.</td>
                  </tr>
                ) : (
                  offers.map((offer) => (
                    <tr key={offer.id}>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{offer.name}</div>
                        <div className="text-[11px] text-white/40">{offer.description}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-purple-300">
                        {offer.payout_type === "percentage" ? `${offer.payout_value}%` : formatCurrency(offer.payout_value)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                          {offer.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {offer.landing_page_url ? (
                          <a href={offer.landing_page_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-[11px]">
                            Acessar página ↗
                          </a>
                        ) : (
                          <span className="text-white/30">N/D</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Campanhas */}
        {activeTab === "campaigns" && (
          <div className="bg-[#121216] border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-white/50 border-b border-white/10 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Campanha</th>
                  <th className="py-3 px-3">ID Google Ads</th>
                  <th className="py-3 px-3">Grupo de Anúncios</th>
                  <th className="py-3 px-3">Termo Principal</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/40">Nenhuma campanha vinculada.</td>
                  </tr>
                ) : (
                  campaigns.map((camp) => (
                    <tr key={camp.id}>
                      <td className="py-3 px-4 font-semibold text-white">{camp.name}</td>
                      <td className="py-3 px-3 font-mono text-white/60">{camp.external_campaign_id || "Aguardando API"}</td>
                      <td className="py-3 px-3 text-white/70">{camp.ad_group || "Padrão"}</td>
                      <td className="py-3 px-3 text-white/50 italic">{camp.search_term || "—"}</td>
                      <td className="py-3 px-3">
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px]">
                          {camp.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Vendas */}
        {(activeTab === "sales" || activeTab === "overview") && (
          <div className="bg-[#121216] border border-white/10 rounded-xl overflow-hidden">
            <div className="p-3.5 border-b border-white/10 text-xs font-bold text-white flex items-center justify-between">
              <span>Últimas Vendas Registradas ({sales.length})</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-white/50 border-b border-white/10 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Data / ID</th>
                  <th className="py-3 px-3">Valor Pedido</th>
                  <th className="py-3 px-3">Comissão</th>
                  <th className="py-3 px-3">Origem</th>
                  <th className="py-3 px-3">Atribuição</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/40">Nenhuma venda cadastrada para esta loja.</td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{sale.date}</div>
                        <div className="text-[10px] text-white/40 font-mono">{sale.order_id || "Sem ID"}</div>
                      </td>
                      <td className="py-3 px-3 text-white font-medium">{formatCurrency(sale.sale_value)}</td>
                      <td className="py-3 px-3 font-semibold text-purple-300">{formatCurrency(sale.commission)}</td>
                      <td className="py-3 px-3">
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/80">
                          {sale.origin}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                            sale.tracking_status === "attributed"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {sale.tracking_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-400 font-medium text-[11px]">{sale.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

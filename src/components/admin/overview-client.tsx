"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  MousePointerClick,
  Store as StoreIcon,
  Tag,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Trophy,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Store, Offer, Campaign, AdSpend, Sale, DatePeriod } from "@/types/affiliate";
import { calculateMetrics, evaluateStoreAlerts, formatCurrency, formatPercent } from "@/lib/metrics";

interface OverviewClientProps {
  initialStores: Store[];
  initialOffers: Offer[];
  initialCampaigns: Campaign[];
  initialAdSpends: AdSpend[];
  initialSales: Sale[];
}

export function OverviewClient({
  initialStores,
  initialOffers,
  initialCampaigns,
  initialAdSpends,
  initialSales,
}: OverviewClientProps) {
  const [period, setPeriod] = useState<DatePeriod>("7d");
  const [activeTab, setActiveTab] = useState<"finance" | "traffic">("finance");

  // Filtro de data
  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date();

    if (period === "today") {
      cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "yesterday") {
      cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (period === "7d") {
      cutoffDate = new Date(now.getTime() - 7 * 86400000);
    } else if (period === "30d") {
      cutoffDate = new Date(now.getTime() - 30 * 86400000);
    } else if (period === "this_month") {
      cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "last_month") {
      cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    const cutoffStr = cutoffDate.toISOString().slice(0, 10);

    const spends = initialAdSpends.filter((s) => s.date >= cutoffStr);
    const sales = initialSales.filter((s) => s.date >= cutoffStr);

    return { spends, sales };
  }, [period, initialAdSpends, initialSales]);

  const metrics = useMemo(() => {
    return calculateMetrics(filteredData.spends, filteredData.sales);
  }, [filteredData]);

  // Contadores de Lojas
  const activeStoresCount = initialStores.filter((s) => s.status === "active").length;
  const testingStoresCount = initialStores.filter((s) => s.status === "testing").length;

  // Alertas de todas as lojas
  const allAlerts = useMemo(() => {
    return initialStores.flatMap((store) => {
      const storeSpends = filteredData.spends.filter((s) => s.store_id === store.id);
      const storeSales = filteredData.sales.filter((s) => s.store_id === store.id);
      const storeMetrics = calculateMetrics(storeSpends, storeSales);
      return evaluateStoreAlerts(store, storeMetrics);
    });
  }, [initialStores, filteredData]);

  // Dados diários para os gráficos
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
        conversions: number;
      }
    >();

    // Inicializa últimos 7 ou 14 dias se não houver dados
    filteredData.spends.forEach((s) => {
      const existing = dayMap.get(s.date) || {
        date: s.date.slice(5), // MM-DD
        cost: 0,
        sales: 0,
        commission: 0,
        profit: 0,
        clicks: 0,
        conversions: 0,
      };
      existing.cost += Number(s.cost) || 0;
      existing.clicks += Number(s.clicks) || 0;
      dayMap.set(s.date, existing);
    });

    filteredData.sales.forEach((sl) => {
      if (sl.status === "approved") {
        const existing = dayMap.get(sl.date) || {
          date: sl.date.slice(5),
          cost: 0,
          sales: 0,
          commission: 0,
          profit: 0,
          clicks: 0,
          conversions: 0,
        };
        existing.sales += Number(sl.sale_value) || 0;
        existing.commission += Number(sl.commission) || 0;
        existing.conversions += 1;
        dayMap.set(sl.date, existing);
      }
    });

    const list = Array.from(dayMap.values()).map((d) => ({
      ...d,
      profit: d.commission - d.cost,
    }));

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Store Ranking for overview table
  const storeRankingRows = useMemo(() =>
    initialStores
      .map((store) => {
        const sp = filteredData.spends.filter((s) => s.store_id === store.id);
        const sl = filteredData.sales.filter((s) => s.store_id === store.id);
        const m = calculateMetrics(sp, sl);
        return { store, metrics: m };
      })
      .sort((a, b) => b.metrics.profit - a.metrics.profit),
    [initialStores, filteredData]
  );

  return (
    <div className="space-y-6">
      {/* Top Bar: Title & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Central de Operações</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 font-medium px-2 py-0.5 rounded-full border border-purple-500/30">
              Live Metrics
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Visão consolidada de investimento, comissões e rentabilidade para até 300 lojas
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start">
          {[
            { id: "today", label: "Hoje" },
            { id: "yesterday", label: "Ontem" },
            { id: "7d", label: "7 Dias" },
            { id: "30d", label: "30 Dias" },
            { id: "this_month", label: "Este Mês" },
            { id: "last_month", label: "Mês Anterior" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as DatePeriod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === item.id
                  ? "bg-purple-600 text-white shadow"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alertas Informativos Ativos */}
      {allAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Alertas Operacionais ({allAlerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  alert.severity === "destructive"
                    ? "bg-red-500/10 border-red-500/20 text-red-300"
                    : alert.severity === "warning"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                    : alert.severity === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-300"
                }`}
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">
                    {alert.store_name} — {alert.title}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">{alert.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gasto */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Investimento em Ads</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">
            {formatCurrency(metrics.ad_spend)}
          </div>
          <div className="text-[11px] text-white/40 mt-1">
            Google Ads & Fontes Diretas
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Total Vendas Faturadas */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Volume de Vendas</span>
            <ShoppingCart className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">
            {formatCurrency(metrics.total_sales_value)}
          </div>
          <div className="text-[11px] text-teal-400 mt-1 flex items-center gap-1">
            <span>{metrics.sales_count} vendas confirmadas</span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Total Comissão Recebida */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Comissão Líquida</span>
            <Flame className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-300 mt-2">
            {formatCurrency(metrics.total_commission)}
          </div>
          <div className="text-[11px] text-white/40 mt-1">
            Média {metrics.sales_count > 0 ? formatCurrency(metrics.total_commission / metrics.sales_count) : "R$ 0"} / venda
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Lucro Líquido Real */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Lucro Líquido Real</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div
            className={`text-xl font-bold mt-2 ${
              metrics.profit >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatCurrency(metrics.profit)}
          </div>
          <div className="text-[11px] mt-1 flex items-center gap-1">
            {metrics.profit >= 0 ? (
              <span className="text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> ROI {formatPercent(metrics.roi)}
              </span>
            ) : (
              <span className="text-red-400 flex items-center">
                <ArrowDownRight className="w-3 h-3" /> Prejuízo
              </span>
            )}
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Secondary Efficiency Metrics (CPA, CPC, EPC, ROAS, Conversão) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
          <div className="text-[10px] uppercase font-semibold text-white/40">ROI Geral</div>
          <div className="text-base font-bold text-white mt-1">{formatPercent(metrics.roi)}</div>
          <div className="text-[10px] text-white/40 mt-0.5">Retorno s/ gasto</div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
          <div className="text-[10px] uppercase font-semibold text-white/40">CPA Médio</div>
          <div className="text-base font-bold text-white mt-1">{formatCurrency(metrics.cpa)}</div>
          <div className="text-[10px] text-white/40 mt-0.5">Custo por aquisição</div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
          <div className="text-[10px] uppercase font-semibold text-white/40">EPC</div>
          <div className="text-base font-bold text-white mt-1">{formatCurrency(metrics.epc)}</div>
          <div className="text-[10px] text-white/40 mt-0.5">Ganho por clique</div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
          <div className="text-[10px] uppercase font-semibold text-white/40">CPC Médio</div>
          <div className="text-base font-bold text-white mt-1">{formatCurrency(metrics.cpc)}</div>
          <div className="text-[10px] text-white/40 mt-0.5">{metrics.clicks} cliques</div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
          <div className="text-[10px] uppercase font-semibold text-white/40">Taxa Conversão</div>
          <div className="text-base font-bold text-white mt-1">{formatPercent(metrics.conversion_rate)}</div>
          <div className="text-[10px] text-white/40 mt-0.5">Cliques p/ venda</div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
          <div className="text-[10px] uppercase font-semibold text-white/40">Lojas Ativas / Teste</div>
          <div className="text-base font-bold text-white mt-1">
            <span className="text-emerald-400">{activeStoresCount}</span>
            <span className="text-white/40 text-xs"> / </span>
            <span className="text-blue-400">{testingStoresCount}</span>
          </div>
          <div className="text-[10px] text-white/40 mt-0.5">{initialStores.length} total cadastradas</div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="bg-[#121216] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white">Evolução Diária de Performance</h2>
            <p className="text-xs text-white/40">Cruzamento de custos de tráfego, vendas e margem líquida</p>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab("finance")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === "finance" ? "bg-white/15 text-white font-medium" : "text-white/50 hover:text-white"
              }`}
            >
              Financeiro (R$)
            </button>
            <button
              onClick={() => setActiveTab("traffic")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === "traffic" ? "bg-white/15 text-white font-medium" : "text-white/50 hover:text-white"
              }`}
            >
              Tráfego & Vendas
            </button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-white/40 text-xs border border-dashed border-white/10 rounded-lg">
            <MousePointerClick className="w-8 h-8 text-white/20 mb-2" />
            <span>Nenhum dado diário lançado para o período selecionado.</span>
            <span className="text-[11px] text-white/30 mt-1">
              Use os botões &quot;+ Nova Venda&quot; e &quot;+ Lançar Gasto&quot; no topo para alimentar o gráfico.
            </span>
          </div>
        ) : activeTab === "finance" ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} />
                <YAxis stroke="#ffffff40" fontSize={11} tickFormatter={(val) => `R$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#ffffff20", borderRadius: 8, fontSize: 12 }}
                  formatter={(val: unknown) => [formatCurrency(Number(val) || 0), ""]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area type="monotone" dataKey="cost" name="Gasto com Anúncios" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCost)" />
                <Area type="monotone" dataKey="commission" name="Comissão Bruta" stroke="#a855f7" fillOpacity={1} fill="url(#colorCommission)" />
                <Area type="monotone" dataKey="profit" name="Lucro Líquido" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} />
                <YAxis yAxisId="left" stroke="#ffffff40" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#a855f7" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#ffffff20", borderRadius: 8, fontSize: 12 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar yAxisId="left" dataKey="clicks" name="Cliques" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="conversions" name="Vendas Confirmadas" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Stores Ranking Table */}
      {initialStores.length > 0 && (
        <div className="bg-[#121216] border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Ranking de Lojas — Período Selecionado</h2>
              <span className="text-[10px] bg-white/5 text-white/40 border border-white/10 px-1.5 py-0.5 rounded">
                {initialStores.length} lojas
              </span>
            </div>
            <Link
              href="/admin/performance"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <span>Ver Matriz Completa</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-2.5 text-white/40 font-semibold uppercase text-[10px] tracking-wide w-8">#</th>
                  <th className="text-left px-4 py-2.5 text-white/40 font-semibold uppercase text-[10px] tracking-wide">Loja</th>
                  <th className="text-right px-4 py-2.5 text-white/40 font-semibold uppercase text-[10px] tracking-wide">Gasto</th>
                  <th className="text-right px-4 py-2.5 text-white/40 font-semibold uppercase text-[10px] tracking-wide">Comissão</th>
                  <th className="text-right px-4 py-2.5 text-white/40 font-semibold uppercase text-[10px] tracking-wide">Lucro</th>
                  <th className="text-right px-4 py-2.5 text-white/40 font-semibold uppercase text-[10px] tracking-wide">ROI</th>
                  <th className="text-right px-4 py-2.5 text-white/40 font-semibold uppercase text-[10px] tracking-wide">CPA</th>
                  <th className="text-center px-4 py-2.5 text-white/40 font-semibold uppercase text-[10px] tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {storeRankingRows.map(({ store, metrics }, idx) => (
                  <tr key={store.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3 text-white/40 font-mono">
                      {idx + 1 <= 3 ? (
                        <span className={`font-bold ${
                          idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-white/60' : 'text-amber-700'
                        }`}>{idx + 1}°</span>
                      ) : (
                        <span>{idx + 1}°</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/stores/${store.slug}`}
                        className="font-semibold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5"
                      >
                        {store.name}
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </Link>
                      <div className="text-[10px] text-white/30 mt-0.5">{store.affiliate_network} • {store.category}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-amber-300 font-mono">{formatCurrency(metrics.ad_spend)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-purple-300 font-mono">{formatCurrency(metrics.total_commission)}</span>
                      <div className="text-[10px] text-white/30">{metrics.sales_count} vendas</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold font-mono ${
                        metrics.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(metrics.profit)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono text-xs ${
                        metrics.roi >= 0 ? 'text-emerald-300' : 'text-red-300'
                      }`}>
                        {formatPercent(metrics.roi)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white/60 font-mono">{formatCurrency(metrics.cpa)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        store.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : store.status === 'testing'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : store.status === 'paused'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-white/5 text-white/40 border-white/10'
                      }`}>
                        {store.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  Search,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";
import { Store, AdSpend, Sale, DatePeriod } from "@/types/affiliate";
import { calculateMetrics, formatCurrency, formatPercent } from "@/lib/metrics";
import { exportPerformanceCsv } from "@/lib/export-csv";

interface PerformanceClientProps {
  stores: Store[];
  adSpends: AdSpend[];
  sales: Sale[];
}

type SortOption = "profit_desc" | "roi_desc" | "commission_desc" | "cpa_asc" | "conversion_rate_desc";

export function PerformanceClient({ stores, adSpends, sales }: PerformanceClientProps) {
  const [search, setSearch] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("profit_desc");

  const networks = useMemo(() => Array.from(new Set(stores.map((s) => s.affiliate_network))).filter(Boolean), [stores]);
  const categories = useMemo(() => Array.from(new Set(stores.map((s) => s.category || "Geral"))).filter(Boolean), [stores]);

  // Agregação de métricas por loja
  const performanceData = useMemo(() => {
    return stores.map((store) => {
      const sp = adSpends.filter((item) => item.store_id === store.id);
      const sl = sales.filter((item) => item.store_id === store.id);
      const m = calculateMetrics(sp, sl);

      return {
        store,
        metrics: m,
      };
    });
  }, [stores, adSpends, sales]);

  // Filtros e Ordenação
  const sortedAndFilteredData = useMemo(() => {
    return performanceData
      .filter(({ store }) => {
        const matchesSearch =
          store.name.toLowerCase().includes(search.toLowerCase()) ||
          store.affiliate_network.toLowerCase().includes(search.toLowerCase());

        const matchesNetwork = selectedNetwork === "all" || store.affiliate_network === selectedNetwork;
        const matchesCategory = selectedCategory === "all" || (store.category || "Geral") === selectedCategory;
        const matchesStatus = selectedStatus === "all" || store.status === selectedStatus;

        return matchesSearch && matchesNetwork && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "profit_desc") return b.metrics.profit - a.metrics.profit;
        if (sortBy === "roi_desc") return b.metrics.roi - a.metrics.roi;
        if (sortBy === "commission_desc") return b.metrics.total_commission - a.metrics.total_commission;
        if (sortBy === "cpa_asc") {
          // Ignora lojas sem vendas na ordenação de CPA asc
          if (a.metrics.sales_count === 0) return 1;
          if (b.metrics.sales_count === 0) return -1;
          return a.metrics.cpa - b.metrics.cpa;
        }
        if (sortBy === "conversion_rate_desc") return b.metrics.conversion_rate - a.metrics.conversion_rate;
        return 0;
      });
  }, [performanceData, search, selectedNetwork, selectedCategory, selectedStatus, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Matriz Comparativa de Performance</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
              {sortedAndFilteredData.length} Lojas Classificadas
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Ranking analítico e ordenação multi-critério para escala de até 300 lojas simultâneas
          </p>
        </div>

        {/* Seletor de Ordenação Rápida */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#121216] border border-white/10 px-3 py-1.5 rounded-xl">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-white/60">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="profit_desc" className="bg-[#18181b] text-white">Maior Lucro Líquido</option>
              <option value="roi_desc" className="bg-[#18181b] text-white">Maior ROI (%)</option>
              <option value="commission_desc" className="bg-[#18181b] text-white">Maior Comissão</option>
              <option value="cpa_asc" className="bg-[#18181b] text-white">Menor CPA (Mais Eficiente)</option>
              <option value="conversion_rate_desc" className="bg-[#18181b] text-white">Maior Taxa de Conversão</option>
            </select>
          </div>

          <button
            onClick={() =>
              exportPerformanceCsv(
                sortedAndFilteredData.map(({ store, metrics }, idx) => ({
                  rank: idx + 1,
                  name: store.name,
                  network: store.affiliate_network,
                  clicks: metrics.clicks,
                  sales_count: metrics.sales_count,
                  conversion_rate: parseFloat(metrics.conversion_rate.toFixed(2)),
                  ad_spend: parseFloat(metrics.ad_spend.toFixed(2)),
                  total_commission: parseFloat(metrics.total_commission.toFixed(2)),
                  cpa: parseFloat(metrics.cpa.toFixed(2)),
                  epc: parseFloat(metrics.epc.toFixed(2)),
                  profit: parseFloat(metrics.profit.toFixed(2)),
                  roi: parseFloat(metrics.roi.toFixed(1)),
                  status: store.status,
                }))
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Exportar CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Multi-Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121216] p-3 rounded-xl border border-white/10">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar loja..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Rede */}
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all" className="bg-[#18181b] text-white">Todas as Redes</option>
            {networks.map((n) => (
              <option key={n} value={n} className="bg-[#18181b] text-white">{n}</option>
            ))}
          </select>

          {/* Categoria */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all" className="bg-[#18181b] text-white">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#18181b] text-white">{c}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all" className="bg-[#18181b] text-white">Todos os Status</option>
            <option value="active" className="bg-[#18181b] text-white">Ativa</option>
            <option value="testing" className="bg-[#18181b] text-white">Em Teste</option>
            <option value="paused" className="bg-[#18181b] text-white">Pausada</option>
          </select>
        </div>
      </div>

      {/* Matriz Comparativa (Tabela Completa de 300 lojas) */}
      <div className="bg-[#121216] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-white/50 border-b border-white/10 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4"># Rank / Loja</th>
                <th className="py-3 px-3">Rede</th>
                <th className="py-3 px-3 text-right">Cliques</th>
                <th className="py-3 px-3 text-right">Vendas</th>
                <th className="py-3 px-3 text-right">Taxa Conv.</th>
                <th className="py-3 px-3 text-right">Gasto Ads</th>
                <th className="py-3 px-3 text-right">Comissão</th>
                <th className="py-3 px-3 text-right">CPA</th>
                <th className="py-3 px-3 text-right">EPC</th>
                <th className="py-3 px-3 text-right font-bold text-white">Lucro Líquido</th>
                <th className="py-3 px-3 text-right font-bold text-white">ROI</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedAndFilteredData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-white/40">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-white/20" />
                    Nenhuma loja para exibir com os filtros atuais.
                  </td>
                </tr>
              ) : (
                sortedAndFilteredData.map(({ store, metrics }, index) => (
                  <tr key={store.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white/30 text-[11px] w-5">
                          {index + 1}°
                        </span>
                        <Link
                          href={`/admin/stores/${store.slug || store.id}`}
                          className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1"
                        >
                          <span>{store.name}</span>
                          <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-blue-400" />
                        </Link>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-white/70">{store.affiliate_network}</td>
                    <td className="py-3.5 px-3 text-right font-mono text-white">{metrics.clicks}</td>
                    <td className="py-3.5 px-3 text-right font-semibold text-teal-400">{metrics.sales_count}</td>
                    <td className="py-3.5 px-3 text-right text-white/80">{formatPercent(metrics.conversion_rate)}</td>
                    <td className="py-3.5 px-3 text-right text-amber-300 font-medium">{formatCurrency(metrics.ad_spend)}</td>
                    <td className="py-3.5 px-3 text-right text-purple-300 font-semibold">{formatCurrency(metrics.total_commission)}</td>
                    <td className="py-3.5 px-3 text-right font-mono text-white/70">{formatCurrency(metrics.cpa)}</td>
                    <td className="py-3.5 px-3 text-right font-mono text-white/70">{formatCurrency(metrics.epc)}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`font-bold text-sm ${metrics.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {formatCurrency(metrics.profit)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold">
                      <span className={metrics.roi >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {formatPercent(metrics.roi)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          store.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : store.status === "testing"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {store.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

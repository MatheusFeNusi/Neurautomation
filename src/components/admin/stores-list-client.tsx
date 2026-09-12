"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Store as StoreIcon,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Store, AdSpend, Sale, StoreStatus } from "@/types/affiliate";
import { calculateMetrics, evaluateStoreAlerts, formatCurrency, formatPercent } from "@/lib/metrics";
import { AddStoreModal } from "./add-store-modal";
import { DeleteRowButton } from "./delete-row-button";

interface StoresListClientProps {
  initialStores: Store[];
  adSpends: AdSpend[];
  sales: Sale[];
}

export function StoresListClient({ initialStores, adSpends, sales }: StoresListClientProps) {
  const [search, setSearch] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | StoreStatus>("all");

  const networks = useMemo(() => {
    const list = Array.from(new Set(initialStores.map((s) => s.affiliate_network)));
    return list.filter(Boolean);
  }, [initialStores]);

  // Lista com métricas calculadas por loja
  const storesWithMetrics = useMemo(() => {
    return initialStores.map((store) => {
      const storeSpends = adSpends.filter((s) => s.store_id === store.id);
      const storeSales = sales.filter((s) => s.store_id === store.id);
      const metrics = calculateMetrics(storeSpends, storeSales);
      const alerts = evaluateStoreAlerts(store, metrics);

      return {
        ...store,
        metrics,
        alerts,
      };
    });
  }, [initialStores, adSpends, sales]);

  // Filtros aplicados
  const filteredStores = useMemo(() => {
    return storesWithMetrics.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.affiliate_network.toLowerCase().includes(search.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(search.toLowerCase()));

      const matchesNetwork = selectedNetwork === "all" || s.affiliate_network === selectedNetwork;
      const matchesStatus = selectedStatus === "all" || s.status === selectedStatus;

      return matchesSearch && matchesNetwork && matchesStatus;
    });
  }, [storesWithMetrics, search, selectedNetwork, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Lojas Afiliadas</span>
            <span className="text-xs bg-blue-500/20 text-blue-300 font-medium px-2 py-0.5 rounded-full border border-blue-500/30">
              {filteredStores.length} de {initialStores.length} Lojas
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Gestão operacional, regras contratuais e controle de orçamento para até 300 lojas simultâneas
          </p>
        </div>

        <AddStoreModal />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#121216] p-3 rounded-xl border border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por loja, rede, categoria..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-white/40" />

          {/* Filtro de Rede */}
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all" className="bg-[#18181b] text-white">Todas as Redes</option>
            {networks.map((net) => (
              <option key={net} value={net} className="bg-[#18181b] text-white">
                {net}
              </option>
            ))}
          </select>

          {/* Filtro de Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "all" | StoreStatus)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all" className="bg-[#18181b] text-white">Todos os Status</option>
            <option value="active" className="bg-[#18181b] text-white">Ativa (Active)</option>
            <option value="testing" className="bg-[#18181b] text-white">Em Teste (Testing)</option>
            <option value="paused" className="bg-[#18181b] text-white">Pausada (Paused)</option>
            <option value="archived" className="bg-[#18181b] text-white">Arquivada (Archived)</option>
          </select>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-[#121216] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-white/50 border-b border-white/10 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Loja / Categoria</th>
                <th className="py-3 px-3">Rede Afiliada</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Budget Diário / Gasto</th>
                <th className="py-3 px-3">Target CPA</th>
                <th className="py-3 px-3 text-right">Comissão</th>
                <th className="py-3 px-3 text-right">Lucro Real</th>
                <th className="py-3 px-3 text-right">ROI</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/40">
                    <StoreIcon className="w-8 h-8 mx-auto mb-2 text-white/20" />
                    Nenhuma loja encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const m = store.metrics;
                  const hasAlerts = store.alerts.length > 0;

                  return (
                    <tr key={store.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Nome e Categoria */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/stores/${store.slug || store.id}`}
                          className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5"
                        >
                          <span>{store.name}</span>
                          <ChevronRight className="w-3 h-3 text-white/30 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="text-[11px] text-white/40 mt-0.5">
                          {store.category || "Geral"}
                        </div>
                      </td>

                      {/* Rede */}
                      <td className="py-3.5 px-3">
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[11px] text-white/80 font-medium">
                          {store.affiliate_network}
                        </span>
                        {store.brand_bidding_allowed && (
                          <div className="text-[10px] text-teal-400 mt-1 font-mono">Brand Bidding ✓</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                            store.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : store.status === "testing"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : store.status === "paused"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-white/5 text-white/40 border-white/10"
                          }`}
                        >
                          {store.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Budget / Gasto */}
                      <td className="py-3.5 px-3">
                        <div className="text-white font-medium">
                          {store.daily_budget > 0 ? formatCurrency(store.daily_budget) : "Ilimitado"}
                        </div>
                        <div className="text-[10px] text-white/40">
                          Gasto: {formatCurrency(m.ad_spend)}
                        </div>
                      </td>

                      {/* Target CPA */}
                      <td className="py-3.5 px-3">
                        <div className="text-white/80 font-mono">
                          {store.target_cpa > 0 ? formatCurrency(store.target_cpa) : "N/D"}
                        </div>
                        {m.sales_count > 0 && (
                          <div
                            className={`text-[10px] ${
                              store.target_cpa > 0 && m.cpa > store.target_cpa
                                ? "text-amber-400 font-semibold"
                                : "text-white/40"
                            }`}
                          >
                            Real: {formatCurrency(m.cpa)}
                          </div>
                        )}
                      </td>

                      {/* Comissão */}
                      <td className="py-3.5 px-3 text-right font-medium text-purple-300">
                        {formatCurrency(m.total_commission)}
                        <div className="text-[10px] text-white/40">
                          {m.sales_count} vendas
                        </div>
                      </td>

                      {/* Lucro Real */}
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-semibold ${
                            m.profit >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {formatCurrency(m.profit)}
                        </span>
                      </td>

                      {/* ROI */}
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-bold ${
                            m.roi >= (store.target_roi || 0) && m.roi > 0
                              ? "text-emerald-400"
                              : m.roi < 0
                              ? "text-red-400"
                              : "text-white/70"
                          }`}
                        >
                          {formatPercent(m.roi)}
                        </span>
                        {store.target_roi > 0 && (
                          <div className="text-[10px] text-white/40">Meta: {store.target_roi}%</div>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/stores/${store.slug || store.id}`}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-2.5 py-1 rounded transition-colors"
                          >
                            <span>Detalhes</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <DeleteRowButton
                            endpoint={`/api/admin/stores/${store.id}`}
                            label="Excluir"
                            onDeleted={() => window.location.reload()}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

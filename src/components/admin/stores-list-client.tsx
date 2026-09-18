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
import { EditStoreModal } from "./edit-store-modal";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <span>Lojas Afiliadas</span>
            <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-200">
              {filteredStores.length} de {initialStores.length} Lojas
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gestão operacional, regras contratuais e controle de orçamento para até 300 lojas simultâneas
          </p>
        </div>

        <AddStoreModal />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por loja, rede, categoria..."
            className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />

          {/* Filtro de Rede */}
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            className="bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
          >
            <option value="all" className="bg-white text-gray-900">Todas as Redes</option>
            {networks.map((net) => (
              <option key={net} value={net} className="bg-white text-gray-900">
                {net}
              </option>
            ))}
          </select>

          {/* Filtro de Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "all" | StoreStatus)}
            className="bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
          >
            <option value="all" className="bg-white text-gray-900">Todos os Status</option>
            <option value="active" className="bg-white text-gray-900">Ativa (Active)</option>
            <option value="testing" className="bg-white text-gray-900">Em Teste (Testing)</option>
            <option value="paused" className="bg-white text-gray-900">Pausada (Paused)</option>
            <option value="archived" className="bg-white text-gray-900">Arquivada (Archived)</option>
          </select>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-semibold uppercase tracking-wider text-[10px]">
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
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <StoreIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    Nenhuma loja encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const m = store.metrics;
                  const hasAlerts = store.alerts.length > 0;

                  return (
                    <tr key={store.id} className="hover:bg-gray-50 transition-colors group">
                      {/* Nome e Categoria */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/stores/${store.slug || store.id}`}
                          className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5"
                        >
                          <span>{store.name}</span>
                          <ChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {store.category || "Geral"}
                          {store.country && <span> • {store.country}</span>}
                        </div>
                      </td>

                      {/* Rede */}
                      <td className="py-3.5 px-3">
                        <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[11px] text-gray-800 font-medium">
                          {store.affiliate_network}
                        </span>
                        {store.brand_bidding_allowed && (
                          <div className="text-[10px] text-teal-600 mt-1 font-mono">Brand Bidding ✓</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                            store.status === "active"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : store.status === "testing"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : store.status === "paused"
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-gray-100 text-gray-400 border-gray-200"
                          }`}
                        >
                          {store.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Budget / Gasto */}
                      <td className="py-3.5 px-3">
                        <div className="text-gray-900 font-medium">
                          {store.daily_budget > 0 ? formatCurrency(store.daily_budget) : "Ilimitado"}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Gasto: {formatCurrency(m.ad_spend)}
                        </div>
                      </td>

                      {/* Target CPA */}
                      <td className="py-3.5 px-3">
                        <div className="text-gray-800 font-mono">
                          {store.target_cpa > 0 ? formatCurrency(store.target_cpa) : "N/D"}
                        </div>
                        {m.sales_count > 0 && (
                          <div
                            className={`text-[10px] ${
                              store.target_cpa > 0 && m.cpa > store.target_cpa
                                ? "text-amber-600 font-semibold"
                                : "text-gray-400"
                            }`}
                          >
                            Real: {formatCurrency(m.cpa)}
                          </div>
                        )}
                      </td>

                      {/* Comissão */}
                      <td className="py-3.5 px-3 text-right font-medium text-purple-700">
                        {formatCurrency(m.total_commission)}
                        <div className="text-[10px] text-gray-400">
                          {m.sales_count} vendas
                        </div>
                      </td>

                      {/* Lucro Real */}
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-semibold ${
                            m.profit >= 0 ? "text-emerald-600" : "text-red-600"
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
                              ? "text-emerald-600"
                              : m.roi < 0
                              ? "text-red-600"
                              : "text-gray-700"
                          }`}
                        >
                          {formatPercent(m.roi)}
                        </span>
                        {store.target_roi > 0 && (
                          <div className="text-[10px] text-gray-400">Meta: {store.target_roi}%</div>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/stores/${store.slug || store.id}`}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-50 border border-blue-200 px-2.5 py-1 rounded transition-colors"
                          >
                            <span>Detalhes</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <EditStoreModal store={store} />
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

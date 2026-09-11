"use client";

import { useState } from "react";
import { ShoppingCart, Search, Filter, ShieldCheck, ShieldAlert, CheckCircle2, Clock, XCircle, RefreshCcw, Download } from "lucide-react";
import { Sale, Store, Offer, Campaign, SaleStatus, SaleOrigin, TrackingStatus } from "@/types/affiliate";
import { formatCurrency } from "@/lib/metrics";
import { AddSaleModal } from "./add-sale-modal";
import { exportSalesCsv } from "@/lib/export-csv";

interface SalesListClientProps {
  initialSales: Sale[];
  stores: Store[];
  offers: Offer[];
  campaigns: Campaign[];
}

export function SalesListClient({ initialSales, stores, offers, campaigns }: SalesListClientProps) {
  const [sales] = useState<Sale[]>(initialSales);
  const [search, setSearch] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("all");
  const [selectedTracking, setSelectedTracking] = useState<string>("all");

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      (s.order_id && s.order_id.toLowerCase().includes(search.toLowerCase())) ||
      (s.notes && s.notes.toLowerCase().includes(search.toLowerCase())) ||
      (s.click_id && s.click_id.toLowerCase().includes(search.toLowerCase())) ||
      s.affiliate_network.toLowerCase().includes(search.toLowerCase());

    const matchesStore = selectedStore === "all" || s.store_id === selectedStore;
    const matchesStatus = selectedStatus === "all" || s.status === selectedStatus;
    const matchesOrigin = selectedOrigin === "all" || s.origin === selectedOrigin;
    const matchesTracking = selectedTracking === "all" || s.tracking_status === selectedTracking;

    return matchesSearch && matchesStore && matchesStatus && matchesOrigin && matchesTracking;
  });

  const totalFilteredSalesValue = filteredSales.reduce((acc, curr) => acc + (Number(curr.sale_value) || 0), 0);
  const totalFilteredCommission = filteredSales.reduce((acc, curr) => acc + (Number(curr.commission) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Registro de Vendas & Atribuição</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 font-medium px-2 py-0.5 rounded-full border border-purple-500/30">
              {filteredSales.length} Vendas
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Lançamento manual rigoroso com conferência de Click ID e comissões por rede
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSalesCsv(filteredSales)}
            disabled={filteredSales.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Exportar vendas filtradas em CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <AddSaleModal stores={stores} offers={offers} campaigns={campaigns} />
        </div>
      </div>

      {/* Summary KPI Mini-Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121216] border border-white/10 rounded-xl p-3">
          <div className="text-[10px] uppercase font-semibold text-white/40">Total Faturado em Vendas</div>
          <div className="text-base font-bold text-white mt-1">{formatCurrency(totalFilteredSalesValue)}</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-3">
          <div className="text-[10px] uppercase font-semibold text-white/40">Comissão Acumulada</div>
          <div className="text-base font-bold text-purple-300 mt-1">{formatCurrency(totalFilteredCommission)}</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-3">
          <div className="text-[10px] uppercase font-semibold text-white/40">Atribuídas com Click ID</div>
          <div className="text-base font-bold text-emerald-400 mt-1">
            {filteredSales.filter((s) => s.tracking_status === "attributed").length}
          </div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-3">
          <div className="text-[10px] uppercase font-semibold text-white/40">Lançamentos Manuais</div>
          <div className="text-base font-bold text-amber-400 mt-1">
            {filteredSales.filter((s) => s.tracking_status === "manual").length}
          </div>
        </div>
      </div>

      {/* Multi-Filters Bar */}
      <div className="bg-[#121216] p-3 rounded-xl border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por Order ID, Click ID ou anotações..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Store */}
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all" className="bg-[#18181b] text-white">Todas as Lojas</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#18181b] text-white">{s.name}</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all" className="bg-[#18181b] text-white">Todos os Status</option>
              <option value="approved" className="bg-[#18181b] text-white">Aprovada</option>
              <option value="pending" className="bg-[#18181b] text-white">Pendente</option>
              <option value="rejected" className="bg-[#18181b] text-white">Rejeitada</option>
              <option value="refunded" className="bg-[#18181b] text-white">Reembolsada</option>
            </select>

            {/* Origin */}
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all" className="bg-[#18181b] text-white">Todas as Origens</option>
              <option value="google_ads" className="bg-[#18181b] text-white">Google Ads</option>
              <option value="organic" className="bg-[#18181b] text-white">Orgânico</option>
              <option value="direct" className="bg-[#18181b] text-white">Direto</option>
              <option value="social" className="bg-[#18181b] text-white">Social</option>
              <option value="manual" className="bg-[#18181b] text-white">Manual</option>
            </select>

            {/* Tracking Status */}
            <select
              value={selectedTracking}
              onChange={(e) => setSelectedTracking(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all" className="bg-[#18181b] text-white">Todos os Trackings</option>
              <option value="attributed" className="bg-[#18181b] text-white">Atribuído (Click ID)</option>
              <option value="manual" className="bg-[#18181b] text-white">Manual</option>
              <option value="unattributed" className="bg-[#18181b] text-white">Não atribuído</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#121216] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-white/50 border-b border-white/10 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Data / Pedido</th>
                <th className="py-3 px-3">Loja Afiliada</th>
                <th className="py-3 px-3">Rede</th>
                <th className="py-3 px-3 text-right">Valor Venda</th>
                <th className="py-3 px-3 text-right">Comissão</th>
                <th className="py-3 px-3">Origem</th>
                <th className="py-3 px-3">Rastreamento</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Click ID / Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/40">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-white/20" />
                    Nenhuma venda encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const store = stores.find((s) => s.id === sale.store_id);

                  return (
                    <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{sale.date}</div>
                        <div className="text-[10px] text-white/40 font-mono">
                          {sale.order_id ? `#${sale.order_id}` : "Sem ID"}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-white/90">
                        {store?.name || "Loja"}
                      </td>
                      <td className="py-3.5 px-3 text-white/70">
                        {sale.affiliate_network}
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-white">
                        {formatCurrency(sale.sale_value, sale.currency)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-purple-300">
                        {formatCurrency(sale.commission, sale.currency)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/80 capitalize">
                          {sale.origin.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
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
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            sale.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : sale.status === "pending"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {sale.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        {sale.click_id && (
                          <div className="font-mono text-[10px] text-purple-300 truncate" title={sale.click_id}>
                            id: {sale.click_id}
                          </div>
                        )}
                        {sale.notes ? (
                          <div className="text-[11px] text-white/50 truncate" title={sale.notes}>
                            {sale.notes}
                          </div>
                        ) : (
                          <span className="text-white/20 text-[10px]">—</span>
                        )}
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

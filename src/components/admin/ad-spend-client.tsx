"use client";

import { useState } from "react";
import { DollarSign, Search, Plus, Calendar, Layers, Download } from "lucide-react";
import { AdSpend, Store, Campaign } from "@/types/affiliate";
import { formatCurrency, formatPercent } from "@/lib/metrics";
import { AddSpendModal } from "./add-spend-modal";
import { DeleteRowButton } from "./delete-row-button";
import { exportAdSpendCsv } from "@/lib/export-csv";

interface AdSpendClientProps {
  initialAdSpends: AdSpend[];
  stores: Store[];
  campaigns: Campaign[];
}

export function AdSpendClient({ initialAdSpends, stores, campaigns }: AdSpendClientProps) {
  const [adSpends] = useState<AdSpend[]>(initialAdSpends);
  const [search, setSearch] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");

  const filteredSpends = adSpends.filter((s) => {
    const camp = campaigns.find((c) => c.id === s.campaign_id);
    const store = stores.find((st) => st.id === s.store_id);

    const matchesSearch =
      (camp && camp.name.toLowerCase().includes(search.toLowerCase())) ||
      (store && store.name.toLowerCase().includes(search.toLowerCase())) ||
      s.date.includes(search);

    const matchesStore = selectedStore === "all" || s.store_id === selectedStore;

    return matchesSearch && matchesStore;
  });

  const totalCost = filteredSpends.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  const totalClicks = filteredSpends.reduce((acc, curr) => acc + (Number(curr.clicks) || 0), 0);
  const totalImpressions = filteredSpends.reduce((acc, curr) => acc + (Number(curr.impressions) || 0), 0);
  const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0;
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Investimento em Anúncios (Ad Spend)</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 font-medium px-2 py-0.5 rounded-full border border-amber-500/30">
              {filteredSpends.length} Lançamentos
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Controle diário de custos por campanha com suporte à importação manual e deduplicação
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportAdSpendCsv(filteredSpends)}
            disabled={filteredSpends.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Exportar gastos em CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <AddSpendModal stores={stores} campaigns={campaigns} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-white/40">Total Investido</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{formatCurrency(totalCost)}</div>
          <div className="text-[11px] text-white/40 mt-1">No período filtrado</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-white/40">Cliques Comprados</div>
          <div className="text-xl font-bold text-white mt-1">{totalClicks}</div>
          <div className="text-[11px] text-white/40 mt-1">{totalImpressions} impressões</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-white/40">CPC Médio</div>
          <div className="text-xl font-bold text-white mt-1">{formatCurrency(avgCpc)}</div>
          <div className="text-[11px] text-white/40 mt-1">Custo por clique médio</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-white/40">CTR Médio</div>
          <div className="text-xl font-bold text-white mt-1">{formatPercent(avgCtr)}</div>
          <div className="text-[11px] text-white/40 mt-1">Taxa de cliques</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121216] p-3 rounded-xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por campanha, loja ou data..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-white/60">Loja:</label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all" className="bg-[#18181b] text-white">Todas as Lojas</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#18181b] text-white">{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#121216] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-white/50 border-b border-white/10 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-3">Campanha</th>
                <th className="py-3 px-3">Loja</th>
                <th className="py-3 px-3 text-right">Cliques</th>
                <th className="py-3 px-3 text-right">Impressões</th>
                <th className="py-3 px-3 text-right">CPC</th>
                <th className="py-3 px-3 text-right">CTR</th>
                <th className="py-3 px-3 text-right">Investimento (Custo)</th>
                <th className="py-3 px-3">Fonte / Deduplicação</th>
                <th className="py-3 px-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSpends.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-white/40">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-white/20" />
                    Nenhum lançamento de gasto encontrado.
                  </td>
                </tr>
              ) : (
                filteredSpends.map((spend) => {
                  const camp = campaigns.find((c) => c.id === spend.campaign_id);
                  const store = stores.find((s) => s.id === spend.store_id);
                  const cpc = spend.clicks > 0 ? spend.cost / spend.clicks : 0;
                  const ctr = spend.impressions > 0 ? (spend.clicks / spend.impressions) * 100 : 0;

                  return (
                    <tr key={spend.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-white/90">{spend.date}</td>
                      <td className="py-3.5 px-3 font-semibold text-white">
                        {camp?.name || "Campanha Geral"}
                      </td>
                      <td className="py-3.5 px-3 text-white/70">{store?.name || "Loja Geral"}</td>
                      <td className="py-3.5 px-3 text-right font-medium text-white">{spend.clicks}</td>
                      <td className="py-3.5 px-3 text-right text-white/60">{spend.impressions}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-white/80">{formatCurrency(cpc)}</td>
                      <td className="py-3.5 px-3 text-right text-white/80">{formatPercent(ctr)}</td>
                      <td className="py-3.5 px-3 text-right font-bold text-amber-400">
                        {formatCurrency(spend.cost)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/70 capitalize font-mono">
                          {spend.source}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <DeleteRowButton
                          endpoint={`/api/admin/ad-spend/${spend.id}`}
                          onDeleted={() => window.location.reload()}
                        />
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

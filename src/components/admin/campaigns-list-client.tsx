"use client";

import { useState } from "react";
import { Megaphone, Plus, Search, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Campaign, Store, Offer, AdSpend, Sale, CampaignStatus } from "@/types/affiliate";
import { calculateMetrics, formatCurrency, formatPercent } from "@/lib/metrics";

interface CampaignsListClientProps {
  initialCampaigns: Campaign[];
  stores: Store[];
  offers: Offer[];
  adSpends: AdSpend[];
  sales: Sale[];
}

export function CampaignsListClient({
  initialCampaigns,
  stores,
  offers,
  adSpends,
  sales,
}: CampaignsListClientProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [search, setSearch] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [storeId, setStoreId] = useState(stores[0]?.id || "");
  const [offerId, setOfferId] = useState("");
  const [name, setName] = useState("");
  const [trafficSource, setTrafficSource] = useState("google_ads");
  const [externalCampaignId, setExternalCampaignId] = useState("");
  const [adGroup, setAdGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<CampaignStatus>("active");

  const filteredOffersForForm = offers.filter((o) => o.store_id === storeId);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.external_campaign_id && c.external_campaign_id.includes(search)) ||
      (c.search_term && c.search_term.toLowerCase().includes(search.toLowerCase()));
    const matchesStore = selectedStore === "all" || c.store_id === selectedStore;
    return matchesSearch && matchesStore;
  });

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          offer_id: offerId || null,
          name,
          traffic_source: trafficSource,
          external_campaign_id: externalCampaignId || null,
          ad_group: adGroup || null,
          search_term: searchTerm || null,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar campanha.");

      setCampaigns([data.campaign, ...campaigns]);
      setIsModalOpen(false);
      setName("");
      setExternalCampaignId("");
      setAdGroup("");
      setSearchTerm("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Campanhas de Tráfego</span>
            <span className="text-xs bg-blue-500/20 text-blue-300 font-medium px-2 py-0.5 rounded-full border border-blue-500/30">
              {filteredCampaigns.length} Campanhas
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Gestão de campanhas no Google Ads e canais de atração com suporte a tracking direto
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9 px-3.5 rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nova Campanha</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121216] p-3 rounded-xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por campanha, ID ou termo de busca..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-white/60">Loja:</label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all" className="bg-[#18181b] text-white">Todas as Lojas</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#18181b] text-white">
                {s.name}
              </option>
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
                <th className="py-3 px-4">Campanha / Grupo</th>
                <th className="py-3 px-3">Loja / Oferta</th>
                <th className="py-3 px-3">ID Google Ads</th>
                <th className="py-3 px-3">Fonte</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Investimento</th>
                <th className="py-3 px-3 text-right">Comissão</th>
                <th className="py-3 px-3 text-right">Lucro</th>
                <th className="py-3 px-3 text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/40">
                    <Megaphone className="w-8 h-8 mx-auto mb-2 text-white/20" />
                    Nenhuma campanha encontrada.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((camp) => {
                  const store = stores.find((s) => s.id === camp.store_id);
                  const offer = offers.find((o) => o.id === camp.offer_id);
                  const campSpends = adSpends.filter((s) => s.campaign_id === camp.id);
                  const campSales = sales.filter((s) => s.campaign_id === camp.id);
                  const m = calculateMetrics(campSpends, campSales);

                  return (
                    <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{camp.name}</div>
                        <div className="text-[11px] text-white/40">
                          {camp.ad_group ? `Grupo: ${camp.ad_group}` : "Sem grupo específico"}
                          {camp.search_term && ` • "${camp.search_term}"`}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-white/80">{store?.name || "Loja Geral"}</div>
                        <div className="text-[10px] text-white/40">{offer?.name || "Oferta Geral"}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-white/70">
                        {camp.external_campaign_id ? (
                          <span className="bg-white/5 px-2 py-0.5 rounded text-[11px]">{camp.external_campaign_id}</span>
                        ) : (
                          <span className="text-white/30 text-[10px]">Aguardando Sync</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-blue-400 font-medium capitalize">
                          {camp.traffic_source.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                          {camp.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-white">
                        {formatCurrency(m.ad_spend)}
                        <div className="text-[10px] text-white/40">{m.clicks} cliques</div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-semibold text-purple-300">
                        {formatCurrency(m.total_commission)}
                        <div className="text-[10px] text-white/40">{m.sales_count} vendas</div>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`font-semibold ${m.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {formatCurrency(m.profit)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold">
                        <span className={m.roi >= 0 ? "text-emerald-400" : "text-red-400"}>
                          {formatPercent(m.roi)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Campanha */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121216] border border-white/10 rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h2 className="text-base font-semibold text-white">Cadastrar Campanha</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">✕</button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Loja *</label>
                  <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#18181b] text-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Oferta (Opcional)</label>
                  <select
                    value={offerId}
                    onChange={(e) => setOfferId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="" className="bg-[#18181b] text-white">-- Geral --</option>
                    {filteredOffersForForm.map((o) => (
                      <option key={o.id} value={o.id} className="bg-[#18181b] text-white">
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Nome da Campanha *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: GS_BR_Nike_Pegasus_Search"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Fonte de Tráfego</label>
                  <select
                    value={trafficSource}
                    onChange={(e) => setTrafficSource(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="google_ads" className="bg-[#18181b] text-white">Google Ads</option>
                    <option value="meta_ads" className="bg-[#18181b] text-white">Meta Ads (Facebook/Insta)</option>
                    <option value="bing_ads" className="bg-[#18181b] text-white">Microsoft Bing Ads</option>
                    <option value="tiktok_ads" className="bg-[#18181b] text-white">TikTok Ads</option>
                    <option value="other" className="bg-[#18181b] text-white">Outra Fonte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">ID Externo (Google Ads)</label>
                  <input
                    type="text"
                    value={externalCampaignId}
                    onChange={(e) => setExternalCampaignId(e.target.value)}
                    placeholder="Ex: 1982738491"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Grupo de Anúncios</label>
                  <input
                    type="text"
                    value={adGroup}
                    onChange={(e) => setAdGroup(e.target.value)}
                    placeholder="Ex: Tenis Corrida Top"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Termo Principal de Busca</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ex: comprar tenis amortecimento"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-white/10 text-white/60 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Cadastrar Campanha
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

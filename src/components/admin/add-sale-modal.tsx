"use client";

import { useState } from "react";
import { Plus, Loader2, AlertCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Store, Offer, Campaign, SaleOrigin, SaleStatus } from "@/types/affiliate";

interface AddSaleModalProps {
  stores: Store[];
  offers?: Offer[];
  campaigns?: Campaign[];
  onSaleCreated?: () => void;
}

export function AddSaleModal({ stores, offers = [], campaigns = [], onSaleCreated }: AddSaleModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [storeId, setStoreId] = useState(stores[0]?.id || "");
  const [offerId, setOfferId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [affiliateNetwork, setAffiliateNetwork] = useState(stores[0]?.affiliate_network || "Awin");
  const [orderId, setOrderId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saleValue, setSaleValue] = useState("");
  const [commission, setCommission] = useState("");
  const [currency, setCurrency] = useState("BRL");
  const [status, setStatus] = useState<SaleStatus>("approved");
  const [origin, setOrigin] = useState<SaleOrigin>("manual");
  const [clickId, setClickId] = useState("");
  const [notes, setNotes] = useState("");

  const selectedStore = stores.find((s) => s.id === storeId);
  const filteredOffers = offers.filter((o) => o.store_id === storeId);
  const filteredCampaigns = campaigns.filter((c) => c.store_id === storeId);

  const handleStoreChange = (id: string) => {
    setStoreId(id);
    const store = stores.find((s) => s.id === id);
    if (store) {
      setAffiliateNetwork(store.affiliate_network);
    }
    setOfferId("");
    setCampaignId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          offer_id: offerId || null,
          campaign_id: campaignId || null,
          affiliate_network: affiliateNetwork,
          order_id: orderId || null,
          date,
          sale_value: Number(saleValue) || 0,
          commission: Number(commission) || 0,
          currency,
          status,
          origin,
          click_id: clickId.trim() || null,
          notes: notes || null,
          source: "manual",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao registrar venda.");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        // Reset form
        setSaleValue("");
        setCommission("");
        setOrderId("");
        setClickId("");
        setNotes("");
        if (onSaleCreated) onSaleCreated();
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium shadow-md shadow-purple-900/30 flex items-center gap-1.5 text-xs h-9 px-3.5 rounded-lg"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>+ Nova Venda</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121216] border border-white/10 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Registrar Venda de Afiliado</h2>
                  <p className="text-xs text-white/50">Lançamento manual com validação de rastreamento e receita</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white text-lg font-light"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-lg text-xs">
                ✓ Venda registrada com sucesso! Atualizando métricas...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Loja */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Loja Afiliada *</label>
                  <select
                    value={storeId}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#18181b] text-white">
                        {s.name} ({s.affiliate_network})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rede de Afiliados */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Rede de Afiliados *</label>
                  <input
                    type="text"
                    value={affiliateNetwork}
                    onChange={(e) => setAffiliateNetwork(e.target.value)}
                    required
                    placeholder="Ex: Awin, Lomadee, Rakuten, Hotmart"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Oferta */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Oferta / Produto (Opcional)</label>
                  <select
                    value={offerId}
                    onChange={(e) => setOfferId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="" className="bg-[#18181b] text-white">-- Nenhuma oferta específica --</option>
                    {filteredOffers.map((o) => (
                      <option key={o.id} value={o.id} className="bg-[#18181b] text-white">
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campanha */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Campanha Associada (Opcional)</label>
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="" className="bg-[#18181b] text-white">-- Nenhuma campanha associada --</option>
                    {filteredCampaigns.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#18181b] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Data */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Data da Venda *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* ID do Pedido */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Order ID (Opcional)</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Ex: AWN-102938"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-white/30"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SaleStatus)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="approved" className="bg-[#18181b] text-white">Aprovada (Approved)</option>
                    <option value="pending" className="bg-[#18181b] text-white">Pendente (Pending)</option>
                    <option value="rejected" className="bg-[#18181b] text-white">Rejeitada (Rejected)</option>
                    <option value="refunded" className="bg-[#18181b] text-white">Reembolsada (Refunded)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Valor Total da Venda */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Valor da Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={saleValue}
                    onChange={(e) => setSaleValue(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-white/30"
                  />
                </div>

                {/* Comissão */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Comissão Gerada (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-white/30"
                  />
                </div>

                {/* Moeda */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Moeda</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="BRL" className="bg-[#18181b] text-white">BRL (R$)</option>
                    <option value="USD" className="bg-[#18181b] text-white">USD ($)</option>
                    <option value="EUR" className="bg-[#18181b] text-white">EUR (€)</option>
                  </select>
                </div>
              </div>

              {/* Seção Rastreamento e Origem (Regra Crítica Anti-Invenção de Atribuição) */}
              <div className="p-3.5 rounded-lg border border-purple-500/20 bg-purple-500/[0.03] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-300">Rastreamento & Origem de Tráfego</span>
                  <span className="text-[10px] text-white/40">Regra: Click ID obrigatório p/ atribuição direta</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">Origem do Tráfego *</label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value as SaleOrigin)}
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="manual" className="bg-[#18181b] text-white">Manual / Não rastreada</option>
                      <option value="google_ads" className="bg-[#18181b] text-white">Google Ads (exige Click ID ou confirmação)</option>
                      <option value="organic" className="bg-[#18181b] text-white">Orgânico (SEO)</option>
                      <option value="direct" className="bg-[#18181b] text-white">Direto</option>
                      <option value="social" className="bg-[#18181b] text-white">Redes Sociais</option>
                      <option value="email" className="bg-[#18181b] text-white">E-mail Marketing</option>
                      <option value="unknown" className="bg-[#18181b] text-white">Desconhecido</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">Click ID (gclid / affiliate click)</label>
                    <input
                      type="text"
                      value={clickId}
                      onChange={(e) => setClickId(e.target.value)}
                      placeholder="Ex: gclid_EAIaIQobChM..."
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 placeholder:text-white/30"
                    />
                  </div>
                </div>

                {!clickId.trim() && origin === "google_ads" && (
                  <p className="text-[11px] text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Atenção: Venda sem Click ID será registrada como <strong>origem Google Ads</strong>, porém com <strong>status de atribuição = manual</strong>.</span>
                  </p>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Observações (Opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Informações adicionais, cupom utilizado, notas de conciliação..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-white/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-medium"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Salvar Venda
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { DollarSign, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Store, Campaign } from "@/types/affiliate";

interface AddSpendModalProps {
  stores: Store[];
  campaigns: Campaign[];
  onSpendCreated?: () => void;
}

export function AddSpendModal({ stores, campaigns, onSpendCreated }: AddSpendModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [storeId, setStoreId] = useState(stores[0]?.id || "");
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [clicks, setClicks] = useState("");
  const [impressions, setImpressions] = useState("");
  const [cost, setCost] = useState("");
  const [conversions, setConversions] = useState("");
  const [conversionValue, setConversionValue] = useState("");

  const filteredCampaigns = campaigns.filter((c) => !storeId || c.store_id === storeId);

  const handleStoreChange = (newStoreId: string) => {
    setStoreId(newStoreId);
    const relatedCamp = campaigns.find((c) => c.store_id === newStoreId);
    if (relatedCamp) setCampaignId(relatedCamp.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/ad-spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          campaign_id: campaignId,
          date,
          clicks: Number(clicks) || 0,
          impressions: Number(impressions) || 0,
          cost: Number(cost) || 0,
          conversions: Number(conversions) || 0,
          conversion_value: Number(conversionValue) || 0,
          source: "manual",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao registrar gasto.");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        setClicks("");
        setImpressions("");
        setCost("");
        setConversions("");
        setConversionValue("");
        if (onSpendCreated) onSpendCreated();
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
        variant="outline"
        className="border-white/20 bg-white/5 text-white hover:bg-white/15 text-xs h-9 px-3 rounded-lg flex items-center gap-1.5"
      >
        <DollarSign className="w-3.5 h-3.5 text-amber-400" />
        <span>+ Lançar Gasto Diário</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121216] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Lançar Custo de Anúncio Diário</h2>
                  <p className="text-xs text-white/50">Google Ads ou outras fontes manuais</p>
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
                ✓ Investimento registrado com sucesso!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Loja *</label>
                  <select
                    value={storeId}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#18181b] text-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Campanha *</label>
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {filteredCampaigns.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#18181b] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Data *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Valor Investido (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="350.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Cliques *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={clicks}
                    onChange={(e) => setClicks(e.target.value)}
                    placeholder="120"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Impressões</label>
                  <input
                    type="number"
                    min="0"
                    value={impressions}
                    onChange={(e) => setImpressions(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Conversões Ads</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={conversions}
                    onChange={(e) => setConversions(e.target.value)}
                    placeholder="5"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Valor Conversão (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={conversionValue}
                    onChange={(e) => setConversionValue(e.target.value)}
                    placeholder="2450.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
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
                  className="bg-amber-600 hover:bg-amber-500 text-white font-medium"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Salvar Lançamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

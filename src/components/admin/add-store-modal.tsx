"use client";

import { useState } from "react";
import { Store as StoreIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreStatus } from "@/types/affiliate";

interface AddStoreModalProps {
  onStoreCreated?: () => void;
}

export function AddStoreModal({ onStoreCreated }: AddStoreModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Moda & Esportes");
  const [affiliateNetwork, setAffiliateNetwork] = useState("Awin");
  const [affiliateProgram, setAffiliateProgram] = useState("");
  const [status, setStatus] = useState<StoreStatus>("testing");
  const [dailyBudget, setDailyBudget] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [targetCpa, setTargetCpa] = useState("");
  const [maxCpc, setMaxCpc] = useState("");
  const [targetRoi, setTargetRoi] = useState("150");
  const [brandBiddingAllowed, setBrandBiddingAllowed] = useState(false);
  const [googleAdsAllowed, setGoogleAdsAllowed] = useState(true);
  const [dsaAllowed, setDsaAllowed] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          affiliate_network: affiliateNetwork,
          affiliate_program: affiliateProgram,
          status,
          daily_budget: Number(dailyBudget) || 0,
          monthly_budget: Number(monthlyBudget) || 0,
          target_cpa: Number(targetCpa) || 0,
          max_cpc: Number(maxCpc) || 0,
          target_roi: Number(targetRoi) || 0,
          brand_bidding_allowed: brandBiddingAllowed,
          google_ads_allowed: googleAdsAllowed,
          dsa_allowed: dsaAllowed,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar loja.");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        // Reset
        setName("");
        setDailyBudget("");
        setMonthlyBudget("");
        setTargetCpa("");
        setMaxCpc("");
        setNotes("");
        if (onStoreCreated) onStoreCreated();
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
        <StoreIcon className="w-3.5 h-3.5 text-blue-400" />
        <span>+ Nova Loja</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121216] border border-white/10 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <StoreIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Cadastrar Nova Loja Afiliada</h2>
                  <p className="text-xs text-white/50">Defina os parâmetros de orçamento, metas e permissões</p>
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
                ✓ Loja cadastrada com sucesso!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Nome da Loja *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Nike Brasil, Sephora, Amazon"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Categoria</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Moda & Esportes, Eletrônicos"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Rede de Afiliados *</label>
                  <input
                    type="text"
                    required
                    value={affiliateNetwork}
                    onChange={(e) => setAffiliateNetwork(e.target.value)}
                    placeholder="Awin, Lomadee, Rakuten, CJ"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Programa / ID</label>
                  <input
                    type="text"
                    value={affiliateProgram}
                    onChange={(e) => setAffiliateProgram(e.target.value)}
                    placeholder="Ex: Nike Oficial #1234"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Status Inicial</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StoreStatus)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="testing" className="bg-[#18181b] text-white">Testing (Em Teste)</option>
                    <option value="active" className="bg-[#18181b] text-white">Active (Ativa)</option>
                    <option value="paused" className="bg-[#18181b] text-white">Paused (Pausada)</option>
                    <option value="archived" className="bg-[#18181b] text-white">Archived (Arquivada)</option>
                  </select>
                </div>
              </div>

              {/* Metas e Orçamentos */}
              <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-lg space-y-3">
                <div className="text-xs font-semibold text-white/80">Controle Orçamentário e Metas</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/60 mb-1">Budget Diário (R$)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      placeholder="500"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/60 mb-1">Budget Mensal (R$)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      placeholder="15000"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/60 mb-1">Target CPA (R$)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={targetCpa}
                      onChange={(e) => setTargetCpa(e.target.value)}
                      placeholder="45.00"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/60 mb-1">Max CPC (R$)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={maxCpc}
                      onChange={(e) => setMaxCpc(e.target.value)}
                      placeholder="2.50"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/60 mb-1">Target ROI (%)</label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      value={targetRoi}
                      onChange={(e) => setTargetRoi(e.target.value)}
                      placeholder="150"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Regras e Permissões */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-xs text-white cursor-pointer hover:bg-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={brandBiddingAllowed}
                    onChange={(e) => setBrandBiddingAllowed(e.target.checked)}
                    className="rounded border-white/20 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Brand Bidding Permitido</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-xs text-white cursor-pointer hover:bg-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={googleAdsAllowed}
                    onChange={(e) => setGoogleAdsAllowed(e.target.checked)}
                    className="rounded border-white/20 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Google Ads Permitido</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-xs text-white cursor-pointer hover:bg-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={dsaAllowed}
                    onChange={(e) => setDsaAllowed(e.target.checked)}
                    className="rounded border-white/20 text-teal-600 focus:ring-teal-500"
                  />
                  <span>DSA Permitido</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Notas e Regras Específicas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Restrições da rede, termos contratuais, palavras-chave negativas obrigatórias..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-white/30"
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
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Cadastrar Loja
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

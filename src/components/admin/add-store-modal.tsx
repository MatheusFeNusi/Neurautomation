"use client";

import { useState } from "react";
import { Store as StoreIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalPortal } from "./modal-portal";
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
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("Brasil");
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
          description,
          country,
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
        setDescription("");
        setCountry("Brasil");
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
        className="border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 text-xs h-9 px-3 rounded-lg flex items-center gap-1.5"
      >
        <StoreIcon className="w-3.5 h-3.5 text-blue-600" />
        <span>+ Nova Loja</span>
      </Button>

      {isOpen && (
        <ModalPortal>
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
                  <StoreIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Cadastrar Nova Loja Afiliada</h2>
                  <p className="text-xs text-gray-500">Defina os parâmetros de orçamento, metas e permissões</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-900 text-lg font-light"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-500/30 text-red-600 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg text-xs">
                ✓ Loja cadastrada com sucesso!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Nome da Loja *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Nike Brasil, Sephora, Amazon"
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">País</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Ex: Brasil, EUA"
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Categoria</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Ex: Moda & Esportes, Eletrônicos"
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Descrição da Loja</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Breve descrição da loja, posicionamento e público..."
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Rede de Afiliados *</label>
                  <input
                    type="text"
                    required
                    value={affiliateNetwork}
                    onChange={(e) => setAffiliateNetwork(e.target.value)}
                    placeholder="Awin, Lomadee, Rakuten, CJ"
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Programa / ID</label>
                  <input
                    type="text"
                    value={affiliateProgram}
                    onChange={(e) => setAffiliateProgram(e.target.value)}
                    placeholder="Ex: Nike Oficial #1234"
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Status Inicial</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StoreStatus)}
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="testing" className="bg-white text-gray-900">Testing (Em Teste)</option>
                    <option value="active" className="bg-white text-gray-900">Active (Ativa)</option>
                    <option value="paused" className="bg-white text-gray-900">Paused (Pausada)</option>
                    <option value="archived" className="bg-white text-gray-900">Archived (Arquivada)</option>
                  </select>
                </div>
              </div>

              {/* Metas e Orçamentos */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                <div className="text-xs font-semibold text-gray-800">Controle Orçamentário e Metas</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-1">Budget Diário (R$)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      placeholder="500"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-600 mb-1">Budget Mensal (R$)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      placeholder="15000"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-600 mb-1">Target CPA (R$)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={targetCpa}
                      onChange={(e) => setTargetCpa(e.target.value)}
                      placeholder="45.00"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-600 mb-1">Max CPC (R$)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={maxCpc}
                      onChange={(e) => setMaxCpc(e.target.value)}
                      placeholder="2.50"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-600 mb-1">Target ROI (%)</label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      value={targetRoi}
                      onChange={(e) => setTargetRoi(e.target.value)}
                      placeholder="150"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Regras e Permissões */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={brandBiddingAllowed}
                    onChange={(e) => setBrandBiddingAllowed(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Brand Bidding Permitido</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={googleAdsAllowed}
                    onChange={(e) => setGoogleAdsAllowed(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Google Ads Permitido</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={dsaAllowed}
                    onChange={(e) => setDsaAllowed(e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>DSA Permitido</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Notas e Regras Específicas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Restrições da rede, termos contratuais, palavras-chave negativas obrigatórias..."
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
        </ModalPortal>
      )}
    </>
  );
}

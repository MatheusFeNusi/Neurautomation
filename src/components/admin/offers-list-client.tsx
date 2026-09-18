"use client";

import { useState } from "react";
import { Tag, Plus, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { DeleteRowButton } from "./delete-row-button";
import { Button } from "@/components/ui/button";
import { Offer, Store, OfferStatus } from "@/types/affiliate";
import { formatCurrency } from "@/lib/metrics";

interface OffersListClientProps {
  initialOffers: Offer[];
  stores: Store[];
}

export function OffersListClient({ initialOffers, stores }: OffersListClientProps) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [storeId, setStoreId] = useState(stores[0]?.id || "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [landingPageUrl, setLandingPageUrl] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [payoutType, setPayoutType] = useState<"percentage" | "fixed">("percentage");
  const [payoutValue, setPayoutValue] = useState("");
  const [status, setStatus] = useState<OfferStatus>("active");

  const handleDeleted = () => window.location.reload();

  const filteredOffers = offers.filter(
    (o) => selectedStore === "all" || o.store_id === selectedStore
  );

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          name,
          description: description || null,
          landing_page_url: landingPageUrl || null,
          affiliate_link: affiliateLink || null,
          payout_type: payoutType,
          payout_value: Number(payoutValue) || 0,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar oferta.");

      setOffers([data.offer, ...offers]);
      setIsModalOpen(false);
      setName("");
      setDescription("");
      setLandingPageUrl("");
      setAffiliateLink("");
      setPayoutValue("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <span>Catálogo de Ofertas</span>
            <span className="text-xs bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded-full border border-purple-200">
              {filteredOffers.length} Ofertas
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Cadastre os produtos e ofertas específicos vinculados às lojas de afiliação
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-9 px-3.5 rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nova Oferta</span>
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
        <label className="text-xs text-gray-600">Filtrar por Loja:</label>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-purple-500"
        >
          <option value="all" className="bg-white text-gray-900">Todas as Lojas</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id} className="bg-white text-gray-900">
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-semibold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Oferta / Descrição</th>
              <th className="py-3 px-3">Loja Vinculada</th>
              <th className="py-3 px-3">Comissão Prevista</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-center">Links</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOffers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  Nenhuma oferta cadastrada. Clique em &quot;+ Nova Oferta&quot; acima.
                </td>
              </tr>
            ) : (
              filteredOffers.map((offer) => {
                const store = stores.find((s) => s.id === offer.store_id);
                return (
                  <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{offer.name}</div>
                      <div className="text-[11px] text-gray-400">{offer.description || "Sem descrição"}</div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-gray-800">
                      {store ? store.name : "Loja Desconhecida"}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-purple-700">
                      {offer.payout_type === "percentage" ? `${offer.payout_value}%` : formatCurrency(offer.payout_value)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                        {offer.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center space-x-2">
                      {offer.landing_page_url && (
                        <a
                          href={offer.landing_page_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded"
                        >
                          <span>Página</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {offer.affiliate_link && (
                        <a
                          href={offer.affiliate_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-700 bg-purple-50 px-2 py-0.5 rounded"
                        >
                          <span>Link Afiliado</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <DeleteRowButton
                        endpoint={`/api/admin/offers/${offer.id}`}
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

      {/* Modal Nova Oferta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h2 className="text-base font-semibold text-gray-900">Adicionar Oferta</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-500/30 text-red-600 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateOffer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Loja *</label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  required
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id} className="bg-white text-gray-900">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome da Oferta / Produto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Tênis Air Zoom Pegasus 41"
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Payout</label>
                  <select
                    value={payoutType}
                    onChange={(e) => setPayoutType(e.target.value as "percentage" | "fixed")}
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                  >
                    <option value="percentage" className="bg-white text-gray-900">Porcentagem (%)</option>
                    <option value="fixed" className="bg-white text-gray-900">Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Valor do Payout *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={payoutValue}
                    onChange={(e) => setPayoutValue(e.target.value)}
                    placeholder="Ex: 8.5"
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Landing Page URL</label>
                <input
                  type="url"
                  value={landingPageUrl}
                  onChange={(e) => setLandingPageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Link de Afiliado</label>
                <input
                  type="url"
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  placeholder="https://awin1.com/..."
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-gray-200 text-gray-600 hover:text-gray-900"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

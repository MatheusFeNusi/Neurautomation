"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FlaskConical, AlertCircle, CheckCircle2, ArrowRight, Gauge } from "lucide-react";
import { Store, Offer, Campaign, AdSpend, Sale } from "@/types/affiliate";
import { calculateMetrics, formatCurrency, formatPercent } from "@/lib/metrics";

interface TestingClientProps {
  stores: Store[];
  offers: Offer[];
  campaigns: Campaign[];
  adSpends: AdSpend[];
  sales: Sale[];
}

export function TestingClient({ stores, offers, campaigns, adSpends, sales }: TestingClientProps) {
  // Apenas lojas e ofertas em teste
  const testingStores = useMemo(() => {
    return stores.filter((s) => s.status === "testing");
  }, [stores]);

  const testingOffers = useMemo(() => {
    return offers.filter((o) => o.status === "testing");
  }, [offers]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <span>Laboratório de Validação (Testing Hub)</span>
          <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-200">
            {testingStores.length} Lojas em Validação
          </span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Acompanhe novas lojas e ofertas antes de escalá-las para a esteira de produção ativa
        </p>
      </div>

      {/* Regras do Protocolo de Teste */}
      <div className="bg-white border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Gauge className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700">
          <strong className="text-gray-900 font-semibold">Protocolo de Validação da Neurautomation: </strong>
          Lojas em fase de teste devem receber no mínimo 50 a 100 cliques direcionados antes de qualquer intervenção de pausa. Evite tomar decisões prematuras sem significância estatística.
        </div>
      </div>

      {/* Grid de Lojas em Teste */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testingStores.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-gray-400 bg-white border border-gray-200 rounded-xl">
            <FlaskConical className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            Nenhuma loja está em status de teste no momento. Todas as lojas cadastradas estão ativas ou pausadas.
          </div>
        ) : (
          testingStores.map((store) => {
            const sp = adSpends.filter((s) => s.store_id === store.id);
            const sl = sales.filter((s) => s.store_id === store.id);
            const m = calculateMetrics(sp, sl);

            const clicksGoal = 100;
            const progress = Math.min(100, (m.clicks / clicksGoal) * 100);

            return (
              <div key={store.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{store.name}</h2>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {store.affiliate_network} • {store.category || "Geral"}
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    Testing
                  </span>
                </div>

                {/* Barra de Progresso de Amostragem */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-600">Amostragem de Tráfego:</span>
                    <span className="text-gray-900 font-mono">{m.clicks} / {clicksGoal} cliques ({progress.toFixed(0)}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Métricas do Teste */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Investimento</span>
                    <strong className="text-gray-900">{formatCurrency(m.ad_spend)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Vendas</span>
                    <strong className="text-teal-600">{m.sales_count}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Comissão</span>
                    <strong className="text-purple-700">{formatCurrency(m.total_commission)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Lucro Real</span>
                    <strong className={m.profit >= 0 ? "text-emerald-600" : "text-red-600"}>
                      {formatCurrency(m.profit)}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">
                    {m.sales_count > 0 ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Primeira venda validada
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Aguardando primeira conversão
                      </span>
                    )}
                  </span>

                  <Link
                    href={`/admin/stores/${store.slug || store.id}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span>Ver loja completa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

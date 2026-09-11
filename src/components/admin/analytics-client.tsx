"use client";

import { useMemo } from "react";
import {
  HelpCircle,
  TrendingUp,
  DollarSign,
  AlertOctagon,
  Award,
  Sparkles,
  PieChart as PieIcon,
  Compass,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Store, Offer, Campaign, AdSpend, Sale } from "@/types/affiliate";
import { calculateMetrics, formatCurrency, formatPercent } from "@/lib/metrics";

interface AnalyticsClientProps {
  stores: Store[];
  offers: Offer[];
  campaigns: Campaign[];
  adSpends: AdSpend[];
  sales: Sale[];
}

export function AnalyticsClient({ stores, offers, campaigns, adSpends, sales }: AnalyticsClientProps) {
  const globalMetrics = useMemo(() => calculateMetrics(adSpends, sales), [adSpends, sales]);

  // Resposta para as 10 Perguntas Estratégicas
  const qAnswers = useMemo(() => {
    // 4. Lojas que mais vendem
    const storeSalesCount = stores.map((s) => {
      const sl = sales.filter((item) => item.store_id === s.id && item.status === "approved");
      const sp = adSpends.filter((item) => item.store_id === s.id);
      const m = calculateMetrics(sp, sl);
      return { store: s, metrics: m };
    });

    const topSellingStores = [...storeSalesCount].sort((a, b) => b.metrics.sales_count - a.metrics.sales_count);
    const topLosingStores = [...storeSalesCount].filter((s) => s.metrics.profit < 0).sort((a, b) => a.metrics.profit - b.metrics.profit);
    const storesNeedingData = storeSalesCount.filter((s) => s.metrics.clicks < 50 && s.store.status !== "archived");

    // 7. Campanhas funcionando (maior lucro e ROI)
    const campPerformance = campaigns.map((c) => {
      const sp = adSpends.filter((item) => item.campaign_id === c.id);
      const sl = sales.filter((item) => item.campaign_id === c.id && item.status === "approved");
      const m = calculateMetrics(sp, sl);
      return { campaign: c, metrics: m };
    }).sort((a, b) => b.metrics.profit - a.metrics.profit);

    // 8 e 9. Ofertas
    const offerPerformance = offers.map((o) => {
      const sl = sales.filter((item) => item.offer_id === o.id && item.status === "approved");
      const totalComm = sl.reduce((acc, curr) => acc + (Number(curr.commission) || 0), 0);
      return { offer: o, salesCount: sl.length, totalComm };
    }).sort((a, b) => b.totalComm - a.totalComm);

    // 10. Origens de tráfego
    const originsMap = new Map<string, number>();
    sales.forEach((s) => {
      originsMap.set(s.origin, (originsMap.get(s.origin) || 0) + 1);
    });

    return {
      topSelling: topSellingStores[0] || null,
      topLosing: topLosingStores[0] || null,
      needingData: storesNeedingData,
      bestCampaign: campPerformance[0] || null,
      bestOffer: offerPerformance[0] || null,
      worstOffer: offerPerformance.length > 1 ? offerPerformance[offerPerformance.length - 1] : null,
      origins: Array.from(originsMap.entries()),
    };
  }, [stores, offers, campaigns, adSpends, sales]);

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span>Central de Decisões Estratégicas</span>
          <span className="text-xs bg-teal-500/20 text-teal-300 font-medium px-2 py-0.5 rounded-full border border-teal-500/30">
            As 10 Respostas-Chave
          </span>
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Visão orientada à tomada de decisão rápida sem ambiguidade operacional
        </p>
      </div>

      {/* Grid com as 10 Perguntas Respondidas Diretamente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Quanto estou gastando? */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2">
          <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span>1. Quanto estou gastando?</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(globalMetrics.ad_spend)}
          </div>
          <p className="text-xs text-white/50">
            Distribuídos em {globalMetrics.clicks} cliques com CPC médio de {formatCurrency(globalMetrics.cpc)}.
          </p>
        </div>

        {/* 2. Quanto estou recebendo? */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2">
          <div className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>2. Quanto estou recebendo?</span>
          </div>
          <div className="text-2xl font-bold text-purple-300">
            {formatCurrency(globalMetrics.total_commission)}
          </div>
          <p className="text-xs text-white/50">
            Comissões de {globalMetrics.sales_count} vendas faturadas em {formatCurrency(globalMetrics.total_sales_value)}.
          </p>
        </div>

        {/* 3. Quanto estou lucrando? */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2">
          <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>3. Quanto estou lucrando?</span>
          </div>
          <div className={`text-2xl font-bold ${globalMetrics.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatCurrency(globalMetrics.profit)}
          </div>
          <p className="text-xs text-white/50">
            ROI líquido de {formatPercent(globalMetrics.roi)} sobre o capital investido.
          </p>
        </div>

        {/* 4. Qual loja está mais vendendo? */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2">
          <div className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>4. Qual loja está vendendo?</span>
          </div>
          {qAnswers.topSelling ? (
            <>
              <div className="text-lg font-bold text-white">
                {qAnswers.topSelling.store.name}
              </div>
              <p className="text-xs text-white/50">
                {qAnswers.topSelling.metrics.sales_count} vendas geradas • Lucro de {formatCurrency(qAnswers.topSelling.metrics.profit)}.
              </p>
            </>
          ) : (
            <div className="text-xs text-white/40">Nenhuma venda registrada ainda.</div>
          )}
        </div>

        {/* 5. Qual loja está dando prejuízo? */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2">
          <div className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>5. Qual loja está no prejuízo?</span>
          </div>
          {qAnswers.topLosing ? (
            <>
              <div className="text-lg font-bold text-red-400">
                {qAnswers.topLosing.store.name}
              </div>
              <p className="text-xs text-white/50">
                Prejuízo de {formatCurrency(qAnswers.topLosing.metrics.profit)} com CPA de {formatCurrency(qAnswers.topLosing.metrics.cpa)}.
              </p>
            </>
          ) : (
            <div className="text-xs text-emerald-400 font-medium">
              Nenhuma loja com prejuízo acumulado no momento!
            </div>
          )}
        </div>

        {/* 6. Qual loja precisa de mais dados? */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2">
          <div className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>6. Lojas precisando de dados?</span>
          </div>
          <div className="text-lg font-bold text-white">
            {qAnswers.needingData.length} Lojas
          </div>
          <p className="text-xs text-white/50">
            Abaixo de 50 cliques. Não altere lances antes de alcançar significância estatística.
          </p>
        </div>

        {/* 7. Qual campanha está funcionando? */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2">
          <div className="text-[10px] uppercase font-bold text-teal-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>7. Campanha de melhor tração?</span>
          </div>
          {qAnswers.bestCampaign ? (
            <>
              <div className="text-base font-bold text-white truncate">
                {qAnswers.bestCampaign.campaign.name}
              </div>
              <p className="text-xs text-white/50">
                Lucro de {formatCurrency(qAnswers.bestCampaign.metrics.profit)} (ROI {formatPercent(qAnswers.bestCampaign.metrics.roi)}).
              </p>
            </>
          ) : (
            <div className="text-xs text-white/40">Nenhuma campanha cadastrada.</div>
          )}
        </div>

        {/* 8. Qual oferta merece mais orçamento? */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2">
          <div className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>8. Oferta p/ escalar orçamento?</span>
          </div>
          {qAnswers.bestOffer ? (
            <>
              <div className="text-base font-bold text-white truncate">
                {qAnswers.bestOffer.offer.name}
              </div>
              <p className="text-xs text-white/50">
                {formatCurrency(qAnswers.bestOffer.totalComm)} gerados em {qAnswers.bestOffer.salesCount} conversões.
              </p>
            </>
          ) : (
            <div className="text-xs text-white/40">Sem dados de ofertas.</div>
          )}
        </div>

        {/* 9. Qual oferta deve ser pausada? */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2">
          <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>9. Oferta com menor tração?</span>
          </div>
          {qAnswers.worstOffer ? (
            <>
              <div className="text-base font-bold text-white truncate">
                {qAnswers.worstOffer.offer.name}
              </div>
              <p className="text-xs text-white/50">
                Apenas {qAnswers.worstOffer.salesCount} vendas. Avalie pausar ou trocar criativo.
              </p>
            </>
          ) : (
            <div className="text-xs text-white/40">Sem ofertas para pausar.</div>
          )}
        </div>

        {/* 10. De onde veio cada venda? */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2 md:col-span-2 lg:col-span-3">
          <div className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
            <PieIcon className="w-3.5 h-3.5" />
            <span>10. Distribuição Real das Origens de Venda</span>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            {qAnswers.origins.map(([origin, count]) => (
              <div key={origin} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs">
                <span className="text-white/60 capitalize">{origin.replace("_", " ")}: </span>
                <strong className="text-white font-bold">{count} vendas</strong>
                <span className="text-[10px] text-white/40 ml-1.5">
                  ({((count / (sales.length || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

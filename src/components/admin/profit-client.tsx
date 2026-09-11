"use client";

import { useMemo } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Flame, Sparkles } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Store, AdSpend, Sale } from "@/types/affiliate";
import { calculateMetrics, formatCurrency, formatPercent } from "@/lib/metrics";

interface ProfitClientProps {
  stores: Store[];
  adSpends: AdSpend[];
  sales: Sale[];
}

export function ProfitClient({ stores, adSpends, sales }: ProfitClientProps) {
  const globalMetrics = useMemo(() => calculateMetrics(adSpends, sales), [adSpends, sales]);

  const margin = globalMetrics.total_commission > 0
    ? (globalMetrics.profit / globalMetrics.total_commission) * 100
    : 0;

  // Lojas mais lucrativas vs deficitárias
  const storeProfits = useMemo(() => {
    return stores.map((s) => {
      const sp = adSpends.filter((item) => item.store_id === s.id);
      const sl = sales.filter((item) => item.store_id === s.id);
      const m = calculateMetrics(sp, sl);

      return {
        store: s,
        metrics: m,
      };
    }).sort((a, b) => b.metrics.profit - a.metrics.profit);
  }, [stores, adSpends, sales]);

  const profitableStores = storeProfits.filter((p) => p.metrics.profit > 0);
  const losingStores = storeProfits.filter((p) => p.metrics.profit < 0);

  // Evolução de Lucro por data
  const profitTimeline = useMemo(() => {
    const dates = Array.from(new Set([...adSpends.map((s) => s.date), ...sales.map((s) => s.date)])).sort();

    return dates.reduce<
      { date: string; profit: number; cumulativeProfit: number }[]
    >((acc, d) => {
      const dayCost = adSpends.filter((s) => s.date === d).reduce((sum, curr) => sum + (Number(curr.cost) || 0), 0);
      const dayComm = sales
        .filter((s) => s.date === d && s.status === "approved")
        .reduce((sum, curr) => sum + (Number(curr.commission) || 0), 0);
      const dayProfit = dayComm - dayCost;
      const prevCumulative = acc.length > 0 ? acc[acc.length - 1].cumulativeProfit : 0;

      acc.push({
        date: d.slice(5),
        profit: dayProfit,
        cumulativeProfit: prevCumulative + dayProfit,
      });
      return acc;
    }, []);
  }, [adSpends, sales]);

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span>Análise de Lucratividade Líquida</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
            Bottom-Line Real
          </span>
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Visão consolidada da margem líquida real (Comissões Faturadas − Custos de Anúncio)
        </p>
      </div>

      {/* Cards Principais de Lucro */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-white/40">Lucro Líquido Acumulado</div>
          <div className={`text-2xl font-bold mt-1 ${globalMetrics.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatCurrency(globalMetrics.profit)}
          </div>
          <div className="text-[11px] text-white/40 mt-1 flex items-center gap-1">
            {globalMetrics.profit >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />}
            <span>ROI Geral de {formatPercent(globalMetrics.roi)}</span>
          </div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-white/40">Margem Líquida</div>
          <div className="text-2xl font-bold text-white mt-1">{formatPercent(margin)}</div>
          <div className="text-[11px] text-white/40 mt-1">Percentual retido de comissão</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-white/40">Lojas no Lucro (Operação Verde)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {profitableStores.length}
          </div>
          <div className="text-[11px] text-white/40 mt-1">Lojas com retorno positivo</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-white/40">Lojas com Prejuízo (Atenção)</div>
          <div className="text-2xl font-bold text-red-400 mt-1">
            {losingStores.length}
          </div>
          <div className="text-[11px] text-white/40 mt-1">Exigem ajuste de lance ou pausa</div>
        </div>
      </div>

      {/* Gráfico de Lucro Acumulado */}
      <div className="bg-[#121216] border border-white/10 rounded-xl p-5 space-y-3">
        <div className="text-sm font-bold text-white">Curva de Lucro Líquido Acumulado</div>
        {profitTimeline.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-white/30 text-xs border border-dashed border-white/10 rounded-lg">
            Sem histórico suficiente para traçar a curva de lucro.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfitLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} />
                <YAxis stroke="#ffffff40" fontSize={11} tickFormatter={(val) => `R$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#ffffff20", borderRadius: 8, fontSize: 12 }}
                  formatter={(val: unknown) => [formatCurrency(Number(val) || 0), ""]}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="Lucro Acumulado"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfitLine)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Comparativo de Lojas Lucrativas vs Lojas no Vermelho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Lucrativas */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" />
            <span>Lojas Mais Lucrativas (Candidatas à Escala)</span>
          </h2>

          <div className="space-y-2">
            {profitableStores.length === 0 ? (
              <div className="text-xs text-white/40 py-4">Nenhuma loja com lucro positivo ainda.</div>
            ) : (
              profitableStores.map(({ store, metrics }) => (
                <div key={store.id} className="p-3 bg-white/[0.02] border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{store.name}</div>
                    <div className="text-[10px] text-white/40">Gasto: {formatCurrency(metrics.ad_spend)} • Comissão: {formatCurrency(metrics.total_commission)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">+{formatCurrency(metrics.profit)}</div>
                    <div className="text-[10px] text-emerald-300 font-mono">ROI {formatPercent(metrics.roi)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lojas no Prejuízo */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-red-400 flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4" />
            <span>Lojas em Prejuízo (Ação Recomendada)</span>
          </h2>

          <div className="space-y-2">
            {losingStores.length === 0 ? (
              <div className="text-xs text-white/40 py-4">Nenhuma loja em prejuízo no período atual.</div>
            ) : (
              losingStores.map(({ store, metrics }) => (
                <div key={store.id} className="p-3 bg-white/[0.02] border border-red-500/20 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{store.name}</div>
                    <div className="text-[10px] text-white/40">Gasto: {formatCurrency(metrics.ad_spend)} • Comissão: {formatCurrency(metrics.total_commission)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-400">{formatCurrency(metrics.profit)}</div>
                    <div className="text-[10px] text-red-300 font-mono">Prejuízo Líquido</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

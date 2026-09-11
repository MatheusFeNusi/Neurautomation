"use client";

import { useMemo } from "react";
import { Coins, CheckCircle, Clock, XCircle, Building2, TrendingUp, Download } from "lucide-react";
import { Sale, Store } from "@/types/affiliate";
import { formatCurrency } from "@/lib/metrics";
import { exportSalesCsv } from "@/lib/export-csv";

interface CommissionsClientProps {
  sales: Sale[];
  stores: Store[];
}

export function CommissionsClient({ sales, stores }: CommissionsClientProps) {
  // Métricas Consolidadas
  const totalApproved = sales
    .filter((s) => s.status === "approved")
    .reduce((acc, curr) => acc + (Number(curr.commission) || 0), 0);

  const totalPending = sales
    .filter((s) => s.status === "pending")
    .reduce((acc, curr) => acc + (Number(curr.commission) || 0), 0);

  const totalRejected = sales
    .filter((s) => s.status === "rejected" || s.status === "refunded")
    .reduce((acc, curr) => acc + (Number(curr.commission) || 0), 0);

  // Agrupado por Rede de Afiliados
  const networkBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        network: string;
        total: number;
        approved: number;
        pending: number;
        salesCount: number;
      }
    >();

    sales.forEach((s) => {
      const net = s.affiliate_network || "Outra";
      const existing = map.get(net) || {
        network: net,
        total: 0,
        approved: 0,
        pending: 0,
        salesCount: 0,
      };

      const comm = Number(s.commission) || 0;
      existing.total += comm;
      if (s.status === "approved") existing.approved += comm;
      if (s.status === "pending") existing.pending += comm;
      existing.salesCount += 1;

      map.set(net, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [sales]);

  // Agrupado por Loja
  const storeBreakdown = (() => {
    const map = new Map<
      string,
      {
        storeName: string;
        network: string;
        total: number;
        approved: number;
        salesCount: number;
      }
    >();

    sales.forEach((s) => {
      const st = stores.find((store) => store.id === s.store_id);
      const name = st ? st.name : "Loja Desconhecida";
      const existing = map.get(s.store_id) || {
        storeName: name,
        network: s.affiliate_network,
        total: 0,
        approved: 0,
        salesCount: 0,
      };

      const comm = Number(s.commission) || 0;
      existing.total += comm;
      if (s.status === "approved") existing.approved += comm;
      existing.salesCount += 1;

      map.set(s.store_id, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  })();

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Conciliação de Comissões</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 font-medium px-2 py-0.5 rounded-full border border-purple-500/30">
              Auditoria Financeira
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Acompanhamento de repasses por rede de afiliados, valores liquidados e provisões pendentes
          </p>
        </div>

        <button
          onClick={() => exportSalesCsv(sales)}
          disabled={sales.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed self-start"
          title="Exportar todas as comissões em CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Top 3 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Comissões Aprovadas (Liquidadas)</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {formatCurrency(totalApproved)}
          </div>
          <div className="text-[11px] text-white/40 mt-1">Disponíveis para resgate / confirmadas</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Comissões Pendentes (Em Validação)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-2">
            {formatCurrency(totalPending)}
          </div>
          <div className="text-[11px] text-white/40 mt-1">Aguardando janela de estorno da rede</div>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Comissões Rejeitadas / Reembolsadas</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-2">
            {formatCurrency(totalRejected)}
          </div>
          <div className="text-[11px] text-white/40 mt-1">Cancelamentos ou devoluções no e-commerce</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown por Rede */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-purple-400" />
              <span>Volume por Rede de Afiliados</span>
            </h2>
            <span className="text-xs text-white/40">{networkBreakdown.length} redes ativas</span>
          </div>

          <div className="space-y-3">
            {networkBreakdown.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-xs">Nenhuma venda conciliada ainda.</div>
            ) : (
              networkBreakdown.map((net) => (
                <div key={net.network} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-xs">{net.network}</div>
                    <div className="text-[11px] text-white/40 mt-0.5">{net.salesCount} vendas geradas</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-purple-300">{formatCurrency(net.total)}</div>
                    <div className="text-[10px] text-emerald-400">
                      {formatCurrency(net.approved)} aprovado
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Breakdown por Loja */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Maiores Geradoras de Comissão</span>
            </h2>
            <span className="text-xs text-white/40">Ranking por faturamento</span>
          </div>

          <div className="space-y-3">
            {storeBreakdown.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-xs">Nenhum dado cadastrado.</div>
            ) : (
              storeBreakdown.slice(0, 5).map((st) => (
                <div key={st.storeName} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-xs">{st.storeName}</div>
                    <div className="text-[11px] text-white/40 mt-0.5">{st.network} • {st.salesCount} vendas</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white">{formatCurrency(st.total)}</div>
                    <div className="text-[10px] text-purple-400">
                      Méd. {formatCurrency(st.total / (st.salesCount || 1))} / pedido
                    </div>
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

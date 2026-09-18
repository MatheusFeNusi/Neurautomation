"use client";

import { useState } from "react";
import { Settings, ShieldCheck, Key, Webhook, Database, Sparkles, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState<"general" | "integrations" | "users">("integrations");

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <span>Configurações & Preparação de Integrações</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Gestão de acesso administrativo e credenciais para expansão incremental de APIs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("integrations")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "integrations" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Integrações Futuras</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "users" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Usuários & Permissões</span>
        </button>
        <button
          onClick={() => setActiveTab("general")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "general" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Geral & Banco de Dados</span>
        </button>
      </div>

      {/* Tab: Integrações Futuras */}
      {activeTab === "integrations" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-transparent border border-purple-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-800 leading-relaxed">
              <strong>Princípio Operacional da Fase 1:</strong> O sistema está operando em <strong>Modo 100% Manual Seguro</strong>. Toda a arquitetura do banco já contém chaves de deduplicação (<code>source</code>, <code>source_id</code> e <code>imported_at</code>) para que quando as chaves de API forem inseridas, a sincronização ocorra sem qualquer quebra de dados.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Ads API */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-gray-900 text-sm">Google Ads API</div>
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                  Fase 2 (Pronto para Plug)
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Sincronização automática de cliques, impressões, CTR e custo diário por campanha.
              </p>

              <div className="space-y-2 pt-2">
                <div>
                  <label className="text-[10px] text-gray-600 block">Developer Token</label>
                  <input
                    type="password"
                    disabled
                    placeholder="••••••••••••••••••••"
                    className="w-full bg-gray-100 border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-600 block">Customer ID / MCC</label>
                  <input
                    type="text"
                    disabled
                    placeholder="123-456-7890"
                    className="w-full bg-gray-100 border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Redes de Afiliados */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-gray-900 text-sm">APIs de Redes de Afiliados</div>
                <span className="text-[10px] bg-blue-500/15 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                  Awin / Lomadee / Rakuten
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Coleta automática de transações, estornos e confirmações de comissão.
              </p>

              <div className="space-y-2 pt-2">
                <div>
                  <label className="text-[10px] text-gray-600 block">Awin API Key / OAuth Token</label>
                  <input
                    type="password"
                    disabled
                    placeholder="••••••••••••••••••••"
                    className="w-full bg-gray-100 border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-600 block">Lomadee App Token</label>
                  <input
                    type="password"
                    disabled
                    placeholder="••••••••••••••••••••"
                    className="w-full bg-gray-100 border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Webhooks & Postbacks */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-gray-900 text-sm">Webhooks & Postbacks Globais</div>
                <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded">
                  Endpoint Ativo
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Receba vendas em tempo real via postback HTTP POST diretamente das redes ou gateways.
              </p>

              <div className="space-y-2 pt-2">
                <div>
                  <label className="text-[10px] text-gray-600 block">URL de Postback Recebimento</label>
                  <input
                    type="text"
                    readOnly
                    value="https://neurautomation.com/api/webhooks/sales"
                    className="w-full bg-gray-100 border border-gray-200 rounded px-2.5 py-1 text-xs text-teal-700 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Similarweb / Fontes de Inteligência */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-gray-900 text-sm">Similarweb & Tráfego Competitivo</div>
                <span className="text-[10px] bg-purple-500/15 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                  Pesquisa de Concorrência
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Estimativas de volume de tráfego, share de busca e principais anunciantes concorrentes.
              </p>

              <div className="space-y-2 pt-2">
                <div>
                  <label className="text-[10px] text-gray-600 block">Similarweb API Key</label>
                  <input
                    type="password"
                    disabled
                    placeholder="••••••••••••••••••••"
                    className="w-full bg-gray-100 border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Usuários & Permissões */}
      {activeTab === "users" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Controle de Acesso por Função (RBAC)</h2>
              <p className="text-xs text-gray-400">Definição estrita de papéis no Supabase Auth</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900 text-xs">Administrador (Admin)</div>
                <div className="text-[11px] text-gray-500">Acesso irrestrito a todas as 300 lojas, gastos, vendas e configurações.</div>
              </div>
              <span className="text-emerald-600 text-xs font-semibold">Seu Papel Atual</span>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between opacity-70">
              <div>
                <div className="font-semibold text-gray-900 text-xs">Gestor de Afiliados (Affiliate Manager)</div>
                <div className="text-[11px] text-gray-500">Pode lançar vendas, cadastrar ofertas e campanhas, sem acesso a alterar configurações globais.</div>
              </div>
              <span className="text-gray-400 text-xs">Disponível</span>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between opacity-70">
              <div>
                <div className="font-semibold text-gray-900 text-xs">Visualizador (Viewer / Auditor)</div>
                <div className="text-[11px] text-gray-500">Somente leitura para relatórios e acompanhamento de auditoria.</div>
              </div>
              <span className="text-gray-400 text-xs">Disponível</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Geral & Banco de Dados */}
      {activeTab === "general" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="text-sm font-bold text-gray-900">Schema e Migrações do Banco de Dados</div>
          <p className="text-xs text-gray-500">
            O schema oficial com RLS, índices e triggers está gravado em:
          </p>
          <div className="bg-gray-100 border border-gray-200 p-3 rounded-lg font-mono text-xs text-purple-700">
            supabase/migrations/20260910000000_admin_affiliate_schema.sql
          </div>

          <div className="pt-2 text-xs text-gray-700 space-y-1.5">
            <div>✓ Chave única de deduplicação ativa em <code>ad_spend</code> (campaign_id, date, source, source_id)</div>
            <div>✓ Restrição de integridade ativa em <code>sales</code> (chk_attribution_requires_click)</div>
            <div>✓ Políticas de RLS habilitadas em todas as 6 tabelas</div>
          </div>
        </div>
      )}
    </div>
  );
}

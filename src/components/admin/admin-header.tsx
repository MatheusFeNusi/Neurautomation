"use client";

import { Store, Offer, Campaign } from "@/types/affiliate";
import { AddSaleModal } from "./add-sale-modal";
import { AddStoreModal } from "./add-store-modal";
import { AddSpendModal } from "./add-spend-modal";
import { Search, Globe } from "lucide-react";
import Link from "next/link";

interface AdminHeaderProps {
  stores: Store[];
  offers: Offer[];
  campaigns: Campaign[];
}

export function AdminHeader({ stores, offers, campaigns }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-white/10 bg-[#0e0e11]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Link para a página inicial do site */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400/80 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Ver Site</span>
      </Link>

      {/* Quick Search */}
      <div className="flex items-center gap-3 w-80">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Buscar loja, campanha, rede ou venda..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Global Quick Action Buttons */}
      <div className="flex items-center gap-2.5">
        <AddStoreModal />
        <AddSpendModal stores={stores} campaigns={campaigns} />
        <AddSaleModal stores={stores} offers={offers} campaigns={campaigns} />
      </div>
    </header>
  );
}

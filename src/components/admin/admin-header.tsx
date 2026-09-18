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
    <header className="h-16 border-b border-gray-200 bg-white/85 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Link para a página inicial do site */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600/80 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Ver Site</span>
      </Link>

      {/* Quick Search */}
      <div className="flex items-center gap-3 w-80">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar loja, campanha, rede ou venda..."
            className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
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

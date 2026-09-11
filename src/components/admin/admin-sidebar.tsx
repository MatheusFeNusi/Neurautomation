"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Tag,
  Megaphone,
  ShoppingCart,
  Coins,
  DollarSign,
  TrendingUp,
  BarChart3,
  Activity,
  FlaskConical,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { AdminUser } from "@/lib/auth-admin";

interface AdminSidebarProps {
  user: AdminUser;
}

const NAV_ITEMS = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/stores", label: "Stores", icon: Store },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/sales", label: "Sales", icon: ShoppingCart },
  { href: "/admin/commissions", label: "Commissions", icon: Coins },
  { href: "/admin/ad-spend", label: "Ad Spend", icon: DollarSign },
  { href: "/admin/profit", label: "Profit", icon: TrendingUp },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/performance", label: "Store Performance", icon: Activity },
  { href: "/admin/testing", label: "Testing", icon: FlaskConical },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-[#0c0c0e] flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-5">
        <Link href="/admin/overview" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 via-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-white text-xs font-black tracking-wider">NA</span>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-white">Neurautomation</div>
            <div className="text-[10px] text-purple-400 font-medium">Affiliate Admin Hub</div>
          </div>
        </Link>
      </div>

      {/* User Role Badge */}
      <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300">
              {user.role}
            </span>
          </div>
          {user.isDevBypass && (
            <span className="text-[9px] bg-amber-500/20 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded">
              DEV MODE
            </span>
          )}
        </div>
        <div className="text-xs text-white/50 truncate mt-0.5">{user.email}</div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Módulos de Gestão
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin/overview" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/10 text-white border border-purple-500/30 font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-white/40"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-white/10 bg-black/40">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

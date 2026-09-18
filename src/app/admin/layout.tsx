import { requireAdminUser } from "@/lib/auth-admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { getStores, getOffers, getCampaigns } from "@/lib/affiliate-service";

export const metadata = {
  title: "Admin Hub | Neurautomation",
  description: "Dashboard Central de Marketing de Afiliados e Controle Operacional",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();
  const [stores, offers, campaigns] = await Promise.all([
    getStores(),
    getOffers(),
    getCampaigns(),
  ]);

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Sidebar Lateral */}
      <AdminSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader stores={stores} offers={offers} campaigns={campaigns} />

        {user.isDevBypass && (
          <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-transparent border-b border-amber-500/20 px-6 py-2 text-[11px] text-amber-200 flex items-center justify-between">
            <div>
              <strong>Ambiente de Demonstração / Dev:</strong> Chaves do Supabase ainda não detectadas no <code>.env.local</code>. O dashboard está operando com persistência híbrida e dados simulados completos para teste imediato.
            </div>
            <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              SUPABASE MIGRATION READY
            </span>
          </div>
        )}

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

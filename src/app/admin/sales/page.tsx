import { Metadata } from "next";
import { getSales, getStores, getOffers, getCampaigns } from "@/lib/affiliate-service";
import { SalesListClient } from "@/components/admin/sales-list-client";

export const metadata: Metadata = {
  title: "Vendas | Neurautomation Admin",
  description: "Registro e auditoria de vendas com atribuição rigorosa",
};

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const [sales, stores, offers, campaigns] = await Promise.all([
    getSales(),
    getStores(),
    getOffers(),
    getCampaigns(),
  ]);

  return (
    <SalesListClient
      initialSales={sales}
      stores={stores}
      offers={offers}
      campaigns={campaigns}
    />
  );
}

import { Metadata } from "next";
import { getStores, getOffers, getCampaigns, getAdSpends, getSales } from "@/lib/affiliate-service";
import { OverviewClient } from "@/components/admin/overview-client";

export const metadata: Metadata = {
  title: "Overview | Neurautomation Admin",
  description: "Visão consolidada da operação de marketing de afiliados",
};

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [stores, offers, campaigns, adSpends, sales] = await Promise.all([
    getStores(),
    getOffers(),
    getCampaigns(),
    getAdSpends(),
    getSales(),
  ]);

  return (
    <OverviewClient
      initialStores={stores}
      initialOffers={offers}
      initialCampaigns={campaigns}
      initialAdSpends={adSpends}
      initialSales={sales}
    />
  );
}

import { Metadata } from "next";
import { getStores, getOffers, getCampaigns, getAdSpends, getSales } from "@/lib/affiliate-service";
import { AnalyticsClient } from "@/components/admin/analytics-client";

export const metadata: Metadata = {
  title: "Analytics & Decisões | Neurautomation Admin",
  description: "Respostas diretas para as 10 perguntas essenciais de marketing de afiliados",
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [stores, offers, campaigns, adSpends, sales] = await Promise.all([
    getStores(),
    getOffers(),
    getCampaigns(),
    getAdSpends(),
    getSales(),
  ]);

  return (
    <AnalyticsClient
      stores={stores}
      offers={offers}
      campaigns={campaigns}
      adSpends={adSpends}
      sales={sales}
    />
  );
}

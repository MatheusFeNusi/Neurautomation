import { Metadata } from "next";
import { getCampaigns, getStores, getOffers, getAdSpends, getSales } from "@/lib/affiliate-service";
import { CampaignsListClient } from "@/components/admin/campaigns-list-client";

export const metadata: Metadata = {
  title: "Campanhas | Neurautomation Admin",
  description: "Gerenciamento de campanhas de tráfego pago e Google Ads",
};

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const [campaigns, stores, offers, adSpends, sales] = await Promise.all([
    getCampaigns(),
    getStores(),
    getOffers(),
    getAdSpends(),
    getSales(),
  ]);

  return (
    <CampaignsListClient
      initialCampaigns={campaigns}
      stores={stores}
      offers={offers}
      adSpends={adSpends}
      sales={sales}
    />
  );
}

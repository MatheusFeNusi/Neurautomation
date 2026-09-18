import { Metadata } from "next";
import { getAdSpends, getStores, getCampaigns } from "@/lib/affiliate-service";
import { AdSpendClient } from "@/components/admin/ad-spend-client";

export const metadata: Metadata = {
  title: "Investimento em Anúncios | Neurautomation Admin",
  description: "Lançamento diário de custos de campanhas e deduplicação",
};

export const dynamic = "force-dynamic";

export default async function AdSpendPage() {
  const [adSpends, stores, campaigns] = await Promise.all([
    getAdSpends(),
    getStores(),
    getCampaigns(),
  ]);

  return (
    <AdSpendClient
      initialAdSpends={adSpends}
      stores={stores}
      campaigns={campaigns}
    />
  );
}

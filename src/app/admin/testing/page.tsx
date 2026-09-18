import { Metadata } from "next";
import { getStores, getOffers, getCampaigns, getAdSpends, getSales } from "@/lib/affiliate-service";
import { TestingClient } from "@/components/admin/testing-client";

export const metadata: Metadata = {
  title: "Testing Hub | Neurautomation Admin",
  description: "Monitoramento de validação e testes de novas lojas e campanhas",
};

export const dynamic = "force-dynamic";

export default async function TestingPage() {
  const [stores, offers, campaigns, adSpends, sales] = await Promise.all([
    getStores(),
    getOffers(),
    getCampaigns(),
    getAdSpends(),
    getSales(),
  ]);

  return (
    <TestingClient
      stores={stores}
      offers={offers}
      campaigns={campaigns}
      adSpends={adSpends}
      sales={sales}
    />
  );
}

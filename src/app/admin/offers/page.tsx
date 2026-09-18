import { Metadata } from "next";
import { getOffers, getStores } from "@/lib/affiliate-service";
import { OffersListClient } from "@/components/admin/offers-list-client";

export const metadata: Metadata = {
  title: "Ofertas | Neurautomation Admin",
  description: "Gerenciamento de ofertas e produtos de afiliados",
};

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const [offers, stores] = await Promise.all([getOffers(), getStores()]);

  return <OffersListClient initialOffers={offers} stores={stores} />;
}

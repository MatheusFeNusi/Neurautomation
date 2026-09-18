import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getStoreBySlug, getOffers, getCampaigns, getAdSpends, getSales } from "@/lib/affiliate-service";
import { StoreDetailClient } from "@/components/admin/store-detail-client";

interface StoreDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StoreDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    return { title: "Loja não encontrada | Neurautomation Admin" };
  }

  return {
    title: `${store.name} | Neurautomation Admin`,
    description: `Performance e controle de orçamento para ${store.name}`,
  };
}

export const dynamic = "force-dynamic";

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  const [offers, campaigns, adSpends, sales] = await Promise.all([
    getOffers(store.id),
    getCampaigns(store.id),
    getAdSpends(store.id),
    getSales(store.id),
  ]);

  return (
    <StoreDetailClient
      store={store}
      offers={offers}
      campaigns={campaigns}
      adSpends={adSpends}
      sales={sales}
    />
  );
}

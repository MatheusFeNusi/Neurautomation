import { Metadata } from "next";
import { getStores, getAdSpends, getSales } from "@/lib/affiliate-service";
import { StoresListClient } from "@/components/admin/stores-list-client";

export const metadata: Metadata = {
  title: "Lojas Afiliadas | Neurautomation Admin",
  description: "Gerenciamento de até 300 lojas afiliadas com orçamento e regras de tráfego",
};

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  const [stores, adSpends, sales] = await Promise.all([
    getStores(),
    getAdSpends(),
    getSales(),
  ]);

  return (
    <StoresListClient
      initialStores={stores}
      adSpends={adSpends}
      sales={sales}
    />
  );
}

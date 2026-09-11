import { Metadata } from "next";
import { getStores, getAdSpends, getSales } from "@/lib/affiliate-service";
import { ProfitClient } from "@/components/admin/profit-client";

export const metadata: Metadata = {
  title: "Lucratividade | Neurautomation Admin",
  description: "Análise de lucro líquido real, margens e ROI por loja afiliada",
};

export const dynamic = "force-dynamic";

export default async function ProfitPage() {
  const [stores, adSpends, sales] = await Promise.all([
    getStores(),
    getAdSpends(),
    getSales(),
  ]);

  return <ProfitClient stores={stores} adSpends={adSpends} sales={sales} />;
}

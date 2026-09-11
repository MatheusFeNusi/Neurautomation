import { Metadata } from "next";
import { getStores, getAdSpends, getSales } from "@/lib/affiliate-service";
import { PerformanceClient } from "@/components/admin/performance-client";

export const metadata: Metadata = {
  title: "Store Performance | Neurautomation Admin",
  description: "Matriz comparativa de até 300 lojas com filtros e ordenação multi-critério",
};

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const [stores, adSpends, sales] = await Promise.all([
    getStores(),
    getAdSpends(),
    getSales(),
  ]);

  return <PerformanceClient stores={stores} adSpends={adSpends} sales={sales} />;
}

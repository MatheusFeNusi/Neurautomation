import { Metadata } from "next";
import { getSales, getStores } from "@/lib/affiliate-service";
import { CommissionsClient } from "@/components/admin/commissions-client";

export const metadata: Metadata = {
  title: "Comissões | Neurautomation Admin",
  description: "Auditoria e conciliação de comissões por rede de afiliados",
};

export const dynamic = "force-dynamic";

export default async function CommissionsPage() {
  const [sales, stores] = await Promise.all([getSales(), getStores()]);

  return <CommissionsClient sales={sales} stores={stores} />;
}

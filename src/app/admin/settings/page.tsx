import { Metadata } from "next";
import { SettingsClient } from "@/components/admin/settings-client";

export const metadata: Metadata = {
  title: "Configurações | Neurautomation Admin",
  description: "Gerenciamento de integrações futuras e papéis administrativos",
};

export default function SettingsPage() {
  return <SettingsClient />;
}

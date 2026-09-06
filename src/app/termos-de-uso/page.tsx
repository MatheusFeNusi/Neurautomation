import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Termos de Uso | Neurautomation",
};

export default function TermosDeUsoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20">
        <h1 className="text-3xl font-semibold">Termos de Uso</h1>
        <p className="mt-6 text-white/60">
          O uso deste site e da área restrita é destinado a clientes e
          parceiros da Neurautomation. As credenciais de acesso são pessoais e
          intransferíveis.
        </p>
        <p className="mt-4 text-white/60">
          Conteúdos, marcas e materiais publicados pertencem à Neurautomation e
          não podem ser reproduzidos sem autorização prévia.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

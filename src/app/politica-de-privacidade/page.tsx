import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Política de Privacidade | Neurautomation",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20">
        <h1 className="text-3xl font-semibold">Política de Privacidade</h1>
        <p className="mt-6 text-white/60">
          A Neurautomation trata dados pessoais conforme a LGPD (Lei nº
          13.709/2018). Coletamos apenas as informações necessárias para
          contato comercial e para o acesso à área restrita, e não
          compartilhamos esses dados com terceiros sem consentimento.
        </p>
        <p className="mt-4 text-white/60">
          Para solicitar acesso, correção ou exclusão dos seus dados, escreva
          para contato@neurautomation.com.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

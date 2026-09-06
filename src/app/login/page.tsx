import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/app/login/login-form";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login | Neurautomation",
  description: "Acesse a área restrita da Neurautomation.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 opacity-20 blur-3xl" />

        <Card className="relative z-10 w-full max-w-md border-white/20 bg-black/70 text-white shadow-xl shadow-white/5 backdrop-blur-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-xl">Área do Cliente</CardTitle>
            <p className="text-sm text-white/50">
              Acesse o painel com as credenciais fornecidas pela
              Neurautomation.
            </p>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<p className="text-sm text-white/50">Carregando…</p>}
            >
              <LoginForm />
            </Suspense>

            <p className="mt-6 text-center text-xs text-white/40">
              Ainda não tem acesso?{" "}
              <Link href="/#contato" className="text-white/70 hover:text-white">
                Fale com a nossa equipe
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

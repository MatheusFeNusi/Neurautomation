import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Painel | Neurautomation",
};

export default async function PainelPage() {
  if (!isSupabaseConfigured) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: roleCheck } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  const isAdmin = !!roleCheck;

  if (isAdmin) {
    redirect("/admin/overview");
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-lg">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500" />
            <span className="text-sm font-semibold uppercase tracking-[0.25em]">
              Neurautomation
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin/overview">
                <Button
                  type="button"
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
                >
                  Painel Admin
                </Button>
              </Link>
            )}
            <form action="/auth/signout" method="post">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              >
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-semibold">Painel do cliente</h1>
        <p className="mt-2 text-white/60">
          Você está autenticado como{" "}
          <span className="text-white">{user.email}</span>.
        </p>

        <Card className="mt-10 border-white/20 bg-white/5 text-white backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-lg">Em construção</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/60">
            A integração com o painel interno NeuraAI será liberada em breve.
            Enquanto isso, fale com a nossa equipe para acompanhar suas
            operações.
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

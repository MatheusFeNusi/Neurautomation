"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin/overview";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (signInError) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.replace(next);
  };

  const handlePasswordReset = async () => {
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    if (!email) {
      setError("Informe seu e-mail para receber o link de redefinição.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/painel`,
      },
    );
    setLoading(false);

    if (resetError) {
      setError("Não foi possível enviar o e-mail de redefinição.");
      return;
    }

    setInfo("Enviamos um link de redefinição para o seu e-mail.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/70">
          E-mail
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@empresa.com"
          className="border-white/20 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-white/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/70">
          Senha
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="border-white/20 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-white/30"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {info && <p className="text-sm text-teal-300">{info}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black hover:bg-white/85"
      >
        {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
        Entrar
      </Button>

      <button
        type="button"
        onClick={handlePasswordReset}
        disabled={loading}
        className="w-full text-center text-xs text-white/50 transition-colors hover:text-white disabled:opacity-50"
      >
        Esqueci minha senha
      </button>
    </form>
  );
}

import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "affiliate_manager" | "viewer";
  isDevBypass?: boolean;
}

const DEV_ADMIN: AdminUser = {
  id: "dev-admin-id",
  email: "admin@neurautomation.com",
  role: "admin",
  isDevBypass: true,
};

async function resolveAdminUser(): Promise<
  { user: AdminUser } | { reason: "unauthenticated" | "forbidden" }
> {
  if (!isSupabaseConfigured) {
    return { user: DEV_ADMIN };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { reason: "unauthenticated" };
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) {
    return { reason: "forbidden" };
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? "admin@neurautomation.com",
      role: "admin",
      isDevBypass: false,
    },
  };
}

/**
 * Validação de autenticação e role de administrador no lado do servidor (páginas).
 */
export async function requireAdminUser(
  currentPath: string = "/admin/overview",
): Promise<AdminUser> {
  const result = await resolveAdminUser();

  if ("user" in result) {
    return result.user;
  }

  if (result.reason === "unauthenticated") {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }

  redirect("/painel?unauthorized=admin");
}

/**
 * Mesma regra para Route Handlers: 401/403 em JSON em vez de redirect HTML.
 */
export async function requireAdminApi(): Promise<
  { user: AdminUser } | { response: NextResponse }
> {
  const result = await resolveAdminUser();

  if ("user" in result) {
    return { user: result.user };
  }

  if (result.reason === "unauthenticated") {
    return {
      response: NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 },
      ),
    };
  }

  return {
    response: NextResponse.json(
      { error: "Acesso restrito a administradores." },
      { status: 403 },
    ),
  };
}

import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-admin";
import { deleteStore, updateStore } from "@/lib/affiliate-service";
import { revalidatePath } from "next/cache";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  try {
    const { id } = await params;
    await deleteStore(id);
    revalidatePath("/admin/stores");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao excluir loja.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};

    // Campos textuais
    if (typeof body.name === "string") updates.name = body.name;
    if (typeof body.description === "string") updates.description = body.description;
    if (typeof body.country === "string") updates.country = body.country;
    if (typeof body.category === "string") updates.category = body.category;
    if (typeof body.affiliate_network === "string") updates.affiliate_network = body.affiliate_network;
    if (typeof body.affiliate_program === "string") updates.affiliate_program = body.affiliate_program;
    if (typeof body.status === "string") updates.status = body.status;
    if (typeof body.notes === "string") updates.notes = body.notes;

    // Booleans
    if (typeof body.brand_bidding_allowed === "boolean") updates.brand_bidding_allowed = body.brand_bidding_allowed;
    if (typeof body.google_ads_allowed === "boolean") updates.google_ads_allowed = body.google_ads_allowed;
    if (typeof body.dsa_allowed === "boolean") updates.dsa_allowed = body.dsa_allowed;

    // Números
    for (const field of ["daily_budget", "monthly_budget", "target_cpa", "max_cpc", "target_roi"] as const) {
      if (body[field] !== undefined && body[field] !== null) {
        const value = Number(body[field]);
        if (!Number.isNaN(value)) updates[field] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo válido para atualizar." }, { status: 400 });
    }

    const updatedStore = await updateStore(id, updates);
    revalidatePath("/admin/stores");
    revalidatePath(`/admin/stores/${updatedStore.slug}`);
    return NextResponse.json({ store: updatedStore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar loja.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
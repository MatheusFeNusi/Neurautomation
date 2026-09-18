import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-admin";
import { deleteSale } from "@/lib/affiliate-service";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  try {
    const { id } = await params;
    await deleteSale(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao excluir venda";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

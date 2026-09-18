import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-admin";
import { deleteAdSpend } from "@/lib/affiliate-service";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  try {
    const { id } = await params;
    await deleteAdSpend(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao excluir gasto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

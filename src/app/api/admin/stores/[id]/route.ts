import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-admin";
import { deleteStore } from "@/lib/affiliate-service";
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

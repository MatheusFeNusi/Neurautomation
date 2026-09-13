import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-admin";
import { updateNote, deleteNote } from "@/lib/notes-service";

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
    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.content === "string") updates.content = body.content;
    if (typeof body.done === "boolean") updates.done = body.done;
    if (typeof body.pinned === "boolean") updates.pinned = body.pinned;
    if (body.priority === "low" || body.priority === "medium" || body.priority === "high") {
      updates.priority = body.priority;
    }

    const updated = await updateNote(id, updates);
    return NextResponse.json({ note: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar nota";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  try {
    const { id } = await params;
    await deleteNote(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao excluir nota";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
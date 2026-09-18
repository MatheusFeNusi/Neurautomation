import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-admin";
import { getNotes, createNote } from "@/lib/notes-service";

export async function GET() {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  try {
    const notes = await getNotes();
    return NextResponse.json({ notes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao buscar notas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  try {
    const body = await req.json();
    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "O título da nota é obrigatório." }, { status: 400 });
    }

    const newNote = await createNote({
      title: body.title.trim(),
      content: body.content || null,
      done: Boolean(body.done),
      pinned: Boolean(body.pinned),
      priority: body.priority === "low" || body.priority === "high" ? body.priority : "medium",
    });

    return NextResponse.json({ note: newNote });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao criar nota";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
import { Metadata } from "next";
import { getNotes } from "@/lib/notes-service";
import { NotesClient } from "@/components/admin/notes-client";

export const metadata: Metadata = {
  title: "Notas & Tarefas | Neurautomation Admin",
  description: "Anotações operacionais e lista de tarefas do dia a dia",
};

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = await getNotes();

  return <NotesClient initialNotes={notes} />;
}
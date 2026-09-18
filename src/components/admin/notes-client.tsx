"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Pin,
  PinOff,
  CircleCheck,
  Circle,
  Trash2,
  Pencil,
  X,
  Search,
  Loader2,
  StickyNote,
} from "lucide-react";
import { Note, NotePriority } from "@/types/affiliate";

interface NotesClientProps {
  initialNotes: Note[];
}

type Filter = "all" | "pending" | "done";

const PRIORITY_STYLES: Record<NotePriority, { label: string; className: string }> = {
  high: { label: "Alta", className: "bg-red-500/15 text-red-700 border-red-500/30" },
  medium: { label: "Média", className: "bg-amber-50 text-amber-800 border-amber-200" },
  low: { label: "Baixa", className: "bg-emerald-500/15 text-emerald-700 border-emerald-200" },
};

export function NotesClient({ initialNotes }: NotesClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<NotePriority>("medium");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notes.filter((n) => {
      if (filter === "pending" && n.done) return false;
      if (filter === "done" && !n.done) return false;
      if (!term) return true;
      const haystack = `${n.title} ${n.content ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [notes, filter, search]);

  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredNotes]);

  const pendingCount = notes.filter((n) => !n.done).length;

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content, priority }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar nota.");
      setNotes((prev) => [data.note, ...prev]);
      setTitle("");
      setContent("");
      setPriority("medium");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar nota.");
    } finally {
      setCreating(false);
    }
  };

  const toggleDone = async (note: Note) => {
    setBusyId(note.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !note.done }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar nota.");
      setNotes((prev) => prev.map((n) => (n.id === note.id ? data.note : n)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar nota.");
    } finally {
      setBusyId(null);
    }
  };

  const togglePin = async (note: Note) => {
    setBusyId(note.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !note.pinned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar nota.");
      setNotes((prev) => prev.map((n) => (n.id === note.id ? data.note : n)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar nota.");
    } finally {
      setBusyId(null);
    }
  };

  const saveEdit = async (note: Note) => {
    if (!editTitle.trim()) return;
    setBusyId(note.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), content: editContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar nota.");
      setNotes((prev) => prev.map((n) => (n.id === note.id ? data.note : n)));
      setEditingId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar nota.");
    } finally {
      setBusyId(null);
    }
  };

  const removeNote = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta nota?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/notes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir nota.");
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir nota.");
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content ?? "");
  };

  const FILTERS: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "Todas", count: notes.length },
    { value: "pending", label: "Pendentes", count: pendingCount },
    { value: "done", label: "Concluídas", count: notes.length - pendingCount },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <StickyNote className="w-6 h-6 text-purple-600" />
          <span>Notas & Tarefas</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Anotações rápidas, lembretes e sua lista do que precisa fazer
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-500/30 text-red-700 rounded-lg px-4 py-2.5 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700/60 hover:text-red-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Criar nova nota */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
          <Plus className="w-4 h-4 text-purple-600" />
          <span>Nova Nota</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="O que você precisa fazer?"
            className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as NotePriority)}
            className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="low">Prioridade Baixa</option>
            <option value="medium">Prioridade Média</option>
            <option value="high">Prioridade Alta</option>
          </select>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Detalhes da anotação (opcional)..."
          rows={2}
          className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
        />

        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            disabled={creating || !title.trim()}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Adicionar Nota</span>
          </button>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                filter === f.value
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[10px] ${filter === f.value ? "text-gray-700" : "text-gray-400"}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar notas..."
            className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Lista de notas */}
      {sortedNotes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <StickyNote className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-400 mt-3 font-medium">Nenhuma nota encontrada</p>
          <p className="text-xs text-gray-400 mt-1">
            Crie uma nova nota acima para começar a organizar suas tarefas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedNotes.map((note) => {
            const prio = PRIORITY_STYLES[note.priority];
            const isEditing = editingId === note.id;
            const isBusy = busyId === note.id;

            return (
              <div
                key={note.id}
                className={`bg-white border rounded-xl p-4 flex flex-col gap-3 transition-colors ${
                  note.done ? "border-gray-100 opacity-60" : "border-gray-200"
                } ${note.pinned ? "border-purple-500/40 shadow-lg shadow-purple-500/5" : ""}`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-purple-500 resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveEdit(note)}
                        disabled={isBusy || !editTitle.trim()}
                        className="text-xs font-semibold bg-emerald-500/15 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : "Salvar"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1 rounded-lg"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => toggleDone(note)}
                        disabled={isBusy}
                        className={`flex items-start gap-2 text-left group ${
                          note.done ? "line-through" : ""
                        }`}
                        title={note.done ? "Marcar como pendente" : "Marcar como concluída"}
                      >
                        {note.done ? (
                          <CircleCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400 group-hover:text-purple-600 flex-shrink-0 mt-0.5 transition-colors" />
                        )}
                        <span className={`font-semibold text-sm ${note.done ? "text-gray-500" : "text-gray-900"}`}>
                          {note.title}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => togglePin(note)}
                          disabled={isBusy}
                          className={`text-[10px] p-1 rounded transition-colors ${
                            note.pinned
                              ? "text-purple-600 hover:text-purple-700"
                              : "text-gray-400 hover:text-gray-900"
                          }`}
                          title={note.pinned ? "Desafixar" : "Fixar no topo"}
                        >
                          {note.pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => startEdit(note)}
                          className="text-gray-400 hover:text-gray-900 p-1 rounded transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeNote(note.id)}
                          disabled={isBusy}
                          className="text-red-600/60 hover:text-red-700 p-1 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {note.content && (
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap px-6">
                        {note.content}
                      </p>
                    )}

                    <div className="flex items-center justify-between px-6 mt-auto pt-1">
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded ${prio.className}`}>
                        {prio.label}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(note.updated_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
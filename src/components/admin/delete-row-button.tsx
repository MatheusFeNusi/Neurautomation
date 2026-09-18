"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteRowButtonProps {
  endpoint: string;
  onDeleted: () => void;
  label?: string;
}

export function DeleteRowButton({ endpoint, onDeleted, label = "Excluir" }: DeleteRowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir item.");

      onDeleted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir item.");
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-end gap-0.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1 text-[11px] text-red-400/80 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-2.5 py-1 rounded transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        <span>{label}</span>
      </button>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}

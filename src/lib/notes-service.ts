import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Note } from '@/types/affiliate';

let MOCK_NOTES: Note[] = [
  {
    id: 'n1111111-1111-1111-1111-111111111111',
    title: 'Revisar termos de comissão da Dell',
    content: 'Pausar campanhas de Dell até confirmar novo patamar de comissão com o CJ Affiliate.',
    done: false,
    pinned: true,
    priority: 'high',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'n2222222-2222-2222-2222-222222222222',
    title: 'Configurar webhook de postback',
    content: 'Testar o endpoint de postback em https://neurautomation.com/api/webhooks/sales com uma venda real.',
    done: false,
    pinned: false,
    priority: 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const getNotes = cache(async (): Promise<Note[]> => {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Note[];
    } catch {
      // Fallback
    }
  }
  return MOCK_NOTES;
});

export async function createNote(
  noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>,
): Promise<Note> {
  const newNote: Note = {
    ...noteData,
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `nt-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select('*')
        .single();
      if (!error && data) return data as Note;
    } catch {
      // Continua para fallback
    }
  }

  MOCK_NOTES = [newNote, ...MOCK_NOTES];
  return newNote;
}

export async function updateNote(
  id: string,
  updates: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>,
): Promise<Note> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      if (!error && data) return data as Note;
    } catch {
      // Fallback
    }
  }

  const index = MOCK_NOTES.findIndex((n) => n.id === id);
  if (index === -1) throw new Error('Nota não encontrada.');
  const updated: Note = {
    ...MOCK_NOTES[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  MOCK_NOTES[index] = updated;
  return updated;
}

export async function deleteNote(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (!error) return;
    } catch {
      // Fallback
    }
  }
  MOCK_NOTES = MOCK_NOTES.filter((n) => n.id !== id);
}
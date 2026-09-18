-- ==============================================================================
-- MIGRATION: Tabela de Notas / Anotações operacionais
-- Execute este arquivo no Supabase (SQL Editor) para adicionar o módulo de notas.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- NOTAS (NOTES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    done BOOLEAN NOT NULL DEFAULT false,
    pinned BOOLEAN NOT NULL DEFAULT false,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_done ON public.notes(done);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON public.notes(pinned);
CREATE INDEX IF NOT EXISTS idx_notes_priority ON public.notes(priority);

-- Trigger de updated_at
DROP TRIGGER IF EXISTS set_timestamp_notes ON public.notes;
CREATE TRIGGER set_timestamp_notes BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- Políticas de segurança (RLS)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access notes" ON public.notes;
CREATE POLICY "Admins full access notes" ON public.notes FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Notas de exemplo iniciais
INSERT INTO public.notes (title, content, done, pinned, priority)
SELECT 'Revisar termos de comissão da Dell',
       'Pausar campanhas de Dell até confirmar novo patamar de comissão com o CJ Affiliate.',
       false, true, 'high'
WHERE NOT EXISTS (SELECT 1 FROM public.notes);
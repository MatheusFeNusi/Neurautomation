-- ==============================================================================
-- MIGRATION: Adiciona descrição e país às lojas afiliadas
-- Execute este arquivo no Supabase (SQL Editor) para bancos já existentes.
-- ==============================================================================

ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS country TEXT;

-- Atualiza o seed das lojas demo com os novos campos (opcional)
UPDATE public.stores SET description = 'E-commerce oficial da Nike no Brasil com foco em tênis de corrida e moda esportiva.', country = 'Brasil' WHERE slug = 'nike-brasil';
UPDATE public.stores SET description = 'Maior e-commerce de tecnologia e games da América Latina.', country = 'Brasil' WHERE slug = 'kabum';
UPDATE public.stores SET description = 'Varejista de beleza e perfumaria com marcas importadas de luxo.', country = 'Brasil' WHERE slug = 'sephora-brasil';
UPDATE public.stores SET description = 'Fabricante global de computadores, notebooks e workstations.', country = 'Brasil' WHERE slug = 'dell-computadores';
UPDATE public.stores SET description = 'Gigante do varejo online com catálogo gigante em eletrônicos, livros e casa.', country = 'Brasil' WHERE slug = 'amazon-brasil';
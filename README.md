# Neurautomation — Site Institucional

Site institucional da Neurautomation (Next.js App Router + TypeScript + Tailwind CSS v4 + shadcn/ui), com home orbital das quatro frentes de negócio e área do cliente autenticada via Supabase Auth.

## Stack

- Next.js 16 (App Router, `src/`, alias `@/*`)
- TypeScript + Tailwind CSS v4
- shadcn/ui (`src/components/ui`) — inicializado via `npx shadcn@latest init`
- Supabase Auth (`@supabase/ssr`)

Os componentes shadcn ficam em `src/components/ui` porque é o caminho definido em `components.json`: o CLI do shadcn grava novos componentes ali e os imports (`@/components/ui/...`) dependem dessa pasta existir.

## Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Home: header, hero, órbita das 4 frentes, footer |
| `/login` | Login por e-mail + senha, com "esqueci minha senha" |
| `/painel` | Área do cliente (placeholder), protegida por `src/proxy.ts` |
| `/admin` | Hub administrativo de afiliados (redireciona para `/admin/overview`) |
| `/auth/callback` | Troca do `code` do link de e-mail por sessão |
| `/auth/signout` | Encerra a sessão |

## Configuração

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do projeto Supabase
npm run dev
```

Variáveis necessárias (Supabase → Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Sem essas variáveis a home funciona normalmente; o login avisa a falta de configuração, `/painel` redireciona para `/login` e `/admin` abre em modo de demonstração com dados simulados.

### Banco do admin (afiliados)

No SQL Editor do Supabase, execute nesta ordem:

1. `supabase/migrations/20260910000000_admin_affiliate_schema.sql`
2. `supabase/seed.sql` (opcional, dados de exemplo)
3. Papel de administrador para o usuário já criado em Authentication → Users:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'SEU_EMAIL_AQUI'
ON CONFLICT (user_id, role) DO NOTHING;
```

Sem a linha em `user_roles`, um usuário autenticado cai em `/painel` e não entra no `/admin`.

No painel do Supabase, adicione as URLs de redirecionamento usadas pelo fluxo de recuperação de senha (Authentication → URL Configuration → Redirect URLs):

```
http://localhost:3000/auth/callback
https://SEU-DOMINIO/auth/callback
```

Não há cadastro público: os usuários são criados diretamente no Supabase (Authentication → Users) ou pelo painel interno NeuraAI, que usa o mesmo backend.

## Scripts

```bash
npm run dev     # desenvolvimento
npm run build   # build de produção (roda type-check)
npm run lint    # eslint
```

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const email = process.env.EMAIL || 'admin@neurautomation.com'
const password = process.argv[2] || process.env.NEW_PASSWORD || ''

const envPath = path.join(root, '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (env ou .env.local)')
  process.exit(1)
}
if (!password) {
  console.error('Passe a nova senha: node scripts/reset-password.mjs "NovaSenha123!"')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data, error } = await supabase.auth.admin.listUsers()
if (error) {
  console.error('Erro ao listar usuários:', error.message)
  process.exit(1)
}

const existing = data?.users?.find((u) => u.email === email)

let result
if (existing) {
  console.log(`Atualizando senha de ${email} (${existing.id})...`)
  result = await supabase.auth.admin.updateUserById(existing.id, { password })
} else {
  console.log(`Usuário ${email} não existe. Criando e confirmando o email...`)
  result = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
}

if (result.error) {
  console.error('Falha:', result.error.message)
  process.exit(1)
}
console.log('OK — senha definida com sucesso. Usuário:', result.data.user.email)
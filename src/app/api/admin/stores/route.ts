import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-admin';
import { createStore, getStores } from '@/lib/affiliate-service';

export async function GET() {
  const auth = await requireAdminApi();
  if ('response' in auth) return auth.response;

  try {
    const stores = await getStores();
    return NextResponse.json({ stores });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar lojas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    if (!body.name || !body.affiliate_network) {
      return NextResponse.json({ error: 'Nome da loja e rede de afiliados são obrigatórios.' }, { status: 400 });
    }

    const slug = (body.slug || body.name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newStore = await createStore({
      name: body.name,
      slug,
      category: body.category || 'Geral',
      affiliate_network: body.affiliate_network,
      affiliate_program: body.affiliate_program || '',
      brand_bidding_allowed: Boolean(body.brand_bidding_allowed),
      google_ads_allowed: body.google_ads_allowed !== undefined ? Boolean(body.google_ads_allowed) : true,
      dsa_allowed: Boolean(body.dsa_allowed),
      status: body.status || 'testing',
      daily_budget: Number(body.daily_budget) || 0,
      monthly_budget: Number(body.monthly_budget) || 0,
      target_cpa: Number(body.target_cpa) || 0,
      max_cpc: Number(body.max_cpc) || 0,
      target_roi: Number(body.target_roi) || 0,
      notes: body.notes || '',
    });

    return NextResponse.json({ store: newStore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar loja';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-admin';
import { createAdSpend, getAdSpends } from '@/lib/affiliate-service';

export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if ('response' in auth) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store_id') || undefined;
    const adSpends = await getAdSpends(storeId);
    return NextResponse.json({ adSpends });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar gastos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    if (!body.campaign_id || !body.store_id || !body.date) {
      return NextResponse.json({ error: 'Campanha, Loja e Data são obrigatórios.' }, { status: 400 });
    }

    const newAdSpend = await createAdSpend({
      campaign_id: body.campaign_id,
      store_id: body.store_id,
      date: body.date,
      clicks: Number(body.clicks) || 0,
      impressions: Number(body.impressions) || 0,
      cost: Number(body.cost) || 0,
      conversions: Number(body.conversions) || 0,
      conversion_value: Number(body.conversion_value) || 0,
      source: body.source || 'manual',
      source_id: body.source_id || null,
      imported_at: null,
    });

    return NextResponse.json({ adSpend: newAdSpend });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao registrar gasto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-admin';
import { createCampaign, getCampaigns } from '@/lib/affiliate-service';

export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if ('response' in auth) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store_id') || undefined;
    const campaigns = await getCampaigns(storeId);
    return NextResponse.json({ campaigns });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar campanhas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    if (!body.store_id || !body.name) {
      return NextResponse.json({ error: 'Loja e Nome da Campanha são obrigatórios.' }, { status: 400 });
    }

    const newCampaign = await createCampaign({
      store_id: body.store_id,
      offer_id: body.offer_id || null,
      name: body.name,
      traffic_source: body.traffic_source || 'google_ads',
      external_campaign_id: body.external_campaign_id || null,
      ad_group: body.ad_group || null,
      search_term: body.search_term || null,
      status: body.status || 'active',
    });

    return NextResponse.json({ campaign: newCampaign });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar campanha';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

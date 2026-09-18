import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-admin';
import { createOffer, getOffers } from '@/lib/affiliate-service';

export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if ('response' in auth) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store_id') || undefined;
    const offers = await getOffers(storeId);
    return NextResponse.json({ offers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar ofertas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    if (!body.store_id || !body.name) {
      return NextResponse.json({ error: 'Loja e Nome da Oferta são obrigatórios.' }, { status: 400 });
    }

    const newOffer = await createOffer({
      store_id: body.store_id,
      name: body.name,
      description: body.description || null,
      landing_page_url: body.landing_page_url || null,
      affiliate_link: body.affiliate_link || null,
      status: body.status || 'active',
      payout_type: body.payout_type || 'percentage',
      payout_value: Number(body.payout_value) || 0,
    });

    return NextResponse.json({ offer: newOffer });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar oferta';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

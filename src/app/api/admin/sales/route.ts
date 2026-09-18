import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-admin';
import { createSale, getSales } from '@/lib/affiliate-service';

export async function GET() {
  const auth = await requireAdminApi();
  if ('response' in auth) return auth.response;

  try {
    const sales = await getSales();
    return NextResponse.json({ sales });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar vendas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();

    if (!body.store_id || !body.affiliate_network || !body.date) {
      return NextResponse.json(
        { error: 'Loja, Rede de Afiliados e Data são obrigatórios.' },
        { status: 400 }
      );
    }

    const clickId = body.click_id && body.click_id.trim().length > 0 ? body.click_id.trim() : null;

    // Regra inquebrável de atribuição:
    // Se não houver click_id, a venda NUNCA pode ser considerada 'attributed'
    let trackingStatus = body.tracking_status || 'manual';
    if (!clickId) {
      trackingStatus = 'manual';
    } else {
      trackingStatus = 'attributed';
    }

    // Se não houver click_id, origem deve ser a especificada pelo usuário (ou 'manual'/'unknown', nunca presumida google_ads sem consentimento)
    const origin = body.origin || (clickId ? 'google_ads' : 'manual');

    const newSale = await createSale({
      store_id: body.store_id,
      offer_id: body.offer_id || null,
      campaign_id: body.campaign_id || null,
      affiliate_network: body.affiliate_network,
      order_id: body.order_id || null,
      date: body.date,
      sale_value: Number(body.sale_value) || 0,
      commission: Number(body.commission) || 0,
      currency: body.currency || 'BRL',
      status: body.status || 'approved',
      origin,
      click_id: clickId,
      tracking_status: trackingStatus,
      notes: body.notes || null,
      source: body.source || 'manual',
      source_id: body.source_id || null,
      imported_at: null,
    });

    return NextResponse.json({ sale: newSale });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao registrar venda';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { placeCheapGigzOrder } from '@/lib/cheapgigz';

export async function POST(req: Request) {
  try {
    const { orderId, action } = await req.json();

    if (!orderId || !['deliver', 'fail'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the order with bundle and agent info
    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('*, bundles(name, base_price, cheapgigz_id, network, size_gb), users(id, email, name)')
      .eq('id', orderId)
      .single();

    if (orderFetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: `Order is already ${order.status}` }, { status: 400 });
    }

    if (action === 'fail') {
      // Mark as failed — no wallet credit
      const { error } = await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', orderId);

      if (error) throw error;
      return NextResponse.json({ status: 'failed', message: 'Order marked as failed' });
    }

    // action === 'deliver'
    const cheapgigzId = order.bundles?.cheapgigz_id;

    if (cheapgigzId || order.bundles?.network) {
      // Try to deliver via Cheap Gigz API (auto-lookup by network+size, or manual ID override)
      const result = await placeCheapGigzOrder(
        order.customer_phone,
        order.bundles?.network ?? '',
        Number(order.bundles?.size_gb ?? 0),
        cheapgigzId
      );

      if (!result.success) {
        return NextResponse.json(
          { error: `Cheap Gigz delivery failed: ${result.message}` },
          { status: 502 }
        );
      }
    }

    // Mark order as completed
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // Credit agent wallet
    const agentCredited = Number(order.agent_credited);
    const agentId = order.agent_id;

    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('agent_id', agentId)
      .single();

    if (walletError) throw walletError;

    const newBalance = Number((Number(wallet.balance) + agentCredited).toFixed(2));

    const { error: walletUpdateError } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('agent_id', agentId);

    if (walletUpdateError) throw walletUpdateError;

    // Insert wallet transaction
    const { error: txError } = await supabase.from('wallet_transactions').insert([{
      agent_id: agentId,
      type: 'credit',
      amount: agentCredited,
      description: `Profit from sale: ${order.bundles?.name ?? 'bundle'} to ${order.customer_phone} (Ref: ${order.reference})`
    }]);

    if (txError) throw txError;

    return NextResponse.json({ status: 'completed', message: 'Order delivered and agent credited' });
  } catch (error: any) {
    console.error('[Admin Deliver] Error:', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

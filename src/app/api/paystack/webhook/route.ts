import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendAgentSaleNotification, sendAgentTopupNotification } from '@/lib/emails';
import { placeGigzHubOrder } from '@/lib/gigzhub';

// Webhook requires raw body for signature verification, but Next.js App Router exposes req.text()
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;

      if (!metadata || !metadata.agent_id) {
        console.error('Missing agent_id in charge.success event:', metadata);
        return NextResponse.json({ status: 'ignored - missing agent_id' });
      }

      // Initialize Supabase admin client to bypass RLS
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Handle agent wallet top-up
      if (metadata.type === 'agent_topup') {
        const { data: existingTx } = await supabase
          .from('wallet_transactions')
          .select('id')
          .like('description', `%${reference}%`)
          .maybeSingle();

        if (existingTx) {
          return NextResponse.json({ status: 'already processed' });
        }

        const [userRes, walletRes] = await Promise.all([
          supabase.from('users').select('name, email').eq('id', metadata.agent_id).single(),
          supabase.from('wallets').select('balance').eq('agent_id', metadata.agent_id).single()
        ]);

        if (userRes.error || walletRes.error || !walletRes.data) {
          console.error('Error fetching user or wallet for top-up', userRes.error, walletRes.error);
          return NextResponse.json({ error: 'Database fetch error' }, { status: 500 });
        }

        const topupAmount = Number(metadata.amount);
        const newBalance = Number((Number(walletRes.data.balance) + topupAmount).toFixed(2));

        const { error: walletError } = await supabase
          .from('wallets')
          .update({ balance: newBalance })
          .eq('agent_id', metadata.agent_id);

        if (walletError) throw walletError;

        const { error: txnError } = await supabase.from('wallet_transactions').insert([{
          agent_id: metadata.agent_id,
          type: 'credit',
          amount: topupAmount,
          description: `Wallet top-up via Paystack (Ref: ${reference})`
        }]);

        if (txnError) throw txnError;

        await sendAgentTopupNotification(
          userRes.data.email,
          userRes.data.name,
          topupAmount,
          newBalance
        );

        return NextResponse.json({ status: 'success', message: 'Wallet topped up' });
      }

      if (!metadata.bundle_id) {
        console.error('Missing bundle_id in charge.success event:', metadata);
        return NextResponse.json({ status: 'ignored - missing bundle_id' });
      }

      // Check if order already exists to prevent duplicate processing
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('reference', reference)
        .single();

      if (existingOrder) {
        return NextResponse.json({ status: 'already processed' });
      }

      // 1. Fetch agent and bundle info (including network and size for auto-lookup)
      const [userRes, bundleRes] = await Promise.all([
        supabase.from('users').select('id, name, email').eq('id', metadata.agent_id).single(),
        supabase.from('bundles').select('name, base_price, cheapgigz_id, network, size_gb').eq('id', metadata.bundle_id).single()
      ]);

      if (userRes.error || bundleRes.error) {
        console.error('Error fetching user or bundle', userRes.error, bundleRes.error);
        return NextResponse.json({ error: 'Database fetch error' }, { status: 500 });
      }

      const customerPaid = Number(metadata.customer_paid);
      const platformFee = Number(metadata.platform_fee);
      
      // agent price is the total customer paid minus the platform fee
      const agentPrice = Number((customerPaid - platformFee).toFixed(2));
      
      // profit is agent price minus base cost
      const agentCredited = Number((agentPrice - Number(bundleRes.data.base_price)).toFixed(2));

      // 2. Create the order with status 'pending'
      const { error: orderError } = await supabase.from('orders').insert([{
        agent_id: metadata.agent_id,
        bundle_id: metadata.bundle_id,
        customer_phone: metadata.customer_phone,
        customer_network: metadata.customer_network || null,
        customer_paid: customerPaid,
        agent_credited: agentCredited,
        platform_fee: platformFee,
        status: 'pending',
        reference: reference
      }]);

      if (orderError) throw orderError;

      // 3. Attempt to automatically fulfill via GigzHub
      const result = await placeGigzHubOrder(
        metadata.customer_phone,
        bundleRes.data.network,
        Number(bundleRes.data.size_gb),
        bundleRes.data.cheapgigz_id  // GigzHub network code override (e.g. 'MTNUP2U')
      );

        if (result.success) {
          // Auto-fulfill: mark completed and credit agent wallet
          await supabase
            .from('orders')
            .update({ status: 'completed' })
            .eq('reference', reference);

          // Credit agent wallet
          const { data: wallet, error: walletError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('agent_id', metadata.agent_id)
            .single();

          if (!walletError && wallet) {
            const newBalance = Number((Number(wallet.balance) + agentCredited).toFixed(2));
            await supabase
              .from('wallets')
              .update({ balance: newBalance })
              .eq('agent_id', metadata.agent_id);

            await supabase.from('wallet_transactions').insert([{
              agent_id: metadata.agent_id,
              type: 'credit',
              amount: agentCredited,
              description: `Profit from sale: ${bundleRes.data.name} to ${metadata.customer_phone} (Ref: ${reference})`
            }]);
          }

          // Send Email Notification
          await sendAgentSaleNotification(
            userRes.data.email,
            userRes.data.name,
            metadata.customer_phone,
            bundleRes.data.name,
            agentCredited
          );
        } else {
          // Auto-fulfillment failed — order stays pending for manual admin action
          console.warn('[Webhook] GigzHub auto-fulfillment failed:', result.message);
        }

      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing error', details: err.message }, { status: 500 });
  }
}

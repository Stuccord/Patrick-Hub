import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendAgentSaleNotification } from '@/lib/emails';

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

      if (!metadata || !metadata.agent_id || !metadata.bundle_id) {
        console.error('Missing metadata in charge.success event:', metadata);
        return NextResponse.json({ status: 'ignored - missing metadata' });
      }

      // Initialize Supabase admin client to bypass RLS
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Check if order already exists to prevent duplicate processing
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('reference', reference)
        .single();

      if (existingOrder) {
        return NextResponse.json({ status: 'already processed' });
      }

      // 1. Fetch agent and bundle info
      const [userRes, bundleRes] = await Promise.all([
        supabase.from('users').select('id, name, email').eq('id', metadata.agent_id).single(),
        supabase.from('bundles').select('name, base_price').eq('id', metadata.bundle_id).single()
      ]);

      if (userRes.error || bundleRes.error) {
        console.error('Error fetching user or bundle', userRes.error, bundleRes.error);
        return NextResponse.json({ error: 'Database fetch error' }, { status: 500 });
      }

      const customerPaid = Number(metadata.customer_paid);
      const platformFee = Number(metadata.platform_fee);
      
      // agent price is the total customer paid minus the platform fee
      const agentPrice = customerPaid - platformFee;
      
      // profit is agent price minus base cost
      const agentCredited = agentPrice - Number(bundleRes.data.base_price);

      // 2. Create the order
      const { error: orderError } = await supabase.from('orders').insert([{
        agent_id: metadata.agent_id,
        bundle_id: metadata.bundle_id,
        customer_phone: metadata.customer_phone,
        customer_paid: customerPaid,
        agent_credited: agentCredited,
        platform_fee: platformFee,
        status: 'completed',
        reference: reference
      }]);

      if (orderError) throw orderError;

      // 3. Update Agent Wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('agent_id', metadata.agent_id)
        .single();

      if (walletError) throw walletError;

      const newBalance = Number(wallet.balance) + agentCredited;
      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('agent_id', metadata.agent_id);

      if (walletUpdateError) throw walletUpdateError;

      // 4. Insert Wallet Transaction
      const { error: txError } = await supabase.from('wallet_transactions').insert([{
        agent_id: metadata.agent_id,
        type: 'credit',
        amount: agentCredited,
        description: `Profit from sale: ${bundleRes.data.name} to ${metadata.customer_phone} (Ref: ${reference})`
      }]);

      if (txError) throw txError;

      // 5. Send Email Notification
      await sendAgentSaleNotification(
        userRes.data.email,
        userRes.data.name,
        metadata.customer_phone,
        bundleRes.data.name,
        agentCredited
      );

      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error', details: error.message }, { status: 500 });
  }
}

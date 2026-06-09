import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWithdrawalProcessedNotification } from '@/lib/emails';

const networkToBankCode: Record<string, string> = {
  'MTN': 'MTN',
  'Vodafone': 'VOD',
  'AirtelTigo': 'ATL',
};

export async function POST(req: Request) {
  try {
    const { withdrawalId, manualOverride } = await req.json();

    if (!withdrawalId) {
      return NextResponse.json({ error: 'Missing withdrawal ID' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Fetch the withdrawal details along with agent profile
    const { data: withdrawal, error: fetchError } = await supabase
      .from('withdrawals')
      .select('*, users(name, email)')
      .eq('id', withdrawalId)
      .single();

    if (fetchError || !withdrawal) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: `Withdrawal has already been ${withdrawal.status}` }, { status: 400 });
    }

    let transferCode = 'MANUAL_PAYOUT';

    if (!manualOverride) {
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecret) {
        return NextResponse.json({ error: 'Paystack Secret Key is not configured on the server' }, { status: 500 });
      }

      const bankCode = networkToBankCode[withdrawal.network] || withdrawal.network;
      const payoutAmountGHS = Number(withdrawal.payout_amount);
      
      // Paystack transfers require amount in pesewas (multiplied by 100)
      const amountInPesewas = Math.round(payoutAmountGHS * 100);

      // 1. Create a Transfer Recipient on Paystack
      const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'mobile_money',
          name: withdrawal.users?.name || 'Agent Partner',
          account_number: withdrawal.momo_number,
          bank_code: bankCode,
          currency: 'GHS',
        }),
      });

      const recipientData = await recipientRes.json();
      if (!recipientData.status) {
        console.error('[Payout] Create recipient failed:', recipientData);
        return NextResponse.json({ 
          error: `Paystack recipient creation failed: ${recipientData.message}` 
        }, { status: 502 });
      }

      const recipientCode = recipientData.data.recipient_code;

      // 2. Initiate the Transfer on Paystack
      const transferRes = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          reason: `Withdrawal payout for ${withdrawal.users?.name || 'Agent'}`,
          amount: amountInPesewas,
          recipient: recipientCode,
        }),
      });

      const transferData = await transferRes.json();
      if (!transferData.status) {
        console.error('[Payout] Initiate transfer failed:', transferData);
        return NextResponse.json({ 
          error: `Paystack transfer initiation failed: ${transferData.message}` 
        }, { status: 502 });
      }

      transferCode = transferData.data.transfer_code;
    }

    // 3. Mark the withdrawal as approved in database
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({ status: 'approved' })
      .eq('id', withdrawalId);

    if (updateError) {
      console.error('[Payout] Supabase status update failed:', updateError);
      return NextResponse.json({ 
        error: `Database status update failed, but Paystack transfer was initiated: ${transferCode}` 
      }, { status: 500 });
    }

    // 4. Send Email Notification
    const reqAmount = Number(withdrawal.amount_requested);
    const payoutAmountGHS = Number(withdrawal.payout_amount);
    const commission = reqAmount - payoutAmountGHS;
    try {
      await sendWithdrawalProcessedNotification(
        withdrawal.users?.email || '',
        withdrawal.users?.name || 'Agent Partner',
        reqAmount,
        payoutAmountGHS,
        commission
      );
    } catch (emailErr) {
      console.error('[Payout] Email notification failed:', emailErr);
      // Don't fail the request since payout was successful
    }

    return NextResponse.json({ 
      success: true, 
      status: 'approved', 
      message: manualOverride ? 'Withdrawal marked as manually paid' : 'Payout processed successfully via Paystack',
      transferCode
    });
  } catch (err) {
    console.error('[Payout] Unexpected error:', err);
    const errMessage = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

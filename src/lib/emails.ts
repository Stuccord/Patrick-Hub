import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const hasApiKey = resendApiKey && !resendApiKey.includes('your_resend');

const resend = hasApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = 'Patrick\'s Info Tech <noreply@patricksinfotetch.com>';
const ADMIN_EMAIL = 'admin@patricks-info-tech.com';

// Local dev logging helper
function logEmailLocal(subject: string, to: string, content: string) {
  console.log(`
=========================================
📧 LOCAL DEV EMAIL LOG
To: ${to}
Subject: ${subject}
Content: ${content}
=========================================
`);
}

export async function sendAgentSignupNotification(agentName: string, agentEmail: string) {
  const subject = 'New Agent Signup Pending Approval';
  const html = `
    <h1>New Agent Registration</h1>
    <p>A new agent has registered and is awaiting approval:</p>
    <ul>
      <li><strong>Name:</strong> ${agentName}</li>
      <li><strong>Email:</strong> ${agentEmail}</li>
    </ul>
    <p>Please log in to the admin panel to review and approve their account.</p>
  `;

  if (!resend) {
    logEmailLocal(subject, ADMIN_EMAIL, `Agent ${agentName} (${agentEmail}) registered.`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send agent signup email:', error);
    return { success: false, error };
  }
}

export async function sendAgentApprovalNotification(agentName: string, agentEmail: string) {
  const subject = 'Your Reseller Account Has Been Approved!';
  const html = `
    <h1>Welcome to Patrick's Info Tech!</h1>
    <p>Hi ${agentName},</p>
    <p>Your agent account has been reviewed and approved by the administrator.</p>
    <p>You can now log in to your dashboard to customize your storefront pricing, check orders, and manage your wallet.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login">Log In to Your Dashboard</a></p>
  `;

  if (!resend) {
    logEmailLocal(subject, agentEmail, `Agent ${agentName} approved.`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: agentEmail,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send agent approval email:', error);
    return { success: false, error };
  }
}

export async function sendAgentSaleNotification(
  agentEmail: string,
  agentName: string,
  customerPhone: string,
  bundleName: string,
  earnings: number
) {
  const subject = 'New Sale Confirmed!';
  const html = `
    <h1>Congratulations, ${agentName}!</h1>
    <p>You have made a new data bundle sale on your storefront:</p>
    <ul>
      <li><strong>Item Sold:</strong> ${bundleName}</li>
      <li><strong>Recipient Phone:</strong> ${customerPhone}</li>
      <li><strong>Your Net Profit Credited:</strong> GHS ${earnings.toFixed(2)}</li>
    </ul>
    <p>Your wallet has been credited automatically. Keep up the great work!</p>
  `;

  if (!resend) {
    logEmailLocal(subject, agentEmail, `Sale of ${bundleName} to ${customerPhone}. Credited GHS ${earnings.toFixed(2)}.`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: agentEmail,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send agent sale email:', error);
    return { success: false, error };
  }
}

export async function sendWithdrawalProcessedNotification(
  agentEmail: string,
  agentName: string,
  amount: number,
  payout: number,
  commission: number
) {
  const subject = 'Your Payout Has Been Processed';
  const html = `
    <h1>Withdrawal Approved</h1>
    <p>Hi ${agentName},</p>
    <p>Your withdrawal request of <strong>GHS ${amount.toFixed(2)}</strong> has been approved and processed.</p>
    <ul>
      <li><strong>Requested Amount:</strong> GHS ${amount.toFixed(2)}</li>
      <li><strong>Platform Commission (5%):</strong> GHS ${commission.toFixed(2)}</li>
      <li><strong>Net Payout Transferred:</strong> GHS ${payout.toFixed(2)}</li>
    </ul>
    <p>The net payout amount has been sent to your registered Mobile Money number. Thank you for partnering with us!</p>
  `;

  if (!resend) {
    logEmailLocal(subject, agentEmail, `Withdrawal of GHS ${amount.toFixed(2)} processed. Net GHS ${payout.toFixed(2)}.`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: agentEmail,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send withdrawal email:', error);
    return { success: false, error };
  }
}

export async function sendAgentTopupNotification(
  agentEmail: string,
  agentName: string,
  amount: number,
  newBalance: number
) {
  const subject = 'Wallet Top-up Successful!';
  const html = `
    <h1>Wallet Top-up Confirmed</h1>
    <p>Hi ${agentName},</p>
    <p>Your wallet has been successfully topped up with <strong>GHS ${amount.toFixed(2)}</strong>.</p>
    <p>Your new available balance is <strong>GHS ${newBalance.toFixed(2)}</strong>.</p>
    <p>Thank you for partnering with us!</p>
  `;

  if (!resend) {
    logEmailLocal(subject, agentEmail, `Wallet top-up of GHS ${amount.toFixed(2)} succeeded. New balance: GHS ${newBalance.toFixed(2)}.`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: agentEmail,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send wallet top-up email:', error);
    return { success: false, error };
  }
}


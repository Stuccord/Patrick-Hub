/**
 * GigzHub API Helper
 * Base URL: https://gigzhub.net/api/v1
 * Auth: x-api-key header
 *
 * Confirmed working endpoints (tested 2026-06-08):
 *   GET  /balance          → { success, balance, currency }
 *   POST /order/data       → places a data bundle order
 *
 * IMPORTANT: The valid `network` values are not publicly documented.
 * Contact GigzHub at info@gigzhub.net or WhatsApp 233249116309
 * to get the correct network identifiers for your API key.
 *
 * Based on the GigzHub site (MTNUP2U-focused), expected values may include:
 *   'MTNUP2U' | 'TELECEL' | 'AT' — but these MUST be confirmed with support.
 */

const GIGZHUB_BASE_URL = 'https://gigzhub.net/api/v1';

export interface GigzHubOrderResult {
  success: boolean;
  orderId?: string;
  transactionId?: string;
  message?: string;
  raw?: unknown;
}

export interface GigzHubBalance {
  success: boolean;
  balance: number;
  currency: string;
}

interface GigzHubApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  type?: string;
  data?: {
    orderId?: string;
    transactionId?: string;
  };
  orderId?: string;
  transactionId?: string;
}

/**
 * Maps app-level network names to GigzHub network identifiers.
 *
 * ⚠️  NOTE: These mappings are UNCONFIRMED. Contact GigzHub support
 * at info@gigzhub.net (WhatsApp: 233249116309) for the correct values.
 *
 * The `cheapgigz_id` column in the `bundles` table can be used to
 * store the GigzHub-specific network code override per bundle.
 */
export function mapNetworkToGigzHub(network: string, overrideCode?: string | null): string {
  // If the admin has set a specific GigzHub code on this bundle, use it directly
  if (overrideCode?.trim()) return overrideCode.trim();

  // Best-guess mappings (UNCONFIRMED — contact GigzHub to verify)
  const n = network.toLowerCase().trim();
  if (n === 'mtn' || n === 'yello') return 'MTNUP2U';
  if (n === 'telecel' || n === 'vodafone') return 'TELECEL';
  if (n === 'airteltigo' || n === 'at') return 'AT';
  return network.toUpperCase();
}

/**
 * Get the GigzHub wallet balance.
 */
export async function getGigzHubBalance(): Promise<GigzHubBalance> {
  const apiKey = process.env.GIGZHUB_API_KEY;
  if (!apiKey) throw new Error('GIGZHUB_API_KEY is not configured');

  const res = await fetch(`${GIGZHUB_BASE_URL}/balance`, {
    method: 'GET',
    headers: { 'x-api-key': apiKey },
  });
  const data = await res.json();
  return data;
}

/**
 * Place a data bundle order via the GigzHub API.
 *
 * @param phone          Recipient phone number (e.g. 0241234567)
 * @param network        Network name (MTN | Telecel | AirtelTigo)
 * @param capacity       Bundle size in GB
 * @param networkOverride  Optional GigzHub-specific network code (from bundles.cheapgigz_id)
 */
export async function placeGigzHubOrder(
  phone: string,
  network: string,
  capacity: number,
  networkOverride?: string | null
): Promise<GigzHubOrderResult> {
  const apiKey = process.env.GIGZHUB_API_KEY;
  if (!apiKey) {
    console.error('[GigzHub] GIGZHUB_API_KEY is not configured');
    return { success: false, message: 'GigzHub API key is not configured' };
  }

  const gigzHubNetwork = mapNetworkToGigzHub(network, networkOverride);

  const payload = {
    network: gigzHubNetwork,
    phoneNumber: phone,
    capacity: capacity.toString(),
  };

  console.log('[GigzHub] Sending order:', JSON.stringify(payload));

  try {
    const res = await fetch(`${GIGZHUB_BASE_URL}/order/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as GigzHubApiResponse;
    console.log('[GigzHub] Response:', JSON.stringify(data));

    if (res.ok && data.success) {
      return {
        success: true,
        orderId: data.data?.orderId ?? data.orderId ?? undefined,
        transactionId: data.data?.transactionId ?? data.transactionId ?? undefined,
        message: data.message ?? 'Order placed successfully',
        raw: data,
      };
    }

    // Surface useful error info
    const errorMsg = data.message ?? data.error ?? `HTTP ${res.status}`;
    const errorType = data.type ?? '';

    if (errorType === 'INVALID_NETWORK') {
      return {
        success: false,
        message: `Invalid network "${gigzHubNetwork}". Contact GigzHub support at info@gigzhub.net to get valid network identifiers for your API key.`,
        raw: data,
      };
    }

    return { success: false, message: errorMsg, raw: data };
  } catch (err: unknown) {
    console.error('[GigzHub] Network error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error contacting GigzHub',
    };
  }
}

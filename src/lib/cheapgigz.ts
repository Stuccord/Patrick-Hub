/**
 * Cheap Gigz API Helper
 * https://cheapgigz.store/api/process-order.php
 */

const CHEAPGIGZ_BASE_URL = 'https://cheapgigz.store/api';

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.CHEAPGIGZ_API_KEY!,
    'X-API-SECRET': process.env.CHEAPGIGZ_API_SECRET!,
  };
}

// ─── Hardcoded Bundle ID Lookup ───────────────────────────────────────────────
// Maps network + size_gb → Cheap Gigz bundle_id integer

const MTN_BUNDLE_MAP: Record<number, number> = {
  1: 14,  2: 15,  3: 16,  4: 17,  5: 18,
  6: 19,  8: 20,  10: 21, 15: 22, 20: 23,
  25: 24, 30: 25, 40: 26, 50: 27,
};

const TELECEL_BUNDLE_MAP: Record<number, number> = {
  10: 30, 15: 31, 20: 32, 25: 33,
  30: 34, 40: 36, 50: 38, 100: 39,
};

const AT_BUNDLE_MAP: Record<number, number> = {
  1: 40,  2: 41,  3: 42,  4: 43,  5: 44,
  6: 45,  8: 47,  10: 49, 15: 54, 20: 55,
  25: 70, 30: 71, 40: 72, 50: 73,
};

/**
 * Automatically resolve a Cheap Gigz bundle_id from network name + size in GB.
 * Returns null if no match found.
 */
export function getBundleId(network: string, sizeGb: number): number | null {
  const n = network.toLowerCase().trim();
  const size = Number(sizeGb);

  if (n === 'mtn') return MTN_BUNDLE_MAP[size] ?? null;
  // Vodafone Ghana rebranded to Telecel
  if (n === 'telecel' || n === 'vodafone') return TELECEL_BUNDLE_MAP[size] ?? null;
  if (n === 'airteltigo' || n === 'at ishare' || n === 'at') return AT_BUNDLE_MAP[size] ?? null;

  return null;
}

// ─── Order Placement ──────────────────────────────────────────────────────────

export interface CheapGigzOrderResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  raw?: unknown;
}

/**
 * Place a data bundle order via the Cheap Gigz API.
 * Resolves the bundle_id automatically from network + size, with an optional
 * manual override via cheapgigzId.
 *
 * @param phone       Recipient phone number (10 digits starting with 0)
 * @param network     Network name (MTN | Vodafone | Telecel | AirtelTigo)
 * @param sizeGb      Bundle size in GB
 * @param cheapgigzId Optional manual override for the Cheap Gigz bundle ID
 */
export async function placeCheapGigzOrder(
  phone: string,
  network: string,
  sizeGb: number,
  cheapgigzId?: string | null
): Promise<CheapGigzOrderResult> {
  // Resolve bundle_id: manual override takes priority, then auto-lookup
  const bundleIdNum = cheapgigzId
    ? Number(cheapgigzId)
    : getBundleId(network, sizeGb);

  if (!bundleIdNum) {
    return {
      success: false,
      message: `No Cheap Gigz bundle found for ${network} ${sizeGb}GB`,
    };
  }

  try {
    const res = await fetch(`${CHEAPGIGZ_BASE_URL}/process-order.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ phone, bundle_id: bundleIdNum }),
    });

    const data = await res.json();
    console.log('[CheapGigz] process-order response:', JSON.stringify(data));

    if (res.ok && (data.status === 'success' || data.success === true)) {
      return {
        success: true,
        transactionId: data.transaction_id ?? data.id ?? undefined,
        message: data.message ?? 'Order placed successfully',
        raw: data,
      };
    }

    return {
      success: false,
      message: data.message ?? data.error ?? `HTTP ${res.status}`,
      raw: data,
    };
  } catch (err: unknown) {
    console.error('[CheapGigz] Network error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error contacting Cheap Gigz',
    };
  }
}

/**
 * Fetch available products/bundles from Cheap Gigz.
 * @param categoryId  Optional category ID to filter by network
 */
export async function getCheapGigzProducts(categoryId?: number): Promise<unknown> {
  const url = categoryId
    ? `${CHEAPGIGZ_BASE_URL}/get-products?category_id=${categoryId}`
    : `${CHEAPGIGZ_BASE_URL}/get-products`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  return res.json();
}

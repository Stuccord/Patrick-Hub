/**
 * DataHustle API Helper
 * https://datahustle.shop/api-doc
 */

export interface DataHustleOrderResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  raw?: unknown;
}

/**
 * Maps application network names to DataHustle API network identifiers.
 */
export function mapNetworkToDataHustle(network: string): string {
  const n = network.toLowerCase().trim();
  if (n === 'mtn' || n === 'yello') return 'YELLO';
  if (n === 'vodafone' || n === 'telecel') return 'TELECEL';
  if (n === 'airteltigo' || n === 'at' || n === 'at_premium') return 'AT_PREMIUM';
  return network.toUpperCase(); // Fallback
}

/**
 * Place a data bundle order via the DataHustle API.
 * 
 * @param phone            Recipient phone number (10 digits starting with 0)
 * @param network          Network name (MTN | Vodafone | Telecel | AirtelTigo)
 * @param sizeGb           Bundle size in GB
 * @param capacityOverride Optional capacity override (e.g. custom string value)
 */
export async function placeDataHustleOrder(
  phone: string,
  network: string,
  sizeGb: number,
  capacityOverride?: string | null
): Promise<DataHustleOrderResult> {
  const dataHustleNetwork = mapNetworkToDataHustle(network);
  const capacity = capacityOverride?.trim() || sizeGb.toString();

  try {
    const apiKey = process.env.DATAHUSTLE_API_KEY;
    if (!apiKey) {
      console.error('[DataHustle] DATAHUSTLE_API_KEY is not configured');
      return {
        success: false,
        message: 'DataHustle API key is not configured',
      };
    }

    const res = await fetch('https://api.datahustle.shop/api/developer/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        phoneNumber: phone,
        network: dataHustleNetwork,
        capacity: capacity,
        gateway: 'wallet',
      }),
    });

    const data = await res.json();
    console.log('[DataHustle] purchase response:', JSON.stringify(data));

    if (res.ok && data.status === 'success') {
      return {
        success: true,
        transactionId: data.data?.purchaseId ?? data.data?.transactionReference ?? undefined,
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
    console.error('[DataHustle] Network error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error contacting DataHustle',
    };
  }
}

/**
 * Fetch available products/packages from DataHustle.
 * @param network Optional network name to filter by
 */
export async function getDataHustlePackages(network?: string): Promise<unknown> {
  const apiKey = process.env.DATAHUSTLE_API_KEY;
  if (!apiKey) {
    throw new Error('DATAHUSTLE_API_KEY is not configured');
  }

  const queryParams = network ? `?network=${mapNetworkToDataHustle(network)}` : '';
  const url = `https://api.datahustle.shop/api/developer/data-packages${queryParams}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey,
    },
  });
  return res.json();
}

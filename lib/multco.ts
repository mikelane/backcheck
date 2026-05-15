/**
 * Multnomah County ArcGIS Feature Service client.
 * Open, unauthenticated. No API key required.
 */

const FEATURE_SERVICE_URL =
  'https://services5.arcgis.com/x7DNZL1YqNQVNykA/arcgis/rest/services/Multnomah_County_Taxlot_Parcels/FeatureServer/0/query';

const OUT_FIELDS = [
  'SITUSADDR',
  'NAME',
  'NAME2',
  'ADDR1',
  'ADDR2',
  'CITY',
  'STATE',
  'ZIP',
  'PROPID',
  'MAPTAXLOT',
  'PROPCLASS',
  'IMPTYPE',
  'ACTYEARBUILT',
  'MAIN_SQFT',
  'UNITS',
  'DEED_DATE',
  'SALE_PRICE',
  'SALE_DATE',
  'ZONING',
].join(',');

export interface ParcelRecord {
  SITUSADDR: string;
  NAME: string;
  NAME2: string;
  ADDR1: string;
  ADDR2: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  PROPID: string;
  MAPTAXLOT: string;
  PROPCLASS: string;
  IMPTYPE: string;
  ACTYEARBUILT: number | null;
  MAIN_SQFT: number | null;
  UNITS: number | null;
  DEED_DATE: Date | null;
  SALE_PRICE: number | null;
  SALE_DATE: Date | null;
  ZONING: string;
}

export class MultcoApiError extends Error {
  constructor(
    public readonly url: string,
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'MultcoApiError';
  }
}

// In-memory cache keyed by full query URL, 10-minute TTL
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { result: ParcelRecord[]; fetchedAt: number }>();

function epochMsToDate(value: number | null | undefined): Date | null {
  if (value == null) return null;
  return new Date(value);
}

function parseAttributes(attrs: Record<string, unknown>): ParcelRecord {
  return {
    SITUSADDR: String(attrs.SITUSADDR ?? ''),
    NAME: String(attrs.NAME ?? ''),
    NAME2: String(attrs.NAME2 ?? ''),
    ADDR1: String(attrs.ADDR1 ?? ''),
    ADDR2: String(attrs.ADDR2 ?? ''),
    CITY: String(attrs.CITY ?? ''),
    STATE: String(attrs.STATE ?? ''),
    ZIP: String(attrs.ZIP ?? ''),
    PROPID: String(attrs.PROPID ?? ''),
    MAPTAXLOT: String(attrs.MAPTAXLOT ?? ''),
    PROPCLASS: String(attrs.PROPCLASS ?? ''),
    IMPTYPE: String(attrs.IMPTYPE ?? ''),
    ACTYEARBUILT: attrs.ACTYEARBUILT != null ? Number(attrs.ACTYEARBUILT) : null,
    MAIN_SQFT: attrs.MAIN_SQFT != null ? Number(attrs.MAIN_SQFT) : null,
    UNITS: attrs.UNITS != null ? Number(attrs.UNITS) : null,
    DEED_DATE: epochMsToDate(attrs.DEED_DATE as number | null),
    SALE_PRICE: attrs.SALE_PRICE != null ? Number(attrs.SALE_PRICE) : null,
    SALE_DATE: epochMsToDate(attrs.SALE_DATE as number | null),
    ZONING: String(attrs.ZONING ?? ''),
  };
}

async function queryFeatureService(where: string): Promise<ParcelRecord[]> {
  const params = new URLSearchParams({
    f: 'json',
    returnGeometry: 'false',
    outFields: OUT_FIELDS,
    resultRecordCount: '100',
    where,
  });
  const url = `${FEATURE_SERVICE_URL}?${params.toString()}`;

  // Return cached result if still fresh
  const cached = cache.get(url);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.result;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new MultcoApiError(url, response.status, `ArcGIS returned HTTP ${response.status}`);
  }

  const json = (await response.json()) as {
    features?: { attributes: Record<string, unknown> }[];
    error?: { message: string };
  };

  if (json.error) {
    throw new MultcoApiError(url, 200, `ArcGIS error: ${json.error.message}`);
  }

  if (!Array.isArray(json.features)) {
    throw new MultcoApiError(url, 200, 'ArcGIS response missing features array');
  }

  const result = json.features.map((f) => parseAttributes(f.attributes));
  cache.set(url, { result, fetchedAt: Date.now() });
  return result;
}

/**
 * Parse a Portland-style address string into a street number and street tokens.
 * Handles "4150 N Williams Ave", "4150 N. Williams Avenue", "4150 N WILLIAMS", etc.
 * Returns null if no leading street number is found.
 */
export function parsePortlandAddress(
  input: string
): { num: string; streetTokens: string[] } | null {
  const cleaned = input
    .toUpperCase()
    .replace(/[.,#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const match = cleaned.match(/^(\d+)\s+(.+)/);
  if (!match) return null;

  const num = match[1];
  // Split remaining tokens, strip common suffixes and city/state/zip tail
  const rawTokens = match[2].split(' ');

  const SUFFIX_STRIP = new Set([
    'AVE', 'AVENUE', 'ST', 'STREET', 'BLVD', 'BOULEVARD',
    'RD', 'ROAD', 'DR', 'DRIVE', 'LN', 'LANE', 'WAY',
    'CT', 'COURT', 'PL', 'PLACE', 'CIR', 'CIRCLE',
    'PORTLAND', 'OR', 'OREGON',
  ]);

  // Drop city/state/zip from the end
  const streetTokens: string[] = [];
  for (const tok of rawTokens) {
    if (/^\d{5}$/.test(tok)) break; // zip code — stop
    if (!SUFFIX_STRIP.has(tok)) {
      streetTokens.push(tok);
    }
  }

  if (streetTokens.length === 0) return null;
  return { num, streetTokens };
}

export async function fetchByAddress(address: string): Promise<ParcelRecord[]> {
  const parsed = parsePortlandAddress(address);
  if (!parsed) return [];

  const { num, streetTokens } = parsed;
  // Use the first meaningful street token (direction + name) for the LIKE clause
  const streetBody = streetTokens.join('%');
  const where = `UPPER(SITUSADDR) LIKE '%${num}%${streetBody}%'`;
  return queryFeatureService(where);
}

export async function fetchByOwnerName(name: string): Promise<ParcelRecord[]> {
  const escaped = name.replace(/'/g, "''");
  const where = `UPPER(NAME) = '${escaped}'`;
  return queryFeatureService(where);
}

export async function fetchByMailingAddress(addr1: string): Promise<ParcelRecord[]> {
  const parsed = parsePortlandAddress(addr1);
  if (!parsed) return [];

  const { num, streetTokens } = parsed;
  const streetBody = streetTokens.join('%');
  const escaped = `%${num}%${streetBody}%`.replace(/'/g, "''");
  const where = `UPPER(ADDR1) LIKE '${escaped}'`;
  return queryFeatureService(where);
}

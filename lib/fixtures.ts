import type { LookupResult } from './types';

function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[.,#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const FIXTURES: Record<string, LookupResult> = {
  '1500 sw 5th ave portland or': {
    address: '1500 SW 5th Ave, Portland, OR',
    matched: true,
    entities: [
      {
        id: 'prop:multco:R245891',
        type: 'property',
        name: '1500 SW 5th Ave',
        metadata: {
          parcel_id: 'R245891',
          year_built: 1987,
          units: 48,
          assessed_value: '$4,200,000',
          zoning: 'CX — Central Commercial',
        },
        confidence: 0.99,
      },
      {
        id: 'llc:or-sos:7823451-89',
        type: 'llc',
        name: 'FIFTH AVE HOLDINGS LLC',
        metadata: {
          registered: '2011-03-14',
          status: 'Active',
          state: 'Oregon',
          principal_address: '888 SW 5th Ave Ste 1200, Portland OR 97204',
        },
        cross_property_count: 8,
        confidence: 0.97,
      },
      {
        id: 'llc:or-sos:4491023-12',
        type: 'llc',
        name: 'PDX URBAN PROPERTIES LLC',
        metadata: {
          registered: '2008-07-02',
          status: 'Active',
          state: 'Oregon',
          principal_address: '888 SW 5th Ave Ste 1200, Portland OR 97204',
          role: 'Manager of FIFTH AVE HOLDINGS LLC',
        },
        cross_property_count: 19,
        confidence: 0.95,
      },
      {
        id: 'human:james-k-wheeler',
        type: 'human',
        name: 'JAMES K. WHEELER',
        metadata: {
          role: 'Registered Agent & Manager',
          address: '888 SW 5th Ave Ste 1200, Portland OR 97204',
          llcs_as_agent: 12,
          llcs_as_member_or_manager: 9,
        },
        cross_property_count: 43,
        confidence: 0.93,
      },
    ],
    edges: [
      {
        from: 'prop:multco:R245891',
        to: 'llc:or-sos:7823451-89',
        relationship: 'owned by',
        confidence: 0.97,
      },
      {
        from: 'llc:or-sos:7823451-89',
        to: 'llc:or-sos:4491023-12',
        relationship: 'managed by',
        confidence: 0.95,
      },
      {
        from: 'llc:or-sos:4491023-12',
        to: 'human:james-k-wheeler',
        relationship: 'registered agent',
        confidence: 0.93,
      },
    ],
    sources: [
      'Multnomah County Assessor',
      'Oregon Secretary of State',
      'Portland Maps',
    ],
    permits_count: 7,
    code_violations_count: 3,
    queried_at: new Date().toISOString(),
  },

  '3201 ne alberta st portland or': {
    address: '3201 NE Alberta St, Portland, OR',
    matched: true,
    entities: [
      {
        id: 'prop:multco:R118734',
        type: 'property',
        name: '3201 NE Alberta St',
        metadata: {
          parcel_id: 'R118734',
          year_built: 1924,
          units: 2,
          assessed_value: '$485,000',
          zoning: 'R2 — Two-Family Residential',
        },
        confidence: 0.99,
      },
      {
        id: 'llc:or-sos:9912345-01',
        type: 'llc',
        name: 'ALBERTA HOUSE LLC',
        metadata: {
          registered: '2019-06-22',
          status: 'Active',
          state: 'Oregon',
          principal_address: '3201 NE Alberta St, Portland OR 97211',
          role: 'Property owner',
        },
        cross_property_count: 1,
        confidence: 0.96,
      },
      {
        id: 'human:margaret-lin',
        type: 'human',
        name: 'MARGARET LIN',
        metadata: {
          role: 'Sole Member',
          address: '3201 NE Alberta St, Portland OR 97211',
          note: 'Owner-occupied duplex',
        },
        cross_property_count: 1,
        confidence: 0.94,
      },
    ],
    edges: [
      {
        from: 'prop:multco:R118734',
        to: 'llc:or-sos:9912345-01',
        relationship: 'owned by',
        confidence: 0.96,
      },
      {
        from: 'llc:or-sos:9912345-01',
        to: 'human:margaret-lin',
        relationship: 'sole member',
        confidence: 0.94,
      },
    ],
    sources: [
      'Multnomah County Assessor',
      'Oregon Secretary of State',
      'Portland Maps',
    ],
    permits_count: 1,
    code_violations_count: 0,
    queried_at: new Date().toISOString(),
  },

  '823 nw 23rd ave portland or': {
    address: '823 NW 23rd Ave, Portland, OR',
    matched: true,
    entities: [
      {
        id: 'prop:multco:R334521',
        type: 'property',
        name: '823 NW 23rd Ave',
        metadata: {
          parcel_id: 'R334521',
          year_built: 1912,
          units: 6,
          assessed_value: '$2,100,000',
          zoning: 'CM2 — Corridor Mixed Use 2',
        },
        confidence: 0.99,
      },
      {
        id: 'llc:or-sos:5561872-33',
        type: 'llc',
        name: 'TWENTY-THIRD AVE PROPERTIES LLC',
        metadata: {
          registered: '2015-11-08',
          status: 'Active',
          state: 'Oregon',
          principal_address: '888 SW 5th Ave Ste 1200, Portland OR 97204',
        },
        cross_property_count: 6,
        confidence: 0.97,
      },
      {
        id: 'llc:or-sos:3301948-77',
        type: 'llc',
        name: 'CASCADE REAL ESTATE TRUST',
        metadata: {
          registered: '2006-04-19',
          status: 'Active',
          state: 'Oregon',
          principal_address: '888 SW 5th Ave Ste 1200, Portland OR 97204',
          role: 'Owner of TWENTY-THIRD AVE PROPERTIES LLC',
        },
        cross_property_count: 24,
        confidence: 0.92,
      },
      {
        id: 'llc:or-sos:4491023-12',
        type: 'llc',
        name: 'WHEELER FAMILY HOLDINGS LLC',
        metadata: {
          registered: '2003-09-30',
          status: 'Active',
          state: 'Oregon',
          principal_address: '888 SW 5th Ave Ste 1200, Portland OR 97204',
          role: 'Trustee of CASCADE REAL ESTATE TRUST',
        },
        cross_property_count: 34,
        confidence: 0.89,
      },
      {
        id: 'human:james-k-wheeler',
        type: 'human',
        name: 'JAMES K. WHEELER',
        metadata: {
          role: 'Manager, WHEELER FAMILY HOLDINGS LLC',
          address: '888 SW 5th Ave Ste 1200, Portland OR 97204',
          note: 'Same individual identified across multiple unrelated ownership chains',
          llcs_as_agent: 12,
          llcs_as_member_or_manager: 9,
        },
        cross_property_count: 43,
        confidence: 0.91,
      },
    ],
    edges: [
      {
        from: 'prop:multco:R334521',
        to: 'llc:or-sos:5561872-33',
        relationship: 'owned by',
        confidence: 0.97,
      },
      {
        from: 'llc:or-sos:5561872-33',
        to: 'llc:or-sos:3301948-77',
        relationship: 'owned by',
        confidence: 0.92,
      },
      {
        from: 'llc:or-sos:3301948-77',
        to: 'llc:or-sos:4491023-12',
        relationship: 'trustee',
        confidence: 0.89,
      },
      {
        from: 'llc:or-sos:4491023-12',
        to: 'human:james-k-wheeler',
        relationship: 'managed by',
        confidence: 0.91,
      },
    ],
    sources: [
      'Multnomah County Assessor',
      'Oregon Secretary of State',
      'Portland Maps',
      'Multnomah County Circuit Court Records',
    ],
    permits_count: 3,
    code_violations_count: 1,
    queried_at: new Date().toISOString(),
  },
};

export const DEMO_ADDRESSES: { label: string; full: string }[] = [
  { label: 'Downtown apt building', full: '1500 SW 5th Ave, Portland, OR' },
  { label: 'Alberta duplex', full: '3201 NE Alberta St, Portland, OR' },
  { label: 'NW 23rd mixed-use', full: '823 NW 23rd Ave, Portland, OR' },
];

export function lookupFixture(address: string): LookupResult | null {
  const normalized = normalizeAddress(address);

  // Try exact match first
  if (FIXTURES[normalized]) {
    return { ...FIXTURES[normalized], queried_at: new Date().toISOString() };
  }

  // Try substring match — handle partial addresses like "1500 SW 5th"
  for (const [key, fixture] of Object.entries(FIXTURES)) {
    if (normalized.includes(key.split(' ').slice(0, 3).join(' '))) {
      return { ...fixture, queried_at: new Date().toISOString() };
    }
  }

  return null;
}

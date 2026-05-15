import {
  fetchByAddress,
  fetchByOwnerName,
  fetchByMailingAddress,
  type ParcelRecord,
} from './multco';
import type { Entity, EntityType, LookupResult, OwnershipEdge } from './types';

export const DEMO_ADDRESSES: { label: string; full: string; subtitle: string }[] = [
  {
    label: 'Mason Williams Apartments',
    full: '4150 N Williams Ave, Portland, OR',
    subtitle: 'A 5-LLC concentration on N Williams',
  },
  {
    label: 'Sibling building',
    full: '3600 N Williams Ave, Portland, OR',
    subtitle: 'Same family, different LLC',
  },
  {
    label: 'Single-owner property',
    full: '4415 SW Carl Pl, Portland, OR',
    subtitle: 'A personal-name-owned property — for contrast',
  },
];

// Conservative regex for detecting personal name patterns like "MENASHE,JACK R"
const PERSONAL_NAME_PATTERN = /[A-Z]{2,},\s*[A-Z]{2,}/;
const ATTN_PATTERN = /ATTN\s+([A-Z][A-Z,\s.]+)/;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDate(d: Date | null): string | undefined {
  if (!d) return undefined;
  return d.toISOString().slice(0, 10);
}

/**
 * Extract a human name from NAME, NAME2, or ADDR1 if it looks like a personal name.
 * Returns null if no personal name pattern is detected.
 * Conservative — false positives are worse than misses.
 */
function detectHumanName(parcel: ParcelRecord): string | null {
  for (const field of [parcel.NAME, parcel.NAME2]) {
    if (!field) continue;
    if (PERSONAL_NAME_PATTERN.test(field)) return field.trim();
  }

  const attnMatch = ATTN_PATTERN.exec(parcel.ADDR1);
  if (attnMatch) {
    const candidate = attnMatch[1].trim();
    if (PERSONAL_NAME_PATTERN.test(candidate)) return candidate;
  }

  return null;
}

function buildPropertyEntity(parcel: ParcelRecord): Entity {
  return {
    id: `prop:multco:${parcel.PROPID}`,
    type: 'property',
    name: parcel.SITUSADDR || parcel.PROPID,
    metadata: {
      parcel_id: parcel.PROPID,
      maptaxlot: parcel.MAPTAXLOT,
      year_built: parcel.ACTYEARBUILT,
      sqft: parcel.MAIN_SQFT,
      units: parcel.UNITS,
      zoning: parcel.ZONING,
      imptype: parcel.IMPTYPE,
      deed_date: formatDate(parcel.DEED_DATE),
      sale_price: parcel.SALE_PRICE,
      sale_date: formatDate(parcel.SALE_DATE),
    },
    confidence: 0.99,
  };
}

function buildLlcEntity(name: string, parcel: ParcelRecord, propertyCount: number): Entity {
  return {
    id: `llc:multco:${slugify(name)}`,
    type: 'llc',
    name,
    metadata: {
      mailing_addr1: parcel.ADDR1,
      mailing_addr2: parcel.ADDR2,
      mailing_city: parcel.CITY,
      mailing_state: parcel.STATE,
      mailing_zip: parcel.ZIP,
    },
    cross_property_count: propertyCount,
    confidence: 0.97,
  };
}

function buildMailingAddressEntity(addr1: string): Entity {
  return {
    id: `mailing:${slugify(addr1)}`,
    type: 'mailing_address' as EntityType,
    name: addr1,
    metadata: {},
    confidence: 1.0,
  };
}

function buildHumanEntity(humanName: string): Entity {
  return {
    id: `human:${slugify(humanName)}`,
    type: 'human',
    name: humanName,
    metadata: {
      source: 'multco-parcel-field',
    },
    cross_property_count: 1,
    confidence: 0.85,
  };
}

interface ResolvedOwnership extends LookupResult {
  _distinctLlcsAtMailing: number;
  _totalPropertiesInResult: number;
}

export async function resolveOwnership(rawAddress: string): Promise<ResolvedOwnership> {
  const queriedAt = new Date().toISOString();

  const addressParcels = await fetchByAddress(rawAddress);

  if (addressParcels.length === 0) {
    return {
      address: rawAddress,
      matched: false,
      message:
        "We couldn't find ownership records for that address in Multnomah County's open data. Double-check the spelling, or try one of the example addresses.",
      entities: [],
      edges: [],
      sources: ['Multnomah County Open Data'],
      queried_at: queriedAt,
      _distinctLlcsAtMailing: 0,
      _totalPropertiesInResult: 0,
    };
  }

  const primaryParcel = addressParcels[0];

  const [ownerParcels, mailingParcels] = await Promise.all([
    primaryParcel.NAME ? fetchByOwnerName(primaryParcel.NAME) : Promise.resolve([]),
    primaryParcel.ADDR1 ? fetchByMailingAddress(primaryParcel.ADDR1) : Promise.resolve([]),
  ]);

  // Union all parcels deduplicated by PROPID
  const allParcelsById = new Map<string, ParcelRecord>();
  for (const p of [...addressParcels, ...ownerParcels, ...mailingParcels]) {
    if (p.PROPID) allParcelsById.set(p.PROPID, p);
  }
  const allParcels = Array.from(allParcelsById.values());

  // Count distinct properties per LLC name
  const propertiesPerLlc = new Map<string, number>();
  for (const p of allParcels) {
    if (p.NAME) {
      propertiesPerLlc.set(p.NAME, (propertiesPerLlc.get(p.NAME) ?? 0) + 1);
    }
  }

  // LLCs that share the primary parcel's mailing address
  const allLlcNamesAtMailing = new Set<string>();
  if (primaryParcel.NAME) allLlcNamesAtMailing.add(primaryParcel.NAME);

  const siblingLlcNames = new Set<string>();
  for (const p of mailingParcels) {
    if (p.NAME && p.NAME !== primaryParcel.NAME) {
      siblingLlcNames.add(p.NAME);
      allLlcNamesAtMailing.add(p.NAME);
    }
  }

  const mailingAddr1 = primaryParcel.ADDR1?.trim().toUpperCase() ?? '';
  const useMhub = allLlcNamesAtMailing.size >= 2 && mailingAddr1.length > 0;

  const entities: Entity[] = [];
  const edges: OwnershipEdge[] = [];
  const seenEntityIds = new Set<string>();

  function addEntity(e: Entity) {
    if (!seenEntityIds.has(e.id)) {
      seenEntityIds.add(e.id);
      entities.push(e);
    }
  }

  const propertyEntity = buildPropertyEntity(primaryParcel);
  addEntity(propertyEntity);

  if (primaryParcel.NAME) {
    const primaryIsPersonal = PERSONAL_NAME_PATTERN.test(primaryParcel.NAME);
    let primaryOwnerId: string;

    if (primaryIsPersonal) {
      const humanEntity = buildHumanEntity(primaryParcel.NAME);
      addEntity(humanEntity);
      primaryOwnerId = humanEntity.id;
    } else {
      const primaryLlcEntity = buildLlcEntity(
        primaryParcel.NAME,
        primaryParcel,
        propertiesPerLlc.get(primaryParcel.NAME) ?? 1
      );
      addEntity(primaryLlcEntity);
      primaryOwnerId = primaryLlcEntity.id;
    }

    edges.push({
      from: propertyEntity.id,
      to: primaryOwnerId,
      relationship: 'owned by',
      confidence: 0.97,
    });

    if (useMhub && !primaryIsPersonal) {
      const mhubEntity = buildMailingAddressEntity(mailingAddr1);
      addEntity(mhubEntity);
      edges.push({
        from: primaryOwnerId,
        to: mhubEntity.id,
        relationship: 'mailing address',
        confidence: 1.0,
      });

      for (const siblingName of siblingLlcNames) {
        const siblingParcel =
          mailingParcels.find((p) => p.NAME === siblingName) ?? primaryParcel;
        const siblingIsPersonal = PERSONAL_NAME_PATTERN.test(siblingName);

        if (siblingIsPersonal) {
          const siblingHuman = buildHumanEntity(siblingName);
          addEntity(siblingHuman);
          edges.push({
            from: siblingHuman.id,
            to: mhubEntity.id,
            relationship: 'mailing address',
            confidence: 1.0,
          });
        } else {
          const siblingLlc = buildLlcEntity(
            siblingName,
            siblingParcel,
            propertiesPerLlc.get(siblingName) ?? 1
          );
          addEntity(siblingLlc);
          edges.push({
            from: siblingLlc.id,
            to: mhubEntity.id,
            relationship: 'mailing address',
            confidence: 1.0,
          });
        }
      }
    }
  }

  // Detect surfaced humans from any parcel in the result set
  const seenHumanSlugs = new Set<string>();
  for (const p of allParcels) {
    const humanName = detectHumanName(p);
    if (!humanName) continue;

    const humanSlug = slugify(humanName);
    if (seenHumanSlugs.has(humanSlug)) continue;
    seenHumanSlugs.add(humanSlug);

    const humanEntity = buildHumanEntity(humanName);
    addEntity(humanEntity);

    // Connect LLCs that referenced this human
    const referencingLlcNames = [
      ...new Set(
        allParcels
          .filter((ap) => {
            const hn = detectHumanName(ap);
            return hn && slugify(hn) === humanSlug && ap.NAME;
          })
          .map((ap) => ap.NAME)
      ),
    ];

    for (const llcName of referencingLlcNames) {
      const llcId = `llc:multco:${slugify(llcName)}`;
      if (seenEntityIds.has(llcId)) {
        edges.push({
          from: llcId,
          to: humanEntity.id,
          relationship: 'associated person',
          confidence: 0.85,
        });
      }
    }
  }

  return {
    address: rawAddress,
    matched: true,
    entities,
    edges,
    sources: ['Multnomah County Open Data'],
    queried_at: queriedAt,
    _distinctLlcsAtMailing: allLlcNamesAtMailing.size,
    _totalPropertiesInResult: allParcels.length,
  };
}

export type EntityType = 'property' | 'llc' | 'human' | 'registered_agent' | 'mailing_address';

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  metadata?: Record<string, unknown>;
  cross_property_count?: number;
  confidence?: number;
}

export interface OwnershipEdge {
  from: string;
  to: string;
  relationship: string;
  confidence: number;
}

export interface LookupResult {
  address: string;
  matched: boolean;
  message?: string;
  entities: Entity[];
  edges: OwnershipEdge[];
  sources: string[];
  permits_count?: number;
  code_violations_count?: number;
  queried_at: string;
}

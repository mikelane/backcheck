'use client';

import type { Entity } from '@/lib/types';

const ENTITY_CONFIG = {
  property: {
    label: 'property',
    accentBorder: 'border-l-blue-500',
    accentText: 'text-blue-400',
  },
  llc: {
    label: 'LLC / entity',
    accentBorder: 'border-l-purple-500',
    accentText: 'text-purple-400',
  },
  human: {
    label: 'individual',
    accentBorder: 'border-l-orange-500',
    accentText: 'text-orange-400',
  },
  registered_agent: {
    label: 'registered agent',
    accentBorder: 'border-l-zinc-500',
    accentText: 'text-zinc-400',
  },
  mailing_address: {
    label: 'mailing address',
    accentBorder: 'border-l-cyan-500',
    accentText: 'text-cyan-400',
  },
};

const FALLBACK_CONFIG = ENTITY_CONFIG.llc;

interface EntityCardProps {
  entity: Entity;
}

export default function EntityCard({ entity }: EntityCardProps) {
  const config = ENTITY_CONFIG[entity.type as keyof typeof ENTITY_CONFIG] ?? FALLBACK_CONFIG;

  return (
    <div
      className={`entity-card relative bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 p-4 transition-colors border-l-2 rounded-lg ${config.accentBorder}`}
    >
      <p className={`text-xs font-medium mb-2 ${config.accentText}`}>{config.label}</p>
      <p className="font-sans font-semibold text-zinc-100 text-lg break-words leading-snug">
        {entity.name}
      </p>
      {entity.cross_property_count !== undefined && entity.cross_property_count >= 2 && (
        <p className="font-mono text-xs text-zinc-500 mt-2">
          Owns {entity.cross_property_count} other Portland properties
        </p>
      )}
    </div>
  );
}

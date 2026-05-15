'use client';

import type { Entity } from '@/lib/types';

const ENTITY_CONFIG = {
  property: {
    label: 'PROPERTY',
    accentBorder: 'border-l-blue-500',
    accentText: 'text-blue-500',
  },
  llc: {
    label: 'LLC / ENTITY',
    accentBorder: 'border-l-purple-500',
    accentText: 'text-purple-500',
  },
  human: {
    label: 'INDIVIDUAL',
    accentBorder: 'border-l-orange-500',
    accentText: 'text-orange-500',
  },
  registered_agent: {
    label: 'REGISTERED AGENT',
    accentBorder: 'border-l-zinc-500',
    accentText: 'text-zinc-500',
  },
  mailing_address: {
    label: 'MAILING ADDRESS',
    accentBorder: 'border-l-cyan-500',
    accentText: 'text-cyan-500',
  },
};

const FALLBACK_CONFIG = ENTITY_CONFIG.llc;

interface EntityCardProps {
  entity: Entity;
}

export default function EntityCard({ entity }: EntityCardProps) {
  const config = ENTITY_CONFIG[entity.type as keyof typeof ENTITY_CONFIG] ?? FALLBACK_CONFIG;
  const isHuman = entity.type === 'human';
  const shortId = entity.id.slice(0, 8).toUpperCase();

  return (
    <div
      className={`relative bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 p-4 transition-colors border-l-2 ${config.accentBorder}`}
    >
      {/* Top row: type label + entity ID */}
      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-mono text-[10px] tracking-[0.22em] uppercase ${config.accentText}`}>
          {config.label}
        </span>
        <span className="font-mono text-[10px] text-zinc-600">{shortId}</span>
      </div>

      {/* Entity name */}
      <p className="font-display text-lg text-zinc-100 break-words leading-snug mt-2">
        {entity.name}
      </p>

      {/* Metadata strip */}
      {entity.cross_property_count !== undefined && entity.cross_property_count >= 2 && (
        <p className="font-mono text-[11px] text-zinc-500 mt-2 uppercase tracking-wide">
          OWNS · {entity.cross_property_count} PROPERTIES
        </p>
      )}

      {/* Surfaced badge for humans */}
      {isHuman && (
        <span className={`inline-block mt-2 font-mono text-[10px] tracking-[0.18em] uppercase ${config.accentText}`}>
          ⚑ SURFACED
        </span>
      )}
    </div>
  );
}

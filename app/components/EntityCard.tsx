'use client';

import { Building2, Home, User, Briefcase } from 'lucide-react';
import type { Entity } from '@/lib/types';

const ENTITY_CONFIG = {
  property: {
    icon: Home,
    accent: 'border-blue-500/40 bg-blue-500/5',
    chip: 'bg-blue-500/20 text-blue-300',
    label: 'Property',
  },
  llc: {
    icon: Building2,
    accent: 'border-purple-500/40 bg-purple-500/5',
    chip: 'bg-purple-500/20 text-purple-300',
    label: 'LLC / Entity',
  },
  human: {
    icon: User,
    accent: 'border-orange-500/40 bg-orange-500/5 shadow-orange-500/20 shadow-lg',
    chip: 'bg-orange-500/20 text-orange-300',
    label: 'Individual',
  },
  registered_agent: {
    icon: Briefcase,
    accent: 'border-zinc-500/40 bg-zinc-800/40',
    chip: 'bg-zinc-700/60 text-zinc-400',
    label: 'Registered Agent',
  },
} as const;

interface EntityCardProps {
  entity: Entity;
}

export default function EntityCard({ entity }: EntityCardProps) {
  const config = ENTITY_CONFIG[entity.type];
  const Icon = config.icon;

  return (
    <div
      className={`
        border rounded-xl p-4
        transition-transform duration-150 hover:-translate-y-0.5
        ${config.accent}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon size={16} className="text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold text-zinc-100 truncate">
              {entity.name}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${config.chip}`}>
              {config.label}
            </span>
            {entity.cross_property_count !== undefined && entity.cross_property_count >= 2 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-medium flex-shrink-0">
                {entity.cross_property_count} properties
              </span>
            )}
          </div>
          {entity.confidence !== undefined && (
            <p className="text-xs text-zinc-600 mt-1">
              {Math.round(entity.confidence * 100)}% confidence
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

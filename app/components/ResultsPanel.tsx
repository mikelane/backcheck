'use client';

import dynamic from 'next/dynamic';
import EntityCard from './EntityCard';
import type { LookupResult } from '@/lib/types';

// ReactFlow must be rendered client-side only
const OwnershipGraph = dynamic(() => import('./OwnershipGraph'), { ssr: false });

interface ResultsPanelProps {
  result: LookupResult;
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  if (!result.matched) {
    return (
      <div className="text-center py-16 px-4 animate-fade-in">
        <p className="text-zinc-400 text-lg mb-2">No ownership records found.</p>
        <p className="text-zinc-600 text-sm">
          We couldn&apos;t find ownership records for that address. Try one of the demo
          addresses to see the tool in action.
        </p>
      </div>
    );
  }

  const topHuman = result.entities.find(
    (e) => e.type === 'human' && (e.cross_property_count ?? 0) >= 5
  );

  const queriedAt = new Date(result.queried_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="w-full animate-reveal space-y-5">
      {/* High-risk banner */}
      {topHuman && (
        <div className="rounded-xl bg-gradient-to-r from-orange-500/20 via-red-500/15 to-orange-500/20 border border-orange-500/30 px-5 py-4">
          <p className="text-sm font-semibold text-orange-200">
            ⚠ This person appears on{' '}
            <span className="text-orange-100 font-bold">
              {(topHuman.metadata?.llcs_as_agent as number | undefined) ??
                topHuman.cross_property_count}{' '}
              LLCs
            </span>{' '}
            and{' '}
            <span className="text-orange-100 font-bold">
              {topHuman.cross_property_count} Portland properties
            </span>
            .{' '}
            <span className="font-mono">{topHuman.name}</span>
          </p>
        </div>
      )}

      {/* Main grid: graph (2 cols) + cards (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 overflow-x-auto">
          <OwnershipGraph entities={result.entities} edges={result.edges} />
        </div>

        <div className="flex flex-col gap-3">
          {result.entities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} />
          ))}
        </div>
      </div>

      {/* Metadata strip */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500 border-t border-zinc-800 pt-4">
        <span>
          <span className="text-zinc-400">Sources:</span>{' '}
          {result.sources.join(' · ')}
        </span>
        {result.permits_count !== undefined && (
          <span>
            <span className="text-zinc-400">Building permits (5yr):</span>{' '}
            {result.permits_count}
          </span>
        )}
        {result.code_violations_count !== undefined && (
          <span>
            <span className={result.code_violations_count > 0 ? 'text-red-400' : 'text-zinc-400'}>
              Code violations:
            </span>{' '}
            <span className={result.code_violations_count > 0 ? 'text-red-300' : 'text-zinc-300'}>
              {result.code_violations_count}
            </span>
          </span>
        )}
        <span>
          <span className="text-zinc-400">Queried at:</span> {queriedAt}
        </span>
      </div>
    </div>
  );
}

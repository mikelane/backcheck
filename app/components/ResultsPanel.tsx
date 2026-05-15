'use client';

import dynamic from 'next/dynamic';
import EntityCard from './EntityCard';
import type { LookupResult } from '@/lib/types';

// ReactFlow must be rendered client-side only
const OwnershipGraph = dynamic(() => import('./OwnershipGraph'), { ssr: false });

interface ResultsPanelProps {
  result: LookupResult;
}

// The API injects these extra fields from resolveOwnership for banner logic
interface EnrichedResult extends LookupResult {
  _distinctLlcsAtMailing?: number;
  _totalPropertiesInResult?: number;
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  if (!result.matched) {
    return (
      <div className="text-center py-16 px-4 animate-fade-in">
        <p className="text-zinc-400 text-lg mb-2">No ownership records found.</p>
        <p className="text-zinc-600 text-sm">
          {result.message ??
            "We couldn't find ownership records for that address. Try one of the demo addresses to see the tool in action."}
        </p>
      </div>
    );
  }

  const enriched = result as EnrichedResult;
  const distinctLlcsAtMailing = enriched._distinctLlcsAtMailing ?? 0;
  const totalPropertiesInResult = enriched._totalPropertiesInResult ?? 0;
  const showAlarmBanner = distinctLlcsAtMailing >= 3;

  const queriedAt = new Date(result.queried_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="w-full animate-reveal space-y-5">
      {/* High-risk alarm banner */}
      {showAlarmBanner && (
        <div className="rounded-xl bg-gradient-to-r from-orange-500/20 via-red-500/15 to-orange-500/20 border border-orange-500/30 px-5 py-4">
          <p className="text-sm font-semibold text-orange-200">
            ⚠ This property is owned by an LLC that shares a mailing address with{' '}
            <span className="text-orange-100 font-bold">
              {distinctLlcsAtMailing - 1} other LLCs and entities
            </span>
            , collectively holding{' '}
            <span className="text-orange-100 font-bold">
              {totalPropertiesInResult} properties
            </span>{' '}
            in Multnomah County.
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

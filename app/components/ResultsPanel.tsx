'use client';

import dynamic from 'next/dynamic';
import EntityCard from './EntityCard';
import type { LookupResult } from '@/lib/types';

const OwnershipGraph = dynamic(() => import('./OwnershipGraph'), { ssr: false });

interface ResultsPanelProps {
  result: LookupResult;
}

interface EnrichedResult extends LookupResult {
  _distinctLlcsAtMailing?: number;
  _totalPropertiesInResult?: number;
}

function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

function caseNumber(address: string): string {
  return 'PDX-' + djb2Hash(address).toString().padStart(5, '0').slice(0, 5);
}

function toProperCase(str: string): string {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  if (!result.matched) {
    return (
      <div className="border border-zinc-800 py-20 text-center">
        <p className="font-display italic text-3xl text-zinc-300">
          No public record found for that address.
        </p>
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-zinc-600 mt-4">
          {result.message ?? 'Try one of the demo addresses to see the tool in action.'}
        </p>
      </div>
    );
  }

  const enriched = result as EnrichedResult;
  const distinctLlcsAtMailing = enriched._distinctLlcsAtMailing ?? 0;
  const totalPropertiesInResult = enriched._totalPropertiesInResult ?? 0;
  const showAlarmBanner = distinctLlcsAtMailing >= 3;
  const caseNo = caseNumber(result.address);

  const filedAt = new Date(result.queried_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="w-full animate-reveal space-y-0">
      {/* Report header band */}
      <div className="report-band py-8 px-6 border border-zinc-800">
        <div className="flex justify-between items-baseline">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500">
            BACKCHECK REPORT · CASE NO. {caseNo}
          </span>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500">
            FILED · {filedAt}
          </span>
        </div>
        <hr className="border-zinc-800 mt-4 mb-4" />
        <p className="font-display font-display-wonk text-4xl sm:text-5xl text-zinc-100 leading-tight tracking-tight">
          {toProperCase(result.address)}
        </p>
        <p className="font-mono text-[11px] tracking-wide uppercase text-zinc-500 mt-3">
          PROPERTY RECORD · MULTNOMAH COUNTY ASSESSOR
        </p>
      </div>

      {/* Alarm banner */}
      {showAlarmBanner && (
        <div className="mt-6 border-l-2 border-orange-500 bg-orange-500/[0.06] px-6 py-5">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-orange-400">
            ⚑ CONCENTRATED OWNERSHIP DETECTED
          </p>
          <p className="font-display italic text-2xl text-orange-50 mt-2 leading-snug">
            This property&apos;s owner shares a mailing address with{' '}
            {distinctLlcsAtMailing - 1} other LLCs and entities, collectively holding{' '}
            {totalPropertiesInResult} Portland properties.
          </p>
          <p className="font-sans text-sm text-orange-200/70 mt-3">
            Public records can&apos;t tell you the why. They can tell you the pattern.
          </p>
        </div>
      )}

      {/* Main grid: graph + entity cards */}
      <div className="mt-8 grid lg:grid-cols-5 gap-6">
        {/* Graph */}
        <div className="lg:col-span-3 border border-zinc-800">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500 px-4 py-3 border-b border-zinc-800">
            OWNERSHIP GRAPH
          </div>
          <OwnershipGraph entities={result.entities} edges={result.edges} />
        </div>

        {/* Entity cards */}
        <div className="lg:col-span-2">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500 px-0 py-3 border-b border-zinc-800 mb-3">
            ENTITIES IDENTIFIED · {result.entities.length}
          </div>
          <div className="flex flex-col gap-3">
            {result.entities.map((entity) => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer ledger */}
      <div className="mt-8 border-t border-zinc-800 pt-6 grid sm:grid-cols-3 gap-6 font-mono text-[11px]">
        <div>
          <p className="tracking-[0.22em] uppercase text-zinc-500 mb-2">SOURCES</p>
          <ul className="space-y-1 text-zinc-400">
            {result.sources.map((s) => (
              <li key={s}>· {s}</li>
            ))}
            {result.permits_count !== undefined && (
              <li>· Building permits (5yr): {result.permits_count}</li>
            )}
            {result.code_violations_count !== undefined && (
              <li className={result.code_violations_count > 0 ? 'text-red-400' : ''}>
                · Code violations: {result.code_violations_count}
              </li>
            )}
          </ul>
        </div>
        <div>
          <p className="tracking-[0.22em] uppercase text-zinc-500 mb-2">METHODOLOGY</p>
          <p className="text-zinc-400 leading-relaxed">
            Public records via the Multnomah County Open Data ArcGIS Feature Service. Owner names
            and mailing addresses are returned verbatim by the county. Entity resolution joins on
            exact owner-name and mailing-address matches. Human names surfaced from NAME, NAME2,
            and ATTN-line fields via conservative regex.
          </p>
        </div>
        <div>
          <p className="tracking-[0.22em] uppercase text-zinc-500 mb-2">DISCLAIMER</p>
          <p className="text-zinc-400 leading-relaxed">
            Backcheck aggregates already-public records. It does not characterize landlords or
            recommend action. Confirm any decision with primary sources or legal counsel.
          </p>
        </div>
      </div>
    </div>
  );
}

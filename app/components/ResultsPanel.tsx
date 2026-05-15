'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
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

function toProperCase(str: string): string {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  useEffect(() => {
    gsap.fromTo(
      '.entity-card',
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
    );
  }, [result]);

  if (!result.matched) {
    return (
      <div className="border border-zinc-800 rounded-xl py-20 text-center mt-8">
        <p className="font-sans text-3xl text-zinc-300">
          No public record found for that address.
        </p>
        <p className="text-zinc-600 text-sm mt-4">
          {result.message ?? 'Try one of the demo addresses to see the tool in action.'}
        </p>
      </div>
    );
  }

  const enriched = result as EnrichedResult;
  const distinctLlcsAtMailing = enriched._distinctLlcsAtMailing ?? 0;
  const totalPropertiesInResult = enriched._totalPropertiesInResult ?? 0;
  const showOwnershipStatement = distinctLlcsAtMailing >= 3;

  return (
    <div className="w-full space-y-0">
      {/* Address headline */}
      <header className="mb-10">
        <p className="text-zinc-500 text-sm mb-2">Public record found</p>
        <h2 className="font-sans font-semibold text-zinc-100 leading-[0.95] tracking-tight text-[clamp(2rem,5vw,4rem)] max-w-3xl">
          {toProperCase(result.address)}
        </h2>
      </header>

      {/* Concentrated ownership editorial statement */}
      {showOwnershipStatement && (
        <div className="my-10 max-w-3xl">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">
            Concentrated ownership
          </p>
          <p className="font-sans font-medium text-zinc-100 text-3xl leading-tight">
            This property&apos;s owner shares a mailing address with{' '}
            <span className="text-orange-400">{distinctLlcsAtMailing - 1} other LLCs</span> holding{' '}
            <span className="text-orange-400">{totalPropertiesInResult} Portland properties</span>{' '}
            in total.
          </p>
        </div>
      )}

      {/* Graph + entity list */}
      <div className="mt-12 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 border border-zinc-900 rounded-xl bg-zinc-950/50 overflow-hidden">
          <OwnershipGraph entities={result.entities} edges={result.edges} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-3">
          {result.entities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} />
          ))}
        </div>
      </div>

      {/* Footnote */}
      <p className="text-zinc-500 text-sm mt-12 max-w-3xl leading-relaxed">
        Records via Multnomah County Open Data, queried{' '}
        {new Date(result.queried_at).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
        . Owner names and mailing addresses are returned verbatim by the county. Human names are
        surfaced from NAME, NAME2, and ATTN-line fields via conservative regex. Backcheck does not
        characterize landlords or recommend action.
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar';
import LoadingSequence from './components/LoadingSequence';
import ResultsPanel from './components/ResultsPanel';
import { DEMO_ADDRESSES } from '@/lib/resolve';
import type { LookupResult } from '@/lib/types';

type LookupState = 'idle' | 'loading' | 'done' | 'error';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const RECENT_INQUIRIES = [
  { case: '#PDX-00482', street: '4150 N WILLIAMS AVE', ago: '2m ago' },
  { case: '#PDX-00481', street: '3637 NE 122ND AVE', ago: '9m ago' },
  { case: '#PDX-00480', street: '12424 NE SANDY BLVD', ago: '14m ago' },
  { case: '#PDX-00479', street: '823 NW 23RD AVE', ago: '27m ago' },
  { case: '#PDX-00478', street: '4415 SW CARL PL', ago: '41m ago' },
];

const HOW_WE_WORK = [
  {
    num: '01',
    statement: 'Query the parcel.',
    explanation:
      "We hit Multnomah County's open-data Feature Service for the property record.",
  },
  {
    num: '02',
    statement: 'Resolve the chain.',
    explanation:
      'We pull every property owned by that LLC and every LLC sharing its mailing address.',
  },
  {
    num: '03',
    statement: 'Surface the human.',
    explanation:
      'Personal names appearing in NAME, NAME2, or ATTN-line fields are extracted with a conservative regex and shown explicitly.',
  },
];

export default function Home() {
  const [state, setState] = useState<LookupState>('idle');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [activeAddress, setActiveAddress] = useState('');

  async function runLookup(address: string) {
    setActiveAddress(address);
    setState('loading');
    setResult(null);

    try {
      const [data] = await Promise.all([
        fetch('/api/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        }).then((r) => r.json() as Promise<LookupResult>),
        delay(3000),
      ]);
      setResult(data);
      setState('done');
    } catch {
      setState('error');
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Masthead bar */}
      <header className="sticky top-0 z-50 h-12 bg-zinc-900/60 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-400">
            CIVIC RECORDS //{' '}
            <span className="text-zinc-100">BACKCHECK</span>
          </span>
          <span className="font-mono text-[10px] tracking-wide text-zinc-500">
            v0.1 · pdx
          </span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-500">
            Source: Multnomah County Open Data
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative parcel-grid border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-12 gap-8">
          {/* Left: headline */}
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-orange-400/80 mb-6">
              ↳ A Portland rental transparency tool
            </p>
            <h1>
              <span className="block font-sans text-5xl sm:text-6xl font-light tracking-tight text-zinc-400 leading-[0.95]">
                Renters get
              </span>
              <span className="block font-display font-display-wonk text-6xl sm:text-7xl italic text-zinc-100 leading-[0.95]">
                background-checked.
              </span>
              <span className="block font-display font-display-wonk text-6xl sm:text-7xl font-semibold text-zinc-100 leading-[0.95]">
                Time to check back.
              </span>
            </h1>
            <div className="h-px w-16 bg-orange-500 mt-6" />
            <p className="font-sans text-base text-zinc-400 max-w-md leading-relaxed mt-6">
              Type a Portland address. We trace the parcel through the Multnomah County
              Assessor and surface the LLCs, mailing-address clusters, and human names
              behind the lease you&apos;re about to sign.
            </p>
          </div>

          {/* Right: recent inquiries ledger */}
          <div className="lg:col-span-5">
            <div className="border border-zinc-800 p-5 bg-zinc-900/40">
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500 mb-4">
                RECENT INQUIRIES · 24H
              </p>
              <div className="divide-y divide-zinc-800">
                {RECENT_INQUIRIES.map((row) => (
                  <div key={row.case} className="flex items-center gap-3 py-2">
                    <span className="font-mono text-[10px] text-zinc-600 flex-shrink-0">
                      {row.case}
                    </span>
                    <span className="font-mono text-xs text-zinc-300 flex-1 truncate">
                      {row.street}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500 flex-shrink-0">
                      · {row.ago}
                    </span>
                  </div>
                ))}
              </div>
              <p className="font-mono text-[10px] text-zinc-600 text-right mt-3">
                ↻ public records · no accounts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search section */}
      <section className="max-w-3xl mx-auto w-full px-6 py-16">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500 mb-3">
          FILE A QUERY
        </p>
        <SearchBar onSubmit={runLookup} />

        {/* Filed cases */}
        <div className="mt-8">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500 mb-3">
            FILED CASES
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {DEMO_ADDRESSES.map((demo, idx) => (
              <button
                key={demo.full}
                onClick={() => runLookup(demo.full)}
                className="group relative text-left p-4 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500">
                  CASE #PDX-{(idx + 481).toString().padStart(5, '0')}
                </span>
                <span className="block mt-2 font-display text-lg text-zinc-100 leading-tight">
                  {demo.label}
                </span>
                <span className="block mt-1 font-mono text-[11px] text-zinc-500 uppercase tracking-wide">
                  {demo.full.replace(', Portland, OR', '')}
                </span>
                <span className="block mt-3 font-sans text-xs text-zinc-400 leading-relaxed">
                  {demo.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results area */}
      <section className="flex-1 max-w-5xl mx-auto w-full px-6 pb-16">
        {state === 'idle' && (
          <div className="max-w-3xl mx-auto py-20">
            <div className="space-y-10">
              {HOW_WE_WORK.map((item) => (
                <div key={item.num}>
                  <p className="font-mono text-sm text-zinc-600 tracking-wider">
                    {item.num} /
                  </p>
                  <p className="font-display italic text-2xl text-zinc-100 mt-1">
                    {item.statement}
                  </p>
                  <p className="font-sans text-sm text-zinc-400 leading-relaxed mt-2 max-w-prose">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {state === 'loading' && (
          <LoadingSequence address={activeAddress} />
        )}

        {state === 'done' && result && <ResultsPanel result={result} />}

        {state === 'error' && (
          <div className="border border-zinc-800 py-20 text-center mt-8">
            <p className="font-display italic text-2xl text-red-400">
              Something went wrong.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-600 mt-3">
              Please try again.
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-24 py-10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500">
            BACKCHECK · OPEN RECORDS, NO ACCOUNTS, NO TRACKING.
          </span>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500">
            RECORDS VIA MULTNOMAH COUNTY OPEN DATA
          </span>
        </div>
      </footer>
    </main>
  );
}

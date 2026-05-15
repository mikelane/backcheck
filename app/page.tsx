'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar';
import LoadingSequence from './components/LoadingSequence';
import ResultsPanel from './components/ResultsPanel';
import { DEMO_ADDRESSES } from '@/lib/fixtures';
import type { LookupResult } from '@/lib/types';

type LookupState = 'idle' | 'loading' | 'done' | 'error';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-12 text-center">
        <div className="mb-6">
          <p className="text-zinc-400 text-lg tracking-wide uppercase text-xs font-semibold mb-3 letter-spacing-widest">
            Portland Rental Transparency Tool
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 leading-tight mb-2">
            Renters get background-checked.
          </h1>
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Time to background-check back.
            </span>
          </h2>
          <p className="mt-5 text-zinc-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Type a Portland address. We walk the LLC ownership chain — Multnomah County
            Assessor, Oregon SOS, registered agents — and surface who actually owns the
            building.
          </p>
        </div>

        <SearchBar onSubmit={runLookup} />

        {/* Demo address buttons */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {DEMO_ADDRESSES.map((demo) => (
            <button
              key={demo.full}
              onClick={() => runLookup(demo.full)}
              className="
                px-3 py-1.5 rounded-lg text-xs font-medium
                bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500
                text-zinc-300 hover:text-zinc-100
                transition-colors duration-150
              "
            >
              {demo.label}
            </button>
          ))}
        </div>
      </section>

      {/* Results area */}
      <section className="flex-1 px-4 pb-16 max-w-5xl mx-auto w-full">
        {state === 'idle' && (
          <div className="text-center py-12">
            <div className="inline-flex flex-col items-center gap-3 text-zinc-600">
              <div className="grid grid-cols-3 gap-2 opacity-40">
                {['Property', 'LLC', 'Human'].map((label) => (
                  <div
                    key={label}
                    className="h-8 w-24 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-500"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <p className="text-sm">Enter an address above to trace the ownership chain</p>
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="flex flex-col items-center">
            <p className="text-zinc-500 text-sm mb-1">
              Looking up{' '}
              <span className="text-zinc-300 font-mono">{activeAddress}</span>
            </p>
            <LoadingSequence />
          </div>
        )}

        {state === 'done' && result && <ResultsPanel result={result} />}

        {state === 'error' && (
          <div className="text-center py-12">
            <p className="text-red-400 text-sm">
              Something went wrong. Please try again.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

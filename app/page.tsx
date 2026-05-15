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

const LLC_NAMES = [
  'RUJAX I LLC',
  'RUJAX II',
  'RUJAX III LLC',
  'RUJAX IV LLC',
  'RUJAX V LLC',
  'RUBEN J MENASHE INC',
  'RIVERWOOD BUILDING LLC',
  'STONEHURST APARTMENTS LLC',
  'GARDEN CREST APARTMENTS LLC',
  'MENASHE,JACK R II & MENASHE,MADELEINE K',
  'FIFTH AVE HOLDINGS LLC',
  'PDX URBAN PROPERTIES LLC',
  'ALBERTA HOUSE LLC',
  'TWENTY-THIRD AVE PROPERTIES LLC',
  'CASCADE REAL ESTATE TRUST',
  'WHEELER FAMILY HOLDINGS LLC',
  'BURNSIDE 23 LLC',
  'HAWTHORNE GROVE PROPERTIES',
  'BELMONT HOLDINGS LLC',
  'DIVISION STREET PARTNERS LLC',
  'SELLWOOD PROPERTY GROUP LLC',
  'NORTH WILLIAMS VENTURE LLC',
  'CONCORDIA RESIDENTIAL LLC',
  'LADD AVENUE PROPERTIES LLC',
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
    <div className="relative w-full">
      {/* Hero */}
      <section className="relative px-6 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Brand mark */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-tight text-zinc-100 mb-20"
          >
            backcheck
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500" />
          </a>

          {/* Headline */}
          <h1 className="font-sans font-bold text-zinc-100 leading-[0.9] tracking-tight text-[clamp(3rem,7vw,6rem)] lg:max-w-5xl">
            Background-check
            <span className="inline-flex items-center align-middle mx-3 my-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
              <svg width="84" height="22" viewBox="0 0 84 22" fill="none" aria-hidden>
                <rect x="2" y="6" width="10" height="10" rx="2" fill="#3b82f6" />
                <line x1="13" y1="11" x2="32" y2="11" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="2 2" />
                <rect x="33" y="6" width="10" height="10" rx="2" fill="#a855f7" />
                <line x1="44" y1="11" x2="63" y2="11" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="71" cy="11" r="6" fill="#f97316" />
              </svg>
            </span>
            your landlord.
          </h1>

          {/* Orange hairline */}
          <div className="line-draw mt-8 h-px w-32 bg-gradient-to-r from-orange-500 to-transparent" />

          {/* Sub-paragraph */}
          <p className="max-w-xl mt-6 text-zinc-400 text-lg leading-relaxed font-normal">
            Type any Multnomah County address. We trace the parcel through public records — every
            LLC, every shared mailing address, every human name we can surface from the
            assessor&apos;s own files.
          </p>

          {/* Search bar */}
          <div className="mt-12">
            <SearchBar onSubmit={runLookup} />
          </div>

          {/* Demo addresses — horizontal accordion */}
          <p className="text-zinc-500 text-xs mt-12 mb-3">Or start with a known case:</p>
          <div className="flex gap-2 h-28 group/cases">
            {DEMO_ADDRESSES.map((demo) => (
              <button
                key={demo.full}
                onClick={() => runLookup(demo.full)}
                className="
                  flex-1 hover:flex-[3] focus:flex-[3]
                  relative overflow-hidden text-left
                  bg-zinc-900/40 border border-zinc-800 hover:border-orange-500/40 focus:border-orange-500/60
                  rounded-xl px-5 py-4
                  transition-all duration-500 ease-out
                  group/case
                "
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 scale-y-0 group-hover/case:scale-y-100 group-focus/case:scale-y-100 transition-transform origin-top duration-500" />
                <p className="text-zinc-100 font-medium text-sm group-hover/case:text-base transition-all">
                  {demo.label}
                </p>
                <p className="text-zinc-500 text-xs mt-1 font-mono opacity-0 group-hover/case:opacity-100 group-focus/case:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap text-ellipsis">
                  {demo.full.replace(', Portland, OR', '')}
                </p>
                <p className="text-zinc-400 text-xs mt-2 leading-snug opacity-0 group-hover/case:opacity-100 group-focus/case:opacity-100 transition-opacity duration-500 delay-75">
                  {demo.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LLC marquee — full bleed */}
      <div className="relative w-full overflow-hidden border-y border-zinc-900 py-5 mask-fade mt-20">
        <div className="marquee-track flex gap-12 whitespace-nowrap">
          {[...LLC_NAMES, ...LLC_NAMES].map((name, i) => (
            <span key={i} className="font-mono text-xs text-zinc-500 tracking-wide">
              {name}
            </span>
          ))}
        </div>
        <p className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-zinc-600 bg-zinc-950 pl-4">
          in the database
        </p>
      </div>

      {/* State-dependent area */}
      <div className="max-w-6xl mx-auto px-6">
        {state === 'idle' && (
          <div className="py-24 max-w-2xl">
            <p className="text-zinc-300 text-2xl font-light leading-relaxed">
              Renters get background-checked, credit-checked, eviction-screened. The landlord
              behind the LLC, you have to take on faith. We flip that.
            </p>
            <p className="text-zinc-500 text-sm mt-6 max-w-md">
              We do not characterize landlords. We aggregate already-public records, in 30 seconds,
              before you sign a lease that locks you in for a year.
            </p>
          </div>
        )}

        {state === 'loading' && <LoadingSequence address={activeAddress} />}

        {state === 'done' && result && <ResultsPanel result={result} />}

        {state === 'error' && (
          <p className="text-orange-400 text-sm mt-8">
            Something went wrong — please try again.
          </p>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 mt-16 border-t border-zinc-900">
        <div className="flex flex-wrap justify-between items-baseline gap-4 text-xs text-zinc-500 font-normal leading-relaxed">
          <p className="max-w-md">
            Backcheck aggregates public records from the Multnomah County Open Data ArcGIS Feature
            Service. We do not store searches, accounts, or personal information.
          </p>
          <a
            href="https://gis-multco.opendata.arcgis.com"
            className="text-zinc-400 hover:text-orange-400 transition-colors"
          >
            multco open data &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const STAGES = [
  {
    label: 'Querying Multnomah County Assessor',
    source: 'MULTCO.US / RECORDS',
    delay: 1000,
  },
  {
    label: 'Cross-referencing mailing addresses',
    source: 'MULTCO OPEN DATA / PARCELS',
    delay: 2000,
  },
  {
    label: 'Resolving entity matches across LLCs',
    source: 'CROSS-REFERENCING REGISTERED AGENTS',
    delay: 3000,
  },
];

interface LoadingSequenceProps {
  address: string;
}

export default function LoadingSequence({ address }: LoadingSequenceProps) {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const timers = STAGES.map((stage, i) =>
      window.setTimeout(() => setCompletedCount(i + 1), stage.delay)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-12 border-t border-b border-zinc-800">
      {/* Header strip */}
      <div className="py-3 border-b border-zinc-800">
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500">
          INQUIRY IN PROGRESS · {address}
        </span>
      </div>

      {/* Stage rows */}
      {STAGES.map((stage, i) => {
        const done = completedCount > i;
        const active = completedCount === i;

        return (
          <div
            key={stage.label}
            className={`flex items-start gap-4 py-4 border-b border-zinc-800 last:border-b-0 transition-opacity duration-300 ${
              i > completedCount ? 'opacity-40' : 'opacity-100'
            }`}
          >
            {/* Stage number */}
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500 flex-shrink-0 pt-0.5">
              STAGE 0{i + 1} / 03
            </span>

            {/* Stage content */}
            <div className="flex-1 min-w-0">
              <p
                className={`font-display italic text-lg leading-tight ${
                  done ? 'text-zinc-300' : active ? 'text-zinc-100' : 'text-zinc-500'
                }`}
              >
                {stage.label}
              </p>
              <p className="font-mono text-[11px] text-zinc-500 uppercase tracking-wide mt-0.5">
                {stage.source}
              </p>
            </div>

            {/* Status icon */}
            <div className="flex-shrink-0 pt-1">
              {done ? (
                <CheckCircle2 size={18} className="text-emerald-400 check-pop" />
              ) : (
                <Loader2
                  size={18}
                  className={`text-zinc-500 ${active ? 'animate-spin text-orange-400' : ''}`}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const STAGES = [
  { label: 'Querying the Multnomah County assessor', delay: 1000 },
  { label: 'Cross-referencing mailing addresses', delay: 2000 },
  { label: 'Resolving entity matches across LLCs', delay: 3000 },
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
    <div className="max-w-xl mt-8">
      <p className="text-zinc-500 text-sm mb-6">
        Looking up{' '}
        <span className="font-mono text-zinc-300">{address}</span>
      </p>
      <ul className="space-y-3">
        {STAGES.map((s, i) => {
          const done = completedCount > i;
          return (
            <li key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 flex items-center justify-center">
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 check-pop" />
                ) : (
                  <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                )}
              </span>
              <span
                className={`text-base transition-colors ${
                  done ? 'text-zinc-300' : 'text-zinc-500'
                }`}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

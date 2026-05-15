'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const STAGES = [
  {
    label: 'Querying Multnomah County Assessor',
    subtitle: 'multco.us / records',
    delay: 1000,
  },
  {
    label: 'Searching Oregon SOS Business Registry',
    subtitle: 'sos.oregon.gov / business',
    delay: 2000,
  },
  {
    label: 'Resolving entity matches across LLCs',
    subtitle: 'cross-referencing registered agents',
    delay: 3000,
  },
];

export default function LoadingSequence() {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const timers = STAGES.map((stage, i) =>
      setTimeout(() => setCompletedCount(i + 1), stage.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col gap-4 py-8 max-w-md mx-auto w-full">
      {STAGES.map((stage, i) => {
        const done = completedCount > i;
        const active = completedCount === i;

        return (
          <div
            key={stage.label}
            className={`flex items-start gap-3 transition-opacity duration-300 ${
              i > completedCount ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {done ? (
                <CheckCircle2
                  size={20}
                  className="text-emerald-400 check-pop"
                />
              ) : (
                <Loader2
                  size={20}
                  className={`text-zinc-500 ${active ? 'animate-spin text-orange-400' : ''}`}
                />
              )}
            </div>
            <div>
              <p
                className={`text-sm font-medium leading-snug ${
                  done
                    ? 'text-zinc-300'
                    : active
                    ? 'text-zinc-100 animate-pulse'
                    : 'text-zinc-500'
                }`}
              >
                {stage.label}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">{stage.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function scramble(name: string) {
  return name
    .split('')
    .map((ch) => (/[A-Za-z]/.test(ch) ? CHARS[Math.floor(Math.random() * CHARS.length)] : ch))
    .join('');
}

export default function NameShuffle({ name, duration = 600 }: { name: string; duration?: number }) {
  const [display, setDisplay] = useState(() => scramble(name));

  useEffect(() => {
    const start = performance.now();
    const targetChars = name.split('');
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const resolved = Math.floor(progress * targetChars.length);
      const next = targetChars
        .map((ch, i) => {
          if (i < resolved) return ch;
          if (!/[A-Za-z]/.test(ch)) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');
      setDisplay(next);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setDisplay(name);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [name, duration]);

  return <span>{display}</span>;
}

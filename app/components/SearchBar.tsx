'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSubmit: (address: string) => void;
  defaultValue?: string;
}

export default function SearchBar({ onSubmit, defaultValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim());
    }
  }

  function handleSubmit() {
    if (value.trim()) {
      onSubmit(value.trim());
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto border-b-2 border-zinc-800 focus-within:border-orange-500/60 transition-colors">
      <Search
        className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
        size={18}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="TRY: 4150 N WILLIAMS AVE"
        className="w-full bg-transparent pl-8 pr-36 py-5 font-mono text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none uppercase tracking-wide"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] tracking-[0.22em] uppercase px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-orange-500 hover:text-zinc-950 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
      >
        RUN INQUIRY ↳
      </button>
    </div>
  );
}

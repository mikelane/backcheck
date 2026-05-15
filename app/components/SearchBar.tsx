'use client';

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  }

  return (
    <form
      className="relative flex items-stretch bg-zinc-900/60 backdrop-blur border border-zinc-800 hover:border-zinc-700 focus-within:border-orange-500/60 transition-colors rounded-2xl overflow-hidden w-full"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Try 4150 N Williams Ave"
        className="flex-1 bg-transparent px-6 py-6 text-2xl font-sans font-medium text-zinc-100 placeholder:text-zinc-600 placeholder:font-normal focus:outline-none"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="m-2 px-6 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-medium text-base hover:bg-orange-500 hover:text-zinc-950 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        Look up
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M5 12h14M13 5l7 7-7 7"/>
        </svg>
      </button>
    </form>
  );
}

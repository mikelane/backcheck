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
    <div className="relative flex items-center w-full max-w-2xl mx-auto">
      <Search className="absolute left-4 text-zinc-400 pointer-events-none" size={20} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Try: 1500 SW 5th Ave, Portland, OR"
        className="
          w-full h-14 pl-12 pr-36 text-lg
          bg-zinc-900 border border-zinc-700
          rounded-2xl text-zinc-100 placeholder-zinc-500
          focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/60
          transition-all duration-200
        "
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="
          absolute right-2 h-10 px-5
          bg-orange-500 hover:bg-orange-400
          disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed
          text-white font-semibold text-sm rounded-xl
          transition-colors duration-150
        "
      >
        Look up →
      </button>
    </div>
  );
}

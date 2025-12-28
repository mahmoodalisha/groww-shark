'use client';

import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

export default function ChartHeader({
  categoriesData,
  selectedInstrument,
  onSelectInstrument,
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Create Fuse ONCE
  const fuse = useMemo(() => {
    return new Fuse(categoriesData || [], {
      keys: ['name', 'symbol'],
      threshold: 0.3,
    });
  }, [categoriesData]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const results = fuse.search(query).map(r => r.item);
    setSuggestions(results.slice(0, 8));
  }, [query, fuse]);

  return (
    <div className="relative chart-header p-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">
          {selectedInstrument?.name || 'Bitcoin'}
        </h1>
        <span className="text-gray-400 text-sm">
          {selectedInstrument?.symbol}
        </span>
      </div>

      
      <input
        type="text"
        placeholder="Search stock / crypto / forex"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 rounded bg-gray-900 border border-gray-700 focus:outline-none"
      />

      {suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-gray-900 border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map(item => (
            <li
              key={`${item.symbol}-${item.type}`}
              className="px-3 py-2 cursor-pointer hover:bg-gray-800"
              onClick={() => {
                onSelectInstrument(item);
                setQuery('');
                setSuggestions([]);
              }}
            >
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-gray-400">
                {item.symbol} • {item.type}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

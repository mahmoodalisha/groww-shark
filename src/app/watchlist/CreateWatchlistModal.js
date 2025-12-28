'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  createWatchlist,
  toggleCreateWatchlist
} from '@/store/watchlistSlice';
import { X } from 'lucide-react';

export default function CreateWatchlistModal() {
  const dispatch = useDispatch();
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    dispatch(createWatchlist({ name }));
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-gray-900 border border-gray-700 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Create Watchlist</h2>
          <button onClick={() => dispatch(toggleCreateWatchlist())}>
            <X className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <label className="block text-sm text-gray-400 mb-2">
            Watchlist Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tech Stocks"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-700">
          <button
            onClick={() => dispatch(toggleCreateWatchlist())}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold"
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
}

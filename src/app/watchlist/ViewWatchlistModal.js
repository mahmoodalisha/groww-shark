'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  closeViewWatchlist,
  deleteWatchlist,
  removeSymbolFromWatchlist,
  setActiveWatchlist
} from '@/store/watchlistSlice';
import { X, Trash2 } from 'lucide-react';

export default function ViewWatchlistModal() {
  const dispatch = useDispatch();

  const { watchlists, viewingWatchlistId } = useSelector(
    state => state.watchlist
  );

  const watchlist = watchlists.find(wl => wl.id === viewingWatchlistId);

  if (!watchlist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-xl bg-gray-900 border border-gray-700 shadow-xl">

        
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">{watchlist.name}</h2>

          <button onClick={() => dispatch(closeViewWatchlist())}>
            <X className="text-gray-400 hover:text-white" />
          </button>
        </div>

        
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {watchlist.items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">
              No instruments in this watchlist
            </p>
          ) : (
            <ul className="space-y-2">
              {watchlist.items.map(item => (
                <li
                  key={item.symbol}
                  className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2"
                >
                  <div>
                    <div className="font-mono font-semibold">
                      {item.symbol}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.name}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      dispatch(
                        removeSymbolFromWatchlist({
                          watchlistId: watchlist.id,
                          symbol: item.symbol
                        })
                      )
                    }
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-700">
          <button
            onClick={() => {
              dispatch(setActiveWatchlist(watchlist.id));
              dispatch(closeViewWatchlist());
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
          >
            Set Active
          </button>

          <button
            onClick={() => {
              dispatch(deleteWatchlist({ id: watchlist.id }));
              dispatch(closeViewWatchlist());
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
          >
            <Trash2 size={16} />
            Delete Watchlist
          </button>
        </div>

      </div>
    </div>
  );
}

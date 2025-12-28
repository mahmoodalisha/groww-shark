'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  toggleCategory, 
  updateCategoryData,
  setLoading,
  collapseAll,
  expandAll
} from '@/store/marketDataSlice';
import { fetchSnapshotData } from '@/lib/fetchers/snapshotFetcher';
import { 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Maximize2,
  BarChart3,
  Clock,
  Star,
  Eye
} from 'lucide-react';
import '@/app/globals.css';
import CreateWatchlistModal from './CreateWatchlistModal';
import ViewWatchlistModal from './ViewWatchlistModal';

import {
  setActiveWatchlist,
  toggleCreateWatchlist,
  addSymbolToWatchlist,
  removeSymbolFromWatchlist,
  openViewWatchlist
} from '@/store/watchlistSlice';


const categoryIcons = {
  indices: '📈',
  stocks: '📊',
  futures: '⛽',
  forex: '💱',
  crypto: '₿',
  fno: '📉'
};

export default function MarketWatchPage() {
  const dispatch = useDispatch();
  const { categories, isLoading, lastUpdated } = useSelector((state) => state.marketData);
  
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const {
  watchlists,
  activeWatchlistId,
  isCreatingWatchlist
} = useSelector(state => state.watchlist);

  const activeWatchlist = watchlists.find(
  wl => wl.id === activeWatchlistId
);

  const { viewingWatchlistId } = useSelector(state => state.watchlist);


  
  // Format number with commas and decimals
  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Format percent
  const formatPercent = (percent) => {
    if (!percent) return '0.00%';
    if (typeof percent === 'string') {
      return percent.endsWith('%') ? percent : `${percent}%`;
    }
    return `${percent.toFixed(2)}%`;
  };
  
  // Get time since last update
  const getTimeSince = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };
  
  // Refresh a specific category
  const refreshCategory = useCallback(async (categoryKey) => {
    if (refreshCooldown > 0 || isLoading) return;
    
    const category = categories[categoryKey];
    if (!category || category.symbols.length === 0) return;
    
    dispatch(setLoading(true));
    
    try {
      // Prepare symbols for API call
      const symbolsWithType = category.symbols.map(item => ({
        symbol: item.symbol,
        name: item.name,
        type: item.type === 'forex' ? 'forex' : 
              item.type === 'crypto' ? 'crypto' : 'stock'
      }));
      
      const data = await fetchSnapshotData(symbolsWithType);
      dispatch(updateCategoryData({ category: categoryKey, data }));
      
    } catch (error) {
      console.error(`Error refreshing ${categoryKey}:`, error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, categories, refreshCooldown, isLoading]);
  
  // Refresh all categories (ONLY ON BUTTON CLICK)
  const refreshAll = useCallback(async () => {
    if (refreshCooldown > 0 || isLoading) return;
    
    dispatch(setLoading(true));
    
    try {
      // Refresh each category sequentially
      for (const categoryKey of Object.keys(categories)) {
        const category = categories[categoryKey];
        if (category.symbols.length > 0) {
          const symbolsWithType = category.symbols.map(item => ({
            symbol: item.symbol,
            name: item.name,
            type: item.type === 'forex' ? 'forex' : 
                  item.type === 'crypto' ? 'crypto' : 'stock'
          }));
          
          const data = await fetchSnapshotData(symbolsWithType);
          dispatch(updateCategoryData({ category: categoryKey, data }));
          
          // Wait 12 seconds between categories to respect 5 calls/minute limit
          if (categoryKey !== Object.keys(categories)[Object.keys(categories).length - 1]) {
            await new Promise(resolve => setTimeout(resolve, 12000));
          }
        }
      }
      
    } catch (error) {
      console.error('Error refreshing all categories:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, categories, refreshCooldown, isLoading]);
  
  // Initial data load - ONLY ONCE when page loads
  useEffect(() => {
    refreshAll();
  }, []); // Empty dependency array = runs only once on mount
  
  // Render category dropdown
  const renderCategory = (categoryKey) => {
    const category = categories[categoryKey];
    if (!category) return null;
    
    return (
      <div key={categoryKey} className="mb-4 overflow-hidden rounded-xl bg-gray-800/30 border border-gray-700/50">
        {/* Category Header */}
        <button
          onClick={() => dispatch(toggleCategory(categoryKey))}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-700/20 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-lg">
              {categoryIcons[categoryKey] || '📊'}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <p className="text-sm text-gray-400">
                {category.data?.length || 0} instruments • {getTimeSince(lastUpdated)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                refreshCategory(categoryKey);
              }}
              disabled={isLoading}
              className={`p-2 rounded-lg ${isLoading ? 'bg-gray-700/50 text-gray-500' : 'bg-gray-800 hover:bg-gray-700'}`}
              title="Refresh this category"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <ChevronDown 
              className={`transition-transform duration-300 ${category.expanded ? 'rotate-180' : ''}`}
              size={20}
            />
          </div>
        </button>
        
        {/* Category Content */}
        {category.expanded && (
          <div className="px-4 pb-4 animate-fadeIn">
            <div className="overflow-x-auto rounded-lg border border-gray-700/50">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50 bg-gray-800/50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Symbol</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Last Price</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Change</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {category.data.length > 0 ? (
  category.data.map((item, index) => {

    const alreadyAdded =
      activeWatchlist?.items?.some(
        i => i.symbol === item.symbol
      );

    return (
      <tr
        key={`${categoryKey}-${item.symbol}`}
        className={`border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors ${
          index === category.data.length - 1 ? 'border-b-0' : ''
        }`}
      >
        <td className="py-3 px-4">
          <div className="font-mono font-bold">{item.symbol}</div>
        </td>

        <td className="py-3 px-4">
          <div className="text-sm text-gray-300">{item.name}</div>
        </td>

        <td className="py-3 px-4">
          <div className="font-bold font-mono text-lg">
            {formatNumber(item.price)}
          </div>
        </td>

        <td className="py-3 px-4">
          <div
            className={`flex items-center ${
              item.changeType === 'up'
                ? 'text-green-400'
                : item.changeType === 'down'
                ? 'text-red-400'
                : 'text-gray-400'
            }`}
          >
            {item.changeType === 'up' && (
              <TrendingUp size={16} className="mr-1" />
            )}

            {item.changeType === 'down' && (
              <TrendingDown size={16} className="mr-1" />
            )}

            {item.changeType === 'neutral' && (
              <span className="mr-1">—</span>
            )}

            <span className="font-mono">
              {item.change > 0 && '+'}
              {formatNumber(item.change)}
            </span>
          </div>
        </td>

        <td className="py-3 px-4">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
              item.changeType === 'up'
                ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                : item.changeType === 'down'
                ? 'bg-red-900/30 text-red-400 border border-red-800/50'
                : 'bg-gray-800/40 text-gray-400 border border-gray-700'
            }`}
          >
            {item.change > 0 && '+'}
            {formatPercent(item.percent)}
          </div>
        </td>

        {/* ⭐ ADD / REMOVE WATCHLIST */}
<td className="py-3 px-4 text-center">
  <button
    disabled={!activeWatchlist}
    onClick={() => {
      if (!activeWatchlist) return;

      if (alreadyAdded) {
        dispatch(
          removeSymbolFromWatchlist({
            watchlistId: activeWatchlistId,
            symbol: item.symbol
          })
        );
      } else {
        dispatch(
          addSymbolToWatchlist({
            watchlistId: activeWatchlistId,
            symbol: item.symbol,
            name: item.name,
            type: item.type
          })
        );
      }
    }}
    className="p-2 rounded-full hover:bg-gray-700/40 transition"
    title={alreadyAdded ? 'Remove from watchlist' : 'Add to watchlist'}
  >
    <Star
      size={18}
      className={`transition ${
        alreadyAdded
          ? 'fill-yellow-400 text-yellow-400'
          : 'text-gray-500 hover:text-yellow-400'
      }`}
    />
  </button>
</td>

      </tr>
    );
  })
) : (
                    <tr>
                      <td colSpan="5" className="py-8 px-4 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <RefreshCw size={24} className="animate-spin mb-2" />
                          <p>Fetching live data from Alpha Vantage...</p>
                          <p className="text-sm mt-1">This may take a minute (free tier limits)</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Filter categories based on active tab
  const getFilteredCategories = () => {
    if (activeTab === 'all') {
      return Object.keys(categories);
    }
    return [activeTab];
  };
  
 return (
  <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
    {/* Header */}
    <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
      <div className="px-4 py-4 space-y-4">

        {/* ROW 1: Title + Actions */}
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Market Watch
            </h1>

            <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
              <Clock size={14} />
              <span>Last Updated: {getTimeSince(lastUpdated)}</span>
              <span className="text-xs px-2 py-0.5 bg-gray-800 rounded">
                Alpha Vantage Free Tier
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshAll}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isLoading
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90'
              }`}
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
            </button>

            <button
              onClick={collapseAll}
              className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
            >
              Collapse
            </button>

            <button
              onClick={expandAll}
              className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
            >
              Expand
            </button>
          </div>
        </div>

        {/* ROW 2: Watchlists */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
  {watchlists.map(wl => {
    const isActive = activeWatchlistId === wl.id;

    return (
      <div
        key={wl.id}
        className={`flex items-center rounded-lg overflow-hidden border ${
          isActive
            ? 'border-blue-500 bg-blue-600 text-white'
            : 'border-gray-700 bg-gray-800 text-gray-300'
        }`}
      >
        {/* LEFT: Set Active */}
        <button
          onClick={() => dispatch(setActiveWatchlist(wl.id))}
          className="px-3 py-1.5 text-sm font-medium"
        >
          {wl.name}
        </button>

        {/* RIGHT: View */}
        <button
          onClick={() => dispatch(openViewWatchlist(wl.id))}
          className="px-2 hover:bg-black/20"
          title="View watchlist"
        >
          <Eye size={16} className="text-gray-300 hover:text-white" />
        </button>
      </div>
    );
  })}

  {/* Create */}
  <button
    onClick={() => dispatch(toggleCreateWatchlist())}
    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-500 whitespace-nowrap"
  >
    + Create Watchlist
  </button>
</div>


        {/* ROW 3: Category Tabs */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300'
                : 'bg-gray-800/50 hover:bg-gray-700/50'
            }`}
          >
            All Markets
          </button>

          {Object.keys(categories).map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center space-x-2 transition-colors ${
                activeTab === key
                  ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300'
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <span>{categoryIcons[key]}</span>
              <span>{categories[key].name}</span>
            </button>
          ))}
        </div>

      </div>
    </div>

      
      {/* Market Data */}
      <div className="p-4">
        {/* Active Watchlist Indicator */}
{activeWatchlist && (
  <div className="mb-3 text-sm text-gray-400 flex items-center gap-2">
    <span>Adding to:</span>
    <span className="px-2 py-0.5 rounded bg-gray-800 text-blue-400 font-medium">
      {activeWatchlist.name}
    </span>
  </div>
)}

        
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-300">
            <BarChart3 size={16} />
            <span>
              <strong>Note:</strong> Using Alpha Vantage Free Tier (5 calls/minute, 25/day). 
              Data updates only on manual refresh.
            </span>
          </div>
        </div>
        
        
        {getFilteredCategories().map(renderCategory)}
        
        {/* No Data State */}
        {Object.values(categories).every(cat => cat.data.length === 0) && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
              <RefreshCw size={32} className="animate-spin text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fetching Initial Market Data</h3>
            <p className="text-gray-400 mb-4">
              Loading live prices from Alpha Vantage API (free tier)...
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              This will take about 1-2 minutes as we fetch 6 categories sequentially 
              to respect API limits (5 calls/minute).
            </p>
          </div>
        )}
        
        
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400">Total Instruments</div>
              <div className="text-2xl font-bold">
                {Object.values(categories).reduce((sum, cat) => sum + cat.symbols.length, 0)}
              </div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400">Data Source</div>
              <div className="text-lg font-semibold text-blue-300">
                Alpha Vantage API
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Free Tier • Manual Refresh Only
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-gray-800/90 p-6 rounded-xl border border-gray-700 flex flex-col items-center">
            <RefreshCw size={32} className="animate-spin mb-3 text-blue-400" />
            <p className="text-lg font-medium">Fetching Market Data</p>
            
            <p className="text-xs text-gray-500 mt-2">
              This may take a minute for all 6 categories
            </p>
          </div>
        </div>
      )}
      
      {isCreatingWatchlist && <CreateWatchlistModal />}

      {viewingWatchlistId && <ViewWatchlistModal />}

    </div>
  );
}
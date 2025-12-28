import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  watchlists: [
    {
      id: 'default',
      name: 'My Watchlist',
      items: [],
    }
  ],
  activeWatchlistId: 'default',
  isCreatingWatchlist: false,
  isAddingSymbols: false,
  isLoading: false,
  lastUpdated: null,
  apiCallCount: 0,
  searchResults: [],
  viewingWatchlistId: null,
};

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    // Watchlist management
    createWatchlist: (state, action) => {
      const { name } = action.payload;
      const newWatchlist = {
        id: Date.now().toString(),
        name,
        items: [],
      };
      state.watchlists.push(newWatchlist);
      state.activeWatchlistId = newWatchlist.id;
      state.isCreatingWatchlist = false;
    },
    
    deleteWatchlist: (state, action) => {
      const { id } = action.payload;
      state.watchlists = state.watchlists.filter(wl => wl.id !== id);
      if (state.activeWatchlistId === id) {
        state.activeWatchlistId = state.watchlists[0]?.id || null;
      }
    },

    openViewWatchlist: (state, action) => {
      state.viewingWatchlistId = action.payload;
    },

    closeViewWatchlist: (state) => {
      state.viewingWatchlistId = null;
    },
    
    setActiveWatchlist: (state, action) => {
      state.activeWatchlistId = action.payload;
    },
    
    // Symbol management
    addSymbolToWatchlist: (state, action) => {
      const { watchlistId, symbol, name, type } = action.payload;
      const watchlist = state.watchlists.find(wl => wl.id === watchlistId);
      if (watchlist && !watchlist.items.some(item => item.symbol === symbol)) {
        watchlist.items.push({
          symbol,
          name,
          type: type || 'stock',
          price: 0,
          change: 0,
          percent: '0%',
          changeType: 'neutral',
          lastUpdated: null,
          isStale: false,
          addedAt: new Date().toISOString(),
        });
      }
    },
    
    removeSymbolFromWatchlist: (state, action) => {
      const { watchlistId, symbol } = action.payload;
      const watchlist = state.watchlists.find(wl => wl.id === watchlistId);
      if (watchlist) {
        watchlist.items = watchlist.items.filter(item => item.symbol !== symbol);
      }
    },
    
    // Data updates
    updateWatchlistData: (state, action) => {
      const { watchlistId, updatedItems } = action.payload;
      const watchlist = state.watchlists.find(wl => wl.id === watchlistId);
      if (watchlist) {
        watchlist.items = watchlist.items.map(item => {
          const updatedItem = updatedItems.find(ui => ui.symbol === item.symbol);
          if (updatedItem) {
            return { 
              ...item, 
              price: updatedItem.price || item.price,
              change: updatedItem.change || item.change,
              percent: updatedItem.percent || item.percent,
              changeType: updatedItem.changeType || item.changeType,
              lastUpdated: updatedItem.lastUpdated || new Date().toISOString(),
              isStale: updatedItem.isStale || false
            };
          }
          return item;
        });
      }
      state.lastUpdated = new Date().toISOString();
      state.apiCallCount = state.apiCallCount + 1;
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    setApiCallCount: (state, action) => {
      state.apiCallCount = action.payload;
    },
    
    // UI states
    toggleCreateWatchlist: (state) => {
      state.isCreatingWatchlist = !state.isCreatingWatchlist;
    },
    
    toggleAddSymbols: (state) => {
      state.isAddingSymbols = !state.isAddingSymbols;
    },
    
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    
    // Reset API count (for testing or daily reset)
    resetApiCallCount: (state) => {
      state.apiCallCount = 0;
    }
  }
});

// Optimized refresh thunk - only refreshes when needed
export const refreshWatchlistDataOptimized = (watchlistId) => async (dispatch, getState) => {
  const state = getState();
  const watchlist = state.watchlist.watchlists.find(wl => wl.id === watchlistId);
  
  if (!watchlist || watchlist.items.length === 0) return;
  
  // Check if we need to refresh (data older than 5 minutes)
  const now = Date.now();
  const itemsNeedRefresh = watchlist.items.filter(item => {
    if (!item.lastUpdated) return true;
    const itemTime = new Date(item.lastUpdated).getTime();
    return (now - itemTime) > 300000; // 5 minutes
  });
  
  if (itemsNeedRefresh.length === 0) {
    // All data is fresh, just update timestamp
    dispatch(updateWatchlistData({ 
      watchlistId, 
      updatedItems: [] // Empty array means no API calls
    }));
    return;
  }
  
  dispatch(setLoading(true));
  
  try {
    const updatedItems = await batchFetchQuotesOptimized(itemsNeedRefresh);
    dispatch(updateWatchlistData({ watchlistId, updatedItems }));
  } catch (error) {
    console.error('Error refreshing watchlist data:', error);
  } finally {
    dispatch(setLoading(false));
  }
};

// Manual refresh - user triggered
export const manualRefreshWatchlist = (watchlistId) => async (dispatch, getState) => {
  const state = getState();
  const watchlist = state.watchlist.watchlists.find(wl => wl.id === watchlistId);
  
  if (!watchlist || watchlist.items.length === 0) return;
  
  dispatch(setLoading(true));
  
  try {
    const updatedItems = await batchFetchQuotesOptimized(watchlist.items);
    dispatch(updateWatchlistData({ watchlistId, updatedItems }));
  } catch (error) {
    console.error('Error refreshing watchlist data:', error);
  } finally {
    dispatch(setLoading(false));
  }
};

// Add symbol and refresh immediately
export const addSymbolAndRefresh = (watchlistId, symbolData) => async (dispatch) => {
  // First add the symbol
  dispatch(addSymbolToWatchlist({
    watchlistId,
    symbol: symbolData.symbol,
    name: symbolData.name,
    type: symbolData.type,
  }));
  
  // Then refresh data for this symbol
  dispatch(setLoading(true));
  
  try {
    const updatedItems = await batchFetchQuotesOptimized([{
      symbol: symbolData.symbol,
      name: symbolData.name,
      type: symbolData.type,
    }]);
    
    dispatch(updateWatchlistData({ watchlistId, updatedItems }));
  } catch (error) {
    console.error('Error fetching new symbol data:', error);
  } finally {
    dispatch(setLoading(false));
  }
};

export const { 
  createWatchlist, 
  deleteWatchlist,
  openViewWatchlist,
  closeViewWatchlist,
  setActiveWatchlist,
  addSymbolToWatchlist,
  removeSymbolFromWatchlist,
  updateWatchlistData,
  setLoading,
  setApiCallCount,
  toggleCreateWatchlist,
  toggleAddSymbols,
  setSearchResults,
  clearSearchResults,
  resetApiCallCount,
} = watchlistSlice.actions;

export default watchlistSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';


const initialMarketData = {
  categories: {
    indices: {
      name: 'Indices',
      expanded: true,
      symbols: [
        { symbol: 'SPX', name: 'S&P 500 Index', type: 'index' },
        { symbol: 'NDX', name: 'NASDAQ 100', type: 'index' },
        { symbol: 'DJI', name: 'Dow Jones Industrial', type: 'index' },
        { symbol: 'VIX', name: 'Volatility Index', type: 'index' },
        { symbol: 'DXY', name: 'US Dollar Index', type: 'index' },
        { symbol: 'NIFTY', name: 'Nifty 50', type: 'index' },
        { symbol: 'SENSEX', name: 'BSE Sensex', type: 'index' }
      ],
      data: []
    },
    stocks: {
      name: 'Stocks',
      expanded: true,
      symbols: [
        { symbol: 'AAPL', name: 'Apple Inc', type: 'stock' },
        { symbol: 'TSLA', name: 'Tesla Inc', type: 'stock' },
        { symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
        { symbol: 'GOOGL', name: 'Alphabet Inc', type: 'stock' },
        { symbol: 'AMZN', name: 'Amazon.com', type: 'stock' },
        { symbol: 'NFLX', name: 'Netflix', type: 'stock' },
        { symbol: 'NVDA', name: 'NVIDIA', type: 'stock' },
        { symbol: 'RELIANCE.BSE', name: 'Reliance Industries', type: 'stock' }
      ],
      data: []
    },
    futures: {
      name: 'Futures',
      expanded: true,
      symbols: [
        { symbol: 'CL', name: 'Crude Oil', type: 'commodity' },
        { symbol: 'GC', name: 'Gold', type: 'commodity' },
        { symbol: 'SI', name: 'Silver', type: 'commodity' },
        { symbol: 'NG', name: 'Natural Gas', type: 'commodity' },
        { symbol: 'ZC', name: 'Corn', type: 'commodity' },
        { symbol: 'ZS', name: 'Soybeans', type: 'commodity' }
      ],
      data: []
    },
    forex: {
      name: 'Forex',
      expanded: true,
      symbols: [
        { symbol: 'EUR/USD', name: 'Euro/US Dollar', type: 'forex' },
        { symbol: 'GBP/USD', name: 'British Pound/USD', type: 'forex' },
        { symbol: 'USD/JPY', name: 'US Dollar/Yen', type: 'forex' },
        { symbol: 'USD/INR', name: 'US Dollar/Indian Rupee', type: 'forex' },
        { symbol: 'AUD/USD', name: 'Australian Dollar/USD', type: 'forex' },
        { symbol: 'USD/CAD', name: 'US Dollar/Canadian Dollar', type: 'forex' }
      ],
      data: []
    },
    crypto: {
      name: 'Crypto',
      expanded: true,
      symbols: [
        { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
        { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
        { symbol: 'BNB', name: 'Binance Coin', type: 'crypto' },
        { symbol: 'ADA', name: 'Cardano', type: 'crypto' },
        { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto' },
        { symbol: 'XRP', name: 'Ripple', type: 'crypto' },
        { symbol: 'SOL', name: 'Solana', type: 'crypto' }
      ],
      data: []
    },
    fno: {
      name: 'F&O',
      expanded: true,
      symbols: [
        { symbol: 'NIFTY', name: 'Nifty 50', type: 'index' },
        { symbol: 'BANKNIFTY', name: 'Bank Nifty', type: 'index' },
        { symbol: 'FINNIFTY', name: 'Financial Nifty', type: 'index' },
        { symbol: 'MIDCPNIFTY', name: 'Midcap Nifty', type: 'index' }
      ],
      data: []
    }
  },
  isLoading: false,
  lastUpdated: null
};

const marketDataSlice = createSlice({
  name: 'marketData',
  initialState: initialMarketData,
  reducers: {
    toggleCategory: (state, action) => {
      const category = action.payload;
      if (state.categories[category]) {
        state.categories[category].expanded = !state.categories[category].expanded;
      }
    },
    
    updateCategoryData: (state, action) => {
      const { category, data } = action.payload;
      if (state.categories[category]) {
        state.categories[category].data = data;
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    collapseAll: (state) => {
      Object.keys(state.categories).forEach(key => {
        state.categories[key].expanded = false;
      });
    },
    
    expandAll: (state) => {
      Object.keys(state.categories).forEach(key => {
        state.categories[key].expanded = true;
      });
    }
  }
});

export const {
  toggleCategory,
  updateCategoryData,
  setLoading,
  collapseAll,
  expandAll
} = marketDataSlice.actions;

export default marketDataSlice.reducer;
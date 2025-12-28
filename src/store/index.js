import { configureStore } from '@reduxjs/toolkit';
import marketDataReducer from './marketDataSlice';
import widgetsReducer from './widgetsSlice';
import watchlistReducer from './watchlistSlice';

export const store = configureStore({
  reducer: {
    marketData: marketDataReducer,
    widgets: widgetsReducer,
    watchlist: watchlistReducer,
  },
});

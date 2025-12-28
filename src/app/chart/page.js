'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ChartHeader from './ChartHeader';
import ChartRenderer from '@/charts/ChartRenderer';
import { fetchSnapshotData } from '@/lib/fetchers/snapshotFetcher';
import { fetchHistory } from '@/lib/fetchers/historyFetcher';


export default function ChartPage() {
  const categoriesData = useSelector(state => state.marketData.categories);
  const allSymbols = Object.values(categoriesData).flatMap(cat => cat.symbols || []);

  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState({ amount: 0, percentage: 0 });
  const [chartType, setChartType] = useState('line');
  const [lastUpdated, setLastUpdated] = useState(null);


  // Set default instrument to BTC if available
  useEffect(() => {
    if (!selectedInstrument && allSymbols.length > 0) {
      const btc = allSymbols.find(i => i.symbol === 'BTC') || allSymbols[0];
      setSelectedInstrument(btc);
    }
  }, [allSymbols, selectedInstrument]);

  // Generate chart data from snapshot
  useEffect(() => {
    if (!selectedInstrument) return;

    setLoading(true);

    // Fetch snapshot for this instrument only
    fetchSnapshotData([selectedInstrument])
      .then(data => {
        const instrument = data.find(d => d.symbol === selectedInstrument.symbol);
        if (!instrument) throw new Error('Instrument not found');

        const currentPriceValue = Number(instrument.price);
        setCurrentPrice(currentPriceValue);

        // Create a 30-day synthetic history from current price
        const basePrice = currentPriceValue;
        const history = Array.from({ length: 30 }).map((_, i) => {
          const variation = (Math.random() - 0.5) * 0.05; // ±5%
          const price = +(basePrice * (1 + variation)).toFixed(2);
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return { time: date.toISOString().split('T')[0], value: price };
        });

        // Calculate price change
        const firstPrice = history[0].value;
        const lastPrice = history[history.length - 1].value;
        const changeAmount = +(lastPrice - firstPrice).toFixed(2);
        const changePercentage = +((changeAmount / firstPrice) * 100).toFixed(2);

        setPriceChange({ amount: changeAmount, percentage: changePercentage });
        //  ONLY set synthetic data for LINE chart
        if (chartType === 'line') {
        setHistoryData(history);
        }
      })
      .catch(err => console.error('Error generating chart data:', err))
      .finally(() => setLoading(false));
  }, [selectedInstrument, chartType]);

  // Determine if price is up or down
  const isPositive = priceChange.amount >= 0;

  useEffect(() => {
  setLastUpdated(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  );
}, []);

//  Fetch historical OHLC data when switching to candlestick
useEffect(() => {
  if (!selectedInstrument) return;
  if (chartType !== 'candle') return;

  setLoading(true);

  fetchHistory({
    symbol: selectedInstrument.symbol,
    type: selectedInstrument.type, // stock | crypto | index
    interval: '1D',
  })
    .then(data => {
      setHistoryData(data); // ← IMPORTANT: replaces synthetic data
    })
    .catch(err => {
      console.error('Failed to fetch candle history', err);
      setHistoryData([]);
    })
    .finally(() => setLoading(false));
}, [chartType, selectedInstrument]);



  return (
    <div className="chart-page min-h-screen bg-gray-950">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">Charts</h1>
              <div className="flex space-x-4">
                <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  Line Chart
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  Candlestick
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  Indicators
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  Compare
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white">
                <option>1D</option>
                <option>1W</option>
                <option>1M</option>
                <option>3M</option>
                <option>1Y</option>
                <option>ALL</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Price Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {selectedInstrument && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {selectedInstrument.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedInstrument.name}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {selectedInstrument.symbol} • {selectedInstrument.category}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end space-x-4">
                <div>
                  <div className="text-3xl font-bold text-white">
                    ${currentPrice ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--.--'}
                  </div>
                  <div className={`flex items-center space-x-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="font-semibold">
                      {isPositive ? '↗' : '↘'} ${Math.abs(priceChange.amount).toFixed(2)}
                    </span>
                    <span className="bg-gray-800 px-2 py-0.5 rounded text-sm">
                      {isPositive ? '+' : ''}{priceChange.percentage}%
                    </span>
                    
                  </div>
                </div>
                <div className="h-12 w-px bg-gray-800"></div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">24h High</div>
                  <div className="text-white font-medium">${currentPrice ? (currentPrice * 1.02).toFixed(2) : '--.--'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">24h Low</div>
                  <div className="text-white font-medium">${currentPrice ? (currentPrice * 0.98).toFixed(2) : '--.--'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Instruments */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 backdrop-blur-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">Markets</h3>
                <div className="flex space-x-2 mb-4">
                  <button className="flex-1 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg">
                    All
                  </button>
                  <button className="flex-1 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    Crypto
                  </button>
                  <button className="flex-1 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    Stocks
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <ChartHeader
                  categoriesData={allSymbols}
                  selectedInstrument={selectedInstrument}
                  onSelectInstrument={setSelectedInstrument}
                />
              </div>
            </div>

            
            <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Market Cap</span>
                  <span className="text-white font-medium">$1.2T</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Volume (24h)</span>
                  <span className="text-white font-medium">$32.5B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Circulating Supply</span>
                  <span className="text-white font-medium">19.5M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">All Time High</span>
                  <span className="text-green-400 font-medium">$68,789.63</span>
                </div>
              </div>
            </div>
          </div>

          
          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="flex bg-gray-800 rounded-lg p-1">
                    <button className="px-3 py-1.5 text-sm font-medium bg-gray-700 text-white rounded">
                      1D
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white rounded">
                      1W
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white rounded">
                      1M
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white rounded">
                      3M
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white rounded">
                      1Y
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
  <button
    onClick={() => setChartType('line')}
    className={`p-2 rounded-lg transition-colors ${
      chartType === 'line'
        ? 'bg-gray-700 text-white'
        : 'text-gray-400 hover:bg-gray-800'
    }`}
  >
    📈
  </button>

  <button
    onClick={() => setChartType('candle')}
    className={`p-2 rounded-lg transition-colors ${
      chartType === 'candle'
        ? 'bg-gray-700 text-white'
        : 'text-gray-400 hover:bg-gray-800'
    }`}
  >
    📊
  </button>

  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
    ⚙️
  </button>
</div>

                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-400">
                    Last updated: {lastUpdated ?? '--:--'}
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Chart Container */}
              <div className="relative">
                {loading && (
                  <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-white font-medium">Loading market data...</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
                  {!loading && historyData.length > 0 && (
                    <div className="h-[500px]">
                      <ChartRenderer
                      data={historyData}
                      type={chartType}
                      />

                    </div>
                  )}
                  {!loading && historyData.length === 0 && (
                    <div className="h-[500px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">📈</div>
                        <p className="text-gray-400">No chart data available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart Bottom Bar */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                  <div className="flex space-x-4">
                    <span>Open: ${currentPrice ? currentPrice.toFixed(2) : '--.--'}</span>
                    <span>High: ${currentPrice ? (currentPrice * 1.02).toFixed(2) : '--.--'}</span>
                    <span>Low: ${currentPrice ? (currentPrice * 0.98).toFixed(2) : '--.--'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Data Source: Live Market Feed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Trading Tools */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 backdrop-blur-sm">
                <h4 className="text-sm font-semibold text-white mb-2">Order Book</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-red-400 text-sm">
                    <span>2,448.12</span>
                    <span>12.45 BTC</span>
                  </div>
                  <div className="flex justify-between text-red-400 text-sm">
                    <span>2,447.89</span>
                    <span>8.23 BTC</span>
                  </div>
                  <div className="text-center py-2 text-gray-500 text-sm">Spread: 1.23</div>
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>2,446.66</span>
                    <span>15.67 BTC</span>
                  </div>
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>2,446.45</span>
                    <span>9.81 BTC</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 backdrop-blur-sm">
                <h4 className="text-sm font-semibold text-white mb-2">Recent Trades</h4>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400">10:{45 - i}:23</span>
                      <span className="text-white">${(currentPrice + i * 0.01).toFixed(2)}</span>
                      <span className={i % 2 === 0 ? 'text-green-400' : 'text-red-400'}>
                        {i % 2 === 0 ? 'BUY' : 'SELL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 backdrop-blur-sm">
                <h4 className="text-sm font-semibold text-white mb-2">Trading Volume</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>24h Volume</span>
                      <span className="text-white">$32.5B</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Buy Pressure</span>
                      <span className="text-green-400">62%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
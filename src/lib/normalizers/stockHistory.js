//Alpha Vantage  Chart.js format
// Alpha Vantage  unified OHLC format

export function normalizeStockHistory(data) {
  const timeSeries =
    data['Time Series (Daily)'] ||
    data['Time Series (60min)'];

  if (!timeSeries) return [];

  return Object.entries(timeSeries)
    .map(([date, v]) => ({
      time: date,
      open: Number(v['1. open']),
      high: Number(v['2. high']),
      low: Number(v['3. low']),
      close: Number(v['4. close']),
      value: Number(v['4. close']),
    }))
    .filter(d => !Object.values(d).some(Number.isNaN))
    .reverse();
}



//CoinRanking → Chart.js format
// src/lib/normalizers/cryptoHistory.js
// CoinRanking → derived OHLC candles

export function normalizeCryptoHistory(data) {
  const history = data?.data?.history || [];

  if (history.length === 0) return [];

  return history
    .map((point, index, arr) => {
      const price = Number(point.price);
      const prevPrice =
        index > 0 ? Number(arr[index - 1].price) : price;

      return {
        time: point.timestamp, // already UNIX seconds
        open: prevPrice,
        high: Math.max(prevPrice, price),
        low: Math.min(prevPrice, price),
        close: price,
        value: price, // for line chart
      };
    })
    .reverse();
}

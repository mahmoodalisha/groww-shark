import { fetchWithCache } from './cache';
import { normalizeCoinRankingCoins } from '../normalizers/cryptoNormalizer';

export async function fetchSnapshotData(categorySymbols) {
  const results = [];

  // ---- CRYPTO (fetch ONCE) ----
  const cryptoSymbols = categorySymbols.filter(i => i.type === 'crypto');
  if (cryptoSymbols.length > 0) {
    try {
      const data = await fetchWithCache(
        `/api/proxy?provider=coinranking`,
        'coinranking'
      );

      const coins = data?.data?.coins || [];
      results.push(...normalizeCoinRankingCoins(coins));
    } catch (err) {
      console.error('Crypto fetch failed', err);
    }
  }

  // ---- STOCKS / FOREX ----
  for (const item of categorySymbols) {
    if (item.type === 'crypto') continue;

    try {
      // STOCK / INDEX
      if (item.type === 'stock' || item.type === 'index') {
        const data = await fetchWithCache(
          `/api/proxy?function=GLOBAL_QUOTE&symbol=${item.symbol}`,
          `quote:${item.symbol}`
        );

        const q = data?.['Global Quote'];
        if (!q) throw new Error('No quote');

        results.push({
          ...item,
          price: Number(q['05. price']),
          change: Number(q['09. change']),
          percent: q['10. change percent'],
          changeType:
            Number(q['09. change']) > 0 ? 'up' :
            Number(q['09. change']) < 0 ? 'down' : 'neutral',
          lastUpdated: new Date().toISOString(),
        });
      }

      // FOREX
      if (item.type === 'forex') {
        const [from, to] = item.symbol.split('/');
        const data = await fetchWithCache(
          `/api/proxy?function=CURRENCY_EXCHANGE_RATE&from=${from}&to=${to}`,
          `fx:${from}_${to}`
        );

        const r = data?.['Realtime Currency Exchange Rate'];
        if (!r) throw new Error('No forex data');

        results.push({
          ...item,
          price: Number(r['5. Exchange Rate']),
          change: 0,
          percent: '0%',
          changeType: 'neutral',
          lastUpdated: new Date().toISOString(),
        });
      }

    } catch (err) {
      console.error(`Snapshot failed for ${item.symbol}`, err);
    }
  }

  return results;
}

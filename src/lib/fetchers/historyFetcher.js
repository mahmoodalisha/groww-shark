//fetches historical data only when chart page opens (not during search)
import { fetchWithCache } from './cache';
import { normalizeStockHistory } from '../normalizers/stockHistory';
import { normalizeCryptoHistory } from '../normalizers/cryptoHistory';

export async function fetchHistory({ symbol, type, interval = '1D' }) {
  let url = '';
  let cacheKey = `history:${type}:${symbol}:${interval}`;

  if (type === 'stock' || type === 'index') {
    url = `/api/proxy/history/alpha?symbol=${symbol}&interval=${interval}`;
  }

  if (type === 'crypto') {
    url = `/api/proxy/history/crypto?symbol=${symbol}&interval=${interval}`;
  }

  const rawData = await fetchWithCache(url, cacheKey);

  if (type === 'crypto') {
    return normalizeCryptoHistory(rawData);
  }

  return normalizeStockHistory(rawData);
}

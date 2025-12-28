// Simple in-memory cache using Map
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; 

export async function fetchWithCache(url, cacheKey) {
  const cached = cache.get(cacheKey);

  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_DURATION) {
      console.log(`Cache hit for ${cacheKey}`);
      return cached.data;
    } else {
      console.log(`Cache expired for ${cacheKey}`);
      cache.delete(cacheKey);
    }
  } else {
    console.log(`Cache miss for ${cacheKey}`);
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API request failed for ${url}`);
    const data = await res.json();

    cache.set(cacheKey, { data, timestamp: Date.now() });
    console.log(`Fetched and cached: ${cacheKey}`);
    return data;
  } catch (err) {
    console.error(`Fetch failed for ${cacheKey}:`, err);
    throw err;
  }
}

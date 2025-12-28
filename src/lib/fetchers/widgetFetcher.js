import cache from './cache';

export async function fetchWidgetData(widget) {
  const cacheKey = `widget:${widget.apiUrl}`;
  const cached = cache.get(cacheKey);

  if (cached) return cached;

  const res = await fetch(widget.apiUrl);
  if (!res.ok) throw new Error('API Error');

  const json = await res.json();
  cache.set(cacheKey, json, widget.refreshInterval * 1000);

  return json;
}

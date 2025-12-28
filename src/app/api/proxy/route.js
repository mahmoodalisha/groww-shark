import { NextResponse } from 'next/server';

const ALPHA_URL = 'https://www.alphavantage.co/query';
const ALPHA_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const COINRANKING_URL = process.env.COINRANKING_BASE_URL;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 300000; // 5 minutes

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const provider = searchParams.get('provider') || 'alpha';
  const functionType = searchParams.get('function') || 'GLOBAL_QUOTE';
  const symbol = searchParams.get('symbol');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let url = '';
  let cacheKey = '';

  // ===== COINRANKING =====
  if (provider === 'coinranking') {
    cacheKey = 'coinranking';
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return NextResponse.json(cached.data);
      }
    }

    url = `${COINRANKING_URL}/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h&tiers[0]=1&orderBy=marketCap&orderDirection=desc&limit=50&offset=0`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com',
        },
      });
      const data = await res.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: 'CoinRanking API failed' }, { status: 500 });
    }
  }

  // ===== ALPHA VANTAGE =====
  if (functionType === 'GLOBAL_QUOTE') {
    cacheKey = `quote:${symbol}`;
    url = `${ALPHA_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_KEY}`;
  } else if (functionType === 'CURRENCY_EXCHANGE_RATE') {
    if (searchParams.get('type') === 'crypto') {
      cacheKey = `crypto:${symbol}`;
      url = `${ALPHA_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${ALPHA_KEY}`;
    } else {
      cacheKey = `forex:${from}_${to}`;
      url = `${ALPHA_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${ALPHA_KEY}`;
    }
  } else if (functionType === 'TIME_SERIES_INTRADAY') {
    cacheKey = `intraday:${symbol}`;
    url = `${ALPHA_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${ALPHA_KEY}`;
  }

  if (!url) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Check cache
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'API request failed' }, { status: 500 });
  }
}

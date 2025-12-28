import { NextResponse } from 'next/server';

const ALPHA_URL = 'https://www.alphavantage.co/query';
const ALPHA_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const url = `${ALPHA_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Alpha history failed' }, { status: 500 });
  }
}

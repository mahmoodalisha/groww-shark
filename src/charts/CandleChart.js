// src/charts/CandleChart.js
'use client';

import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

export default function CandleChart({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !data?.length) return;

    const candles = data.filter(
      d =>
        typeof d.open === 'number' &&
        typeof d.high === 'number' &&
        typeof d.low === 'number' &&
        typeof d.close === 'number'
    );

    if (!candles.length) return;

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#020617' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
    });

    // ✅ v5 API
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    series.setData(candles);
    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [data]);

  return <div ref={ref} className="w-full h-[500px]" />;
}

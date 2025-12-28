// src/charts/ChartRenderer.js
'use client';

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import CandleChart from './CandleChart';


ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

export default function ChartRenderer({ data, type = 'line' }) {
  if (!data || data.length < 2) return <p>Loading chart...</p>;

  // 🔥 CANDLESTICK
  if (type === 'candle') {
  const hasOHLC = data.some(d => d.open !== undefined);
  if (!hasOHLC) {
    return (
      <div className="h-[500px] flex items-center justify-center text-gray-400">
        Candlestick data not available
      </div>
    );
  }
  return <CandleChart data={data} />;
}


  // 🔥 LINE CHART
  const isUp = data[data.length - 1].value >= data[0].value;
  const lineColor = isUp ? '#22c55e' : '#ef4444';

  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        data: data.map(d => d.value),
        borderColor: lineColor,
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: { display: false },
      y: {
        grid: { color: '#1f2933' },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

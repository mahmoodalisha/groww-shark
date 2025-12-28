'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { removeWidget } from '@/store/widgetsSlice';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial'; // ✅ import from plugin
import 'chartjs-adapter-date-fns';

// Register all Chart.js components + candlestick plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  CandlestickController,
  CandlestickElement
);


export default function WidgetCard({ widget }) {
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/proxy?url=${encodeURIComponent(widget.apiUrl)}`);
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, widget.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [widget]);

  // Function to render table view
  const renderTable = () => {
    if (!data || !widget.selectedFields?.length) return <p className="text-gray-400">No data available</p>;

    const items = Array.isArray(data) ? data : Object.values(data);
    return (
      <div className="overflow-x-auto max-h-64">
        <table className="w-full text-sm border border-gray-700">
          <thead>
            <tr>
              {widget.selectedFields.map(field => (
                <th key={field} className="border px-2 py-1 text-left">{field}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-700">
                {widget.selectedFields.map(field => (
                  <td key={field} className="border px-2 py-1">
                    {item[field] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Function to render card view
  const renderCard = () => {
    if (!data) return <p className="text-gray-400">No data available</p>;
    const items = Array.isArray(data) ? data : [data];

    return (
      <div className="flex flex-col gap-2 max-h-64 overflow-auto">
        {items.map((item, idx) => (
          <div key={idx} className="bg-gray-700 p-3 rounded-md shadow">
            {widget.selectedFields?.length
              ? widget.selectedFields.map(field => (
                  <p key={field} className="text-sm">
                    <span className="font-semibold">{field}: </span>
                    {item[field] ?? '-'}
                  </p>
                ))
              : JSON.stringify(item).slice(0, 100) + '...'}
          </div>
        ))}
      </div>
    );
  };

  // Function to render chart view (Line chart example)
  const renderChart = () => {
    if (!data) return <p className="text-gray-400">No data available</p>;

    try {
      const timeseries = data['Time Series (5min)'] || data['Time Series (Daily)'] || data;
      const labels = Object.keys(timeseries).reverse();
      const prices = labels.map(time => parseFloat(timeseries[time]['4. close'] || timeseries[time].close || 0));

      const chartData = {
        labels,
        datasets: [
          {
            label: widget.name,
            data: prices,
            borderColor: 'rgb(34,197,94)', // green
            backgroundColor: 'rgba(34,197,94,0.2)',
            tension: 0.3,
          },
        ],
      };

      const options = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { display: true }, y: { display: true } },
      };

      return <Line data={chartData} options={options} />;
    } catch (err) {
      return <p className="text-gray-400">Chart cannot be rendered</p>;
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 relative">
      {/* Remove button */}
      <button
        onClick={() => dispatch(removeWidget(widget.id))}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
      >
        <X size={16} />
      </button>

      {/* Widget title */}
      <h3 className="font-semibold mb-3">{widget.name}</h3>

      {/* Loading / Error */}
      {loading && <p className="text-gray-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {/* Render widget based on type */}
      {!loading && !error && (
        <>
          {widget.viewType === 'table' && renderTable()}
          {widget.viewType === 'card' && renderCard()}
          {widget.viewType === 'chart' && renderChart()}
        </>
      )}
    </div>
  );
}

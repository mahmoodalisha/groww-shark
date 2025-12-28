'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { removeWidget } from '@/store/widgetsSlice';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
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

  
  const getValueByPath = (obj, path) => {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
  };

  // Table view
  const renderTable = () => {
    if (!data || !widget.fields?.length) return <p className="text-gray-400">No data available</p>;

    // If the API returns a single object, wrap in array
    const items = Array.isArray(data) ? data : [data];

    return (
      <div className="overflow-x-auto max-h-64">
        <table className="w-full text-sm border border-gray-700">
          <thead>
            <tr>
              {widget.fields.map(f => (
                <th key={f.path} className="border px-2 py-1 text-left">{f.path}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-700">
                {widget.fields.map(f => (
                  <td key={f.path} className="border px-2 py-1">
                    {getValueByPath(item, f.path) ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Card view
  const renderCard = () => {
    if (!data || !widget.fields?.length) return <p className="text-gray-400">No data available</p>;
    const items = Array.isArray(data) ? data : [data];

    return (
      <div className="flex flex-col gap-2 max-h-64 overflow-auto">
        {items.map((item, idx) => (
          <div key={idx} className="bg-gray-700 p-3 rounded-md shadow">
            {widget.fields.map(f => (
              <p key={f.path} className="text-sm">
                <span className="font-semibold">{f.path}: </span>
                {getValueByPath(item, f.path) ?? '-'}
              </p>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Chart view simple line chart
  const renderChart = () => {
    if (!data || !widget.fields?.length) return <p className="text-gray-400">No data available</p>;
    
    // Use first selected field for Y-axis, first primitive path for X-axis
    const yField = widget.fields[0].path;
    const items = Array.isArray(data) ? data : [data];
    const labels = items.map((item, idx) => idx); // simple numeric index for X
    const values = items.map(item => parseFloat(getValueByPath(item, yField)) || 0);

    const chartData = {
      labels,
      datasets: [
        {
          label: yField,
          data: values,
          borderColor: 'rgb(34,197,94)',
          backgroundColor: 'rgba(34,197,94,0.2)',
          tension: 0.3,
        },
      ],
    };

    return <Line data={chartData} options={{ responsive: true }} />;
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 relative">
      <button
        onClick={() => dispatch(removeWidget(widget.id))}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
      >
        <X size={16} />
      </button>

      <h3 className="font-semibold mb-3">{widget.name}</h3>

      {loading && <p className="text-gray-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

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

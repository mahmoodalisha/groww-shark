'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addWidget, closeAddWidget } from '@/store/widgetsSlice';
import { X, Globe, BarChart3, Table, CreditCard, RefreshCw } from 'lucide-react';
import JsonExplorer from '@/components/JsonExplorer';
import { v4 as uuid } from 'uuid';

export default function AddWidgetModal() {
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [viewType, setViewType] = useState('table');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [previewData, setPreviewData] = useState(null);
  const [fields, setFields] = useState([]);
  const [chartType, setChartType] = useState('line');


  const fetchPreview = async () => {
  const res = await fetch(apiUrl);
  const json = await res.json();
  setPreviewData(json);
};

const toggleField = path => {
  setFields(prev =>
    prev.some(f => JSON.stringify(f.path) === JSON.stringify(path))
      ? prev.filter(f => JSON.stringify(f.path) !== JSON.stringify(path))
      : [...prev, { path }]
  );
};


const handleAdd = () => {
  dispatch(addWidget({
    id: uuid(),
    name,
    description: '',
    apiUrl,
    fields,
    viewType,
    chartType,
    refreshInterval,
  }));
  dispatch(closeAddWidget());
};

const isInvalidChartSelection =
  viewType === 'chart' &&
  chartType === 'candlestick' &&
  fields.length !== 4;


  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-lg border border-gray-700/50 shadow-2xl shadow-emerald-500/10">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create New Widget</h2>
              <p className="text-sm text-gray-400">Configure your data visualization</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(closeAddWidget())}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Widget Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Widget Name
            </label>
            <input
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              placeholder="e.g., Stock Prices"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* API URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Globe size={16} className="inline mr-2 mb-1" />
              API Endpoint URL
            </label>
            <input
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-sm"
              placeholder="https://api.example.com/data"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
            />
            <p className="mt-2 text-xs text-gray-500">
              Ensure the API supports CORS and returns JSON format
            </p>
          </div>
          <button
          onClick={fetchPreview}
          disabled={!apiUrl.trim()}
          className="w-full py-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition text-sm font-medium disabled:opacity-50"
          >
          Preview API Response
          </button>
          {previewData && (
          <div className="mt-4 bg-gray-900/60 rounded-xl p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-emerald-400 mb-2">
          Select Fields to Display
          </h4>

          <JsonExplorer
          data={previewData}
          selected={fields}
          onToggle={toggleField}
          />
         </div>
        )}



          {/* View Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Display Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'table', icon: Table, label: 'Table', desc: 'Tabular data' },
                { type: 'chart', icon: BarChart3, label: 'Chart', desc: 'Visual graphs' },
                { type: 'card', icon: CreditCard, label: 'Cards', desc: 'Summary cards' },
              ].map(({ type, icon: Icon, label, desc }) => (
                <button
                  key={type}
                  onClick={() => setViewType(type)}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    viewType === type
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg w-fit mb-3 ${
                    viewType === type ? 'bg-emerald-500/20' : 'bg-gray-700'
                  }`}>
                    <Icon size={20} className={viewType === type ? 'text-emerald-400' : 'text-gray-400'} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">{label}</div>
                    <div className="text-xs text-gray-400 mt-1">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Chart Type (only when Chart is selected) */}
{viewType === 'chart' && (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-3">
      Chart Type
    </label>

    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => setChartType('line')}
        className={`p-4 rounded-xl border transition-all ${
          chartType === 'line'
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-gray-700 bg-gray-800/30'
        }`}
      >
        📈 Line Chart
      </button>

      <button
        onClick={() => setChartType('candlestick')}
        className={`p-4 rounded-xl border transition-all ${
          chartType === 'candlestick'
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-gray-700 bg-gray-800/30'
        }`}
      >
        🕯️ Candlestick
      </button>
    </div>
  </div>
)}


          {/* Refresh Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <RefreshCw size={16} className="inline mr-2 mb-1" />
              Refresh Interval (seconds)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={refreshInterval}
                onChange={e => setRefreshInterval(Number(e.target.value))}
                className="flex-1 accent-emerald-500"
              />
              <div className="px-4 py-2 bg-gray-800/50 rounded-xl min-w-[80px] text-center">
                <span className="text-emerald-400 font-bold">{refreshInterval}s</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Real-time (5s)</span>
              <span>Standard (30s)</span>
              <span>Slow (5m)</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-700/50 bg-gray-900/30 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">ESC</kbd> to cancel
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => dispatch(closeAddWidget())}
                className="px-5 py-2.5 border border-gray-700 text-gray-300 hover:bg-gray-800/50 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-xl font-medium text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!name.trim() || !apiUrl.trim()}
              >
                Create Widget
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
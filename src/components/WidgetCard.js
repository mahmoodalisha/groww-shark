'use client';

import { useEffect, useState } from 'react';

function getValue(obj, pathArray) {
  return pathArray.reduce((acc, key) => {
    if (acc && acc[key] !== undefined) return acc[key];
    return undefined;
  }, obj);
}


export default function WidgetCard({ widget }) {
  const { name, apiUrl, fields, viewType, refreshInterval } = widget;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, refreshInterval * 1000);
    return () => clearInterval(id);
  }, [apiUrl, refreshInterval]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!data) return null;

  // 🔑 SHAPE SAFETY (NOT NORMALIZATION)
  const rows = Array.isArray(data) ? data : [data];

  // ================= TABLE =================
  if (viewType === 'table') {
    return (
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
        <h3 className="font-semibold mb-3">{name}</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                {fields.map(f => (
                  <th key={f.path} className="text-left p-2">
                    {f.path}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-800">
                  {fields.map(f => (
                    <td key={f.path} className="p-2 text-gray-200">
                      {String(getValue(row, f.path) ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ================= CARD =================
  if (viewType === 'card') {
    return (
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
        <h3 className="font-semibold mb-3">{name}</h3>

        <div className="grid grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.path}>
              <div className="text-xs text-gray-400">{f.path}</div>
              <div className="text-lg font-bold">
                {String(getValue(rows[0], f.path) ?? '-')}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

// ================= CHART =================
if (viewType === 'chart') {
  const {
    name,
    chartType,
    seriesPath,
    yKey,
    openKey,
    highKey,
    lowKey,
    closeKey,
  } = widget;

  // ---- REQUIRED CONFIG ----
  if (!seriesPath || !chartType) {
    return (
      <div className="p-4 text-red-400 text-sm">
        Chart configuration missing
      </div>
    );
  }

  // ---- RATE LIMIT / INVALID RESPONSE ----
  if (data?.Information && !getValue(data, seriesPath)) {
    return (
      <div className="p-4 text-yellow-400 text-sm">
        API rate limit reached or invalid response
      </div>
    );
  }

  const seriesObj = getValue(data, seriesPath);

  if (!seriesObj || typeof seriesObj !== 'object') {
    return (
      <div className="p-4 text-red-400 text-sm">
        Invalid series path
      </div>
    );
  }

  const series = objectSeriesToArray(seriesObj);

  if (!Array.isArray(series) || series.length === 0) {
    return (
      <div className="p-4 text-red-400 text-sm">
        No data available
      </div>
    );
  }

  // ---------- LINE CHART ----------
  if (chartType === 'line') {
    if (!yKey) {
      return (
        <div className="p-4 text-red-400 text-sm">
          Y-axis key not selected
        </div>
      );
    }

    const labels = series.map(d => d.__key__);
    const values = series.map(d => {
      const v = Number(d[yKey]);
      return Number.isFinite(v) ? v : null;
    });

    return (
      <LineChart
        labels={labels}
        values={values}
        title={name}
      />
    );
  }

  // ---------- CANDLESTICK ----------
  if (chartType === 'candlestick') {
    if (!openKey || !highKey || !lowKey || !closeKey) {
      return (
        <div className="p-4 text-red-400 text-sm">
          OHLC keys missing
        </div>
      );
    }

    const candles = series
      .map(d => ({
        time: d.__key__,
        open: Number(d[openKey]),
        high: Number(d[highKey]),
        low: Number(d[lowKey]),
        close: Number(d[closeKey]),
      }))
      .filter(c =>
        Number.isFinite(c.open) &&
        Number.isFinite(c.high) &&
        Number.isFinite(c.low) &&
        Number.isFinite(c.close)
      );

    if (candles.length === 0) {
      return (
        <div className="p-4 text-red-400 text-sm">
          Invalid candle data
        </div>
      );
    }

    return (
      <CandleChart
        data={candles}
        title={name}
      />
    );
  }

  return (
    <div className="p-4 text-red-400 text-sm">
      Unsupported chart type
    </div>
  );
}

}

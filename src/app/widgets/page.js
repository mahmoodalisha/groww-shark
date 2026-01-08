'use client';

import { useDispatch, useSelector } from 'react-redux';
import { Plus, TrendingUp, Grid3x3 } from 'lucide-react';
import WidgetCard from '@/components/WidgetCard';
import AddWidgetModal from './AddWidgetModal';
import { openAddWidget } from '@/store/widgetsSlice';
import { useEffect } from 'react';


export default function WidgetsPage() {
  const dispatch = useDispatch();
  const { widgets, isAddingWidget } = useSelector(s => s.widgets);
  useEffect(() => {
  localStorage.setItem('widgets', JSON.stringify(widgets));
    }, [widgets]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 text-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Quantum Dashboard
          </h1>
          <span className="ml-2 px-3 py-1 bg-gray-800/50 rounded-full text-xs font-medium text-cyan-300 border border-cyan-500/30">
            PRO
          </span>
        </div>
        <p className="text-gray-400">Real-time financial data visualization</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Active Widgets</div>
          <div className="text-2xl font-bold text-white">{widgets.length}</div>
        </div>
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Total APIs</div>
          <div className="text-2xl font-bold text-emerald-400">{widgets.length}</div>
        </div>
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Live Updates</div>
          <div className="text-2xl font-bold text-cyan-400">24/7</div>
        </div>
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <div className="text-lg font-bold text-white">All Systems Go</div>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Grid3x3 size={20} className="text-cyan-400" />
          <h2 className="text-lg font-semibold">Widget Dashboard</h2>
        </div>
        <button
          onClick={() => dispatch(openAddWidget())}
          className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Add New Widget
        </button>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
        {widgets.map(widget => (
          <div key={widget.id} className="transform transition-all duration-300 hover:scale-[1.02] hover:z-10">
            <WidgetCard widget={widget} />
          </div>
        ))}

        {/* Add New Widget Card */}
        <button
          onClick={() => dispatch(openAddWidget())}
          className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 p-8 flex flex-col items-center justify-center h-full min-h-[280px] transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl mb-4 group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
              <Plus size={32} className="text-emerald-400 group-hover:text-cyan-300 transition-colors duration-300" />
            </div>
            <h3 className="font-medium text-lg mb-2">Add New Widget</h3>
            <p className="text-sm text-gray-400 text-center">
              Connect to APIs and visualize data in real-time
            </p>
            <div className="mt-6 flex gap-2">
              {['Table', 'Chart', 'Card'].map((type) => (
                <span key={type} className="px-3 py-1 bg-gray-800/50 rounded-lg text-xs text-gray-300">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </button>
      </div>

      
      <div className="mt-8 pt-6 border-t border-gray-800/50 text-center">
        <p className="text-sm text-gray-500">
          Quantum Dashboard v2.1 • Data updates every 30s • 
          <span className="text-emerald-400 ml-2">Connected</span>
        </p>
      </div>

      {isAddingWidget && <AddWidgetModal />}
    </div>
  );
}
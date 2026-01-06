
import React, { useState, useMemo } from 'react';
import { EnergyRecord, ChartFilter } from '../types';
import { exportToCSV } from '../services/dataService';

interface AnalysisViewProps {
  data: EnergyRecord[];
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data }) => {
  const [filter, setFilter] = useState<ChartFilter>({
    startDate: '',
    endDate: '',
    source: 'All'
  });

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const dateMatch = (!filter.startDate || item.timestamp >= filter.startDate) && 
                        (!filter.endDate || item.timestamp <= filter.endDate);
      const sourceMatch = filter.source === 'All' || item.source === filter.source;
      return dateMatch && sourceMatch;
    }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [data, filter]);

  const handleExport = () => {
    exportToCSV(filteredData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Data Analysis</h2>
          <p className="text-gray-600 dark:text-gray-400">Deep dive into your consumption logs</p>
        </div>
        
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="glass p-6 rounded-[24px] border border-white/60 dark:border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider ml-1">Start Date</label>
          <input
            type="date"
            value={filter.startDate}
            onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider ml-1">End Date</label>
          <input
            type="date"
            value={filter.endDate}
            onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider ml-1">Energy Source</label>
          <select
            value={filter.source}
            onChange={(e) => setFilter({ ...filter, source: e.target.value as any })}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
          >
            <option value="All">All Sources</option>
            <option value="Solar">Solar</option>
            <option value="Grid">Grid</option>
            <option value="Battery">Battery</option>
          </select>
        </div>
      </div>

      <div className="glass rounded-[30px] overflow-hidden border border-white/60 dark:border-white/10 shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Usage (kWh)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cost (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredData.slice(0, 100).map((record, index) => (
                <tr key={`${record.timestamp}-${record.source}-${index}`} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{record.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      record.source === 'Solar' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      record.source === 'Grid' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {record.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-300">{record.usageKWh.toFixed(3)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-300">${record.cost.toFixed(3)}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-500 italic">No records found for the selected filter</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 100 && (
          <div className="px-6 py-4 bg-gray-50/30 dark:bg-gray-800/30 text-center text-xs text-gray-500">
            Showing latest 100 records. Export as CSV to view all {filteredData.length} records.
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisView;

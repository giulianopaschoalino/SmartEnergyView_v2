
import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { EnergyRecord, ChartFilter } from '../types';
import { getEnergyInsights } from '../services/geminiService';

interface DashboardProps {
  data: EnergyRecord[];
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, isDarkMode }) => {
  const [filter, setFilter] = useState<ChartFilter>({
    startDate: '',
    endDate: '',
    source: 'All'
  });
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const sourceMatch = filter.source === 'All' || item.source === filter.source;
      return sourceMatch;
    }).slice(-60); // Show last 60 records for performance/view
  }, [data, filter.source]);

  const stats = useMemo(() => {
    const totalUsage = filteredData.reduce((sum, item) => sum + item.usageKWh, 0);
    const totalCost = filteredData.reduce((sum, item) => sum + item.cost, 0);
    const avgUsage = totalUsage / (filteredData.length || 1);
    return { totalUsage, totalCost, avgUsage };
  }, [filteredData]);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const insights = await getEnergyInsights(filteredData);
    setAiInsights(insights);
    setLoadingInsights(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const chartColors = {
    grid: isDarkMode ? '#374151' : '#E5E7EB',
    tick: isDarkMode ? '#9CA3AF' : '#4B5563', // Darker tick color for light mode
    tooltipBg: isDarkMode ? '#1F2937' : 'rgba(255,255,255,0.9)',
    tooltipText: isDarkMode ? '#F3F4F6' : '#111827',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Overview</h2>
          <p className="text-gray-600 dark:text-gray-400">Your energy performance at a glance</p>
        </div>
        
        <div className="glass px-4 py-3 rounded-2xl flex items-center gap-4 shadow-sm border border-white/60 dark:border-white/10">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">SOURCE:</span>
          <div className="flex p-1 bg-gray-200/50 dark:bg-gray-800 rounded-xl">
            {['All', 'Solar', 'Grid', 'Battery'].map(s => (
              <button
                key={s}
                onClick={() => setFilter({ ...filter, source: s as any })}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter.source === s 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-[24px] shadow-sm border border-white/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2 text-blue-600 dark:text-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="text-xs font-bold uppercase tracking-wider">Total Usage</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.totalUsage.toFixed(1)}</span>
            <span className="text-lg text-gray-600 dark:text-gray-400 font-medium">kWh</span>
          </div>
        </div>
        
        <div className="glass p-6 rounded-[24px] shadow-sm border border-white/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2 text-green-600 dark:text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Cost</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">${stats.totalCost.toFixed(2)}</span>
            <span className="text-lg text-gray-600 dark:text-gray-400 font-medium">USD</span>
          </div>
        </div>

        <div className="glass p-6 rounded-[24px] shadow-sm border border-white/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2 text-orange-600 dark:text-orange-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <span className="text-xs font-bold uppercase tracking-wider">Avg. Consumption</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.avgUsage.toFixed(1)}</span>
            <span className="text-lg text-gray-600 dark:text-gray-400 font-medium">kWh/h</span>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[30px] shadow-sm border border-white/60 dark:border-white/10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Usage Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: chartColors.tick}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: chartColors.tick}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                    backgroundColor: chartColors.tooltipBg,
                    color: chartColors.tooltipText
                  }} 
                  itemStyle={{ color: chartColors.tooltipText }}
                />
                <Area type="monotone" dataKey="usageKWh" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-[30px] shadow-sm border border-white/60 dark:border-white/10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Cost Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: chartColors.tick}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: chartColors.tick}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                    backgroundColor: chartColors.tooltipBg,
                    color: chartColors.tooltipText
                  }} 
                  itemStyle={{ color: chartColors.tooltipText }}
                />
                <Bar dataKey="cost" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="glass p-8 rounded-[30px] shadow-sm border border-white/60 dark:border-white/10 bg-gradient-to-br from-white/40 to-blue-50/30 dark:from-gray-800/40 dark:to-blue-900/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Efficiency Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personalized recommendations by Gemini</p>
            </div>
          </div>
          <button 
            onClick={fetchInsights}
            disabled={loadingInsights}
            className="px-4 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {loadingInsights ? 'Refining...' : 'Refresh Insights'}
          </button>
        </div>
        
        <div className="prose prose-blue dark:prose-invert max-w-none">
          {loadingInsights ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
            </div>
          ) : (
            <div className="text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {aiInsights || "Generating insights for your energy profile..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

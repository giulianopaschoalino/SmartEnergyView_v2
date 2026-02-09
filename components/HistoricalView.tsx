
import React, { useState, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EnergyRecord } from '../types.ts';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { SectionCard } from './UIProvider.tsx';

interface HistoricalViewProps {
  data: EnergyRecord[];
  t: any;
  lang: string;
}

const COLORS = ['#375785', '#1991B3', '#27908F', '#E89D45', '#ECAF5B'];

const HistoricalView: React.FC<HistoricalViewProps> = ({ data, t, lang }) => {
  const [refreshing, setRefreshing] = useState(false);
  const years = useMemo(() => {
    const uniqueYears: number[] = Array.from(new Set(data.map(d => new Date(d.timestamp).getFullYear())));
    return uniqueYears.sort((a, b) => b - a);
  }, [data]);

  const [selectedYears, setSelectedYears] = useState<number[]>(() => 
    years.length > 0 ? [years[0], ...(years[1] ? [years[1]] : [])] : []
  );
  const [selectedSource, setSelectedSource] = useState<'All' | 'Solar' | 'Grid' | 'Battery'>('All');
  const [autoScale, setAutoScale] = useState(false);

  const toggleYear = (year: number) => {
    setSelectedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh for visual feedback as local data is used here
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const chartData = useMemo(() => {
    const monthlyDataMap: Record<number, Record<string, number>> = {};
    
    data.forEach(d => {
      const date = new Date(d.timestamp);
      const year = date.getFullYear();
      const monthIdx = date.getMonth();
      const sourceMatch = selectedSource === 'All' || d.source === selectedSource;

      if (sourceMatch && selectedYears.includes(year)) {
        if (!monthlyDataMap[monthIdx]) monthlyDataMap[monthIdx] = {};
        const yearKey = year.toString();
        monthlyDataMap[monthIdx][yearKey] = (monthlyDataMap[monthIdx][yearKey] || 0) + d.usageKWh;
      }
    });

    return Array.from({ length: 12 }, (_, i) => {
      const monthLabel = new Date(2000, i).toLocaleDateString(lang, { month: 'short' });
      const row: any = { month: monthLabel };
      selectedYears.forEach(y => {
        row[y.toString()] = parseFloat((monthlyDataMap[i]?.[y.toString()] || 0).toFixed(2));
      });
      return row;
    });
  }, [data, selectedYears, selectedSource, lang]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight uppercase">{t.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAutoScale(!autoScale)}
            className={`glass px-5 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${autoScale ? 'bg-bondi/10 text-bondi shadow-inner' : 'text-slate-400'}`}
          >
            {autoScale ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {autoScale ? t.historical.shrinkToFit : t.historical.zeroAxis}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-[40px] shadow-sm lg:col-span-2 space-y-6">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t.historical.compare}</h3>
          <div className="flex flex-wrap gap-2">
            {years.map(year => (
              <button
                key={year}
                onClick={() => toggleYear(year)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all border-2 ${
                  selectedYears.includes(year)
                    ? 'bg-yinmn text-white border-yinmn shadow-lg'
                    : 'bg-white/50 dark:bg-night text-slate-400 border-transparent hover:border-slate-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] shadow-sm space-y-6">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t.historical.sourceFilter}</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['All', 'Solar', 'Grid', 'Battery'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSelectedSource(s)}
                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedSource === s ? 'bg-bondi text-white shadow-lg' : 'bg-slate-100 dark:bg-night text-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SectionCard 
        title={t.historical.usageTitle} 
        subtitle={t.historical.usageSubtitle} 
        onRefresh={handleRefresh} 
        isRefreshing={refreshing}
      >
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#88898A'}} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#88898A'}} domain={autoScale ? ['auto', 'auto'] : [0, 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', padding: '16px' }} 
                itemStyle={{ fontWeight: 800 }}
              />
              <Legend verticalAlign="top" height={60} iconType="circle" />
              {selectedYears.map((year, idx) => (
                <Line 
                  key={year} 
                  type="monotone" 
                  dataKey={year.toString()} 
                  stroke={COLORS[idx % COLORS.length]} 
                  strokeWidth={5} 
                  dot={{ r: 5, strokeWidth: 3, fill: '#FFF' }} 
                  activeDot={{ r: 8 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
};

export default HistoricalView;

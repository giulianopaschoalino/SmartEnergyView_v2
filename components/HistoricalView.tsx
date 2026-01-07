import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EnergyRecord } from '../types.ts';

interface HistoricalViewProps {
  data: EnergyRecord[];
  t: any;
  lang: string;
}

const HistoricalView: React.FC<HistoricalViewProps> = ({ data, t, lang }) => {
  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(data.map(d => new Date(d.timestamp).getFullYear())));
    return uniqueYears.sort((a, b) => b - a);
  }, [data]);

  const [selectedYears, setSelectedYears] = useState<number[]>([years[0], years[1] || years[0]]);
  const [selectedSource, setSelectedSource] = useState<'All' | 'Solar' | 'Grid' | 'Battery'>('All');

  const toggleYear = (year: number) => {
    setSelectedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const chartData = useMemo(() => {
    const monthlyData: any[] = [];
    const months = Array.from({ length: 12 }, (_, i) => i);

    months.forEach(m => {
      const monthLabel = new Date(2000, m).toLocaleDateString(lang, { month: 'short' });
      const row: any = { month: monthLabel };

      selectedYears.forEach(year => {
        const usage = data
          .filter(d => {
            const date = new Date(d.timestamp);
            const sourceMatch = selectedSource === 'All' || d.source === selectedSource;
            return date.getFullYear() === year && date.getMonth() === m && sourceMatch;
          })
          .reduce((sum, d) => sum + d.usageKWh, 0);
        
        row[year.toString()] = parseFloat(usage.toFixed(2));
      });

      monthlyData.push(row);
    });

    return monthlyData;
  }, [data, selectedYears, selectedSource, lang]);

  const stats = useMemo(() => {
    const yearlyTotals = selectedYears.map(year => {
      const total = data
        .filter(d => new Date(d.timestamp).getFullYear() === year)
        .reduce((sum, d) => sum + d.usageKWh, 0);
      return { year, total };
    });

    const highestYear = yearlyTotals.length > 0 ? yearlyTotals.reduce((prev, curr) => prev.total < curr.total ? prev : curr).year : (years[0] || 0);
    const totalConsumption = data.reduce((sum, d) => sum + d.usageKWh, 0);

    return { highestYear, totalConsumption };
  }, [data, selectedYears, years]);

  const colors = ['#375785', '#1991B3', '#27908F', '#E89D45', '#ECAF5B'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-night dark:text-white tracking-tight">{t.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-4xl shadow-sm space-y-4 lg:col-span-2">
          <label className="text-[11px] font-bold text-yinmn dark:text-slate-400 uppercase tracking-widest ml-1">{t.compareByYear}</label>
          <div className="flex flex-wrap gap-2">
            {years.map(year => (
              <button
                key={year}
                onClick={() => toggleYear(year)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedYears.includes(year)
                    ? 'bg-yinmn text-white border-yinmn shadow-md'
                    : 'bg-white/50 dark:bg-night text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-yinmn'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-4xl shadow-sm space-y-4">
          <label className="text-[11px] font-bold text-yinmn dark:text-slate-400 uppercase tracking-widest ml-1">{t.sources}</label>
          <div className="grid grid-cols-2 gap-2">
            {(['All', 'Solar', 'Grid', 'Battery'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSelectedSource(s)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  selectedSource === s
                    ? 'bg-bondi text-white shadow-md'
                    : 'bg-slate-100 dark:bg-night text-slate-500 hover:text-yinmn dark:hover:text-white'
                }`}
              >
                {t.sources_labels ? t.sources_labels[s] : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-6 sm:p-8 rounded-4xl shadow-sm">
        <h3 className="text-xl font-bold text-night dark:text-white mb-8">{t.chartTitle}</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(136, 137, 138, 0.1)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#88898A'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#88898A'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', color: '#141414', fontWeight: 'bold' }} 
                formatter={(value: number) => [`${value} kWh`]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {selectedYears.map((year, index) => (
                <Line 
                  key={year} 
                  type="monotone" 
                  dataKey={year.toString()} 
                  stroke={colors[index % colors.length]} 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#FFF' }} 
                  activeDot={{ r: 6 }} 
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-4xl border-l-8 border-l-cyan flex flex-col justify-center">
          <p className="text-[11px] font-black text-cyan uppercase tracking-[0.2em] mb-2">{t.stats.highestYear}</p>
          <p className="text-4xl font-bold text-night dark:text-white tracking-tighter">{stats.highestYear}</p>
        </div>
        <div className="glass p-6 rounded-4xl border-l-8 border-l-yinmn flex flex-col justify-center">
          <p className="text-[11px] font-black text-yinmn uppercase tracking-[0.2em] mb-2">{t.stats.totalKWh}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-night dark:text-white tracking-tighter">{stats.totalConsumption.toLocaleString(lang, { maximumFractionDigits: 0 })}</p>
            <span className="text-slate-400 font-bold uppercase text-xs">kWh</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalView;
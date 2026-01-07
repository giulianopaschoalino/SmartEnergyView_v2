import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { EnergyRecord } from '../types.ts';

interface EconomyViewProps {
  data: EnergyRecord[];
  t: any;
  lang: string;
}

const EconomyView: React.FC<EconomyViewProps> = ({ data, t, lang }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyData = data.filter(item => {
      const d = new Date(item.timestamp);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const ytdData = data.filter(item => {
      const d = new Date(item.timestamp);
      return d.getFullYear() === currentYear;
    });

    const monthlyFree = monthlyData.reduce((acc, curr) => acc + curr.cost, 0);
    const monthlyCaptive = monthlyData.reduce((acc, curr) => acc + curr.captiveCost, 0);
    const monthlySavings = monthlyCaptive - monthlyFree;

    const ytdFree = ytdData.reduce((acc, curr) => acc + curr.cost, 0);
    const ytdCaptive = ytdData.reduce((acc, curr) => acc + curr.captiveCost, 0);
    const ytdSavings = ytdCaptive - ytdFree;

    const annualFree = data.reduce((acc, curr) => acc + curr.cost, 0);
    const annualCaptive = data.reduce((acc, curr) => acc + curr.captiveCost, 0);
    const annualSavings = annualCaptive - annualFree;

    const savingsRate = (annualSavings / (annualCaptive || 1)) * 100;

    return { monthlySavings, monthlyFree, monthlyCaptive, ytdSavings, ytdFree, ytdCaptive, annualSavings, savingsRate };
  }, [data]);

  const projectionData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const annual = stats.annualSavings;
    
    return [
      { year: (currentYear - 3).toString(), economy: annual * 0.85, isProjection: false },
      { year: (currentYear - 2).toString(), economy: annual * 0.88, isProjection: false },
      { year: (currentYear - 1).toString(), economy: annual * 0.94, isProjection: false },
      { year: currentYear.toString(), economy: annual, isProjection: false },
      { year: (currentYear + 1).toString(), economy: annual * 1.08, isProjection: true },
      { year: (currentYear + 2).toString(), economy: annual * 1.15, isProjection: true },
      { year: (currentYear + 3).toString(), economy: annual * 1.25, isProjection: true },
      { year: (currentYear + 4).toString(), economy: annual * 1.32, isProjection: true },
      { year: (currentYear + 5).toString(), economy: annual * 1.40, isProjection: true },
    ];
  }, [stats.annualSavings]);

  const chartData = useMemo(() => {
    const monthlyAgg: Record<string, { name: string; free: number; captive: number }> = {};
    data.slice(-180).forEach(item => {
      const d = new Date(item.timestamp);
      const monthLabel = d.toLocaleDateString(lang, { month: 'short' });
      if (!monthlyAgg[monthLabel]) {
        monthlyAgg[monthLabel] = { name: monthLabel, free: 0, captive: 0 };
      }
      monthlyAgg[monthLabel].free += item.cost;
      monthlyAgg[monthLabel].captive += item.captiveCost;
    });
    return Object.values(monthlyAgg);
  }, [data, lang]);

  const currency = lang === 'pt' ? 'R$' : '$';
  const gridColor = 'rgba(136, 137, 138, 0.1)';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-night dark:text-white tracking-tight">{t.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
        </div>
      </div>

      <div className="glass p-6 md:p-8 rounded-[30px] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <h3 className="text-xl font-bold text-night dark:text-white">
             {t.charts.summary}
           </h3>
           <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-cyan"></div>
               <span className="text-gray-500">{t.charts.historical}</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-bondi"></div>
               <span className="text-gray-500">{t.charts.projection}</span>
             </div>
           </div>
        </div>
        <div className="h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectionData.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#88898A'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#88898A'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', color: '#141414', fontWeight: 'bold' }} 
                formatter={(value: number) => [`${currency} ${value.toFixed(2)}`]}
              />
              <Bar dataKey="economy" radius={[6, 6, 0, 0]}>
                {projectionData.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isProjection ? '#1991B3' : '#27908F'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="glass p-6 md:p-8 rounded-4xl shadow-lg border-l-8 border-l-cyan relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-cyan mb-2">{t.monthly}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-5xl font-bold text-night dark:text-white tracking-tighter">{currency} {stats.monthlySavings.toFixed(2)}</span>
            <span className="text-gray-400 font-bold text-xs uppercase">{t.labels.savings}</span>
          </div>
        </div>

        <div className="glass p-6 md:p-8 rounded-4xl shadow-lg border-l-8 border-l-bondi relative overflow-hidden group">
          <p className="text-[11px] font-black uppercase tracking-widest text-bondi mb-2">{t.annually}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-5xl font-bold text-night dark:text-white tracking-tighter">{currency} {stats.annualSavings.toFixed(2)}</span>
            <span className="text-gray-400 font-bold text-xs uppercase">{t.labels.savings}</span>
          </div>
        </div>
      </div>

      <div className="glass p-6 md:p-8 rounded-4xl shadow-sm">
        <h3 className="text-xl font-bold text-night dark:text-white mb-6">
          {t.breakdown}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/10">
              <span className="text-xs font-black uppercase tracking-widest text-yinmn dark:text-bondi">{t.monthly}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.labels.captive}</p>
                <p className="text-lg font-bold text-night dark:text-white">{currency} {stats.monthlyCaptive.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.labels.free}</p>
                <p className="text-lg font-bold text-cyan">{currency} {stats.monthlyFree.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/10">
              <span className="text-xs font-black uppercase tracking-widest text-yinmn dark:text-bondi">{t.ytd}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.labels.captive}</p>
                <p className="text-lg font-bold text-night dark:text-white">{currency} {stats.ytdCaptive.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.labels.free}</p>
                <p className="text-lg font-bold text-cyan">{currency} {stats.ytdFree.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass p-6 md:p-8 rounded-4xl shadow-sm">
        <h3 className="text-xl font-bold text-night dark:text-white mb-8">{t.charts.trend}</h3>
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#88898A'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#88898A'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', color: '#141414', fontWeight: 'bold' }} 
                formatter={(value: number) => [`${currency} ${value.toLocaleString(lang, { minimumFractionDigits: 2 })}`, t.charts.estimated]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar name={t.charts.estimated} dataKey="economy" radius={[8, 8, 0, 0]}>
                {projectionData.map((entry, index) => (
                  <Cell key={`cell-trend-${index}`} fill={entry.isProjection ? '#1991B3' : '#27908F'} fillOpacity={entry.isProjection ? 0.7 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-6 text-[11px] text-slate-500 dark:text-slate-400 text-center font-bold italic tracking-wide">
          {t.projectionDisclaimer}
        </p>
      </div>

      <div className="glass p-6 md:p-8 rounded-4xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <h3 className="text-xl font-bold text-night dark:text-white">{t.comparison}</h3>
           <div className="px-4 py-2 bg-cyan/10 dark:bg-cyan/20 rounded-2xl text-cyan font-black text-xs uppercase tracking-wider border border-cyan/20">
             {t.percentage}: {stats.savingsRate.toFixed(1)}%
           </div>
        </div>
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#88898A'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#88898A'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', fontWeight: 'bold' }} 
                formatter={(value: number) => [`${currency} ${value.toFixed(2)}`]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar name={t.labels.captive} dataKey="captive" fill="#88898A" radius={[4, 4, 0, 0]} opacity={0.2} />
              <Bar name={t.labels.free} dataKey="free" fill="#375785" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="text-center p-6 bg-yinmn/5 dark:bg-white/5 rounded-3xl border border-yinmn/10 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
        {t.details}
      </div>
    </div>
  );
};

export default EconomyView;
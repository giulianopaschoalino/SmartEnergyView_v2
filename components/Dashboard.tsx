
import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, ComposedChart, Line, Legend 
} from 'recharts';
import { EnergyRecord, ChartFilter } from '../types.ts';
import { getEnergyInsights } from '../services/geminiService.ts';
import { Zap, DollarSign, TrendingUp, BarChart2, Info, RefreshCw } from 'lucide-react';

interface DashboardProps {
  data: EnergyRecord[];
  isDarkMode: boolean;
  t: any;
  lang: string;
}

const INSIGHTS_CACHE_BASE_KEY = 'smart_energia_ai_insights';

const Dashboard: React.FC<DashboardProps> = ({ data, isDarkMode, t, lang }) => {
  const [filter, setFilter] = useState<ChartFilter>({ startDate: '', endDate: '', source: 'All' });
  const cacheKey = `${INSIGHTS_CACHE_BASE_KEY}_${lang}`;
  const [aiInsights, setAiInsights] = useState<string | null>(() => sessionStorage.getItem(cacheKey));
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(cacheKey);
    setAiInsights(cached);
    if (!cached && !loadingInsights) fetchInsights();
  }, [lang, cacheKey]);

  const filteredData = useMemo(() => {
    return (Array.isArray(data) ? data : [])
      .filter(item => filter.source === 'All' || item.source === filter.source)
      .slice(-45);
  }, [data, filter.source]);

  const stats = useMemo(() => {
    const totalUsage = filteredData.reduce((sum, item) => sum + item.usageKWh, 0);
    const totalCost = filteredData.reduce((sum, item) => sum + item.cost, 0);
    const economy = filteredData.reduce((sum, item) => sum + ((item.captiveCost || 0) - item.cost), 0);
    const avgUsage = totalUsage / (filteredData.length || 1);
    return { totalUsage, totalCost, avgUsage, economy };
  }, [filteredData]);

  const monthlyComparison = useMemo(() => {
    const months: Record<string, any> = {};
    data.slice(-180).forEach(d => {
      const mLabel = new Date(d.timestamp).toLocaleDateString(lang, { month: 'short', year: '2-digit' });
      if (!months[mLabel]) months[mLabel] = { month: mLabel, captive: 0, free: 0, economy: 0 };
      months[mLabel].captive += (d.captiveCost || 0);
      months[mLabel].free += (d.cost || 0);
      months[mLabel].economy += ((d.captiveCost || 0) - (d.cost || 0));
    });
    return Object.values(months);
  }, [data, lang]);

  const fetchInsights = async () => {
    if (filteredData.length === 0) return;
    setLoadingInsights(true);
    try {
      const insights = await getEnergyInsights(filteredData, lang);
      setAiInsights(insights);
      if (insights) sessionStorage.setItem(cacheKey, insights);
    } catch (e) {} finally { setLoadingInsights(false); }
  };

  const palette = {
    primary: '#375785',
    bondi: '#1991B3',
    success: '#27908F',
    warning: '#E89D45',
    tick: isDarkMode ? '#88898A' : '#475569',
    grid: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    tooltipBg: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    tooltipText: isDarkMode ? '#F8FAFC' : '#0F172A',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass px-4 py-3 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 animate-in zoom-in-95 backdrop-blur-3xl">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
            {new Date(label).toLocaleDateString(lang, { day: '2-digit', month: 'short' })}
          </p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
              <p className="text-sm font-black dark:text-white leading-tight">
                {p.name}: <span className="font-medium opacity-80">{p.value.toFixed(2)}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const currencyPrefix = lang === 'pt' ? 'R$' : '$';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-night dark:text-white tracking-tight leading-tight">{t.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
        </div>
        
        <div className="glass px-3 py-2 rounded-2xl flex items-center gap-3 shadow-sm border border-black/5 dark:border-white/10 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{t.source}</span>
          <div className="flex p-1 bg-black/5 dark:bg-night rounded-xl">
            {(['All', 'Solar', 'Grid', 'Battery'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter({ ...filter, source: s })}
                className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all whitespace-nowrap uppercase ${filter.source === s ? 'bg-white dark:bg-white/10 text-yinmn dark:text-white shadow-sm' : 'text-slate-500 hover:text-yinmn dark:hover:text-white'}`}
              >
                {t.sources[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: t.stats.usage, val: stats.totalUsage.toFixed(1), unit: 'kWh', color: 'bg-yinmn', icon: Zap },
          { label: t.stats.cost, val: `${currencyPrefix}${stats.totalCost.toFixed(2)}`, unit: '', color: 'bg-bondi', icon: DollarSign },
          { label: t.stats.economyTitle, val: `${currencyPrefix}${stats.economy.toFixed(2)}`, unit: '', color: 'bg-success', icon: TrendingUp },
          { label: t.stats.avg, val: stats.avgUsage.toFixed(1), unit: 'kWh/d', color: 'bg-warning', icon: BarChart2 }
        ].map((item, i) => (
          <div key={i} className="glass p-5 md:p-6 rounded-[32px] shadow-sm border border-black/5 dark:border-white/10 group hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center text-white shadow-lg shadow-black/5`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-night dark:text-white tracking-tight">{item.val}</span>
              {item.unit && <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="glass p-6 md:p-10 rounded-[40px] shadow-sm border border-black/5 dark:border-white/10">
          <h3 className="text-lg font-black text-night dark:text-white mb-10 uppercase tracking-widest">{t.charts.usageTrend}</h3>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs><linearGradient id="usageDashboard" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={palette.primary} stopOpacity={0.2}/><stop offset="95%" stopColor={palette.primary} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.grid} />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: palette.tick}} dy={10} tickFormatter={(d) => new Date(d).toLocaleDateString(lang, { day: '2-digit', month: 'short' })}/>
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: palette.tick}} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="usageKWh" name="Usage" stroke={palette.primary} strokeWidth={4} fill="url(#usageDashboard)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 md:p-10 rounded-[40px] shadow-sm border border-black/5 dark:border-white/10">
          <h3 className="text-lg font-black text-night dark:text-white mb-10 uppercase tracking-widest">{t.charts.costVsFree}</h3>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.grid} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: palette.tick}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: palette.tick}} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar name={t.charts.captive} dataKey="captive" fill="#94A3B8" opacity={0.3} radius={[6, 6, 0, 0]} />
                <Bar name={t.charts.free} dataKey="free" fill={palette.primary} radius={[6, 6, 0, 0]} />
                <Line name={t.charts.economy} type="monotone" dataKey="economy" stroke={palette.success} strokeWidth={4} dot={{ r: 5, fill: palette.success }} animationDuration={1200} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass p-8 md:p-12 rounded-[48px] shadow-xl border-2 border-yinmn/10 bg-gradient-to-br from-yinmn/5 via-transparent to-transparent relative overflow-hidden group">
        <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:scale-110 transition-transform duration-1000">
           <Info className="w-80 h-80 text-yinmn" />
        </div>
        <div className="relative z-10 space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-yinmn rounded-2xl flex items-center justify-center text-white shadow-xl shadow-yinmn/20 transition-transform group-hover:rotate-12">
                <RefreshCw className={`w-8 h-8 ${loadingInsights ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-night dark:text-white tracking-tight leading-tight">{t.ai.title}</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">{t.ai.subtitle}</p>
              </div>
            </div>
            <button 
              onClick={fetchInsights} 
              disabled={loadingInsights} 
              className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-white dark:bg-night border border-black/5 dark:border-white/10 hover:shadow-xl transition-all flex items-center gap-3 text-yinmn active:scale-95 group-hover:border-yinmn/30"
            >
              <RefreshCw className={`w-4 h-4 ${loadingInsights ? 'animate-spin' : ''}`} />
              {loadingInsights ? t.ai.loading : t.ai.refresh}
            </button>
          </div>
          
          <div className="min-h-[160px]">
            {loadingInsights ? (
              <div className="space-y-6">
                <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-full animate-pulse" />
                <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-5/6 animate-pulse" />
                <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-4/6 animate-pulse" />
              </div>
            ) : aiInsights ? (
              <div className="space-y-6">
                {aiInsights.split(/\n+/).map((line, idx) => (
                  <div key={idx} className="flex gap-6 items-start animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 150}ms` }}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yinmn/10 dark:bg-yinmn/20 flex items-center justify-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-yinmn"></div>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-base font-medium">
                      {line.replace(/^(\*|-|\d+\.)\s+/, '')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Info className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                <p className="text-slate-400 font-black uppercase tracking-widest italic">{t.ai.default}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

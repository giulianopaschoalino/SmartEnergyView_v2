import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, ComposedChart, Line, Legend, Cell 
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
  const [filter, setFilter] = useState<ChartFilter>({
    startDate: '',
    endDate: '',
    source: 'All'
  });
  
  const cacheKey = `${INSIGHTS_CACHE_BASE_KEY}_${lang}`;
  
  const [aiInsights, setAiInsights] = useState<string | null>(() => {
    return sessionStorage.getItem(cacheKey);
  });
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(cacheKey);
    setAiInsights(cached);
    if (!cached && !loadingInsights) {
      fetchInsights();
    }
  }, [lang, cacheKey]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return filter.source === 'All' || item.source === filter.source;
    }).slice(-45);
  }, [data, filter.source]);

  const stats = useMemo(() => {
    const totalUsage = filteredData.reduce((sum, item) => sum + item.usageKWh, 0);
    const totalCost = filteredData.reduce((sum, item) => sum + item.cost, 0);
    const totalCaptive = filteredData.reduce((sum, item) => sum + (item.captiveCost || 0), 0);
    const economy = totalCaptive - totalCost;
    const avgUsage = totalUsage / (filteredData.length || 1);
    return { totalUsage, totalCost, avgUsage, economy };
  }, [filteredData]);

  const annualData = useMemo(() => {
    const years: Record<string, number> = {};
    data.forEach(d => {
      const year = new Date(d.timestamp).getFullYear().toString();
      const savings = d.captiveCost - d.cost;
      years[year] = (years[year] || 0) + savings;
    });
    return Object.entries(years).map(([year, economy]) => ({ year, economy })).sort((a, b) => a.year.localeCompare(b.year));
  }, [data]);

  const monthlyComparison = useMemo(() => {
    const months: Record<string, { month: string; captive: number; free: number; economy: number }> = {};
    // Last 6 months approximation
    const last180 = data.slice(-180);
    
    last180.forEach(d => {
      const date = new Date(d.timestamp);
      const mLabel = date.toLocaleDateString(lang, { month: 'short', year: '2-digit' });
      if (!months[mLabel]) {
        months[mLabel] = { month: mLabel, captive: 0, free: 0, economy: 0 };
      }
      months[mLabel].captive += d.captiveCost;
      months[mLabel].free += d.cost;
      months[mLabel].economy += (d.captiveCost - d.cost);
    });
    
    return Object.values(months);
  }, [data, lang]);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const insights = await getEnergyInsights(filteredData, lang);
      setAiInsights(insights);
      if (insights) {
        sessionStorage.setItem(cacheKey, insights);
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const palette = {
    primary: '#375785',
    bondi: '#1991B3',
    success: '#27908F',
    warning: '#E89D45',
    tick: isDarkMode ? '#88898A' : '#475569',
    grid: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(55,87,133,0.1)',
    tooltipBg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    tooltipText: isDarkMode ? '#F8FAFC' : '#0F172A',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(lang, { day: '2-digit', month: 'short' });
  };

  const currencyPrefix = lang === 'pt' ? 'R$' : '$';

  const renderFormattedInsights = (text: string) => {
    if (!text) return null;
    const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
    return (
      <div className="space-y-4">
        {lines.map((line, idx) => {
          const content = line.replace(/^(\*|-|\d+\.)\s+/, '');
          return (
            <div key={`insight-${idx}`} className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yinmn/20 dark:bg-yinmn/30 flex items-center justify-center mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yinmn"></div>
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm font-medium">{content}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-night dark:text-white tracking-tight">{t.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
        </div>
        
        <div className="glass px-4 py-3 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar">
          <span className="text-xs font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">{t.source}</span>
          <div className="flex p-1 bg-slate-100 dark:bg-night rounded-xl">
            {(['All', 'Solar', 'Grid', 'Battery'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter({ ...filter, source: s })}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${filter.source === s ? 'bg-yinmn text-white shadow-sm' : 'text-slate-500 hover:text-yinmn dark:hover:text-white'}`}
              >
                {t.sources[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: t.stats.usage, val: stats.totalUsage.toFixed(1), unit: 'kWh', color: 'border-l-yinmn', icon: Zap },
          { label: t.stats.cost, val: `${currencyPrefix}${stats.totalCost.toFixed(2)}`, unit: '', color: 'border-l-bondi', icon: DollarSign },
          { label: t.stats.economyTitle, val: `${currencyPrefix}${stats.economy.toFixed(2)}`, unit: '', color: 'border-l-success', icon: TrendingUp },
          { label: t.stats.avg, val: stats.avgUsage.toFixed(1), unit: 'kWh/d', color: 'border-l-warning', icon: BarChart2 }
        ].map((item, i) => (
          <div key={i} className={`glass p-5 md:p-6 rounded-4xl shadow-sm border-l-4 ${item.color} group hover:scale-[1.02] transition-all`}>
            <div className="flex items-center gap-2 mb-3 opacity-70">
              <item.icon className="w-4 h-4" />
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">{item.label}</span>
            </div>
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="text-xl md:text-3xl font-black text-night dark:text-white">{item.val}</span>
              {item.unit && <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-tighter">{item.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Usage Trend */}
        <div className="glass p-6 md:p-8 rounded-5xl shadow-sm">
          <h3 className="text-xl font-black text-night dark:text-white mb-8">{t.charts.usageTrend}</h3>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="usageDashboard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette.primary} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={palette.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.grid} />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: palette.tick}} dy={10} tickFormatter={formatDate}/>
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: palette.tick}} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: palette.tooltipBg, color: palette.tooltipText, fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} labelFormatter={formatDate}/>
                <Area type="monotone" dataKey="usageKWh" stroke={palette.primary} strokeWidth={4} fill="url(#usageDashboard)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Comparison */}
        <div className="glass p-6 md:p-8 rounded-5xl shadow-sm">
          <h3 className="text-xl font-black text-night dark:text-white mb-8">{t.charts.costVsFree}</h3>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.grid} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: palette.tick}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: palette.tick}} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: palette.tooltipBg, color: palette.tooltipText, fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar name={t.charts.captive} dataKey="captive" fill="#94A3B8" opacity={0.3} radius={[4, 4, 0, 0]} />
                <Bar name={t.charts.free} dataKey="free" fill={palette.primary} radius={[4, 4, 0, 0]} />
                <Line name={t.charts.economy} type="monotone" dataKey="economy" stroke={palette.success} strokeWidth={3} dot={{ r: 4, fill: palette.success }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="glass p-8 rounded-5xl shadow-xl border-2 border-yinmn/10 bg-gradient-to-br from-yinmn/5 via-transparent to-transparent relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 opacity-5">
           <Info className="w-64 h-64 text-yinmn" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-yinmn rounded-2xl flex items-center justify-center text-white shadow-lg shadow-yinmn/20">
                <RefreshCw className={`w-7 h-7 ${loadingInsights ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-night dark:text-white tracking-tight">{t.ai.title}</h3>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{t.ai.subtitle}</p>
              </div>
            </div>
            <button 
              onClick={fetchInsights} 
              disabled={loadingInsights} 
              className="px-6 py-3 rounded-2xl font-black text-sm bg-white dark:bg-night border border-slate-200 dark:border-white/10 hover:shadow-md transition-all flex items-center gap-2 text-yinmn active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loadingInsights ? 'animate-spin' : ''}`} />
              {loadingInsights ? t.ai.loading : t.ai.refresh}
            </button>
          </div>
          
          <div className="min-h-[160px]">
            {loadingInsights ? (
              <div className="space-y-4">
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-full w-full animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-full w-4/5 animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-full w-3/4 animate-pulse" />
              </div>
            ) : aiInsights ? (
              renderFormattedInsights(aiInsights)
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <Info className="w-8 h-8 text-slate-300" />
                <p className="text-slate-400 font-bold italic">{t.ai.default}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
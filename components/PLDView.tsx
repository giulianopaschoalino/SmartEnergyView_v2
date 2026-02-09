
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend 
} from 'recharts';
import { Globe, RefreshCcw, Maximize2, Minimize2 } from 'lucide-react';
import { fetchPLDData } from '../services/dataService.ts';
import { Skeleton } from './UIProvider.tsx';

interface PLDViewProps {
  t: any;
  lang: string;
}

const PLDView: React.FC<PLDViewProps> = ({ t, lang }) => {
  const [activeTab, setActiveTab] = useState(1); 
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoScale, setAutoScale] = useState(false);

  const fetchPLD = async () => {
    setLoading(true);
    try {
      const typeMap: any = { 0: 'list', 1: 'daily', 2: 'schedule' };
      const response = await fetchPLDData(typeMap[activeTab]);
      
      let finalData: any[] = [];
      if (activeTab === 0) {
        finalData = Array.isArray(response?.data) ? response.data : [];
      } else {
        finalData = Array.isArray(response) ? response : [];
      }
      
      setData(finalData);
    } catch (err) {
      console.error("Backend PLD Fetch failed", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPLD();
  }, [activeTab]);

  const palette = { primary: '#375785', bondi: '#1991B3' };
  
  const yAxisDomain: any = autoScale ? ['dataMin', 'dataMax'] : [0, 'dataMax'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight flex items-center gap-3 uppercase">
            <Globe className="text-bondi" /> {t.pld.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.pld.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAutoScale(!autoScale)}
            className={`glass px-4 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${autoScale ? 'text-bondi bg-bondi/10 shadow-inner' : 'text-slate-400'}`}
          >
            {autoScale ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {autoScale ? t.historical.shrinkToFit : t.historical.zeroAxis}
          </button>
          <button onClick={fetchPLD} disabled={loading} className="glass px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yinmn hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? t.pld.loading : t.pld.sync}
          </button>
        </div>
      </header>

      <div className="glass p-1.5 rounded-[28px] flex items-center shadow-inner max-w-xl">
        {[t.pld.tabs.history, t.pld.tabs.daily, t.pld.tabs.hourly].map((label, idx) => (
          <button key={idx} onClick={() => setActiveTab(idx)} className={`flex-1 py-3 px-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === idx ? 'bg-yinmn text-white shadow-lg' : 'text-slate-500 hover:text-yinmn dark:hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="glass p-6 md:p-10 rounded-[48px] shadow-xl border border-black/5 dark:border-white/10 bg-white dark:bg-night min-h-[600px] overflow-hidden">
        {loading ? (
          <div className="h-[500px] w-full flex items-center justify-center">
            {activeTab === 0 ? (
              <div className="w-full space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-end px-10 gap-2">
                {[...Array(24)].map((_, i) => (
                  <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${20 + Math.random() * 70}%` }} />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 0 ? (
          <div className="h-[500px] overflow-y-auto custom-scrollbar pr-4">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead className="text-[10px] uppercase tracking-widest font-black text-slate-400 sticky top-0 bg-white dark:bg-night z-10 pb-4 block">
                <tr className="flex w-full px-4">
                  <th className="flex-1">{t.ops.table.month}</th>
                  <th className="flex-1 text-right">{t.pld.regions.north}</th>
                  <th className="flex-1 text-right">{t.pld.regions.ne}</th>
                  <th className="flex-1 text-right">{t.pld.regions.se}</th>
                  <th className="flex-1 text-right">{t.pld.regions.south}</th>
                </tr>
              </thead>
              <tbody className="block w-full">
                {data.map((r, i) => (
                  <tr key={i} className="flex w-full items-center p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl mb-2 hover:bg-bondi/5 transition-colors group">
                    <td className="flex-1 text-sm font-black text-yinmn dark:text-bondi">{r.year_month_formatted}</td>
                    <td className="flex-1 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">{parseFloat(r.norte || 0).toFixed(2)}</td>
                    <td className="flex-1 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">{parseFloat(r.nordeste || 0).toFixed(2)}</td>
                    <td className="flex-1 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">{parseFloat(r.sudeste || 0).toFixed(2)}</td>
                    <td className="flex-1 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">{parseFloat(r.sul || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 1 ? (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="pldDailyDashboard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={palette.bondi} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={palette.bondi} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day_formatted" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94A3B8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} domain={yAxisDomain} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke={palette.bondi} strokeWidth={4} fill="url(#pldDailyDashboard)" isAnimationActive={false} />
                </AreaChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} tickFormatter={(h)=>`${h}h`} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} domain={yAxisDomain} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                  <Legend verticalAlign="top" height={48}/>
                  <Line type="monotone" dataKey="value" name={`Price (${t.dashboard.pldUnit})`} stroke={palette.primary} strokeWidth={4} dot={{r:4, fill: palette.primary, strokeWidth: 2, stroke: '#FFF'}} isAnimationActive={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default PLDView;

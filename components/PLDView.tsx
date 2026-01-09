
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend 
} from 'recharts';
import { Globe, RefreshCcw, Database } from 'lucide-react';
import { fetchPLDData } from '../services/dataService.ts';

interface PLDViewProps {
  t: any;
  lang: string;
}

const PLDView: React.FC<PLDViewProps> = ({ t, lang }) => {
  const [activeTab, setActiveTab] = useState(1); // Default to Daily
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('SUDESTE');

  const fetchPLD = async () => {
    setLoading(true);
    try {
      const typeMap: any = { 0: 'list', 1: 'daily', 2: 'schedule' };
      const result = await fetchPLDData(typeMap[activeTab]);
      
      // The 'list' endpoint returns { data: [...], result: [...] }
      // The other endpoints return simple arrays [...]
      // We ensure 'data' is always the array part to prevent .map errors
      const arrayPart = Array.isArray(result) ? result : (result?.data || []);
      setData(arrayPart);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight flex items-center gap-3">
            <Globe className="text-bondi" /> {t.pld.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.pld.subtitle}</p>
        </div>
        <button onClick={fetchPLD} disabled={loading} className="glass px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yinmn hover:bg-slate-50 transition-all active:scale-95">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t.pld.loading : 'Refresh'}
        </button>
      </header>

      <div className="glass p-1.5 rounded-[28px] flex items-center shadow-inner max-w-xl">
        {[t.pld.tabs.history, t.pld.tabs.daily, t.pld.tabs.hourly].map((label, idx) => (
          <button key={idx} onClick={() => setActiveTab(idx)} className={`flex-1 py-3 px-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === idx ? 'bg-yinmn text-white shadow-lg' : 'text-slate-500 hover:text-yinmn dark:hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="glass p-6 md:p-10 rounded-5xl shadow-xl min-h-[500px]">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center"><RefreshCcw className="animate-spin text-yinmn w-8 h-8" /></div>
        ) : activeTab === 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                <tr>
                  <th className="p-4">Month</th>
                  <th className="p-4">North</th>
                  <th className="p-4">NE</th>
                  <th className="p-4">SE</th>
                  <th className="p-4">South</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {data.map((r, i) => (
                  <tr key={i} className="text-sm font-bold">
                    <td className="p-4">{r.year_month_formatted}</td>
                    <td className="p-4">{parseFloat(r.norte || 0).toFixed(2)}</td>
                    <td className="p-4">{parseFloat(r.nordeste || 0).toFixed(2)}</td>
                    <td className="p-4">{parseFloat(r.sudeste || 0).toFixed(2)}</td>
                    <td className="p-4">{parseFloat(r.sul || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 1 ? (
                <AreaChart data={data}>
                  <defs><linearGradient id="pldDaily" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={palette.bondi} stopOpacity={0.3}/><stop offset="95%" stopColor={palette.bondi} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day_formatted" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke={palette.bondi} strokeWidth={4} fill="url(#pldDaily)" />
                </AreaChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tickFormatter={(h)=>`${h}h`} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36}/>
                  <Line type="monotone" dataKey="value" name="Price (R$/MWh)" stroke={palette.primary} strokeWidth={4} dot={{r:3}} />
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

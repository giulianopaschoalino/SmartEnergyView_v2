import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Zap, Globe, RefreshCcw, Database } from 'lucide-react';
import { fetchPLDData } from '../services/dataService.ts';

interface PLDRecord {
  hora: number;
  sul: number;
  se_co: number;
  n: number;
  ne: number;
}

interface PLDViewProps {
  t: any;
  lang: string;
}

const PLDView: React.FC<PLDViewProps> = ({ t, lang }) => {
  const [data, setData] = useState<PLDRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<keyof Omit<PLDRecord, 'hora'>>('se_co');

  const fetchPLD = async () => {
    setLoading(true);
    try {
      const result = await fetchPLDData();
      // result from /api/pld/daily is expected to be mapped to this structure
      // based on the backend PldController@consumptionByDaily
      const formatted = result.map((r: any) => ({
        hora: parseInt(r.hour || r.hora || 0),
        sul: parseFloat(r.sul || r.valor || 0),
        se_co: parseFloat(r.sudeste || r.se_co || 0),
        n: parseFloat(r.norte || r.n || 0),
        ne: parseFloat(r.nordeste || r.ne || 0)
      })).slice(0, 24);
      
      setData(formatted);
    } catch (err) {
      console.error("Backend PLD Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPLD();
  }, []);

  const currentPrices = useMemo(() => {
    if (data.length === 0) return { sul: 0, se_co: 0, n: 0, ne: 0 };
    return data[data.length - 1];
  }, [data]);

  const palette = {
    primary: '#375785',
    bondi: '#1991B3'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight flex items-center gap-3">
            <Globe className="text-bondi" /> {t.pld.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.pld.subtitle}</p>
        </div>
        
        <button onClick={fetchPLD} disabled={loading} className="glass px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yinmn hover:bg-slate-50 transition-all active:scale-95">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t.pld.loading : t.dashboard.ai.refresh}
        </button>
      </div>

      <div className="glass p-1.5 rounded-[28px] flex items-center shadow-inner max-w-2xl mx-auto">
        {(['sul', 'se_co', 'n', 'ne'] as const).map(r => (
          <button key={r} onClick={() => setSelectedRegion(r)} className={`flex-1 py-3 px-2 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${selectedRegion === r ? 'bg-yinmn text-white shadow-lg' : 'text-slate-500 hover:text-yinmn dark:hover:text-white'}`}>
            {t.pld.regions[r.toUpperCase()]}
          </button>
        ))}
      </div>

      <div className="glass p-6 md:p-10 rounded-5xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-4">
          <div>
            <h3 className="text-xl font-black text-night dark:text-white uppercase tracking-tighter">{t.pld.hourlyTrend}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Database className="w-3 h-3 text-bondi" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Cloud Data</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-yinmn dark:text-bondi tracking-tighter block">R$ {currentPrices[selectedRegion].toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">/ MWh</span>
          </div>
        </div>

        <div className="h-[350px] sm:h-[450px]">
          {loading ? <div className="w-full h-full flex items-center justify-center"><RefreshCcw className="animate-spin text-yinmn w-8 h-8" /></div> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="pldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette.bondi} stopOpacity={0.3}/><stop offset="95%" stopColor={palette.bondi} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} dy={10} tickFormatter={(h) => `${h}h`} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: '#FFF', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }} labelFormatter={(h) => `Hour: ${h}:00`} />
                <Area type="monotone" dataKey={selectedRegion} stroke={palette.bondi} strokeWidth={4} fill="url(#pldGradient)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default PLDView;
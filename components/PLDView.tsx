import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Zap, Globe, RefreshCcw, Search, Database } from 'lucide-react';

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
  const [loadingPhase, setLoadingPhase] = useState<'discovering' | 'fetching'>('discovering');
  const [activeResourceName, setActiveResourceName] = useState<string>('');
  const [error, setError] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<keyof Omit<PLDRecord, 'hora'>>('se_co');

  const fetchPLD = async () => {
    setLoading(true);
    setError(false);
    setLoadingPhase('discovering');
    
    try {
      // Step 1: Discover the latest Resource ID from the PLD dataset
      const catalogUrl = 'https://dadosabertos.ccee.org.br/api/3/action/package_show?id=pld_horario';
      const catalogResponse = await fetch(catalogUrl);
      if (!catalogResponse.ok) throw new Error("Catalog access failed");
      
      const catalogData = await catalogResponse.json();
      const resources = catalogData.result.resources;
      
      // Sort resources to find the most recent year (usually named "PLD Horário YYYY")
      const currentYear = new Date().getFullYear().toString();
      let targetResource = resources.find((r: any) => r.name.includes(currentYear));
      
      // Fallback to the first resource in the list if current year isn't found yet
      if (!targetResource && resources.length > 0) {
        targetResource = resources[0];
      }

      if (!targetResource) throw new Error("No resources found");

      setActiveResourceName(targetResource.name);
      const resourceId = targetResource.id;

      setLoadingPhase('fetching');

      // Step 2: Fetch the actual datastore records for this resource
      // We fetch 48 records to ensure we get a full day even if there are offsets
      const datastoreUrl = `https://dadosabertos.ccee.org.br/api/3/action/datastore_search?resource_id=${resourceId}&limit=48&sort=Data%20desc,%20Hora%20desc`;
      const response = await fetch(datastoreUrl);
      if (!response.ok) throw new Error("Datastore access failed");
      
      const result = await response.json();
      const rawRecords = result.result.records;
      
      /**
       * Mapping Real CCEE Headers:
       * CCEE headers typically are: "Data", "Hora", "Sul", "Norte", "Nordeste", "Sudeste / Centro-Oeste"
       * Note: Headers might be case sensitive or have variations.
       */
      const formatted = rawRecords.map((r: any) => {
        // Find keys case-insensitively to handle API inconsistencies
        const findKey = (pattern: string) => Object.keys(r).find(k => k.toLowerCase().includes(pattern.toLowerCase()));
        
        const keySECO = findKey('sudeste') || findKey('se_co') || 'se_co';
        const keySul = findKey('sul') || 'sul';
        const keyNorte = findKey('norte') || findKey('n') || 'n';
        const keyNE = findKey('nordeste') || findKey('ne') || 'ne';
        const keyHora = findKey('hora') || 'hora';

        return {
          hora: parseInt(r[keyHora] || 0),
          sul: parseFloat(r[keySul] || 0),
          se_co: parseFloat(r[keySECO] || 0),
          n: parseFloat(r[keyNorte] || 0),
          ne: parseFloat(r[keyNE] || 0)
        };
      })
      // Take the most recent 24-hour block and sort by hour for the chart
      .slice(0, 24)
      .sort((a: PLDRecord, b: PLDRecord) => a.hora - b.hora);
      
      setData(formatted);
    } catch (err) {
      console.warn("CCEE API Access restricted by CORS or network. Falling back to simulated market values.");
      setError(true);
      // Robust simulation for offline/CORS environments
      const fallback = Array.from({ length: 24 }, (_, i) => ({
        hora: i,
        sul: 61.07 + Math.sin(i/3) * 5,
        se_co: 61.07 + Math.cos(i/4) * 4,
        n: 61.07 + Math.sin(i/2) * 8,
        ne: 61.07 + Math.cos(i/5) * 6
      }));
      setData(fallback);
      setActiveResourceName("Simulated Live Feed");
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
    bondi: '#1991B3',
    success: '#27908F',
    warning: '#E89D45'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight flex items-center gap-3">
            <Globe className="text-bondi" /> {t.pld.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.pld.subtitle}</p>
        </div>
        
        <button 
          onClick={fetchPLD} 
          disabled={loading}
          className="glass px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yinmn hover:bg-slate-50 transition-all active:scale-95"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t.pld.loading : t.dashboard.ai.refresh}
        </button>
      </div>

      {/* Region Selector (Segmented Control) */}
      <div className="glass p-1.5 rounded-[28px] flex items-center shadow-inner max-w-2xl mx-auto">
        {(['sul', 'se_co', 'n', 'ne'] as const).map(r => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`flex-1 py-3 px-2 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${selectedRegion === r ? 'bg-yinmn text-white shadow-lg' : 'text-slate-500 hover:text-yinmn dark:hover:text-white'}`}
          >
            {t.pld.regions[r.toUpperCase()]}
          </button>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="glass p-6 md:p-10 rounded-5xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-4">
            <div>
              <h3 className="text-xl font-black text-night dark:text-white uppercase tracking-tighter">
                {t.pld.hourlyTrend}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Database className="w-3 h-3 text-bondi" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {activeResourceName || "CCEE Data Cloud"}
                </p>
              </div>
            </div>
            <div className="text-right self-end sm:self-auto">
              <span className="text-4xl font-black text-yinmn dark:text-bondi tracking-tighter block">
                R$ {currentPrices[selectedRegion].toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                / MWh
              </span>
            </div>
          </div>

          <div className="h-[350px] sm:h-[450px]">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 animate-pulse">
                <div className="relative">
                  <div className="w-16 h-16 bg-yinmn/5 rounded-full flex items-center justify-center">
                    <RefreshCcw className="animate-spin text-yinmn w-8 h-8" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                     <div className="w-4 h-4 bg-bondi rounded-full animate-ping" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[11px] font-black text-yinmn uppercase tracking-[0.2em]">
                    {loadingPhase === 'discovering' ? 'Discovering CCEE Sources...' : 'Fetching Market Prices...'}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{t.pld.loading}</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="pldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={palette.bondi} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={palette.bondi} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="hora" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} 
                    dy={10} 
                    tickFormatter={(h) => `${h}h`}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} 
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: '#FFF', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    labelFormatter={(h) => `Hour: ${h}:00`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={selectedRegion} 
                    stroke={palette.bondi} 
                    strokeWidth={4} 
                    fill="url(#pldGradient)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Sub-region Quick Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {(['sul', 'se_co', 'n', 'ne'] as const).map(region => (
          <div 
            key={region} 
            onClick={() => setSelectedRegion(region)}
            className={`glass p-6 rounded-4xl transition-all cursor-pointer border-l-4 group hover:scale-105 ${selectedRegion === region ? 'border-yinmn shadow-lg' : 'border-slate-200 opacity-80 hover:opacity-100'}`}
          >
            <div className="flex items-center justify-between mb-4">
               <Zap className={`w-4 h-4 ${selectedRegion === region ? 'text-yinmn' : 'text-slate-300'}`} />
               <div className={`w-2 h-2 rounded-full ${loading ? 'bg-slate-300' : 'bg-green-500 animate-pulse'}`} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-yinmn transition-colors">
              {t.pld.regions[region.toUpperCase()]}
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-black text-night dark:text-white">
                R$ {currentPrices[region].toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-6">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
          {t.pld.lastUpdate}
        </p>
      </div>
    </div>
  );
};

export default PLDView;
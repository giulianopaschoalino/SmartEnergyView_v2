
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart, LabelList
} from 'recharts';
import { UserSession } from '../types.ts';
import { ApiClient } from '../services/apiClient.ts';
import { Skeleton } from './UIProvider.tsx';
import { Activity, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';

interface TelemetryViewProps {
  session: UserSession;
  t: any;
  lang: string;
  selectedUnit: any | null;
}

const TelemetryView: React.FC<TelemetryViewProps> = ({ session, t, lang, selectedUnit }) => {
  const telemetryT = t.telemetry;
  const commonT = t.common;
  
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  
  const [filters, setFilters] = useState({
    discretization: '1_hora',
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const tabs = [telemetryT.tabs.consumption, telemetryT.tabs.demand, telemetryT.tabs.powerFactor];

  const getMaxDays = (disc: string) => {
    switch(disc) {
      case '5_min': return 3;   
      case '15_min': return 7;  
      case '1_hora': return 31; 
      case '1_dia': return 365; 
      default: return 30;
    }
  };

  const fetchData = useCallback(async (isRetry = false) => {
    setLoading(true);
    if (!isRetry) {
      setError(null);
      setIsFallback(false);
    }

    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    
    const effectiveStart = isRetry ? new Date(start.setFullYear(start.getFullYear() - 1)) : start;
    const effectiveEnd = isRetry ? new Date(end.setFullYear(end.getFullYear() - 1)) : end;

    const diffDays = Math.ceil(Math.abs(effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24));
    const maxAllowed = getMaxDays(filters.discretization);

    if (diffDays > maxAllowed) {
      setError(`Range too large. Max ${maxAllowed} days for resolution.`);
      setLoading(false);
      setData([]);
      return;
    }

    try {
      const endpoints: any = { 0: 'discretization', 1: 'demand', 2: 'powerFactor' };
      const endpointFilters: any[] = [
        { type: "between", field: "dia_num", value: [effectiveStart.toISOString().split('T')[0], effectiveEnd.toISOString().split('T')[0]] }
      ];

      if (selectedUnit?.codigo_scde) {
        endpointFilters.push({ type: "=", field: "med_5min.ponto", value: selectedUnit.codigo_scde });
      }

      const response = await ApiClient.post<any[]>(`/telemetry/${endpoints[activeTab]}`, {
        type: filters.discretization,
        limit: 1000, 
        filters: endpointFilters
      });
      
      let result = Array.isArray(response) ? response : [];
      
      if (result.length === 0 && !isRetry) {
        setIsFallback(true);
        fetchData(true);
        return;
      }

      result = [...result].sort((a, b) => {
        const timeA = new Date(a.dia_num || a.day_formatted || 0).getTime();
        const timeB = new Date(b.dia_num || b.day_formatted || 0).getTime();
        return timeA - timeB;
      });
      
      result = result.map(item => ({
        ...item,
        isEstimated: item.dad_estimado === true || Number(item.dad_estimado) === 1 || item.dad_estimado === "true"
      }));

      setData(result);
    } catch (e: any) {
      if (e.name !== 'AbortError') setError("Error loading telemetry data.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, selectedUnit]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 400);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const chartMax = useMemo(() => {
    const keysMap: any = {
      0: ['consumo', 'reativa'],
      1: ['dem_cont', 'dem_reg', 'dem_tolerancia'],
      2: ['fp_indutivo', 'fp_capacitivo', 'f_ref']
    };
    const keys = keysMap[activeTab] || [];
    let max = 0;
    data.forEach(item => {
      keys.forEach(k => {
        const val = parseFloat(item[k]);
        if (!isNaN(val) && val > max) max = val;
      });
    });
    return max * 1.1 || 1;
  }, [data, activeTab]);

  const commonLabelProps = {
    position: 'top' as const,
    fill: '#94A3B8',
    fontSize: 9,
    fontWeight: 'bold',
    offset: 8
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight flex items-center gap-3">
            <Activity className="text-yinmn" /> {telemetryT.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{telemetryT.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">{telemetryT.filters.discretization}</label>
            <select 
              value={filters.discretization}
              onChange={(e) => setFilters({...filters, discretization: e.target.value})}
              className="glass w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none border-none cursor-pointer block shadow-sm"
            >
              <option value="5_min">5 Min</option>
              <option value="15_min">15 Min</option>
              <option value="1_hora">1 Hour</option>
              <option value="1_dia">1 Day</option>
              <option value="1_mes">1 Month</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">{commonT.date}</label>
            <div className="glass flex items-center gap-2 px-3 py-2 rounded-xl border border-black/5 shadow-sm">
               <Calendar className="w-3.5 h-3.5 text-slate-400" />
               <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="bg-transparent text-[10px] font-bold outline-none border-none dark:text-white" />
               <span className="text-slate-300">/</span>
               <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="bg-transparent text-[10px] font-bold outline-none border-none dark:text-white" />
            </div>
          </div>
          <button 
            onClick={() => fetchData()}
            disabled={loading}
            className="glass p-2.5 rounded-xl text-yinmn hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {isFallback && (
        <div className="bg-gamboge/10 border border-gamboge/20 p-4 rounded-2xl flex items-center gap-3 text-gamboge text-xs font-bold animate-in slide-in-from-top-2">
          <AlertTriangle size={16} />
          <span>{telemetryT.historicalNotice}</span>
        </div>
      )}

      <div className="glass p-1.5 rounded-[28px] flex items-center shadow-inner max-w-xl">
        {tabs.map((label, idx) => (
          <button key={idx} onClick={() => setActiveTab(idx)} className={`flex-1 py-3 px-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === idx ? 'bg-yinmn text-white shadow-lg' : 'text-slate-500 hover:text-yinmn dark:hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="glass p-6 md:p-10 rounded-[48px] shadow-xl border border-black/5 dark:border-white/10 bg-white dark:bg-night min-h-[600px] relative">
        {loading ? (
          <div className="h-[500px] w-full flex items-end gap-1 px-4">
            {[...Array(30)].map((_, i) => (
              <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${10 + Math.random() * 80}%` }} />
            ))}
          </div>
        ) : error ? (
          <div className="h-[500px] flex flex-col items-center justify-center text-center p-6 space-y-4">
            <AlertTriangle className="w-10 h-10 text-gamboge" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 max-w-xs">{error}</p>
          </div>
        ) : data.length === 0 && !loading ? (
          <div className="h-[500px] flex items-center justify-center italic text-slate-400 font-bold uppercase tracking-[0.2em]">{commonT.noData}</div>
        ) : (
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 0 ? (
                <ComposedChart data={data} margin={{ top: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day_formatted" axisLine={false} tickLine={false} tick={{fontSize: 9, fontStretch: 'expanded', fontWeight: 700, fill: '#94A3B8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} domain={[0, chartMax]} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" height={48}/>
                  <Bar name={telemetryT.labels.consumption} dataKey="consumo" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-consumption-${index}`} fill={entry.isEstimated ? 'url(#stripes-telemetry)' : '#74ACEC'} />
                    ))}
                    <LabelList 
                      dataKey="consumo" 
                      {...commonLabelProps}
                      formatter={(val: number) => val > 0 ? `${val.toFixed(0)}` : ''}
                    />
                  </Bar>
                  <Line name={telemetryT.labels.reativa} type="monotone" dataKey="reativa" stroke="#FF0000" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                </ComposedChart>
              ) : activeTab === 1 ? (
                <ComposedChart data={data} margin={{ top: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day_formatted" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94A3B8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} domain={[0, chartMax]} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" height={48}/>
                  <Bar name={telemetryT.labels.registered} dataKey="dem_reg" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-demand-${index}`} fill={entry.isEstimated ? 'url(#stripes-primary)' : '#375785'} />
                    ))}
                    <LabelList 
                      dataKey="dem_reg" 
                      {...commonLabelProps}
                      formatter={(val: number) => val > 0 ? `${val.toFixed(0)}` : ''}
                    />
                  </Bar>
                  <Line name={telemetryT.labels.tolerance} type="monotone" dataKey="dem_tolerancia" stroke="#FF0000" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                  <Line name={telemetryT.labels.contracted} type="monotone" dataKey="dem_cont" stroke="#000000" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                </ComposedChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day_formatted" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94A3B8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} domain={[0, 1]} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" height={48}/>
                  <Line type="monotone" dataKey="fp_indutivo" name={telemetryT.labels.inductive} stroke="#375785" strokeWidth={3} dot={{r: 4}} />
                  <Line type="monotone" dataKey="fp_capacitivo" name={telemetryT.labels.capacitive} stroke="#E7992F" strokeWidth={3} dot={{r: 4}} />
                  <Line type="step" dataKey="f_ref" name={telemetryT.labels.reference} stroke="#000000" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelemetryView;


import React, { useState, useEffect, useCallback } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { UserSession } from '../types.ts';
import { ApiClient } from '../services/apiClient.ts';
import { Activity, Calendar, AlertTriangle } from 'lucide-react';

interface TelemetryViewProps {
  session: UserSession;
  t: any; // Full translations object
  lang: string;
}

const TelemetryView: React.FC<TelemetryViewProps> = ({ session, t, lang }) => {
  const telemetryT = t.telemetry;
  const commonT = t.common;
  
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    discretization: '1_hora',
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const tabs = [telemetryT.tabs.consumption, telemetryT.tabs.demand, telemetryT.tabs.powerFactor];

  // Logic to limit date ranges to keep the app lightweight
  const getMaxDays = (disc: string) => {
    switch(disc) {
      case '5_min': return 3;   // High resolution: 3 days max
      case '15_min': return 7;  // Medium resolution: 7 days max
      case '1_hora': return 31; // Hourly: 1 month max
      case '1_dia': return 365; // Daily: 1 year max
      default: return 30;
    }
  };

  const fetchData = useCallback(async () => {
    if (!session.scdeCode) return;
    setLoading(true);
    setError(null);

    // Validate range for performance
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const maxAllowed = getMaxDays(filters.discretization);

    if (diffDays > maxAllowed) {
      setError(`Range too large. Max ${maxAllowed} days for ${filters.discretization.replace('_', ' ')} resolution.`);
      setLoading(false);
      setData([]);
      return;
    }

    try {
      const endpoints: any = { 0: 'discretization', 1: 'demand', 2: 'powerFactor' };
      const response = await ApiClient.post<any[]>(`/telemetry/${endpoints[activeTab]}`, {
        type: filters.discretization,
        limit: 1000, // Safety cap
        filters: [
          { type: "=", field: "med_5min.ponto", value: session.scdeCode },
          { type: "between", field: "dia_num", value: [filters.startDate, filters.endDate] }
        ]
      });
      setData(Array.isArray(response) ? response : []);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error(e);
        setError("Error loading telemetry data.");
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, session.scdeCode]);

  useEffect(() => {
    // Debounce fetching to optimize rapid filter changes
    const timer = setTimeout(() => {
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight flex items-center gap-3">
            <Activity className="text-yinmn" /> {telemetryT.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{telemetryT.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">{telemetryT.filters.discretization}</label>
            <select 
              value={filters.discretization}
              onChange={(e) => setFilters({...filters, discretization: e.target.value})}
              className="glass w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none border-none cursor-pointer block"
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
            <div className="glass flex items-center gap-2 px-3 py-2 rounded-xl">
               <Calendar className="w-3.5 h-3.5 text-slate-400" />
               <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="bg-transparent text-[10px] font-bold outline-none border-none dark:text-white" />
               <span className="text-slate-300">/</span>
               <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="bg-transparent text-[10px] font-bold outline-none border-none dark:text-white" />
            </div>
          </div>
        </div>
      </header>

      <div className="glass p-1.5 rounded-[28px] flex items-center shadow-inner max-w-xl">
        {tabs.map((label, idx) => (
          <button key={idx} onClick={() => setActiveTab(idx)} className={`flex-1 py-3 px-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === idx ? 'bg-yinmn text-white shadow-lg' : 'text-slate-500 hover:text-yinmn dark:hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="glass p-6 md:p-10 rounded-5xl shadow-xl min-h-[500px] relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-yinmn border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-yinmn">{commonT.loading}</p>
            </div>
          </div>
        )}

        {error ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="p-4 bg-gamboge/10 rounded-full text-gamboge">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 max-w-xs">{error}</p>
          </div>
        ) : data.length === 0 && !loading ? (
          <div className="h-[400px] flex items-center justify-center italic text-slate-400 font-bold">{commonT.noData}</div>
        ) : (
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 0 ? (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day_formatted" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94A3B8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }} />
                  <Bar name="Consumption (kWh)" dataKey="consumo" fill="#375785" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              ) : activeTab === 1 ? (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day_formatted" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94A3B8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36}/>
                  <Line type="monotone" dataKey="dem_cont" name="Contracted" stroke="#88898A" strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="dem_reg" name="Registered" stroke="#1991B3" strokeWidth={3} isAnimationActive={false} />
                </LineChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day_formatted" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94A3B8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} domain={[0.8, 1]} />
                  <Tooltip />
                  <Line type="step" dataKey="f_ref" name="Reference (0.92)" stroke="#E89D45" strokeDasharray="3 3" dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="fp_indutivo" name="Inductive" stroke="#375785" strokeWidth={3} dot={{r: 2}} isAnimationActive={false} />
                  <Line type="monotone" dataKey="fp_capacitivo" name="Capacitive" stroke="#27908F" strokeWidth={3} dot={{r: 2}} isAnimationActive={false} />
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

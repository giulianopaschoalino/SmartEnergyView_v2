
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, Line, ComposedChart } from 'recharts';
import { EnergyRecord } from '../types.ts';
import { fetchEconomyData } from '../services/dataService.ts';

interface EconomyViewProps {
  data: EnergyRecord[];
  t: any;
  lang: string;
}

const EconomyView: React.FC<EconomyViewProps> = ({ data, t, lang }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [remoteData, setRemoteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const tabs = [t.tabs.annual, t.tabs.monthly, t.tabs.captiveVsFree, t.tabs.costMWh];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const typeMap: any = { 0: 'grossAnnual', 1: 'grossMonthly', 2: 'estimates', 3: 'MWh' };
        const result = await fetchEconomyData(typeMap[activeTab]);
        setRemoteData(Array.isArray(result) ? result : []);
      } catch (e) {
        console.error(e);
        setRemoteData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const safeLocalData = Array.isArray(data) ? data : [];
  const chartSource = remoteData.length > 0 ? remoteData : safeLocalData.slice(-12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-night dark:text-white tracking-tight">{t.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
      </header>

      <div className="glass p-1.5 rounded-[28px] flex items-center shadow-inner overflow-x-auto no-scrollbar">
        {tabs.map((label, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 py-3 px-6 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === idx ? 'bg-yinmn text-white shadow-lg' : 'text-slate-500 hover:text-yinmn dark:hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="glass p-6 md:p-10 rounded-5xl shadow-xl min-h-[500px]">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center"><div className="w-10 h-10 border-4 border-yinmn border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab < 3 ? (
                <BarChart data={chartSource}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey={activeTab === 0 ? "ano" : "mes"} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar name="Economy" dataKey={activeTab === 2 ? "custo_livre" : "economia_acumulada"} fill="#375785" radius={[6, 6, 0, 0]} />
                  {activeTab === 2 && <Bar name="Captive" dataKey="custo_cativo" fill="#1991B3" radius={[6, 6, 0, 0]} />}
                </BarChart>
              ) : (
                <ComposedChart data={chartSource}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="custo_unit" stroke="#1991B3" strokeWidth={4} dot={{ r: 6 }} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default EconomyView;

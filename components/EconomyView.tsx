
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Line, ComposedChart, LineChart, LabelList
} from 'recharts';
import { EnergyRecord } from '../types.ts';
import { fetchEconomyData } from '../services/dataService.ts';
import { Skeleton } from './UIProvider.tsx';
import { RefreshCw } from 'lucide-react';
import { getLastConsolidatedYear, populateGraphDataForYear } from '../utils/dataProcessing.ts';

interface EconomyViewProps {
  data: EnergyRecord[];
  t: any;
  lang: string;
  selectedUnit: any | null;
}

const EconomyView: React.FC<EconomyViewProps> = ({ data, t, lang, selectedUnit }) => {
  const [activeTab, setActiveTab] = useState(1); 
  const [remoteData, setRemoteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const economyT = t.economy;
  const dashboardT = t.dashboard;
  const commonT = t.common;

  const tabs = [economyT.tabs.annual, economyT.tabs.monthly, economyT.tabs.captiveVsFree, economyT.tabs.costMWh];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const typeMap: any = { 0: 'grossAnnual', 1: 'grossMonthly', 2: 'estimates', 3: 'MWh' };
      
      const filters = selectedUnit ? [
        { type: "=", field: "dados_cadastrais.cod_smart_unidade", value: selectedUnit.cod_smart_unidade }
      ] : [];

      const result = await fetchEconomyData(typeMap[activeTab], filters);
      const arrayToSet = Array.isArray(result) ? result : [];
      setRemoteData(arrayToSet);
    } catch (e) {
      console.error("Economy Sync Failure", e);
      setRemoteData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedUnit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartSource = useMemo(() => {
    const raw = Array.isArray(remoteData) ? remoteData : [];
    if (raw.length === 0) return [];

    let runningMax = 0;

    if (activeTab === 0) {
      const sortedAnnual = [...raw].sort((a, b) => parseInt(a.ano) - parseInt(b.ano));
      return sortedAnnual.map(item => {
        let val = parseFloat(String(item.economia_acumulada || 0));
        if (val < runningMax) val = runningMax;
        runningMax = val;

        return {
          label: item.ano,
          consolidated: val / 1000,
          estimated: 0,
          total: val / 1000,
          isEstimated: item.dad_estimado === true || Number(item.dad_estimado) === 1 || item.dad_estimado === "true"
        };
      });
    }

    const lastYear = getLastConsolidatedYear(raw, true);
    const populated = populateGraphDataForYear(raw, String(lastYear));

    return populated.map(item => {
      const isEst = item.dad_estimado === true || Number(item.dad_estimado) === 1 || item.dad_estimado === "true";
      
      let valAcum = parseFloat(String(item.economia_acumulada || 0));
      if (valAcum < runningMax) valAcum = runningMax;
      runningMax = valAcum;

      const valAcumScaled = valAcum / 1000;
      const valMensal = parseFloat(String(item.economia_mensal || 0)) / 1000;
      const valCativo = parseFloat(String(item.custo_cativo || 0)) / 1000;
      const valLivre = parseFloat(String(item.custo_livre || 0)) / 1000;
      const valUnit = parseFloat(String(item.custo_unit || 0));

      return {
        label: item.mes,
        consolidated: !isEst ? valAcumScaled : 0,
        estimated: isEst ? valAcumScaled : 0,
        total: valAcumScaled,
        cativo: valCativo,
        livre: valLivre,
        mensal: valMensal,
        unit: valUnit,
        isEstimated: isEst
      };
    });
  }, [remoteData, activeTab]);

  const currencyPrefix = lang === 'pt' ? 'R$' : '$';

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
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight uppercase">{economyT.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{economyT.subtitle}</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="glass p-1.5 rounded-[28px] flex items-center shadow-inner overflow-x-auto no-scrollbar flex-1">
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
        <button 
          onClick={fetchData}
          disabled={loading}
          className="glass p-4 rounded-[28px] text-yinmn hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95 shadow-sm disabled:opacity-50"
          aria-label="Refresh Current Chart"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="glass p-6 md:p-10 rounded-[48px] shadow-xl border border-black/5 dark:border-white/10 bg-white dark:bg-night">
        {loading ? (
          <div className="h-[500px] flex flex-col items-center justify-center space-y-8">
            <div className="w-full h-full flex items-end gap-3 px-10">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="flex-1 rounded-t-xl" style={{ height: `${30 + Math.random() * 50}%` }} />
              ))}
            </div>
          </div>
        ) : chartSource.length === 0 ? (
          <div className="h-[500px] flex items-center justify-center text-center p-8">
            <div className="space-y-4">
              <p className="text-2xl font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">{economyT.emptyTitle}</p>
              <p className="text-sm font-medium text-slate-400">{economyT.emptySubtitle}</p>
              <button onClick={fetchData} className="text-bondi font-black text-[10px] uppercase underline tracking-widest">{commonT.tryAgain || 'Try Again'}</button>
            </div>
          </div>
        ) : (
          <div className="h-[500px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab < 2 ? (
                <BarChart data={chartSource} margin={{ top: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} domain={[0, 'auto']} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.02)'}} 
                    contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                    formatter={(val: any) => `${currencyPrefix} ${val.toLocaleString()}`}
                  />
                  <Legend verticalAlign="top" height={48} iconType="circle" />
                  <Bar name={dashboardT.charts.free} dataKey="consolidated" stackId="stack" fill="#375785">
                    {chartSource.map((entry, index) => (
                      <Cell key={`cell-free-${index}`} fill={entry.isEstimated ? 'url(#stripes-primary)' : '#375785'} />
                    ))}
                  </Bar>
                  <Bar name={dashboardT.charts.captive} dataKey="estimated" stackId="stack" fill="url(#stripes-light)" radius={[6, 6, 0, 0]}>
                    <LabelList 
                      dataKey="total" 
                      {...commonLabelProps}
                      formatter={(val: number) => val > 0 ? `${currencyPrefix}${val.toFixed(1)}k` : ''}
                    />
                  </Bar>
                </BarChart>
              ) : activeTab === 2 ? (
                <ComposedChart data={chartSource} margin={{ top: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} domain={[0, 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }}
                    formatter={(val: any) => `${currencyPrefix} ${parseFloat(String(val)).toLocaleString()}`}
                  />
                  <Legend verticalAlign="top" height={48} />
                  <Bar name={dashboardT.charts.captive} dataKey="cativo" radius={[6, 6, 0, 0]}>
                    {chartSource.map((entry, index) => (
                      <Cell key={`cell-cativo-${index}`} fill={entry.isEstimated ? 'url(#stripes-light)' : '#C2D5FB'} />
                    ))}
                  </Bar>
                  <Bar name={dashboardT.charts.free} dataKey="livre" radius={[6, 6, 0, 0]}>
                    {chartSource.map((entry, index) => (
                      <Cell key={`cell-livre-${index}`} fill={entry.isEstimated ? 'url(#stripes-primary)' : '#375785'} />
                    ))}
                    <LabelList 
                      dataKey="livre" 
                      {...commonLabelProps}
                      formatter={(val: number) => `${val.toFixed(1)}k`}
                    />
                  </Bar>
                  <Line name={dashboardT.charts.monthlySavings} type="monotone" dataKey="mensal" stroke="#0C9200" strokeWidth={3} dot={{r: 4, fill: '#FFF', stroke: '#0C9200', strokeWidth: 2}} />
                </ComposedChart>
              ) : (
                <LineChart data={chartSource}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} domain={[0, 'auto']} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                  <Line name={dashboardT.pldUnit} type="monotone" dataKey="unit" stroke="#1991B3" strokeWidth={4} dot={{ r: 6, fill: '#1991B3', strokeWidth: 2, stroke: '#FFF' }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default EconomyView;

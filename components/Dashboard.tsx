
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, Legend, ComposedChart, Line, LabelList
} from 'recharts';
import { EnergyRecord } from '../types.ts';
import { fetchEconomyData, fetchPLDData } from '../services/dataService.ts';
import { getEnergyInsights } from '../services/geminiService.ts';
import { SectionCard, CardSkeleton, Skeleton } from './UIProvider.tsx';
import { DollarSign, Sparkles, RefreshCw, TrendingUp, CheckCircle2 } from 'lucide-react';
import { getLastConsolidatedYear, populateGraphDataForYear } from '../utils/dataProcessing.ts';

interface DashboardProps {
  data: EnergyRecord[];
  isDarkMode: boolean;
  t: any;
  lang: string;
  selectedUnit: any | null;
}

interface AIInsight {
  title: string;
  description: string;
  action: string;
}

const Dashboard: React.FC<DashboardProps> = ({ data, isDarkMode, t, lang, selectedUnit }) => {
  const [economyData, setEconomyData] = useState<{
    annual: any[];
    monthly: any[];
    estimates: any[];
    mwh: any[];
  }>({ annual: [], monthly: [], estimates: [], mwh: [] });
  
  const [pldOverview, setPldOverview] = useState<any[]>([]);
  const [accumulatedValues, setAccumulatedValues] = useState({ annual: '0', monthly: '0' });
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    annual: false,
    monthly: false,
    estimates: false,
    mwh: false,
    pld: false,
    global: true
  });
  
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  const updateLoading = (key: string, val: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: val }));
  };

  const refreshChart = useCallback(async (key: 'annual' | 'monthly' | 'estimates' | 'mwh' | 'pld') => {
    updateLoading(key, true);
    try {
      if (key === 'pld') {
        const pld = await fetchPLDData('overview');
        setPldOverview(Array.isArray(pld) ? pld : []);
      } else {
        const typeMap: any = { annual: 'grossAnnual', monthly: 'grossMonthly', estimates: 'estimates', mwh: 'MWh' };
        
        const filters = selectedUnit ? [
          { type: "=", field: "dados_cadastrais.cod_smart_unidade", value: selectedUnit.cod_smart_unidade }
        ] : [];
        
        const result = await fetchEconomyData(typeMap[key], filters);
        const arrayPart = Array.isArray(result) ? result : [];
        setEconomyData(prev => ({ ...prev, [key]: arrayPart }));
      }
    } catch (e) {
      console.error(`Error refreshing ${key}`, e);
    } finally {
      updateLoading(key, false);
    }
  }, [selectedUnit]);

  const loadAllData = useCallback(async () => {
    updateLoading('global', true);
    try {
      await Promise.all([
        refreshChart('annual'),
        refreshChart('monthly'),
        refreshChart('estimates'),
        refreshChart('mwh'),
        refreshChart('pld')
      ]);
    } finally {
      updateLoading('global', false);
    }
  }, [refreshChart]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData, selectedUnit]);

  const processedMonthlyData = useMemo(() => {
    if (economyData.monthly.length === 0) return [];
    const lastYear = getLastConsolidatedYear(economyData.monthly, true);
    const populated = populateGraphDataForYear(economyData.monthly, String(lastYear));
    
    let lastMonthlyValue = '0';
    let runningMax = 0;
    
    const mapped = populated.map(item => {
      const isEst = item.dad_estimado === true || Number(item.dad_estimado) === 1 || item.dad_estimado === "true";
      let val = parseFloat(String(item.economia_acumulada || 0));
      
      if (val < runningMax) val = runningMax;
      runningMax = val;

      if (!isEst && val > 0) lastMonthlyValue = (val / 1000).toFixed(3);
      
      return {
        label: item.mes,
        consolidated: !isEst ? val / 1000 : 0,
        estimated: isEst ? val / 1000 : 0,
        total: val / 1000,
        isEstimated: isEst
      };
    });

    setAccumulatedValues(prev => ({ ...prev, monthly: lastMonthlyValue }));
    return mapped;
  }, [economyData.monthly]);

  const processedAnnualData = useMemo(() => {
    let lastAnnualValue = '0';
    let runningMax = 0;
    
    const sortedAnnual = [...economyData.annual].sort((a, b) => parseInt(a.ano) - parseInt(b.ano));
    
    const mapped = sortedAnnual.map(item => {
      const isEst = item.dad_estimado === true || Number(item.dad_estimado) === 1 || item.dad_estimado === "true";
      let val = parseFloat(String(item.economia_acumulada || 0));
      
      if (val < runningMax) val = runningMax;
      runningMax = val;

      if (!isEst && val > 0) lastAnnualValue = (val / 1000).toFixed(3);
      
      return {
        ...item,
        scaled_economy: val / 1000,
        isEstimated: isEst
      };
    });
    
    setAccumulatedValues(prev => ({ ...prev, annual: lastAnnualValue }));
    return mapped;
  }, [economyData.annual]);

  const processedEstimatesData = useMemo(() => {
    if (economyData.estimates.length === 0) return [];
    const lastYear = getLastConsolidatedYear(economyData.estimates, true);
    const populated = populateGraphDataForYear(economyData.estimates, String(lastYear));
    
    return populated.map(item => ({
      label: item.mes,
      cativo: parseFloat(String(item.custo_cativo || 0)) / 1000,
      livre: parseFloat(String(item.custo_livre || 0)) / 1000,
      savings: parseFloat(String(item.economia_mensal || 0)) / 1000,
      isEstimated: item.dad_estimado === true || Number(item.dad_estimado) === 1 || item.dad_estimado === "true"
    }));
  }, [economyData.estimates]);

  const processedMWHData = useMemo(() => {
    if (economyData.mwh.length === 0) return [];
    const lastYear = getLastConsolidatedYear(economyData.mwh, true);
    const populated = populateGraphDataForYear(economyData.mwh, String(lastYear));
    return populated.map(item => ({
      label: item.mes,
      unit: parseFloat(String(item.custo_unit || 0)),
      isEstimated: item.dad_estimado === true || Number(item.dad_estimado) === 1 || item.dad_estimado === "true"
    }));
  }, [economyData.mwh]);

  const handleFetchInsights = async () => {
    const energyData = Array.isArray(data) ? data : [];
    if (energyData.length === 0) return;
    setLoadingAI(true);
    try {
      const result = await getEnergyInsights(energyData, lang);
      if (result) {
        const parsed = JSON.parse(result);
        if (parsed.insights) {
          setAiInsights(parsed.insights);
        }
      }
    } catch (e) {
      console.error("Failed to parse AI insights", e);
    } finally {
      setLoadingAI(false);
    }
  };

  const palette = {
    primary: '#375785', 
    light: '#C2D5FB',
    bondi: '#1991B3',
    success: '#27908F',
    tick: isDarkMode ? '#88898A' : '#94A3B8'
  };

  const currencyPrefix = lang === 'pt' ? 'R$' : '$';

  const commonLabelProps = {
    position: 'top' as const,
    fill: palette.tick,
    fontSize: 9,
    fontWeight: 'bold',
    offset: 8
  };

  if (loadingStates.global) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
        <div className="glass p-6 rounded-[32px] flex flex-wrap justify-around gap-8 border border-black/5 dark:border-white/10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight flex items-center gap-3 uppercase">
            <DollarSign className="text-bondi" /> {t?.title || 'Overview'}
          </h2>
          {t?.subtitle && <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>}
        </div>
        <button 
          onClick={loadAllData}
          disabled={loadingStates.global}
          className="glass px-6 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-yinmn hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loadingStates.global ? 'animate-spin' : ''}`} />
          {loadingStates.global ? t.refreshingAll : t.refreshAll}
        </button>
      </header>

      <div className="glass p-6 rounded-[32px] border border-black/5 dark:border-white/10 flex flex-wrap justify-around gap-8 shadow-sm relative">
        <button 
          onClick={() => refreshChart('pld')}
          className="absolute top-2 right-2 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loadingStates.pld ? 'animate-spin' : ''}`} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yinmn/10 rounded-2xl flex items-center justify-center text-yinmn shadow-inner">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.pldUnit || 'R$/MWh'}</p>
            <p className="text-lg font-black text-night dark:text-white">
              {new Date().toLocaleDateString(lang, { month: '2-digit', year: 'numeric' })}
            </p>
          </div>
        </div>
        {pldOverview.map((region, idx) => (
          <div key={idx} className="flex items-center gap-4 transition-transform hover:scale-105">
            <div className="w-12 h-12 bg-bondi/10 rounded-2xl flex items-center justify-center text-bondi shadow-inner">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{region.submarket}</p>
              <p className="text-lg font-black text-night dark:text-white">{parseFloat(region.value || 0).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SectionCard 
          title={t.charts.annualGross} 
          subtitle={`${t.accumulated}: ${currencyPrefix} ${accumulatedValues.annual}`}
          onRefresh={() => refreshChart('annual')}
          isRefreshing={loadingStates.annual}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedAnnualData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="ano" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: palette.tick}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: palette.tick}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                <Bar name={t.charts.economy} dataKey="scaled_economy" radius={[6, 6, 0, 0]}>
                  {processedAnnualData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isEstimated ? 'url(#stripes-primary)' : palette.primary} />
                  ))}
                  <LabelList 
                    dataKey="scaled_economy" 
                    {...commonLabelProps}
                    formatter={(val: number) => `${currencyPrefix}${val.toFixed(1)}k`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard 
          title={t.charts.monthlyGross} 
          subtitle={`${t.accumulated}: ${currencyPrefix} ${accumulatedValues.monthly}`}
          onRefresh={() => refreshChart('monthly')}
          isRefreshing={loadingStates.monthly}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedMonthlyData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: palette.tick}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: palette.tick}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                <Bar name={t.charts.free} dataKey="consolidated" stackId="stack" fill={palette.primary} />
                <Bar name={t.charts.captive} dataKey="estimated" stackId="stack" fill="url(#stripes-light)" radius={[6, 6, 0, 0]}>
                  <LabelList 
                    dataKey="total" 
                    {...commonLabelProps}
                    formatter={(val: number) => val > 0 ? `${currencyPrefix}${val.toFixed(1)}k` : ''}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard 
          title={t.charts.captiveVsFree} 
          subtitle={t.charts.estimates}
          onRefresh={() => refreshChart('estimates')}
          isRefreshing={loadingStates.estimates}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={processedEstimatesData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: palette.tick}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: palette.tick}} domain={[0, 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} 
                  formatter={(val: any) => `${currencyPrefix} ${parseFloat(val).toLocaleString()}`}
                />
                <Bar name={t.charts.captive} dataKey="cativo" radius={[6, 6, 0, 0]}>
                  {processedEstimatesData.map((entry, index) => (
                    <Cell key={`cell-cativo-${index}`} fill={entry.isEstimated ? 'url(#stripes-light)' : palette.light} />
                  ))}
                </Bar>
                <Bar name={t.charts.free} dataKey="livre" radius={[6, 6, 0, 0]}>
                  {processedEstimatesData.map((entry, index) => (
                    <Cell key={`cell-livre-${index}`} fill={entry.isEstimated ? 'url(#stripes-primary)' : palette.primary} />
                  ))}
                  <LabelList 
                    dataKey="livre" 
                    {...commonLabelProps}
                    formatter={(val: number) => `${val.toFixed(1)}k`}
                  />
                </Bar>
                <Line name={t.charts.economy} type="monotone" dataKey="savings" stroke={palette.success} strokeWidth={3} dot={{r: 3}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard 
          title={t.charts.mwhPrice} 
          subtitle={t.charts.indicator}
          onRefresh={() => refreshChart('mwh')}
          isRefreshing={loadingStates.mwh}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedMWHData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: palette.tick}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: palette.tick}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                <Bar name={t.pldUnit} dataKey="unit" radius={[6, 6, 0, 0]}>
                  {processedMWHData.map((entry, index) => (
                    <Cell key={`cell-unit-${index}`} fill={entry.isEstimated ? 'url(#stripes-bondi)' : palette.bondi} />
                  ))}
                  <LabelList 
                    dataKey="unit" 
                    {...commonLabelProps}
                    formatter={(val: number) => val.toFixed(0)}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={t?.ai?.title || 'AI Insights'} subtitle={t?.ai?.subtitle} onRefresh={handleFetchInsights} isRefreshing={loadingAI}>
        <div className="min-h-[150px] flex flex-col justify-center py-4">
          {loadingAI ? (
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <Sparkles className="text-bondi animate-bounce" />
              <p className="text-[10px] font-black uppercase text-slate-400">{t?.ai?.loading || 'Analyzing...'}</p>
            </div>
          ) : aiInsights.length > 0 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-base font-black text-night dark:text-white flex items-center gap-3 tracking-tight">
                    <span className="w-6 h-6 rounded-lg bg-yinmn/10 dark:bg-white/10 flex items-center justify-center text-[11px] font-black text-yinmn dark:text-bondi">
                      {idx + 1}
                    </span>
                    {insight.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-9">
                    {insight.description}
                  </p>
                  <div className="ml-9 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 flex items-start gap-3 transition-transform hover:scale-[1.01]">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                        {lang === 'pt' ? 'Ação Recomendada' : lang === 'es' ? 'Acción Recomendada' : 'Recommended Action'}
                      </p>
                      <p className="text-sm font-black text-yinmn dark:text-bondi leading-snug">
                        {insight.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 italic text-xs font-medium py-10">
              {t.ai.prompt}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default Dashboard;

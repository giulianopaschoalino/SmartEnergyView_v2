import React, { useState, useEffect, useCallback } from 'react';
import { UserSession } from '../types.ts';
import { fetchOperationSummary, exportToCSV } from '../services/dataService.ts';
import { ApiClient } from '../services/apiClient.ts';
import { FileText, Download, ArrowUpRight, ArrowDownLeft, RefreshCw, Calendar } from 'lucide-react';

interface OperationSummaryViewProps {
  session: UserSession;
  t: any;
  lang: string;
  selectedUnit: any | null;
}

const OperationSummaryView: React.FC<OperationSummaryViewProps> = ({ session, t, lang, selectedUnit }) => {
  const [operations, setOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableMonths, setAvailableMonths] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  const loadFilterData = useCallback(async () => {
    try {
      // Fetch months
      const months = await ApiClient.post<any[]>('operation', {
        filters: [{ type: '>=', field: 'dados_te.mes', value: 1, interval: 'year' }],
        fields: ['mes'],
        distinct: true
      });
      
      const sortedMonths = (months || []).sort((a: any, b: any) => {
        const [mA, yA] = a.mes.split('/').map(Number);
        const [mB, yB] = b.mes.split('/').map(Number);
        if (yA !== yB) return yB - yA;
        return mB - mA;
      });
      setAvailableMonths(sortedMonths);
    } catch (e) {
      console.error("Error loading filters", e);
    }
  }, []);

  const loadOps = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any[] = [];
      if (selectedMonth) {
        filters.push({ type: '=', field: 'mes', value: selectedMonth });
      }
      
      // Use global selectedUnit
      if (selectedUnit?.cod_smart_unidade) {
        filters.push({ type: '=', field: 'dados_te.cod_smart_unidade', value: selectedUnit.cod_smart_unidade });
      }

      const result = await fetchOperationSummary(filters);
      
      const filteredResult = (result || []).filter((op: any) => {
        const year = op.mes.split('/')[1];
        return year !== '2020';
      });

      setOperations(filteredResult);
    } catch (e) {
      console.error("Ops Fetch Error", e);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedUnit]);

  useEffect(() => {
    loadFilterData();
  }, [loadFilterData]);

  useEffect(() => {
    loadOps();
  }, [loadOps]);

  const currency = lang === 'pt' ? 'R$' : '$';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight flex items-center gap-3 uppercase">
            <FileText className="text-cyan" /> {t.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={loadOps}
            disabled={loading}
            className="glass px-6 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-yinmn hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? t.loading : t.common?.refresh || 'Refresh'}
          </button>
          <button 
            onClick={() => exportToCSV(operations, 'resumo_operacao')} 
            className="flex items-center gap-2 px-6 py-3 bg-yinmn text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" /> {t.common?.download || 'Download'}
          </button>
        </div>
      </header>

      {/* Filters Section */}
      <div className="flex justify-end">
        <div className="glass p-4 rounded-3xl flex items-center gap-4 shadow-sm border border-black/5 dark:border-white/5 w-full md:w-auto md:min-w-[300px]">
          <div className="w-10 h-10 bg-cyan/10 rounded-2xl flex items-center justify-center text-cyan">
            <Calendar size={20} />
          </div>
          <div className="flex-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 mb-1 block">{t.ops?.months || 'Months'}</label>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-night dark:text-white cursor-pointer outline-none"
            >
              <option value="">{t.ops?.allMonths || 'All Months'}</option>
              {availableMonths.map((m) => (
                <option key={m.mes} value={m.mes}>{m.mes}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="glass rounded-[32px] overflow-hidden shadow-sm border border-black/5 dark:border-white/5 bg-white dark:bg-night">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.table.month}</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.table.unit}</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.table.op}</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.table.counterparty}</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">{t.table.amount}</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">{t.table.price}</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">{t.table.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center text-xs font-black uppercase tracking-widest text-slate-300 animate-pulse">{t.loading}</td></tr>
              ) : operations.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center text-xs font-black uppercase tracking-widest text-slate-300">{t.common?.noData || 'No operations found'}</td></tr>
              ) : operations.map((op, idx) => {
                const isPurchase = parseFloat(op.nf_c_icms) > 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-night dark:text-slate-300">{op.mes}</td>
                    <td className="px-6 py-4 text-xs font-bold text-night dark:text-slate-300">{op.unidade}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         {isPurchase ? <ArrowUpRight className="w-3.5 h-3.5 text-red-500" /> : <ArrowDownLeft className="w-3.5 h-3.5 text-yinmn" />}
                         <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${isPurchase ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-yinmn/5 dark:bg-yinmn/20 text-yinmn dark:text-bondi'}`}>
                           {isPurchase ? t.purchase : t.assignment}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{op.contraparte || op.perfil_contr}</td>
                    <td className="px-6 py-4 text-xs font-black text-night dark:text-slate-200 text-right">
                      {parseFloat(op.montante_nf).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 3 })}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-night dark:text-slate-200 text-right">
                      {currency} {parseFloat(op.preco_nf).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-night dark:text-white text-right">
                      {currency} {Math.abs(parseFloat(op.nf_c_icms)).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperationSummaryView;
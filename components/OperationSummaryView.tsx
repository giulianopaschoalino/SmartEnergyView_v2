
import React, { useState, useEffect } from 'react';
import { UserSession } from '../types.ts';
import { fetchOperationSummary, exportToCSV } from '../services/dataService.ts';
import { FileText, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface OperationSummaryViewProps {
  session: UserSession;
  t: any;
  lang: string;
}

const OperationSummaryView: React.FC<OperationSummaryViewProps> = ({ session, t, lang }) => {
  const [operations, setOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOps = async () => {
      setLoading(true);
      const result = await fetchOperationSummary();
      setOperations(result || []);
      setLoading(false);
    };
    loadOps();
  }, []);

  const currency = lang === 'pt' ? 'R$' : '$';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="text-cyan" /> {t.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
        </div>
        <button onClick={() => exportToCSV(operations, 'ops_summary')} className="flex items-center gap-2 px-6 py-3 bg-yinmn text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
          <Download className="w-4 h-4" /> {t.table.total}
        </button>
      </header>

      <div className="glass rounded-[32px] overflow-hidden shadow-sm border border-black/5 dark:border-white/5">
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
                <tr><td colSpan={7} className="py-20 text-center text-xs font-black uppercase tracking-widest text-slate-300 animate-pulse">Processing Market Data...</td></tr>
              ) : operations.map((op, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-night dark:text-slate-300">{op.mes}</td>
                  <td className="px-6 py-4 text-xs font-bold text-night dark:text-slate-300">{op.unidade}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {op.nf_c_icms > 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-red-500" /> : <ArrowDownLeft className="w-3.5 h-3.5 text-green-500" />}
                       <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${op.nf_c_icms > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                         {op.nf_c_icms > 0 ? 'Purchase' : 'Sale'}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{op.contraparte}</td>
                  <td className="px-6 py-4 text-xs font-black text-night dark:text-slate-200 text-right">{parseFloat(op.montante_nf).toFixed(3)}</td>
                  <td className="px-6 py-4 text-xs font-bold text-night dark:text-slate-200 text-right">{currency} {parseFloat(op.preco_nf).toFixed(2)}</td>
                  <td className="px-6 py-4 text-xs font-black text-night dark:text-white text-right">{currency} {Math.abs(parseFloat(op.nf_c_icms)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperationSummaryView;

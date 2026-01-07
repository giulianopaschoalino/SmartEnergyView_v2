import React, { useState, useMemo } from 'react';
import { EnergyRecord, ChartFilter } from '../types.ts';
import { exportToCSV } from '../services/dataService.ts';

interface AnalysisViewProps {
  data: EnergyRecord[];
  t: any;
  lang: string;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, t, lang }) => {
  const [filter, setFilter] = useState<ChartFilter>({
    startDate: '',
    endDate: '',
    source: 'All'
  });

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const dateMatch = (!filter.startDate || item.timestamp >= filter.startDate) && 
                        (!filter.endDate || item.timestamp <= filter.endDate);
      const sourceMatch = filter.source === 'All' || item.source === filter.source;
      return dateMatch && sourceMatch;
    }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [data, filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-night dark:text-white tracking-tight">{t.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
        </div>
        
        <button
          onClick={() => exportToCSV(filteredData)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#375785] text-white font-bold rounded-2xl hover:bg-[#2a4365] active:scale-95 transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {t.export}
        </button>
      </div>

      <div className="glass p-6 rounded-[24px] grid grid-cols-1 md:grid-cols-3 gap-6 border border-slate-200 dark:border-white/10">
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold text-[#375785] dark:text-slate-300 uppercase tracking-widest ml-1">{t.filters.start}</label>
          <input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} className="w-full px-4 py-3 bg-white/60 dark:bg-night border border-slate-300 rounded-xl outline-none font-medium" />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold text-[#375785] dark:text-slate-300 uppercase tracking-widest ml-1">{t.filters.end}</label>
          <input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} className="w-full px-4 py-3 bg-white/60 dark:bg-night border border-slate-300 rounded-xl outline-none font-medium" />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold text-[#375785] dark:text-slate-300 uppercase tracking-widest ml-1">{t.filters.source}</label>
          <select value={filter.source} onChange={(e) => setFilter({ ...filter, source: e.target.value as any })} className="w-full px-4 py-3 bg-white/60 dark:bg-night border border-slate-300 rounded-xl outline-none font-bold">
            <option value="All">{t.filters.allSources}</option>
            <option value="Solar">Solar</option>
            <option value="Grid">Grid</option>
            <option value="Battery">Battery</option>
          </select>
        </div>
      </div>

      <div className="glass rounded-[30px] overflow-hidden border border-slate-200 dark:border-white/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200">
                <th className="px-6 py-5 text-[11px] font-black text-[#375785] uppercase tracking-widest">{t.table.date}</th>
                <th className="px-6 py-5 text-[11px] font-black text-[#375785] uppercase tracking-widest">{t.table.source}</th>
                <th className="px-6 py-5 text-[11px] font-black text-[#375785] uppercase tracking-widest">{t.table.usage}</th>
                <th className="px-6 py-5 text-[11px] font-black text-[#375785] uppercase tracking-widest">{t.table.cost}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredData.slice(0, 100).map((record) => (
                <tr key={`${record.timestamp}-${record.source}-${record.usageKWh}`} className="hover:bg-bondi/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold">{new Date(record.timestamp).toLocaleDateString(lang)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${record.source === 'Solar' ? 'bg-[#E7992F]/10 text-[#854D0E]' : record.source === 'Grid' ? 'bg-[#375785]/10 text-[#1E3A8A]' : 'bg-[#27908F]/10 text-[#134E4A]'}`}>
                      {record.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">{record.usageKWh.toFixed(3)}</td>
                  <td className="px-6 py-4 text-sm font-bold">{lang === 'pt' ? 'R$' : '$'}{record.cost.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
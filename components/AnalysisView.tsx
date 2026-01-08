import React, { useState, useMemo } from 'react';
import { EnergyRecord, ChartFilter } from '../types.ts';
import { exportToCSV } from '../services/dataService.ts';
import { Download, Filter } from 'lucide-react';

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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-night dark:text-white tracking-tight">{t.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
        </div>
        
        <button
          onClick={() => exportToCSV(filteredData)}
          aria-label={`${t.export} ${t.title}`}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-yinmn text-white font-bold rounded-2xl hover:bg-[#2a4365] focus:outline-none focus:ring-2 focus:ring-yinmn focus:ring-offset-2 active:scale-95 transition-all shadow-lg"
        >
          <Download className="w-5 h-5" aria-hidden="true" />
          {t.export}
        </button>
      </header>

      <section 
        className="glass p-6 rounded-[24px] grid grid-cols-1 md:grid-cols-3 gap-6 border border-slate-200 dark:border-white/10"
        aria-labelledby="filters-heading"
      >
        <h3 id="filters-heading" className="sr-only">Data Filters</h3>
        
        <div className="space-y-2">
          <label 
            htmlFor="start-date-filter" 
            className="text-xs font-black text-yinmn dark:text-slate-300 uppercase tracking-widest ml-1 block"
          >
            {t.filters.start}
          </label>
          <input 
            id="start-date-filter"
            type="date" 
            value={filter.startDate} 
            onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} 
            className="w-full px-4 py-3 bg-white/60 dark:bg-night border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-yinmn transition-all font-medium text-night dark:text-white" 
          />
        </div>

        <div className="space-y-2">
          <label 
            htmlFor="end-date-filter" 
            className="text-xs font-black text-yinmn dark:text-slate-300 uppercase tracking-widest ml-1 block"
          >
            {t.filters.end}
          </label>
          <input 
            id="end-date-filter"
            type="date" 
            value={filter.endDate} 
            onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} 
            className="w-full px-4 py-3 bg-white/60 dark:bg-night border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-yinmn transition-all font-medium text-night dark:text-white" 
          />
        </div>

        <div className="space-y-2">
          <label 
            htmlFor="source-filter" 
            className="text-xs font-black text-yinmn dark:text-slate-300 uppercase tracking-widest ml-1 block"
          >
            {t.filters.source}
          </label>
          <select 
            id="source-filter"
            value={filter.source} 
            onChange={(e) => setFilter({ ...filter, source: e.target.value as any })} 
            className="w-full px-4 py-3 bg-white/60 dark:bg-night border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-yinmn transition-all font-bold text-night dark:text-white appearance-none cursor-pointer"
          >
            <option value="All">{t.filters.allSources}</option>
            <option value="Solar">Solar</option>
            <option value="Grid">Grid</option>
            <option value="Battery">Battery</option>
          </select>
        </div>
      </section>

      <div className="glass rounded-[30px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <caption className="sr-only">Detailed logs of energy consumption and costs based on the applied filters.</caption>
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th scope="col" className="px-6 py-5 text-xs font-black text-yinmn dark:text-bondi uppercase tracking-widest">{t.table.date}</th>
                <th scope="col" className="px-6 py-5 text-xs font-black text-yinmn dark:text-bondi uppercase tracking-widest">{t.table.source}</th>
                <th scope="col" className="px-6 py-5 text-xs font-black text-yinmn dark:text-bondi uppercase tracking-widest">{t.table.usage}</th>
                <th scope="col" className="px-6 py-5 text-xs font-black text-yinmn dark:text-bondi uppercase tracking-widest">{t.table.cost}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredData.slice(0, 100).map((record) => (
                <tr key={`${record.timestamp}-${record.source}-${record.usageKWh}`} className="hover:bg-bondi/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-night dark:text-slate-200">
                    {new Date(record.timestamp).toLocaleDateString(lang)}
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center ${
                        record.source === 'Solar' 
                          ? 'bg-[#E7992F]/10 text-[#854D0E] dark:bg-[#E7992F]/20 dark:text-[#ECAF5B]' 
                          : record.source === 'Grid' 
                            ? 'bg-[#375785]/10 text-[#1E3A8A] dark:bg-[#375785]/30 dark:text-bondi' 
                            : 'bg-[#27908F]/10 text-[#134E4A] dark:bg-[#27908F]/30 dark:text-[#27908F]'
                      }`}
                    >
                      {record.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-night dark:text-slate-200">{record.usageKWh.toFixed(3)} kWh</td>
                  <td className="px-6 py-4 text-sm font-bold text-night dark:text-slate-200">{lang === 'pt' ? 'R$' : '$'}{record.cost.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold italic">No records found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
import React, { useState } from 'react';
import { Alert, Language } from '../types.ts';

interface AlertsViewProps {
  alerts: Alert[];
  onAddAlert: (alert: Alert) => void;
  onDeleteAlert: (id: string) => void;
  t: any;
  lang: Language;
}

const AlertsView: React.FC<AlertsViewProps> = ({ alerts, onAddAlert, onDeleteAlert, t, lang }) => {
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    type: 'usage',
    condition: 'greater',
    source: 'All',
    threshold: 0,
    enabled: true
  });

  const handleCreate = () => {
    if (newAlert.threshold && newAlert.threshold > 0) {
      onAddAlert({
        ...newAlert,
        id: Math.random().toString(36).substr(2, 9),
        enabled: true
      } as Alert);
      setNewAlert({ type: 'usage', condition: 'greater', source: 'All', threshold: 0, enabled: true });
    }
  };

  const currency = lang === 'pt' ? 'R$' : '$';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-night dark:text-white tracking-tight">{t.alerts.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{t.alerts.subtitle}</p>
      </div>

      <div className="glass rounded-4xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-night dark:text-white">{t.alerts.create}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-yinmn dark:text-slate-400 uppercase tracking-widest ml-1">{t.alerts.type}</label>
            <div className="flex p-1 bg-gray-100 dark:bg-night rounded-xl border border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setNewAlert({...newAlert, type: 'usage'})}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${newAlert.type === 'usage' ? 'bg-yinmn text-white shadow-sm' : 'text-slate-500 hover:text-yinmn'}`}
              >
                {t.alerts.usage}
              </button>
              <button 
                onClick={() => setNewAlert({...newAlert, type: 'cost'})}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${newAlert.type === 'cost' ? 'bg-yinmn text-white shadow-sm' : 'text-slate-500 hover:text-yinmn'}`}
              >
                {t.alerts.cost}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-yinmn dark:text-slate-400 uppercase tracking-widest ml-1">{t.alerts.condition}</label>
            <select 
              value={newAlert.condition}
              onChange={(e) => setNewAlert({...newAlert, condition: e.target.value as any})}
              className="w-full px-4 py-3 bg-white/50 dark:bg-night border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-yinmn outline-none text-sm font-bold"
            >
              <option value="greater">{t.alerts.greater}</option>
              <option value="less">{t.alerts.less}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-yinmn dark:text-slate-400 uppercase tracking-widest ml-1">{t.alerts.threshold}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold uppercase">
                {newAlert.type === 'cost' ? currency : 'kWh'}
              </span>
              <input 
                type="number" 
                value={newAlert.threshold || ''}
                onChange={(e) => setNewAlert({...newAlert, threshold: parseFloat(e.target.value)})}
                className="w-full pl-14 pr-4 py-3 bg-white/50 dark:bg-night border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-yinmn outline-none text-sm font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-yinmn dark:text-slate-400 uppercase tracking-widest ml-1">{t.alerts.source}</label>
            <select 
              value={newAlert.source}
              onChange={(e) => setNewAlert({...newAlert, source: e.target.value as any})}
              className="w-full px-4 py-3 bg-white/50 dark:bg-night border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-yinmn outline-none text-sm font-bold"
            >
              <option value="All">{t.dashboard.sources.All}</option>
              <option value="Solar">{t.dashboard.sources.Solar}</option>
              <option value="Grid">{t.dashboard.sources.Grid}</option>
              <option value="Battery">{t.dashboard.sources.Battery}</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleCreate}
          className="w-full py-4 bg-yinmn text-white font-bold rounded-2xl hover:bg-[#2a4365] transition-all shadow-xl shadow-yinmn/20"
        >
          {t.alerts.save}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-bold text-yinmn dark:text-slate-400 uppercase tracking-widest ml-1">{t.alerts.active}</h3>
        {alerts.length === 0 ? (
          <div className="glass p-12 rounded-4xl text-center text-slate-400 italic font-medium">
            {t.alerts.noAlerts}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {alerts.map(alert => (
              <div key={alert.id} className="glass p-5 rounded-3xl flex items-center justify-between group hover:border-yinmn/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${alert.type === 'usage' ? 'bg-cyan/10 text-cyan' : 'bg-gamboge/10 text-gamboge'}`}>
                    {alert.type === 'usage' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1" /></svg>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-night dark:text-white">
                      {t.dashboard.sources[alert.source]} {alert.type === 'usage' ? t.alerts.usage : t.alerts.cost}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">
                      {alert.condition === 'greater' ? t.alerts.greater : t.alerts.less} {alert.type === 'cost' ? currency : ''}{alert.threshold} {alert.type === 'usage' ? 'kWh' : ''}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteAlert(alert.id)}
                  className="p-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                  aria-label={t.alerts.delete}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsView;
import React from 'react';
import { Language } from '../types.ts';

interface SettingsViewProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  email: string | null;
  t: any;
  onEditProfile: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme, language, setLanguage, email, t, onEditProfile }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-night dark:text-white tracking-tight">{t.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
      </div>

      {/* Profile Section */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-extrabold text-[#254F7F] dark:text-slate-400 uppercase tracking-widest ml-1">{t.profile}</h3>
        <div className="glass rounded-[24px] overflow-hidden divide-y divide-slate-100 dark:divide-white/5 border border-slate-200 dark:border-white/10">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#254F7F] rounded-full flex items-center justify-center text-white font-bold text-xl uppercase shadow-sm">
                {email?.[0] || 'U'}
              </div>
              <div>
                <p className="font-bold text-night dark:text-white">{email}</p>
                <p className="text-sm font-bold text-bondi uppercase tracking-tighter">{t.premium}</p>
              </div>
            </div>
            <button 
              onClick={onEditProfile}
              className="px-4 py-2 text-sm font-bold text-[#254F7F] dark:text-bondi hover:bg-[#254F7F]/5 rounded-lg transition-colors"
            >
              {t.edit}
            </button>
          </div>
        </div>
      </section>

      {/* Appearance & Language Section */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-extrabold text-[#254F7F] dark:text-slate-400 uppercase tracking-widest ml-1">{t.appearance}</h3>
        <div className="glass rounded-[24px] p-6 space-y-6 border border-slate-200 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-night dark:text-white">{t.theme}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t.themeDesc}</p>
            </div>
            <div className="flex p-1 bg-slate-100 dark:bg-night rounded-xl w-fit border border-slate-200 dark:border-slate-800">
              {(['system', 'light', 'dark'] as const).map((tValue) => (
                <button
                  key={tValue}
                  onClick={() => setTheme(tValue)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                    theme === tValue
                      ? 'bg-white dark:bg-slate-700 text-[#254F7F] dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[#254F7F] dark:hover:text-white'
                  }`}
                >
                  {tValue}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
            <div>
              <p className="font-bold text-night dark:text-white">{t.language}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t.languageDesc}</p>
            </div>
            <div className="flex p-1 bg-slate-100 dark:bg-night rounded-xl w-fit border border-slate-200 dark:border-slate-800">
              {(['en', 'pt', 'es'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all uppercase ${
                    language === lang
                      ? 'bg-white dark:bg-slate-700 text-[#254F7F] dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[#254F7F] dark:hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-extrabold text-[#254F7F] dark:text-slate-400 uppercase tracking-widest ml-1">{t.notifications}</h3>
        <div className="glass rounded-[24px] overflow-hidden divide-y divide-slate-100 dark:divide-white/5 border border-slate-200 dark:border-white/10">
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-night dark:text-white">{t.alerts}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t.alertsDesc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#254F7F]"></div>
            </label>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-night dark:text-white">{t.summary}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t.summaryDesc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#254F7F]"></div>
            </label>
          </div>
        </div>
      </section>

      <div className="text-center pt-8 text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-extrabold">
        Smart Energia Insight • v2.0.4 • {t.build} 108
      </div>
    </div>
  );
};

export default SettingsView;
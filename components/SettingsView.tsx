
import React, { useState } from 'react';
import { Language } from '../types.ts';
import { Lock, LogOut, ChevronRight } from 'lucide-react';

interface SettingsViewProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  name?: string;
  profilePhotoUrl?: string;
  email: string | null;
  t: any;
  tCommon: any;
  onEditProfile: () => void;
  onLogout: () => void;
}

const getFullImageUrl = (path?: string) => {
  if (!path || path === '') return '';
  if (path.startsWith('http')) return path;
  const filename = path.split('/').pop() || path;
  return `https://api.energiasmart.com.br/images/${filename}`;
};

const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme, language, setLanguage, name, profilePhotoUrl, email, t, tCommon, onEditProfile, onLogout }) => {
  const [imgError, setImgError] = useState(false);

  const renderProfileAvatar = () => {
    const sizeClass = "w-28 h-28";
    const photoUrl = getFullImageUrl(profilePhotoUrl);
    
    if (photoUrl && !imgError) {
      return (
        <img 
          src={photoUrl} 
          alt={name || "User Profile"} 
          onError={() => setImgError(true)}
          className={`${sizeClass} rounded-[28px] object-cover bg-white dark:bg-white/10 border-4 border-white dark:border-white/10 shadow-xl ring-1 ring-black/5`}
        />
      );
    }
    const initial = (name?.[0] || email?.[0] || 'U').toUpperCase();
    return (
      <div className={`${sizeClass} bg-gradient-to-br from-yinmn to-bondi rounded-[28px] flex items-center justify-center text-white font-black text-4xl uppercase shadow-xl ring-1 ring-black/5`}>
        {initial}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-black text-night dark:text-white tracking-tight leading-tight uppercase">{t.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
      </header>

      {/* Profile Group */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.profile}</h3>
        <div className="glass rounded-[32px] overflow-hidden border border-black/5 dark:border-white/10 shadow-sm">
          <div className="p-8 space-y-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-8">
              <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
                {renderProfileAvatar()}
                <div>
                  <p className="text-2xl font-black text-night dark:text-white tracking-tight leading-tight uppercase">{name || 'Verified User'}</p>
                  <p className="text-[11px] font-black text-bondi uppercase tracking-[0.25em] mt-2">{t.premium}</p>
                </div>
              </div>
              <button 
                onClick={onEditProfile}
                className="flex items-center gap-2 px-8 py-4 text-[11px] font-black text-bondi bg-yinmn/5 dark:bg-white/5 rounded-2xl hover:bg-yinmn/10 transition-all uppercase tracking-widest group active:scale-95 border border-white/10 shadow-sm"
              >
                {t.edit.toUpperCase()}
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="space-y-3 pt-8 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.accountID}</label>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-tighter">
                  <Lock size={10} /> {tCommon.verified.toUpperCase()}
                </div>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={name || ''} 
                  readOnly 
                  className="w-full px-5 py-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl text-slate-500 dark:text-slate-400 font-bold cursor-not-allowed outline-none focus:ring-0 uppercase"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                   <Lock className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                </div>
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium px-1 italic uppercase tracking-wider">{t.identityNotice}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Group */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.appearance}</h3>
        <div className="glass rounded-[32px] p-8 space-y-10 border border-black/5 dark:border-white/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="font-black text-night dark:text-white tracking-tight uppercase">{t.theme}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase tracking-widest opacity-80 mt-1">{t.themeDesc}</p>
            </div>
            <div className="flex p-1 bg-black/5 dark:bg-night rounded-2xl w-full sm:w-fit border border-black/5 dark:border-slate-800">
              {(['system', 'light', 'dark'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setTheme(v)}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    theme === v
                      ? 'bg-bondi/10 dark:bg-bondi/20 text-bondi shadow-sm'
                      : 'text-slate-500 hover:text-night dark:hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-10 border-t border-black/5 dark:border-white/5">
            <div>
              <p className="font-black text-night dark:text-white tracking-tight uppercase">{t.language}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase tracking-widest opacity-80 mt-1">{t.languageDesc}</p>
            </div>
            <div className="flex p-1 bg-black/5 dark:bg-night rounded-2xl w-full sm:w-fit border border-black/5 dark:border-slate-800">
              {(['en', 'pt', 'es'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    language === lang
                      ? 'bg-bondi/10 dark:bg-bondi/20 text-bondi shadow-sm'
                      : 'text-slate-500 hover:text-night dark:hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Actions Group */}
      <section className="pt-6">
        <button
          onClick={onLogout}
          className="w-full glass flex items-center justify-center gap-3 px-8 py-5 rounded-[28px] text-red-500 font-black uppercase tracking-[0.2em] text-xs border border-red-500/10 hover:bg-red-500/5 active:scale-95 transition-all shadow-sm group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          {t.logout.toUpperCase()}
        </button>
      </section>

      <footer className="text-center py-10">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
          Smart Energia Insight • v2.0.4 • Build 108
        </p>
      </footer>
    </div>
  );
};

export default SettingsView;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserSession, EnergyRecord, ViewMode, Language } from './types.ts';
import Login from './components/Login.tsx';
import PolicyAgreement from './components/PolicyAgreement.tsx';
import Dashboard from './components/Dashboard.tsx';
import EconomyView from './components/EconomyView.tsx';
import TelemetryView from './components/TelemetryView.tsx';
import OperationSummaryView from './components/OperationSummaryView.tsx';
import NewsView from './components/NewsView.tsx';
import PLDView from './components/PLDView.tsx';
import SettingsView from './components/SettingsView.tsx';
import ProfileView from './components/ProfileView.tsx';
import StaticViews from './components/StaticViews.tsx';
import InfinityLogo from './components/InfinityLogo.tsx';
import { Avatar } from './components/UIProvider.tsx';
import { fetchConsumptionLogs, fetchClientUnits, authService } from './services/dataService.ts';
import { translations } from './translations.ts';
import { ApiClient } from './services/apiClient.ts';
import { 
  LayoutDashboard, Wallet, Settings, Newspaper, Globe,
  List, MoreHorizontal, FileText, Info, HelpCircle, Activity, Building2, LayoutGrid, Wifi, WifiOff
} from 'lucide-react';

const APP_POLICY_VERSION = "2023.10.1";
const SESSION_KEY = 'smartenergia_session';

const getFullImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://app.dev.smartenergia.com.br/api/images/${path.split('/').pop()}`;
};

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession>(() => {
    const stored = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token) ApiClient.setAuthToken(parsed.token);
        return parsed;
      } catch (e) {
        return { isAuthenticated: false, email: null, hasAgreedToPolicy: false, policyVersion: APP_POLICY_VERSION };
      }
    }
    return { isAuthenticated: false, email: null, hasAgreedToPolicy: false, policyVersion: APP_POLICY_VERSION };
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('smart_theme') as any) || 'system');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('smart_lang') as any) || 'en');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Dashboard);
  const [data, setData] = useState<EnergyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);

  const t = useMemo(() => translations[language], [language]);

  const handleLogout = useCallback(async () => {
    try { await authService.logout(); } catch (e) {}
    ApiClient.setAuthToken(null);
    setSession({ isAuthenticated: false, email: null, hasAgreedToPolicy: false, policyVersion: APP_POLICY_VERSION });
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  useEffect(() => {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('smart_theme', theme);
  }, [theme]);

  // Network listener
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const syncAll = useCallback(async () => {
    if (!session.isAuthenticated || !session.token) return;
    setLoading(true);
    try {
      if (session.clientId && units.length === 0) {
        const fetchedUnits = await fetchClientUnits(session.clientId);
        setUnits(fetchedUnits || []);
        if (session.scdeCode && !selectedUnit) {
          const matched = fetchedUnits.find(u => u.codigo_scde === session.scdeCode);
          if (matched) setSelectedUnit(matched);
        }
      }
      const logs = await fetchConsumptionLogs(365, selectedUnit?.codigo_scde);
      setData(logs || []);
    } catch (error) {
      console.warn("Global sync failed:", error);
    } finally {
      setLoading(false);
    }
  }, [session, selectedUnit, units.length]);

  useEffect(() => {
    syncAll();
  }, [syncAll]);

  const navItems = [
    { id: ViewMode.Dashboard, label: t.nav.dashboard, icon: LayoutDashboard },
    { id: ViewMode.Economy, label: t.nav.economy, icon: Wallet },
    { id: ViewMode.Telemetry, label: t.nav.telemetry, icon: Activity },
    { id: ViewMode.OperationSummary, label: t.nav.operation_summary, icon: FileText },
    { id: ViewMode.News, label: t.nav.news, icon: Newspaper },
    { id: ViewMode.PLD, label: t.nav.pld, icon: Globe },
    { id: ViewMode.SectorialInfo, label: t.nav.sectorial_info, icon: List },
    { id: ViewMode.AboutUs, label: t.nav.about_us, icon: Info },
    { id: ViewMode.FAQ, label: t.nav.faq, icon: HelpCircle }
  ];

  if (!session.isAuthenticated) return <Login onLogin={() => {}} onRealLogin={async (email, password, keep) => {
    try {
      const res = await authService.login({ email, password });
      const s = { ...session, isAuthenticated: true, ...res.user, token: res.token, keepLoggedIn: keep };
      setSession(s);
      (keep ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(s));
    } catch (err: any) {
      console.error("Login failure", err);
      alert(err.message || "Authentication failed.");
    }
  }} t={t.login} isDarkMode={document.documentElement.classList.contains('dark')} />;

  if (!session.hasAgreedToPolicy) return <PolicyAgreement onAgree={() => setSession(p => ({...p, hasAgreedToPolicy: true}))} onDisagree={handleLogout} t={t.policy} />;

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black transition-colors duration-500 pb-safe font-inter selection:bg-yinmn">
      {/* Primary Navigation */}
      <nav className="glass sticky top-0 z-50 px-4 md:px-10 py-1.5 flex items-center justify-between border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode(ViewMode.Dashboard)} className="hover:opacity-80 transition-all outline-none">
            <InfinityLogo className="w-16 md:w-20" isDarkMode={document.documentElement.classList.contains('dark')} />
          </button>
          <div className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full ${isOnline ? 'bg-cyan/10 text-cyan' : 'bg-red-500/10 text-red-500'}`}>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span className="text-[9px] font-black uppercase tracking-widest">{isOnline ? 'Live' : 'Offline'}</span>
          </div>
        </div>
        <div className="hidden lg:flex bg-black/5 dark:bg-white/5 p-0.5 rounded-[20px] backdrop-blur-3xl overflow-x-auto no-scrollbar shadow-inner">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setViewMode(item.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[16px] text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === item.id ? 'bg-white dark:bg-white/15 text-yinmn dark:text-bondi shadow-sm' : 'text-slate-500 hover:text-yinmn dark:hover:text-white'}`}>
              <item.icon className="w-3 h-3" /><span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode(ViewMode.Settings)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${viewMode === ViewMode.Settings ? 'bg-yinmn text-white shadow-lg' : 'glass text-slate-400 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 active:scale-90'}`}>
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode(ViewMode.Profile)} className="outline-none">
            <Avatar src={getFullImageUrl(session.profilePhotoUrl)} name={session.name} size="w-10 h-10" />
          </button>
        </div>
      </nav>

      {/* Global Unity Selector Bar */}
      {session.isAuthenticated && (
        <div className="sticky top-[58px] z-40 bg-white/60 dark:bg-black/60 backdrop-blur-xl border-b border-black/5 dark:border-white/5 py-3 px-4 md:px-10 overflow-x-auto no-scrollbar">
          <div className="max-w-[1600px] mx-auto flex items-center gap-2">
            <div className="flex-shrink-0 mr-4 flex items-center gap-2 text-slate-400 dark:text-slate-500">
               <Building2 size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">{t.common.units}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedUnit(null)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${!selectedUnit ? 'bg-yinmn text-white border-yinmn shadow-lg' : 'bg-black/5 dark:bg-white/5 text-slate-500 border-transparent hover:bg-black/10'}`}
              >
                <LayoutGrid size={14} />
                {t.common.allUnits}
              </button>
              {units.map((u) => (
                <button 
                  key={u.cod_smart_unidade}
                  onClick={() => setSelectedUnit(u)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedUnit?.cod_smart_unidade === u.cod_smart_unidade ? 'bg-yinmn text-white border-yinmn shadow-lg' : 'bg-black/5 dark:bg-white/5 text-slate-500 border-transparent hover:bg-black/10'}`}
                >
                  {u.unidade}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto min-h-[calc(100vh-120px)]">
        {loading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
            <div className="w-16 h-16 border-4 border-yinmn rounded-full border-t-transparent animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.common.loading}</p>
          </div>
        ) : !isOnline && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
            <WifiOff size={64} className="text-slate-300 dark:text-slate-700" />
            <div className="space-y-2">
              <h3 className="text-xl font-black text-night dark:text-white uppercase tracking-tight">Offline Mode</h3>
              <p className="text-sm text-slate-500 max-w-sm">Please check your internet connection. Some data might be unavailable until you're back online.</p>
            </div>
            <button onClick={syncAll} className="px-8 py-3 bg-yinmn text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl">Try Reconnecting</button>
          </div>
        ) : (
          <>
            {viewMode === ViewMode.Dashboard && <Dashboard data={data} isDarkMode={document.documentElement.classList.contains('dark')} t={t.dashboard} lang={language} selectedUnit={selectedUnit} />}
            {viewMode === ViewMode.Economy && <EconomyView data={data} t={t} lang={language} selectedUnit={selectedUnit} />}
            {viewMode === ViewMode.Telemetry && <TelemetryView session={session} t={t} lang={language} selectedUnit={selectedUnit} />}
            {viewMode === ViewMode.OperationSummary && <OperationSummaryView session={session} t={t.ops} lang={language} selectedUnit={selectedUnit} />}
            {viewMode === ViewMode.News && <NewsView t={t} />}
            {viewMode === ViewMode.PLD && <PLDView t={t} lang={language} />}
            {viewMode === ViewMode.SectorialInfo && <StaticViews.SectorialInfo t={t.sector} />}
            {viewMode === ViewMode.AboutUs && <StaticViews.AboutUs t={t.nav} tStatic={t.static} />}
            {viewMode === ViewMode.FAQ && <StaticViews.FAQ t={t.nav} tStatic={t.static} />}
            {viewMode === ViewMode.Settings && <SettingsView theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} name={session.name} profilePhotoUrl={session.profilePhotoUrl} email={session.email} t={t.settings} tCommon={t.common} onEditProfile={() => setViewMode(ViewMode.Profile)} onLogout={handleLogout} />}
            {viewMode === ViewMode.Profile && <ProfileView name={session.name} profilePhotoUrl={session.profilePhotoUrl} email={session.email} t={t.profile} tCommon={t.common} onBack={() => setViewMode(ViewMode.Settings)} />}
          </>
        )}
      </main>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60]">
        {isMoreOpen && (
          <div className="absolute bottom-full left-0 right-0 px-4 pb-6 animate-in slide-in-from-bottom-10">
            <div className="glass rounded-[36px] p-5 grid grid-cols-2 gap-4 shadow-2xl border border-black/5 dark:border-white/10">
              {navItems.slice(4).map(item => (
                <button key={item.id} onClick={() => { setViewMode(item.id); setIsMoreOpen(false); }} className={`flex flex-col items-center gap-3 p-6 rounded-[28px] transition-all active:scale-95 ${viewMode === item.id ? 'bg-yinmn text-white shadow-lg' : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300'}`}>
                  <item.icon size={28} /><span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-t border-black/5 dark:border-white/5 px-4 pb-safe flex justify-around items-center h-18">
          {navItems.slice(0, 4).map(item => (
            <button key={item.id} onClick={() => { setViewMode(item.id); setIsMoreOpen(false); }} className={`flex flex-col items-center flex-1 gap-1 active:scale-90 ${viewMode === item.id ? 'text-bondi' : 'text-slate-400'}`}>
              <item.icon size={20} /><span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          <button onClick={() => setIsMoreOpen(!isMoreOpen)} className={`flex flex-col items-center flex-1 gap-1 active:scale-90 ${isMoreOpen ? 'text-bondi' : 'text-slate-400'}`}>
            <MoreHorizontal size={20} /><span className="text-[8px] font-black uppercase tracking-widest">{t.common.more}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
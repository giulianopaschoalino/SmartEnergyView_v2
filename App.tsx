
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
import { fetchConsumptionLogs, fetchClientUnits, authService } from './services/dataService.ts';
import { translations } from './translations.ts';
import { ApiClient } from './services/apiClient.ts';
import { 
  LayoutDashboard, 
  Wallet, 
  Settings, 
  Newspaper, 
  Globe,
  List,
  MoreHorizontal,
  FileText,
  Info,
  HelpCircle,
  Activity
} from 'lucide-react';

const APP_POLICY_VERSION = "2023.10.1";
const SESSION_KEY = 'smartenergia_session';
const THEME_KEY = 'smartenergia_theme';
const LANG_KEY = 'smartenergia_lang';

/**
 * Ensures profile photo URLs are correctly resolved to the Smart Energia API image repository.
 */
const getFullImageUrl = (path?: string) => {
  if (!path || path === '') return '';
  if (path.startsWith('http')) return path;
  // Standardize the path to ensure it maps to https://api.energiasmart.com.br/images/XXXXXXXXX.png
  const filename = path.split('/').pop() || path;
  return `https://api.energiasmart.com.br/images/${filename}`;
};

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const storedLocal = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (storedLocal) {
        const parsed = JSON.parse(storedLocal);
        if (parsed.token) ApiClient.setAuthToken(parsed.token);
        return parsed;
      }
    } catch (e) {}
    return { isAuthenticated: false, email: null, hasAgreedToPolicy: false, policyVersion: APP_POLICY_VERSION };
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem(THEME_KEY) as any) || 'system');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem(LANG_KEY) as any) || 'en');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Dashboard);
  const [data, setData] = useState<EnergyRecord[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const t = useMemo(() => translations[language], [language]);

  const handleLogout = useCallback(async () => {
    try { await authService.logout(); } catch (e) {}
    ApiClient.setAuthToken(null);
    setSession({ isAuthenticated: false, email: null, hasAgreedToPolicy: false, policyVersion: APP_POLICY_VERSION });
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setData([]);
    setViewMode(ViewMode.Dashboard);
    setImgError(false);
  }, []);

  useEffect(() => {
    if (session.isAuthenticated && session.token) {
      const syncData = async () => {
        setIsFetchingData(true);
        try {
          ApiClient.setAuthToken(session.token || null);
          let targetScde = session.scdeCode;
          if (!targetScde && session.clientId) {
            const units = await fetchClientUnits(session.clientId);
            if (units?.length > 0) {
              targetScde = units[0].codigo_scde || units[0].cod_smart_unidade;
              setSession(prev => ({ ...prev, scdeCode: targetScde }));
            }
          }
          const result = await fetchConsumptionLogs(365, targetScde);
          setData(result || []);
        } catch (e) {} finally { setIsFetchingData(false); }
      };
      syncData();
    }
  }, [session.isAuthenticated, session.token, session.clientId]);

  useEffect(() => {
    const activeDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(activeDark);
    if (activeDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const handleLogin = useCallback(async (email: string, password: string, keepLoggedIn: boolean) => {
    try {
      const response = await authService.login({ email, password });
      ApiClient.setAuthToken(response.token);
      const newSession: UserSession = {
        ...session, 
        isAuthenticated: true, 
        email: response.user.email, 
        name: response.user.name, 
        profilePhotoUrl: response.user.profilePhotoUrl,
        clientId: response.user.clientId, 
        scdeCode: response.user.scdeCode,
        token: response.token, 
        keepLoggedIn
      };
      setSession(newSession);
      const storage = keepLoggedIn ? localStorage : sessionStorage;
      storage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setImgError(false);
    } catch (e) { alert("Login failed: " + (e as Error).message); }
  }, [session]);

  const navMenuItems = [
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

  const mobilePrimaryItems = navMenuItems.slice(0, 4);
  const mobileMoreItems = navMenuItems.slice(4);

  const renderAvatar = (sizeClass: string = "w-9 h-9") => {
    const photoUrl = getFullImageUrl(session.profilePhotoUrl);
    if (photoUrl && !imgError) {
      return (
        <img 
          src={photoUrl} 
          alt={session.name || "User Profile"} 
          onError={() => setImgError(true)}
          className={`${sizeClass} rounded-xl object-cover bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 shadow-md transition-transform hover:scale-105 active:scale-95`}
        />
      );
    }
    const initial = (session.name?.[0] || session.email?.[0] || 'U').toUpperCase();
    return (
      <div className={`${sizeClass} rounded-xl bg-gradient-to-br from-yinmn to-bondi flex items-center justify-center text-white font-black text-[11px] shadow-md transition-transform hover:scale-105 active:scale-95`}>
        {initial}
      </div>
    );
  };

  const renderContent = () => {
    if (isFetchingData && data.length === 0) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse"><div className="w-16 h-16 border-4 border-yinmn rounded-full border-t-transparent animate-spin" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Data...</p></div>;
    
    switch (viewMode) {
      case ViewMode.Dashboard: return <Dashboard data={data} isDarkMode={isDarkMode} t={t.dashboard} lang={language} />;
      case ViewMode.Economy: return <EconomyView data={data} t={t.economy} lang={language} />;
      case ViewMode.Telemetry: return <TelemetryView session={session} t={t} lang={language} />;
      case ViewMode.OperationSummary: return <OperationSummaryView session={session} t={t.ops} lang={language} />;
      case ViewMode.News: return <NewsView t={t} />;
      case ViewMode.PLD: return <PLDView t={t} lang={language} />;
      case ViewMode.SectorialInfo: return <StaticViews.SectorialInfo t={t.sector} />;
      case ViewMode.AboutUs: return <StaticViews.AboutUs t={t.nav} />;
      case ViewMode.FAQ: return <StaticViews.FAQ t={t.nav} />;
      case ViewMode.Settings: return <SettingsView theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} name={session.name} profilePhotoUrl={session.profilePhotoUrl} email={session.email} t={t.settings} tCommon={t.common} onEditProfile={() => setViewMode(ViewMode.Profile)} onLogout={handleLogout} />;
      case ViewMode.Profile: return <ProfileView name={session.name} profilePhotoUrl={session.profilePhotoUrl} email={session.email} t={t.profile} tCommon={t.common} onBack={() => setViewMode(ViewMode.Settings)} />;
      default: return <Dashboard data={data} isDarkMode={isDarkMode} t={t.dashboard} lang={language} />;
    }
  };

  if (!session.isAuthenticated) return <Login onLogin={() => {}} onRealLogin={handleLogin} isDarkMode={isDarkMode} t={t.login} />;
  if (!session.hasAgreedToPolicy) return <PolicyAgreement onAgree={() => setSession(p => ({...p, hasAgreedToPolicy: true}))} onDisagree={handleLogout} t={t.policy} />;

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black transition-colors duration-500 pb-safe font-inter selection:bg-yinmn selection:text-white">
      <nav className="glass sticky top-0 z-50 px-4 md:px-10 py-1.5 flex items-center justify-between border-b border-black/5 dark:border-white/5 transition-all">
        <button onClick={() => setViewMode(ViewMode.Dashboard)} className="hover:opacity-80 active:scale-95 transition-all outline-none">
          <InfinityLogo className="w-16 md:w-20 h-auto" isDarkMode={isDarkMode} />
        </button>
        <div className="hidden lg:flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-[20px] backdrop-blur-3xl overflow-x-auto no-scrollbar shadow-inner">
          {navMenuItems.map(item => (
            <button key={item.id} onClick={() => setViewMode(item.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[16px] text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === item.id ? 'bg-white dark:bg-white/15 text-yinmn dark:text-bondi shadow-sm' : 'text-slate-500 hover:text-yinmn dark:hover:text-white'}`}>
              <item.icon className="w-3 h-3" /><span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setViewMode(ViewMode.Settings)} 
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${viewMode === ViewMode.Settings ? 'bg-yinmn text-white shadow-lg' : 'glass text-bondi dark:text-bondi hover:bg-black/5 dark:hover:bg-white/10 active:scale-90'}`} 
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode(ViewMode.Profile)} className="outline-none focus:outline-none">
            {renderAvatar("w-8 h-8")}
          </button>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] overflow-x-hidden">
        {renderContent()}
      </main>
      
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60]">
        {isMoreMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 px-4 pb-6 animate-in slide-in-from-bottom-10 duration-200">
            <div className="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl rounded-[36px] p-5 grid grid-cols-2 gap-4 shadow-[0_25px_60px_rgba(0,0,0,0.4)] border border-black/5 dark:border-white/10">
              {mobileMoreItems.map(item => (
                <button key={item.id} onClick={() => { setViewMode(item.id); setIsMoreMenuOpen(false); }} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[28px] transition-all active:scale-95 ${viewMode === item.id ? 'bg-yinmn text-white' : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300'}`}>
                  <item.icon className="w-7 h-7" /><span className="text-[10px] font-black uppercase tracking-widest text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-t border-black/5 dark:border-white/5 px-4 pb-safe flex justify-around items-center h-18 transition-all">
          {mobilePrimaryItems.map(item => (
            <button key={item.id} onClick={() => { setViewMode(item.id); setIsMoreMenuOpen(false); }} className={`flex flex-col items-center justify-center flex-1 gap-1 transition-all active:scale-90 ${viewMode === item.id ? 'text-bondi' : 'text-slate-400'}`}>
              <item.icon className="w-5 h-5" /><span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className={`flex flex-col items-center justify-center flex-1 gap-1 transition-all active:scale-90 ${isMoreMenuOpen ? 'text-bondi' : 'text-slate-400'}`}>
            <MoreHorizontal className="w-5 h-5" /><span className="text-[8px] font-black uppercase tracking-widest">More</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserSession, EnergyRecord, ViewMode, Language, Alert, AppNotification } from './types.ts';
import Login from './components/Login.tsx';
import PolicyAgreement from './components/PolicyAgreement.tsx';
import Dashboard from './components/Dashboard.tsx';
import AnalysisView from './components/AnalysisView.tsx';
import EconomyView from './components/EconomyView.tsx';
import HistoricalView from './components/HistoricalView.tsx';
import AlertsView from './components/AlertsView.tsx';
import NewsView from './components/NewsView.tsx';
import PLDView from './components/PLDView.tsx';
import SettingsView from './components/SettingsView.tsx';
import ProfileView from './components/ProfileView.tsx';
import InfinityLogo from './components/InfinityLogo.tsx';
import { fetchConsumptionLogs, authService } from './services/dataService.ts';
import { translations } from './translations.ts';
import { ApiClient } from './services/apiClient.ts';
import { 
  LayoutDashboard, 
  History, 
  Bell, 
  Wallet, 
  Settings, 
  Newspaper, 
  User, 
  Globe,
  List,
  MoreHorizontal,
  X
} from 'lucide-react';

const APP_POLICY_VERSION = "2023.10.1";
const SESSION_KEY = 'smartenergia_session';
const THEME_KEY = 'smartenergia_theme';
const LANG_KEY = 'smartenergia_lang';
const ALERTS_KEY = 'smartenergia_alerts';
const NOTIFS_KEY = 'smartenergia_notifications';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const storedLocal = localStorage.getItem(SESSION_KEY);
      if (storedLocal) {
        const parsed = JSON.parse(storedLocal);
        if (parsed.token) ApiClient.setAuthToken(parsed.token);
        return parsed;
      }
      const storedSession = sessionStorage.getItem(SESSION_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed.token) ApiClient.setAuthToken(parsed.token);
        return parsed;
      }
    } catch (e) { console.error("Session parse error", e); }
    return {
      isAuthenticated: false,
      email: null,
      hasAgreedToPolicy: false,
      policyVersion: APP_POLICY_VERSION,
      keepLoggedIn: false,
      token: undefined
    };
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const stored = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system';
    return stored || 'system';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem(LANG_KEY) as Language;
    if (stored) return stored;
    const browserLang = navigator.language.split('-')[0];
    if (['en', 'pt', 'es'].includes(browserLang)) return browserLang as Language;
    return 'en';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system';
    const activeTheme = stored || 'system';
    if (activeTheme === 'dark') return true;
    if (activeTheme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Dashboard);
  const [data, setData] = useState<EnergyRecord[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const stored = localStorage.getItem(ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const stored = localStorage.getItem(NOTIFS_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [showNotifications, setShowNotifications] = useState(false);

  const t = useMemo(() => translations[language], [language]);

  const userInitial = useMemo(() => {
    return session.email ? session.email[0].toUpperCase() : 'U';
  }, [session.email]);

  useEffect(() => {
    const handleUnauthorized = () => handleLogout();
    window.addEventListener('api-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('api-unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (session.isAuthenticated && session.token) {
      const loadInitialData = async () => {
        setIsFetchingData(true);
        try {
          // Set token in ApiClient before first call
          ApiClient.setAuthToken(session.token || null);
          const result = await fetchConsumptionLogs(365);
          setData(result);
        } catch (e) {
          console.error("Data load failed", e);
        } finally {
          setIsFetchingData(false);
        }
      };
      loadInitialData();
    }
  }, [session.isAuthenticated, session.token]);

  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const sessionStr = JSON.stringify(session);
    if (session.keepLoggedIn) {
      localStorage.setItem(SESSION_KEY, sessionStr);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, sessionStr);
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    const applyTheme = () => {
      let activeDark = false;
      if (theme === 'dark') activeDark = true;
      else if (theme === 'light') activeDark = false;
      else activeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(activeDark);
      if (activeDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    applyTheme();
  }, [theme]);

  const handleLogin = useCallback(async (email: string, password: string, keepLoggedIn: boolean) => {
    try {
      const response = await authService.login({ email, password });
      
      // Update ApiClient token immediately to avoid race conditions with effects
      ApiClient.setAuthToken(response.token);

      setSession(prev => ({
        ...prev,
        isAuthenticated: true,
        email: email,
        token: response.token,
        keepLoggedIn: keepLoggedIn,
        hasAgreedToPolicy: prev.policyVersion === APP_POLICY_VERSION ? prev.hasAgreedToPolicy : false
      }));
    } catch (e) {
      alert("Login failed: " + (e as Error).message);
    }
  }, []);

  const handleAgree = useCallback(() => {
    setSession(prev => ({ ...prev, hasAgreedToPolicy: true, policyVersion: APP_POLICY_VERSION }));
  }, []);

  const handleLogout = useCallback(async () => {
    try { await authService.logout(); } catch (e) {}
    ApiClient.setAuthToken(null);
    setSession({ isAuthenticated: false, email: null, hasAgreedToPolicy: false, policyVersion: APP_POLICY_VERSION, keepLoggedIn: false, token: undefined });
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setViewMode(ViewMode.Dashboard);
  }, []);

  if (!session.isAuthenticated) return <Login onLogin={(email, keep) => {}} onRealLogin={handleLogin} isDarkMode={isDarkMode} t={t.login} />;
  if (!session.hasAgreedToPolicy) return <PolicyAgreement onAgree={handleAgree} onDisagree={handleLogout} t={t.policy} />;

  const unreadCount = notifications.filter(n => !n.read).length;

  const navMenuItems = [
    { id: ViewMode.Dashboard, label: t.nav.dashboard, icon: LayoutDashboard },
    { id: ViewMode.Analysis, label: t.nav.analysis, icon: List },
    { id: ViewMode.Historical, label: t.nav.historical, icon: History },
    { id: ViewMode.Economy, label: t.nav.economy, icon: Wallet },
    { id: ViewMode.PLD, label: t.nav.pld, icon: Globe },
    { id: ViewMode.Alerts, label: t.nav.alerts, icon: Bell },
    { id: ViewMode.News, label: t.nav.news, icon: Newspaper }
  ];

  const mobilePrimaryItems = navMenuItems.slice(0, 4);
  const mobileMoreItems = navMenuItems.slice(4);

  const activeMode = (viewMode as string) === ViewMode.Profile ? ViewMode.Settings : viewMode;

  const renderContent = () => {
    if (isFetchingData && data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
           <div className="w-12 h-12 border-4 border-yinmn/20 border-t-yinmn rounded-full animate-spin" />
           <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing with Backend...</p>
        </div>
      );
    }
    switch (viewMode) {
      case ViewMode.Dashboard: return <Dashboard data={data} isDarkMode={isDarkMode} t={t.dashboard} lang={language} />;
      case ViewMode.Analysis: return <AnalysisView data={data} t={t.analysis} lang={language} />;
      case ViewMode.Economy: return <EconomyView data={data} t={t.economy} lang={language} />;
      case ViewMode.Historical: return <HistoricalView data={data} t={t.historical} lang={language} />;
      case ViewMode.Alerts: return <AlertsView alerts={alerts} onAddAlert={(a) => setAlerts([...alerts, a])} onDeleteAlert={(id) => setAlerts(alerts.filter(a => a.id !== id))} t={t} lang={language} />;
      case ViewMode.News: return <NewsView t={t} />;
      case ViewMode.PLD: return <PLDView t={t} lang={language} />;
      case ViewMode.Settings: return <SettingsView theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} email={session.email} t={t.settings} onEditProfile={() => setViewMode(ViewMode.Profile)} />;
      case ViewMode.Profile: return <ProfileView email={session.email} t={t.profile} onBack={() => setViewMode(ViewMode.Settings)} />;
      default: return <Dashboard data={data} isDarkMode={isDarkMode} t={t.dashboard} lang={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black transition-colors duration-500 pb-safe selection:bg-yinmn selection:text-white">
      <nav className="glass sticky top-0 z-50 px-4 md:px-10 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode(ViewMode.Dashboard)} className="hover:opacity-80 active:scale-95 transition-all">
            <InfinityLogo className="w-32 md:w-44 h-auto" isDarkMode={isDarkMode} />
          </button>
        </div>

        <div className="hidden lg:flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-[22px] backdrop-blur-3xl shadow-inner border border-black/5 dark:border-white/5">
          {navMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setViewMode(item.id); setIsMoreMenuOpen(false); }}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative group ${activeMode === item.id ? 'bg-white dark:bg-white/15 text-yinmn dark:text-white shadow-md scale-100' : 'text-slate-500 hover:text-yinmn dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <item.icon className={`w-4 h-4 transition-all ${activeMode === item.id ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px] group-hover:scale-110'}`} />
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-11 h-11 rounded-full flex items-center justify-center text-yinmn dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative group"
          >
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-black animate-pulse" />}
          </button>
          
          <div className="h-6 w-px bg-black/10 dark:bg-white/10 mx-1 hidden sm:block" />

          <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5">
            <button onClick={() => setViewMode(ViewMode.Settings)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${activeMode === ViewMode.Settings ? 'bg-yinmn text-white shadow-sm' : 'text-yinmn dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10'}`}>
              <Settings className={`w-4 h-4 ${activeMode === ViewMode.Settings ? 'animate-spin-slow' : ''}`} />
            </button>
            <button onClick={() => setViewMode(ViewMode.Profile)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ml-1 ${activeMode === ViewMode.Profile ? 'ring-2 ring-yinmn ring-offset-2 dark:ring-offset-black' : 'hover:scale-105'}`}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-yinmn to-bondi flex items-center justify-center text-white font-black text-[10px] shadow-sm">{userInitial}</div>
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-6 pb-32 lg:pb-12 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
        {renderContent()}
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {isMoreMenuOpen && <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMoreMenuOpen(false)} />}
        {isMoreMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 px-4 pb-6 animate-in slide-in-from-bottom-10 duration-500 ease-out">
            <div className="bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/10">
              <div className="p-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Utilities & More</span>
                <button onClick={() => setIsMoreMenuOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {mobileMoreItems.map(item => (
                  <button key={item.id} onClick={() => { setViewMode(item.id); setIsMoreMenuOpen(false); }} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[24px] transition-all active:scale-95 ${viewMode === item.id ? 'bg-yinmn text-white' : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'}`}>
                    <item.icon className={`w-6 h-6 ${viewMode === item.id ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-t border-black/5 dark:border-white/10 px-4 pb-safe flex justify-around items-center h-20">
          {mobilePrimaryItems.map(item => {
            const isActive = activeMode === item.id;
            return (
              <button key={item.id} onClick={() => { setViewMode(item.id); setIsMoreMenuOpen(false); }} className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all duration-400 group ${isActive ? 'text-yinmn dark:text-bondi' : 'text-slate-400 dark:text-slate-600'}`}>
                <div className={`p-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-yinmn/10 dark:bg-bondi/10 scale-110' : 'group-active:scale-90'}`}>
                  <item.icon className={`w-[24px] h-[24px] transition-all ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter sm:tracking-widest leading-none ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
              </button>
            );
          })}
          <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all duration-400 group ${isMoreMenuOpen ? 'text-yinmn dark:text-bondi' : 'text-slate-400 dark:text-slate-600'}`}>
            <div className={`p-1.5 rounded-full transition-all duration-500 ${isMoreMenuOpen ? 'bg-yinmn/10 dark:bg-bondi/10 scale-110 rotate-180' : 'group-active:scale-90'}`}>
              <MoreHorizontal className={`w-[24px] h-[24px] transition-all ${isMoreMenuOpen ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-tighter sm:tracking-widest leading-none ${isMoreMenuOpen ? 'opacity-100' : 'opacity-60'}`}>More</span>
          </button>
        </div>
      </div>
      <style>{`@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin-slow { animation: spin-slow 8s linear infinite; }`}</style>
    </div>
  );
};

export default App;

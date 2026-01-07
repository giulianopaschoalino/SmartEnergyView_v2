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
import PLDView from './components/PLDView.tsx'; // Import new view
import SettingsView from './components/SettingsView.tsx';
import ProfileView from './components/ProfileView.tsx';
import InfinityLogo from './components/InfinityLogo.tsx';
import { generateMockData } from './services/dataService.ts';
import { translations } from './translations.ts';
import { 
  LayoutDashboard, 
  History, 
  Bell, 
  Wallet, 
  Settings, 
  Newspaper, 
  User, 
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Globe // Icon for PLD
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
      if (storedLocal) return JSON.parse(storedLocal);
      const storedSession = sessionStorage.getItem(SESSION_KEY);
      if (storedSession) return JSON.parse(storedSession);
    } catch (e) { console.error("Session parse error", e); }
    return {
      isAuthenticated: false,
      email: null,
      hasAgreedToPolicy: false,
      policyVersion: APP_POLICY_VERSION,
      keepLoggedIn: false
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
  const [data] = useState<EnergyRecord[]>(() => generateMockData(1095));
  
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
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (alerts.length === 0 || data.length === 0) return;

    const recentData = data[data.length - 1];
    const triggeredAlerts: AppNotification[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    alerts.forEach(alert => {
      if (!alert.enabled) return;
      const sourceMatch = alert.source === 'All' || recentData.source === alert.source;
      if (!sourceMatch) return;

      let triggered = false;
      const val = alert.type === 'usage' ? recentData.usageKWh : recentData.cost;
      
      if (alert.condition === 'greater' && val > alert.threshold) triggered = true;
      if (alert.condition === 'less' && val < alert.threshold) triggered = true;

      if (triggered) {
        const alreadyNotifiedToday = notifications.some(n => 
          n.title === t.alerts.notificationTitle && 
          n.timestamp.startsWith(todayStr)
        );
        
        if (!alreadyNotifiedToday) {
          const currency = language === 'pt' ? 'R$' : '$';
          const msg = alert.type === 'usage' 
            ? t.alerts.usageExceeded.replace('{val}', val.toFixed(2)) 
            : t.alerts.costExceeded.replace('{val}', `${currency}${val.toFixed(2)}`);

          triggeredAlerts.push({
            id: `alert-${Date.now()}-${alert.id}`,
            title: t.alerts.notificationTitle,
            message: msg,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'alert'
          });
        }
      }
    });

    if (triggeredAlerts.length > 0) {
      setNotifications(prev => [...triggeredAlerts, ...prev]);
    }
  }, [data, alerts, language, t.alerts, notifications]);

  useEffect(() => {
    const sessionStr = JSON.stringify(session);
    if (session.keepLoggedIn) {
      localStorage.setItem(SESSION_KEY, sessionStr);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, sessionStr);
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
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, language);
  }, [language]);

  const handleLogin = useCallback((email: string, keepLoggedIn: boolean) => {
    setSession(prev => ({
      ...prev,
      isAuthenticated: true,
      email: email,
      keepLoggedIn: keepLoggedIn,
      hasAgreedToPolicy: prev.policyVersion === APP_POLICY_VERSION ? prev.hasAgreedToPolicy : false
    }));
  }, []);

  const handleAgree = useCallback(() => {
    setSession(prev => ({ ...prev, hasAgreedToPolicy: true, policyVersion: APP_POLICY_VERSION }));
  }, []);

  const handleLogout = useCallback(() => {
    setSession({ isAuthenticated: false, email: null, hasAgreedToPolicy: false, policyVersion: APP_POLICY_VERSION, keepLoggedIn: false });
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  if (!session.isAuthenticated) return <Login onLogin={handleLogin} isDarkMode={isDarkMode} t={t.login} />;
  if (!session.hasAgreedToPolicy) return <PolicyAgreement onAgree={handleAgree} onDisagree={handleLogout} t={t.policy} />;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const renderContent = () => {
    switch (viewMode) {
      case ViewMode.Dashboard:
        return <Dashboard data={data} isDarkMode={isDarkMode} t={t.dashboard} lang={language} />;
      case ViewMode.Analysis:
        return <AnalysisView data={data} t={t.analysis} lang={language} />;
      case ViewMode.Economy:
        return <EconomyView data={data} t={t.economy} lang={language} />;
      case ViewMode.Historical:
        return <HistoricalView data={data} t={t.historical} lang={language} />;
      case ViewMode.Alerts:
        return <AlertsView alerts={alerts} onAddAlert={(a) => setAlerts([...alerts, a])} onDeleteAlert={(id) => setAlerts(alerts.filter(a => a.id !== id))} t={t} lang={language} />;
      case ViewMode.News:
        return <NewsView t={t} />;
      case ViewMode.PLD:
        return <PLDView t={t} lang={language} />;
      case ViewMode.Settings:
        return <SettingsView theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} email={session.email} t={t.settings} onEditProfile={() => setViewMode(ViewMode.Profile)} />;
      case ViewMode.Profile:
        return <ProfileView email={session.email} t={t.profile} onBack={() => setViewMode(ViewMode.Settings)} />;
      default:
        return <Dashboard data={data} isDarkMode={isDarkMode} t={t.dashboard} lang={language} />;
    }
  };

  const navMenuItems = [
    { id: ViewMode.Dashboard, label: t.nav.dashboard, icon: LayoutDashboard },
    { id: ViewMode.Historical, label: t.nav.historical, icon: History },
    { id: ViewMode.PLD, label: t.nav.pld, icon: Globe },
    { id: ViewMode.Economy, label: t.nav.economy, icon: Wallet },
    { id: ViewMode.Alerts, label: t.nav.alerts, icon: Bell },
    { id: ViewMode.News, label: t.nav.news, icon: Newspaper }
  ];

  const activeMode = viewMode === ViewMode.Profile ? ViewMode.Settings : viewMode;

  return (
    <div className="min-h-screen bg-floral dark:bg-black transition-colors duration-300">
      {/* Dynamic Sidebar/Nav for Desktop */}
      <nav className="glass sticky top-0 z-40 px-4 md:px-6 py-4 pt-safe flex items-center justify-between shadow-sm border-b border-[#375785]/10">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setViewMode(ViewMode.Dashboard)}>
          <InfinityLogo className="w-24 h-auto sm:w-32 md:w-40" isDarkMode={isDarkMode} />
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden lg:flex items-center bg-gray-200/40 dark:bg-night p-1 rounded-2xl border border-gray-300/20">
            {navMenuItems.map(mode => (
              <button 
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeMode === mode.id ? 'bg-yinmn text-white shadow-lg shadow-yinmn/30' : 'text-slate-500 hover:text-yinmn dark:text-slate-400 dark:hover:text-white'}`}
              >
                <mode.icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:border-l lg:border-gray-300 lg:dark:border-gray-700 lg:pl-4 relative">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-yinmn dark:text-white hover:shadow-md transition-all relative group"
                aria-label={t.notifications.title}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-night" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-72 sm:w-80 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-yinmn dark:text-white opacity-80">{t.notifications.title}</h4>
                    <div className="flex gap-3">
                      <button onClick={markAllRead} className="text-[10px] font-bold text-bondi uppercase tracking-tight hover:opacity-70 transition-opacity">{t.notifications.markRead}</button>
                      <button onClick={clearNotifications} className="text-[10px] font-bold text-red-500 uppercase tracking-tight hover:opacity-70 transition-opacity">{t.notifications.clear}</button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-16 px-6 text-center flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                          <Bell className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                          {t.notifications.empty}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 dark:divide-white/5">
                        {notifications.map(n => (
                          <div key={n.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!n.read ? 'bg-bondi/5' : ''}`}>
                            <div className="flex items-start gap-3">
                              {n.type === 'alert' ? <AlertTriangle className="w-4 h-4 text-red-500 mt-1" /> : <CheckCircle2 className="w-4 h-4 text-blue-500 mt-1" />}
                              <div className="flex-1">
                                <p className={`text-xs font-bold ${n.read ? 'text-slate-600 dark:text-slate-300' : 'text-night dark:text-white'}`}>{n.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Universal Settings Button */}
            <button 
              onClick={() => setViewMode(ViewMode.Settings)}
              className={`w-10 h-10 rounded-full glass flex items-center justify-center transition-all group ${viewMode === ViewMode.Settings ? 'bg-yinmn text-white shadow-lg' : 'text-yinmn dark:text-white hover:shadow-md'}`}
              aria-label={t.nav.settings}
            >
              <Settings className={`w-5 h-5 ${viewMode === ViewMode.Settings ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
            </button>

            <button 
              onClick={() => setViewMode(ViewMode.Profile)}
              className={`w-10 h-10 rounded-full bg-gradient-to-br from-yinmn to-bondi flex items-center justify-center text-white font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all border-2 ${viewMode === ViewMode.Profile ? 'border-white dark:border-night ring-2 ring-yinmn' : 'border-transparent'}`}
            >
              {userInitial}
            </button>
          </div>
        </div>
      </nav>

      {/* Main content with improved bottom padding for floating bar */}
      <main className="pb-40 lg:pb-16 pt-4 min-h-[calc(100vh-100px)]">
        {renderContent()}
      </main>

      {/* Improved Mobile Tab Bar based on Screen Edits */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe px-3 sm:px-4">
        <div className="bg-white/95 dark:bg-night/95 backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex justify-between items-center h-20 px-2 mb-4">
          {navMenuItems.map(item => {
            const isActive = activeMode === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => setViewMode(item.id)} 
                className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${isActive ? 'text-yinmn dark:text-bondi' : 'text-slate-400 dark:text-slate-600 hover:text-slate-500'}`}
                aria-label={item.label}
              >
                <div className={`p-2 rounded-2xl transition-colors ${isActive ? 'bg-yinmn/5' : ''}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter sm:tracking-widest text-center px-0.5 leading-none ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
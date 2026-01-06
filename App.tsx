
import React, { useState, useEffect } from 'react';
import { UserSession, EnergyRecord, ViewMode } from './types';
import Login from './components/Login';
import PolicyAgreement from './components/PolicyAgreement';
import Dashboard from './components/Dashboard';
import AnalysisView from './components/AnalysisView';
import { generateMockData } from './services/dataService';

const APP_POLICY_VERSION = "2023.10.1";

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession>(() => {
    const stored = localStorage.getItem('smartenergia_session');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      isAuthenticated: false,
      email: null,
      hasAgreedToPolicy: false,
      policyVersion: APP_POLICY_VERSION
    };
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('smartenergia_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Dashboard);
  const [data] = useState<EnergyRecord[]>(() => generateMockData(90));

  useEffect(() => {
    localStorage.setItem('smartenergia_session', JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('smartenergia_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smartenergia_theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogin = (email: string) => {
    setSession(prev => ({
      ...prev,
      isAuthenticated: true,
      email: email,
      hasAgreedToPolicy: prev.policyVersion === APP_POLICY_VERSION ? prev.hasAgreedToPolicy : false
    }));
  };

  const handleAgree = () => {
    setSession(prev => ({
      ...prev,
      hasAgreedToPolicy: true,
      policyVersion: APP_POLICY_VERSION
    }));
  };

  const handleDisagree = () => {
    setSession({
      isAuthenticated: false,
      email: null,
      hasAgreedToPolicy: false,
      policyVersion: APP_POLICY_VERSION
    });
    alert("You must agree to the policy to use Smart Energia dashboard.");
  };

  const handleLogout = () => {
    setSession({
      isAuthenticated: false,
      email: null,
      hasAgreedToPolicy: false,
      policyVersion: APP_POLICY_VERSION
    });
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (!session.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (!session.hasAgreedToPolicy) {
    return <PolicyAgreement onAgree={handleAgree} onDisagree={handleDisagree} />;
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#1C1C1E] transition-colors duration-300">
      {/* Navigation Shell */}
      <nav className="glass sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm border-b border-white/50 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white hidden sm:block">Smart Energia</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="hidden md:flex items-center bg-gray-200/50 dark:bg-gray-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode(ViewMode.Dashboard)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === ViewMode.Dashboard ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setViewMode(ViewMode.Analysis)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === ViewMode.Analysis ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Analysis
            </button>
            <button 
              onClick={() => setViewMode(ViewMode.Settings)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === ViewMode.Settings ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Settings
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 border-l border-gray-300 dark:border-gray-700 pl-4 sm:pl-6">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{session.email?.split('@')[0]}</p>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-widest mt-0.5">Premium Plan</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
              title="Logout"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pb-24 sm:pb-8">
        {viewMode === ViewMode.Dashboard ? (
          <Dashboard data={data} isDarkMode={isDarkMode} />
        ) : viewMode === ViewMode.Analysis ? (
          <AnalysisView data={data} />
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-3xl mx-auto flex items-center justify-center mb-4">
                 <svg className="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">View in Progress</h2>
              <p className="text-gray-600 dark:text-gray-400">The {viewMode} module is currently being optimized.</p>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/50 dark:border-white/10 px-6 py-3 flex justify-between items-center z-50">
        <button 
          onClick={() => setViewMode(ViewMode.Dashboard)}
          className={`flex flex-col items-center gap-1 ${viewMode === ViewMode.Dashboard ? 'text-blue-600' : 'text-gray-600 dark:text-gray-500'}`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>
        <button 
          onClick={() => setViewMode(ViewMode.Analysis)}
          className={`flex flex-col items-center gap-1 ${viewMode === ViewMode.Analysis ? 'text-blue-600' : 'text-gray-600 dark:text-gray-500'}`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/></svg>
          <span className="text-[10px] font-bold">Analysis</span>
        </button>
        <button 
          onClick={() => setViewMode(ViewMode.Settings)}
          className={`flex flex-col items-center gap-1 ${viewMode === ViewMode.Settings ? 'text-blue-600' : 'text-gray-600 dark:text-gray-500'}`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zM19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z"/></svg>
          <span className="text-[10px] font-bold">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default App;

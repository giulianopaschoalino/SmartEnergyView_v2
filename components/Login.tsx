
import React, { useState } from 'react';
import InfinityLogo from './InfinityLogo.tsx';
import { Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, keepLoggedIn: boolean) => void;
  onRealLogin: (email: string, pass: string, keepLoggedIn: boolean) => void;
  isDarkMode?: boolean;
  t: any;
}

type LoginMode = 'signin' | 'signup' | 'reset';

const Login: React.FC<LoginProps> = ({ onRealLogin, isDarkMode = false, t }) => {
  const [mode, setMode] = useState<LoginMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      if (email && password) {
        onRealLogin(email, password, keepLoggedIn);
      }
    } else if (mode === 'signup') {
      // Signup implementation
    } else if (mode === 'reset') {
      // Reset implementation
    }
  };

  const switchMode = (newMode: LoginMode) => {
    setResetSent(false);
    setMode(newMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const PasswordToggle = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-yinmn dark:hover:text-bondi hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all active:scale-90 focus:outline-none"
      aria-label={visible ? "Hide password" : "Show password"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <div className={`absolute transition-all duration-300 transform ${visible ? 'opacity-0 scale-75 rotate-45' : 'opacity-100 scale-100 rotate-0'}`}>
          <Eye size={18} strokeWidth={2.5} />
        </div>
        <div className={`absolute transition-all duration-300 transform ${visible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-45'}`}>
          <EyeOff size={18} strokeWidth={2.5} />
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-floral dark:bg-black px-4 transition-colors duration-300">
      <div className="w-full max-w-md glass rounded-4xl p-8 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <InfinityLogo className="w-32 h-auto" isDarkMode={isDarkMode} />
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm font-medium tracking-wide">
            {mode === 'signin' ? t.subtitle : mode === 'signup' ? t.signUpSubtitle : t.resetSubtitle}
          </p>
        </div>

        {resetSent ? (
          <div className="text-center p-8 space-y-4 animate-in slide-in-from-bottom-4">
            <div className="w-16 h-16 bg-cyan/10 rounded-full flex items-center justify-center mx-auto text-cyan">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-night dark:text-white font-bold">{t.resetSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-4">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1">{t.fullName}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white/40 dark:bg-night border border-slate-300 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yinmn transition-all text-night dark:text-white placeholder:text-slate-400"
                  placeholder={t.placeholderName}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1">{t.identity}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 bg-white/40 dark:bg-night border border-slate-300 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yinmn transition-all text-night dark:text-white placeholder:text-slate-400"
                placeholder={t.placeholderEmail}
                required
              />
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1">{t.credentials}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-5 pr-12 py-3.5 bg-white/40 dark:bg-night border border-slate-300 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yinmn transition-all text-night dark:text-white placeholder:text-slate-400"
                    placeholder={t.placeholderPassword}
                    required
                  />
                  <PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-4">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1">{t.confirmPassword}</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-5 pr-12 py-3.5 bg-white/40 dark:bg-night border border-slate-300 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yinmn transition-all text-night dark:text-white placeholder:text-slate-400"
                    placeholder={t.placeholderPassword}
                    required
                  />
                  <PasswordToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="keepLoggedIn"
                      checked={keepLoggedIn}
                      onChange={(e) => setKeepLoggedIn(e.target.checked)}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-400 dark:border-slate-600 bg-white/50 dark:bg-gray-800 transition-all checked:bg-yinmn checked:border-yinmn focus:outline-none"
                    />
                    <svg
                      className="pointer-events-none absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <label htmlFor="keepLoggedIn" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    {t.keepLoggedIn}
                  </label>
                </div>
                <button 
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-bondi hover:underline text-xs font-bold"
                >
                  {t.recovery}
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-yinmn text-white font-bold rounded-2xl hover:bg-[#2a4365] active:scale-[0.98] transition-all shadow-xl shadow-yinmn/20"
            >
              {mode === 'signin' ? t.signIn : mode === 'signup' ? t.createAccount : t.sendReset}
            </button>
          </form>
        )}

        <div className="mt-8 text-center space-y-3">
          {mode === 'signin' ? (
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {t.newHere}{' '}
              <button onClick={() => switchMode('signup')} className="text-bondi font-bold hover:underline ml-1">
                {t.createAccount}
              </button>
            </p>
          ) : (
            <button onClick={() => switchMode('signin')} className="text-bondi font-bold hover:underline text-xs">
              {t.alreadyHaveAccount} {t.signIn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

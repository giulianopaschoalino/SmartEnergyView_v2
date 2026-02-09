import React, { useState } from 'react';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

interface ProfileViewProps {
  name?: string;
  profilePhotoUrl?: string;
  email: string | null;
  t: any;
  tCommon: any;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ name, profilePhotoUrl, email, t, tCommon, onBack }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onBack();
    }, 400);
  };

  const renderLargeAvatar = () => {
    const sizeClass = "w-56 h-56";
    if (profilePhotoUrl && !imgError) {
      return (
        <div className={`${sizeClass} rounded-[56px] overflow-hidden bg-slate-100 dark:bg-white/10 border-4 border-white dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.2)] ring-1 ring-black/5 flex items-center justify-center`}>
          <img 
            src={profilePhotoUrl} 
            alt={name || "User Profile"} 
            onError={() => setImgError(true)}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }
    const initial = (name?.[0] || email?.[0] || 'U').toUpperCase();
    return (
      <div className={`${sizeClass} bg-gradient-to-br from-yinmn to-bondi rounded-[56px] flex items-center justify-center text-white text-8xl font-black shadow-[0_30px_60px_rgba(0,0,0,0.2)] ring-1 ring-black/5`}>
        {initial}
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 ${isClosing ? 'animate-out fade-out slide-out-to-bottom-4 duration-400' : 'animate-in fade-in slide-in-from-bottom-4 duration-500'}`}>
      <div className="flex items-center gap-6">
        <button 
          onClick={onBack}
          className="p-3 glass rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all text-yinmn dark:text-bondi outline-none"
          aria-label={t.cancel}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-night dark:text-white tracking-tight leading-tight">{t.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="relative group">
          {renderLargeAvatar()}
          <div className="absolute -bottom-4 -right-4 p-4 bg-white dark:bg-night rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 text-yinmn dark:text-bondi">
            <ShieldCheck size={28} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-[11px] font-black text-yinmn dark:text-slate-500 uppercase tracking-widest ml-1">{t.personalDetails}</h3>
        <div className="glass rounded-[32px] p-8 space-y-8 border border-black/5 dark:border-white/10 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.name}</label>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full">
                 <Lock size={10} className="text-slate-400" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tCommon.locked}</span>
              </div>
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={name || t.verifiedUser || ''} 
                readOnly
                className="w-full px-5 py-4 bg-black/5 dark:bg-black/30 border border-transparent rounded-2xl text-slate-500 dark:text-slate-400 font-bold cursor-not-allowed focus:ring-0 outline-none"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <Lock size={16} className="text-slate-300 dark:text-slate-600" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.email}</label>
            <div className="w-full px-5 py-4 bg-black/5 dark:bg-black/30 border border-transparent rounded-2xl text-slate-500 dark:text-slate-400 font-bold cursor-not-allowed">
              {email}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[11px] font-black text-yinmn dark:text-slate-500 uppercase tracking-widest ml-1">{t.membership}</h3>
        <div className="glass rounded-[32px] p-8 flex items-center justify-between bg-gradient-to-r from-yinmn/5 to-transparent border border-yinmn/10 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-yinmn text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">Premium</span>
              <p className="font-black text-night dark:text-white tracking-tight leading-tight">Smart Energia Insight</p>
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest leading-relaxed">{t.membershipDesc}</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-yinmn flex items-center justify-center text-yinmn shadow-inner">
             <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button 
          onClick={handleClose}
          className="flex-1 py-5 bg-yinmn text-white font-black text-xs uppercase tracking-[0.2em] rounded-[24px] hover:bg-[#2a4365] active:scale-[0.98] transition-all shadow-xl shadow-yinmn/30"
        >
          {t.save}
        </button>
        <button 
          onClick={onBack}
          className="flex-1 py-5 glass text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-[0.2em] rounded-[24px] hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all border border-black/5 dark:border-white/10"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
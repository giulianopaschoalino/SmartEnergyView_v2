
import React, { useState } from 'react';

interface ProfileViewProps {
  email: string | null;
  t: any;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ email, t, onBack }) => {
  const [name, setName] = useState('User');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-night transition-colors"
        >
          <svg className="w-6 h-6 text-[#254F7F] dark:text-bondi" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-3xl font-bold text-night dark:text-white tracking-tight">{t.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col items-center py-8">
        <div className="relative group">
          <div className="w-32 h-32 bg-gradient-to-br from-yinmn to-bondi rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl">
            {email?.[0]?.toUpperCase() || 'U'}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-night rounded-full shadow-lg border border-gray-100 dark:border-white/10 hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-yinmn dark:text-bondi" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-yinmn dark:text-gray-400 uppercase tracking-widest ml-1">{t.personalDetails}</h3>
        <div className="glass rounded-[30px] p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-night dark:text-white">{t.name}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3 bg-white/40 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yinmn transition-all text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-night dark:text-white">{t.email}</label>
            <div className="w-full px-5 py-3 bg-gray-100/50 dark:bg-black/40 border border-transparent rounded-2xl text-gray-500 cursor-not-allowed">
              {email}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-yinmn dark:text-gray-400 uppercase tracking-widest ml-1">{t.membership}</h3>
        <div className="glass rounded-[30px] p-8 flex items-center justify-between bg-gradient-to-r from-yinmn/10 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-yinmn text-white text-[10px] font-bold rounded uppercase tracking-tighter">Premium</span>
              <p className="font-bold text-night dark:text-white">Smart Energia Premium</p>
            </div>
            <p className="text-sm text-gray-500">{t.membershipDesc}</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-yinmn flex items-center justify-center text-yinmn">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </section>

      <div className="flex gap-4 pt-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-4 bg-yinmn text-white font-bold rounded-2xl hover:bg-[#2a4365] active:scale-[0.98] transition-all shadow-xl shadow-yinmn/20 flex items-center justify-center gap-2"
        >
          {isSaving ? (
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : t.save}
        </button>
        <button 
          onClick={onBack}
          className="flex-1 py-4 glass text-night dark:text-white font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 active:scale-[0.98] transition-all border border-gray-200 dark:border-white/10"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
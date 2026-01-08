import React from 'react';
import { Shield, Lock, Zap, ShieldCheck, Info, ChevronRight } from 'lucide-react';

interface PolicyAgreementProps {
  onAgree: () => void;
  onDisagree: () => void;
  t: any;
}

const PolicyAgreement: React.FC<PolicyAgreementProps> = ({ onAgree, onDisagree, t }) => {
  const icons = [
    <Zap className="w-5 h-5 text-gamboge" />,
    <Lock className="w-5 h-5 text-bondi" />,
    <Info className="w-5 h-5 text-cyan" />,
    <ShieldCheck className="w-5 h-5 text-yinmn" />
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="max-w-2xl w-full bg-white/90 dark:bg-night/90 backdrop-blur-3xl rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.4)] overflow-hidden border border-white/20 dark:border-white/5 animate-in zoom-in-95 slide-in-from-bottom-8 duration-700">
        <div className="p-8 sm:p-12 flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yinmn/10 dark:bg-yinmn/20 text-yinmn dark:text-bondi mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.lastUpdated}</span>
            </div>
            <h2 className="text-4xl font-black text-night dark:text-white tracking-tight leading-tight">
              {t.title}
            </h2>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-8 custom-scrollbar mb-8">
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
              {t.intro}
            </p>

            <div className="space-y-4">
              {[1, 2, 3, 4].map(num => (
                <div 
                  key={num} 
                  className="p-5 rounded-3xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex gap-5 group hover:border-yinmn/20 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white dark:bg-night shadow-sm flex items-center justify-center">
                    {icons[num - 1]}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-night dark:text-white uppercase tracking-wide">
                      {t[`point${num}Title`]}
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                      {t[`point${num}Desc`]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gradient-to-br from-yinmn to-bondi rounded-3xl text-white shadow-xl shadow-yinmn/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-20 h-20" />
              </div>
              <p className="text-xs font-bold leading-relaxed opacity-90 relative z-10">
                {t.agreeNote}
              </p>
            </div>
          </div>

          {/* Sticky Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-white/5 bg-white/50 dark:bg-night/50">
            <button
              onClick={onAgree}
              className="flex-1 py-5 bg-yinmn text-white font-black rounded-2xl hover:bg-[#2a4365] active:scale-[0.98] transition-all shadow-xl shadow-yinmn/30 flex items-center justify-center gap-2 group"
            >
              <span className="uppercase tracking-[0.15em] text-xs">{t.agree}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onDisagree}
              className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              <span className="uppercase tracking-[0.15em] text-xs">{t.disagree}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyAgreement;
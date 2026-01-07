import React from 'react';

interface PolicyAgreementProps {
  onAgree: () => void;
  onDisagree: () => void;
  t: any;
}

const PolicyAgreement: React.FC<PolicyAgreementProps> = ({ onAgree, onDisagree, t }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="max-w-xl w-full glass rounded-4xl shadow-2xl overflow-hidden border border-white/40 dark:border-white/10 animate-in zoom-in-95 slide-in-from-bottom-4">
        <div className="p-8 sm:p-10">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">{t.title}</h2>
          <div className="h-72 overflow-y-auto mb-10 pr-2 text-sm text-gray-600 dark:text-gray-300 space-y-6 leading-relaxed custom-scrollbar font-medium">
            <p className="font-black text-yinmn dark:text-bondi uppercase tracking-widest text-[10px]">{t.lastUpdated}</p>
            <p className="text-lg leading-snug text-gray-800 dark:text-gray-100 font-bold">{t.intro}</p>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(num => (
                <p key={num}>
                  <span className="font-black text-gray-900 dark:text-white">{t[`point${num}Title`]}</span> {t[`point${num}Desc`]}
                </p>
              ))}
            </div>
            <div className="p-4 bg-yinmn/5 dark:bg-white/5 rounded-2xl border border-yinmn/10">
              <p className="italic text-xs opacity-80">{t.agreeNote}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onAgree}
              className="flex-1 py-4 bg-yinmn text-white font-black rounded-2xl hover:bg-[#2a4365] active:scale-[0.98] transition-all shadow-xl shadow-yinmn/20 uppercase tracking-widest text-xs"
            >
              {t.agree}
            </button>
            <button
              onClick={onDisagree}
              className="flex-1 py-4 glass text-gray-700 dark:text-gray-300 font-black rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
            >
              {t.disagree}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyAgreement;
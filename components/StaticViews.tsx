
import React, { useState, useEffect } from 'react';
import { FileText, Info, HelpCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { fetchAboutUs, fetchFAQ, fetchSectorialInfo } from '../services/dataService.ts';

const SectorialInfo: React.FC<{t: any}> = ({ t }) => {
  const handleDownload = async () => {
    try {
      const result = await fetchSectorialInfo();
      if (result.data) window.open(result.data, '_blank');
    } catch (e) { alert(t.error); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 text-center animate-in fade-in slide-in-from-bottom-4">
      <div className="w-24 h-24 bg-bondi/10 rounded-[32px] flex items-center justify-center mx-auto mb-8">
        <FileText className="w-12 h-12 text-bondi" />
      </div>
      <div>
        <h2 className="text-4xl font-black text-night dark:text-white tracking-tight uppercase">{t.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto mt-4">{t.subtitle}</p>
      </div>
      <button 
        onClick={handleDownload}
        className="px-10 py-5 bg-yinmn text-white font-black rounded-3xl text-sm uppercase tracking-[0.2em] shadow-2xl shadow-yinmn/30 hover:scale-[1.02] active:scale-95 transition-all"
      >
        {t.downloadBtn}
      </button>
    </div>
  );
};

const AboutUs: React.FC<{t: any; tStatic: any}> = ({ t, tStatic }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutUs()
      .then(res => {
        const firstItem = Array.isArray(res) ? res[0] : res;
        const text = firstItem?.about || firstItem?.text || firstItem?.content || firstItem?.description || '';
        setContent(text);
      })
      .catch((e) => {
        console.error("Failed to load About Us", e);
        setContent('');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-in fade-in">
      <h2 className="text-3xl font-black text-night dark:text-white tracking-tight flex items-center gap-4">
        <div className="p-2 bg-bondi/10 rounded-2xl"><Info className="text-bondi" /></div> {t.about_us}
      </h2>
      <div className="glass p-8 md:p-12 rounded-[40px] shadow-sm relative overflow-hidden min-h-[300px] bg-white dark:bg-night">
        {loading ? (
          <div className="space-y-6">
            <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-full animate-pulse" />
            <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-5/6 animate-pulse" />
            <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-4/6 animate-pulse" />
            <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-full animate-pulse" />
            <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-3/4 animate-pulse" />
          </div>
        ) : content ? (
          <div className="leading-relaxed text-slate-700 dark:text-slate-300 font-medium text-lg prose dark:prose-invert max-w-none" 
               dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-slate-200 dark:text-slate-800" />
            <p className="text-slate-400 font-black uppercase tracking-widest italic">{tStatic.infoUnavailable}</p>
            <p className="text-xs text-slate-400">{tStatic.checkBackLater}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const FAQ: React.FC<{t: any; tStatic: any}> = ({ t, tStatic }) => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  useEffect(() => {
    fetchFAQ().then(res => setFaqs(Array.isArray(res) ? res : []));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-in fade-in">
      <h2 className="text-3xl font-black text-night dark:text-white tracking-tight flex items-center gap-4">
        <div className="p-2 bg-gamboge/10 rounded-2xl"><HelpCircle className="text-gamboge" /></div> {t.faq}
      </h2>
      <div className="space-y-4">
        {faqs.length > 0 ? faqs.map((faq, idx) => (
          <div key={idx} className="glass rounded-[28px] overflow-hidden border border-black/5 bg-white dark:bg-night">
            <button 
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <span className="font-bold text-night dark:text-white">{faq.question}</span>
              {openIdx === idx ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {openIdx === idx && (
              <div className="px-8 pb-8 text-slate-600 dark:text-slate-400 font-medium animate-in slide-in-from-top-2">
                {faq.answer}
              </div>
            )}
          </div>
        )) : (
          <div className="glass p-12 rounded-[28px] text-center text-slate-400 italic font-bold">
            {tStatic.noFaq}
          </div>
        )}
      </div>
    </div>
  );
};

export default { SectorialInfo, AboutUs, FAQ };

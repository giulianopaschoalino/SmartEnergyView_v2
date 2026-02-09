
import React, { useState, useEffect } from 'react';
import { StatusBadge } from './UIProvider.tsx';
import { ChevronRight } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  creator: string;
}

const MOCK_NEWS: NewsItem[] = [
  {
    title: "Brazil's Solar Capacity Reaches New Milestone in 2024",
    link: "#",
    pubDate: new Date().toISOString(),
    description: "The distributed generation sector has seen a 35% increase in installations since the beginning of the year, driven by lower equipment costs and new regulatory incentives.",
    creator: "Sector Analysis"
  },
  {
    title: "Green Hydrogen: The Next Frontier for Brazilian Industry",
    link: "#",
    pubDate: new Date(Date.now() - 86400000).toISOString(),
    description: "New projects in Ceará and Rio Grande do Norte are positioning Brazil as a global leader in green hydrogen production for European export.",
    creator: "Energy News"
  },
  {
    title: "Free Energy Market Migration for SMEs: What You Need to Know",
    link: "#",
    pubDate: new Date(Date.now() - 172800000).toISOString(),
    description: "As market opening progresses, small and medium enterprises are finding significant savings by moving away from traditional utility providers.",
    creator: "Financial Insight"
  },
  {
    title: "The Role of AI in Grid Stabilization",
    link: "#",
    pubDate: new Date(Date.now() - 259200000).toISOString(),
    description: "Predictive analytics and machine learning are becoming essential tools for managing the intermittent nature of renewable energy sources in national grids.",
    creator: "Tech Reports"
  },
  {
    title: "Wind Power: Offshore Projects Gain Momentum",
    link: "#",
    pubDate: new Date(Date.now() - 345600000).toISOString(),
    description: "Environmental licensing for massive offshore wind farms is speeding up as global investors look for long-term sustainable returns in the Brazilian coast.",
    creator: "Sustainability Weekly"
  }
];

interface NewsViewProps {
  t: any;
}

const NewsView: React.FC<NewsViewProps> = ({ t }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-500 pb-24">
      <header>
        <h2 className="text-3xl font-bold text-night dark:text-white tracking-tight uppercase">{t.news.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{t.news.subtitle}</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-[40px] p-8 space-y-6 animate-pulse bg-white/40 dark:bg-night/40">
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
              <div className="h-8 bg-slate-200 dark:bg-white/10 rounded w-full" />
              <div className="h-20 bg-slate-200 dark:bg-white/10 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_NEWS.map((item, index) => (
            <article 
              key={index}
              className="glass group rounded-[40px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full animate-in fade-in zoom-in-95 bg-white dark:bg-night"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <StatusBadge label={t.news.article} type="success" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                  {new Date(item.pubDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <h3 className="text-xl font-black text-yinmn dark:text-white mb-4 line-clamp-2 leading-tight uppercase tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-8 flex-grow line-clamp-3 leading-relaxed font-medium">
                {item.description}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-500 italic uppercase tracking-wider">
                  {t.news.by} {item.creator}
                </span>
                <button 
                  className="w-10 h-10 rounded-2xl bg-yinmn/5 text-yinmn flex items-center justify-center group-hover:bg-yinmn group-hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsView;

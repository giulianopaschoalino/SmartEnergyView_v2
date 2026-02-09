import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StatusBadge } from './UIProvider.tsx';
import { ChevronRight } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  creator: string;
}

interface NewsViewProps {
  t: any;
}

const NewsView: React.FC<NewsViewProps> = ({ t }) => {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [displayNews, setDisplayNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const parseRSS = useCallback((xmlText: string): NewsItem[] => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) return [];

      const items = xmlDoc.querySelectorAll("item");
      return Array.from(items).map(item => ({
        title: item.getElementsByTagName("title")[0]?.textContent || "Untitled",
        link: item.getElementsByTagName("link")[0]?.textContent || "#",
        pubDate: item.getElementsByTagName("pubDate")[0]?.textContent || new Date().toISOString(),
        description: (item.getElementsByTagName("description")[0]?.textContent || "").replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
        creator: item.getElementsByTagName("dc:creator")[0]?.textContent || item.getElementsByTagName("creator")[0]?.textContent || "Smart Energia"
      }));
    } catch (e) {
      return [];
    }
  }, []);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    const feedUrl = 'https://www.smartenergia.com.br/noticias/feed/';
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}&timestamp=${Date.now()}`,
      `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`
    ];

    let items: NewsItem[] = [];
    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl);
        if (!response.ok) continue;
        
        let xmlContent = '';
        if (proxyUrl.includes("allorigins")) {
          const json = await response.json();
          xmlContent = json.contents;
        } else {
          xmlContent = await response.text();
        }
        
        const parsed = parseRSS(xmlContent);
        if (parsed.length > 0) {
          items = parsed;
          break;
        }
      } catch (err) {
        console.warn(`Proxy ${proxyUrl} failed:`, err);
      }
    }

    setAllNews(items);
    setDisplayNews(items.slice(0, 9));
    setLoading(false);
  }, [parseRSS]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const loadMore = useCallback(() => {
    if (displayNews.length >= allNews.length || loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayNews(allNews.slice(0, displayNews.length + 9));
      setLoadingMore(false);
    }, 400);
  }, [displayNews.length, allNews, loadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && !loading && !loadingMore) loadMore(); },
      { threshold: 0.1, rootMargin: '200px' }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, loadMore]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-500 pb-24">
      <header>
        <h2 className="text-3xl font-bold text-night dark:text-white tracking-tight uppercase">{t.news.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{t.news.subtitle}</p>
      </header>

      {loading && displayNews.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-[40px] p-8 space-y-6 animate-pulse bg-white/40 dark:bg-night/40">
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
              <div className="h-8 bg-slate-200 dark:bg-white/10 rounded w-full" />
              <div className="h-20 bg-slate-200 dark:bg-white/10 rounded w-full" />
            </div>
          ))}
        </div>
      ) : displayNews.length === 0 ? (
        <div className="py-20 text-center glass rounded-[40px]">
          <p className="text-slate-400 font-bold italic">{t.common.noData}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayNews.map((item, index) => (
            <article 
              key={index}
              className="glass group rounded-[40px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full animate-in fade-in zoom-in-95 bg-white dark:bg-night"
              style={{ animationDelay: `${(index % 9) * 50}ms` }}
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
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener"
                  className="w-10 h-10 rounded-2xl bg-yinmn/5 text-yinmn flex items-center justify-center group-hover:bg-yinmn group-hover:text-white transition-all shadow-sm"
                  aria-label={`Read ${item.title}`}
                >
                  <ChevronRight size={18} />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      <div ref={observerTarget} className="py-12 flex justify-center">
        {loadingMore && <div className="w-8 h-8 border-4 border-yinmn/20 border-t-yinmn rounded-full animate-spin" />}
      </div>
    </div>
  );
};

export default NewsView;
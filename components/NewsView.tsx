import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';

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
  const [error, setError] = useState<string | null>(null);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const MOCK_NEWS = useMemo(() => [
    { title: "Free Energy Market Expansion for Small Businesses", link: "#", pubDate: new Date().toISOString(), description: "New regulations now allow smaller companies to choose their energy suppliers for better optimization.", creator: "Editorial Team" },
    { title: "Solar Technology Breakthroughs in 2024", link: "#", pubDate: new Date(Date.now() - 86400000).toISOString(), description: "Photovoltaic cells reach record efficiency levels in new testing environments.", creator: "Specialist" },
    { title: "Batteries Role in Network Storage", link: "#", pubDate: new Date(Date.now() - 172800000).toISOString(), description: "How new battery systems are stabilizing national grids.", creator: "Smart Energia" },
    { title: "White Tariff: Is it Worth It?", link: "#", pubDate: new Date(Date.now() - 259200000).toISOString(), description: "Detailed analysis on potential savings for residential consumers.", creator: "Financial Management" }
  ], []);

  const parseRSS = (xmlText: string): NewsItem[] => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const parserError = xmlDoc.getElementsByTagName("parsererror");
      if (parserError.length > 0) throw new Error("XML Parsing failed");

      const items = xmlDoc.querySelectorAll("item");
      return Array.from(items).map(item => {
        const title = item.getElementsByTagName("title")[0]?.textContent || "---";
        const link = item.getElementsByTagName("link")[0]?.textContent || "#";
        const pubDate = item.getElementsByTagName("pubDate")[0]?.textContent || new Date().toISOString();
        const rawDescription = item.getElementsByTagName("description")[0]?.textContent || "";
        const description = rawDescription.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
        
        const creator = (
          item.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", "creator")[0]?.textContent || 
          item.getElementsByTagName("dc:creator")[0]?.textContent || 
          item.getElementsByTagName("creator")[0]?.textContent || 
          "Smart Energia"
        );

        return { title, link, pubDate, description, creator };
      });
    } catch (e) {
      console.error("XML Parsing Error", e);
      return [];
    }
  };

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    const feedUrl = 'https://www.smartenergia.com.br/noticias/feed/';
    const proxies = [
      `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}&timestamp=${Date.now()}`
    ];

    let items: NewsItem[] = [];
    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl, { cache: 'no-store' });
        if (!response.ok) continue;

        let xmlContent = "";
        if (proxyUrl.includes("allorigins")) {
          const data = await response.json();
          xmlContent = data.contents;
        } else {
          xmlContent = await response.text();
        }

        if (xmlContent) {
          const parsed = parseRSS(xmlContent);
          if (parsed.length > 0) {
            items = parsed;
            break;
          }
        }
      } catch (err) {
        console.warn(`Proxy failed: ${proxyUrl}`);
      }
    }

    if (items.length > 0) {
      setAllNews(items);
      setDisplayNews(items.slice(0, 9));
    } else {
      setAllNews(MOCK_NEWS);
      setDisplayNews(MOCK_NEWS.slice(0, 9));
    }
    setLoading(false);
  }, [MOCK_NEWS]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const loadMore = useCallback(() => {
    if (displayNews.length >= allNews.length || loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      const nextBatchEnd = displayNews.length + 9;
      setDisplayNews(allNews.slice(0, nextBatchEnd));
      setLoadingMore(false);
    }, 600);
  }, [displayNews.length, allNews, loadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && displayNews.length < allNews.length) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, displayNews.length, allNews.length, loadMore]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-night dark:text-white tracking-tight">{t.news.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t.news.subtitle}</p>
        </div>
      </div>

      {loading && displayNews.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-4xl p-8 space-y-6 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-night rounded w-1/3"></div>
              <div className="h-8 bg-slate-200 dark:bg-night rounded w-full"></div>
              <div className="h-16 bg-slate-200 dark:bg-night rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayNews.map((item, index) => (
              <a 
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group rounded-4xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full animate-in fade-in zoom-in-95"
                style={{ animationDelay: `${(index % 9) * 50}ms` }}
                aria-label={item.title}
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest bg-cyan px-2.5 py-1.5 rounded-xl shadow-lg shadow-cyan/20">
                    {t.news.article}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                    {new Date(item.pubDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-yinmn dark:text-white mb-4 line-clamp-2 leading-tight transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-8 flex-grow line-clamp-3 leading-relaxed font-medium">
                  {item.description}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/10">
                  <span className="text-[11px] font-bold text-slate-500 italic">
                    {t.news.by} {item.creator}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-yinmn/10 text-yinmn flex items-center justify-center group-hover:bg-yinmn group-hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {displayNews.length < allNews.length && (
            <div ref={observerTarget} className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-yinmn/10 border-t-yinmn rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                {loadingMore ? t.news.processing : t.news.scrollForMore}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsView;
import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Standard Section Card with Apple-inspired glassmorphism
 * Enhanced with native refresh support
 */
export const SectionCard: React.FC<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}> = ({ title, subtitle, children, className = "", height = "auto", onRefresh, isRefreshing }) => (
  <section 
    className={`glass p-6 md:p-8 rounded-[40px] shadow-sm border border-black/5 dark:border-white/10 bg-white dark:bg-night flex flex-col transition-all hover:shadow-xl group overflow-hidden ${className}`}
    style={{ height }}
  >
    <div className="flex items-start justify-between mb-6 flex-shrink-0">
      <div className="flex-1 min-w-0">
        {title && <h3 className="text-sm font-black text-night dark:text-white uppercase tracking-[0.2em] group-hover:text-bondi transition-colors">{title}</h3>}
        {subtitle && <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider line-clamp-1">{subtitle}</p>}
      </div>
      {onRefresh && (
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 text-slate-400 hover:text-yinmn dark:hover:text-bondi transition-all active:scale-90 disabled:opacity-50"
          aria-label={`Refresh ${title}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
    <div className="flex-1 w-full relative">
      {children}
    </div>
  </section>
);

/**
 * Performance-focused Avatar component with robust fallback.
 * size increased and object-contain used to preserve aspect ratio.
 */
export const Avatar: React.FC<{
  src?: string;
  name?: string;
  size?: string;
  className?: string;
}> = ({ src, name, size = "w-12 h-12", className = "" }) => {
  const [error, setError] = React.useState(false);
  
  if (src && !error) {
    return (
      <div className={`${size} rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center justify-center ${className}`}>
        <img 
          src={src} 
          alt={name || "Avatar"} 
          onError={() => setError(true)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  const initial = (name?.[0] || 'U').toUpperCase();
  return (
    <div className={`${size} rounded-2xl bg-gradient-to-br from-yinmn to-bondi flex items-center justify-center text-white font-black text-sm shadow-md transition-transform hover:scale-105 active:scale-95 ${className}`}>
      {initial}
    </div>
  );
};

/**
 * Standard badge for status and source labels
 */
export const StatusBadge: React.FC<{
  label: string;
  type?: 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}> = ({ label, type = 'info', className = "" }) => {
  const styles = {
    primary: "bg-yinmn/10 text-yinmn dark:bg-yinmn/30 dark:text-bondi",
    success: "bg-cyan/10 text-cyan dark:bg-cyan/30 dark:text-cyan",
    warning: "bg-gamboge/10 text-[#854D0E] dark:bg-gamboge/20 dark:text-earth",
    info: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center whitespace-nowrap ${styles[type]} ${className}`}>
      {label}
    </span>
  );
};
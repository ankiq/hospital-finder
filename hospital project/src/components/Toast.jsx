import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* ─── FLOATING TOAST NOTIFICATION CONTAINER ─── */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] flex flex-col items-center gap-2.5 pointer-events-none max-w-md w-full px-4">
        {toasts.map(toast => {
          let bgStyle = 'bg-slate-900/95 border-slate-700 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]';
          let icon = 'ℹ️';
          let borderGlow = 'border-blue-500/40';

          if (toast.type === 'success') {
            icon = '🎉';
            borderGlow = 'border-emerald-500/50 shadow-[0_10px_30px_rgba(16,185,129,0.3)]';
          } else if (toast.type === 'error' || toast.type === 'danger') {
            icon = '❌';
            borderGlow = 'border-rose-500/50 shadow-[0_10px_30px_rgba(244,63,94,0.3)]';
          } else if (toast.type === 'warning') {
            icon = '⚠️';
            borderGlow = 'border-amber-500/50 shadow-[0_10px_30px_rgba(245,158,11,0.3)]';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border backdrop-blur-2xl text-xs font-extrabold tracking-wide transition-all duration-300 animate-in fade-in slide-in-from-top-5 duration-300 w-full ${bgStyle} ${borderGlow}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base shrink-0">{icon}</span>
                <span className="leading-snug text-slate-100">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white font-black text-sm px-1.5 py-0.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback object if used outside Provider
    return {
      showToast: (msg) => console.log("[Toast]", msg)
    };
  }
  return context;
}

import React from 'react';

function ErrorPage({ onGoHome }) {
  return (
    <div className="w-full h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-md">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(225,29,72,0.2)]">
          ⚠️
        </div>

        <h1 className="text-6xl font-black tracking-tighter text-white mb-2">404</h1>
        <h2 className="text-xl font-black uppercase tracking-widest text-rose-400 mb-4">Page Not Found</h2>
        
        <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">
          The page you are trying to access does not exist or hasn't been initialized in the health network grid.
        </p>

        <button 
          onClick={onGoHome}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-transform active:scale-95 cursor-pointer"
        >
          Return to Safe Zone (Home)
        </button>
      </div>
    </div>
  );
}

export default ErrorPage;
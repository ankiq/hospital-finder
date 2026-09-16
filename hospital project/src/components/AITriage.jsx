import React, { useState } from 'react';

function AITriage({ onSubmitPrompt }) {
  const [prompt, setPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setAnalyzing(true);
    
    // Simulate AI clinical routing weights analysis delay
    setTimeout(() => {
      setAnalyzing(false);
      onSubmitPrompt(prompt.trim());
    }, 1500);
  };

  return (
    <div id="ai-triage-console" className="w-full bg-[#030712] py-20 px-4 md:px-8 border-t border-white/[0.04] flex flex-col items-center">
      <div className="w-full max-w-4xl bg-gradient-to-br from-[#0b1536]/40 to-slate-950 p-8 md:p-12 rounded-3xl border border-blue-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        
        {/* Glow Decorator */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black tracking-widest uppercase mb-4 animate-pulse">
            🚨 Instant AI Triage Node
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            Describe the Medical Emergency
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Type natural language symptoms. Our platform parses trauma severity instantly to calculate routing rules via Dijkstra's matrix.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={analyzing}
            placeholder="Example: My friend just collapsed, has a heavy chest pressure and is sweating heavily..."
            className="w-full h-32 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-white font-medium placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors text-base resize-none shadow-inner"
          />

          <button
            type="submit"
            disabled={analyzing || !prompt.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black py-4 px-6 rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></span>
                Analyzing Trauma Priority Matrix...
              </span>
            ) : (
              <>Analyze Symptoms & Plot Route Nodes ➔</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AITriage;
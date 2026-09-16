import React from 'react';

function AITriageHistoryPage({ onBack }) {
  const history = [
    { id: "TR-551", date: "21 Oct 2026", time: "11:45 PM", symptom: "Severe chest pain radiating to left arm", severity: "CRITICAL", recommended: "Trauma Surgeon" },
    { id: "TR-420", date: "15 Sep 2026", time: "09:10 AM", symptom: "Persistent migraine for 3 days with nausea", severity: "MODERATE", recommended: "Neurologist" },
    { id: "TR-301", date: "02 Aug 2026", time: "04:30 PM", symptom: "Mild fever and sore throat", severity: "LOW", recommended: "General Physician" }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white pb-20">
      {/* ─── HEADER ─── */}
      <div className="w-full bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 hover:text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer">
          ← Back to Vault
        </button>
        <h1 className="text-lg font-black tracking-widest uppercase text-blue-400">Triage History</h1>
        <div className="w-24"></div> {/* Spacer */}
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Past AI Symptom Assessments</p>
        
        <div className="space-y-4">
          {history.map((log) => (
            <div key={log.id} className="bg-[#070f2e] border border-white/5 rounded-3xl p-6 shadow-lg hover:border-white/10 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                  <span className="bg-[#030712] px-2 py-1 rounded font-mono border border-white/5">{log.id}</span>
                  <span>{log.date} • {log.time}</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  log.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(225,29,72,0.2)]' : 
                  log.severity === 'MODERATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  Risk: {log.severity}
                </span>
              </div>
              
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Reported Symptoms</p>
                <p className="text-base font-bold text-slate-200">"{log.symptom}"</p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">AI Recommendation</p>
                   <p className="text-sm font-bold text-blue-400">{log.recommended}</p>
                </div>
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-all cursor-pointer">
                  View Full Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AITriageHistoryPage;
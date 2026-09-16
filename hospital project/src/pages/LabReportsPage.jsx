import React from 'react';

function LabReportsPage({ onBack }) {
  const reports = [
    { id: "LR-101", title: "Complete Blood Count (CBC)", date: "15 Oct 2026", lab: "Apex Diagnostics", status: "Normal", file: "PDF" },
    { id: "LR-102", title: "Lipid Profile", date: "02 Sep 2026", lab: "City Health Labs", status: "Review Needed", file: "PDF" },
    { id: "LR-103", title: "HbA1c (Blood Sugar)", date: "10 Jan 2026", lab: "Apex Diagnostics", status: "Normal", file: "PDF" }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white pb-20">
      {/* ─── HEADER ─── */}
      <div className="w-full bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 hover:text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer">
          ← Back to Vault
        </button>
        <h1 className="text-lg font-black tracking-widest uppercase text-blue-400">Lab Reports</h1>
        <div className="w-24"></div> {/* Spacer */}
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Synced Diagnostic Records</p>
        
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-[#070f2e] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg hover:border-white/10 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-500/10 flex items-center justify-center text-2xl border border-blue-500/20">
                  📄
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-100">{report.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-400">
                    <span>{report.date}</span>
                    <span>•</span>
                    <span>{report.lab}</span>
                  </div>
                  <div className="mt-3 inline-block">
                     <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                       report.status === 'Normal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                     }`}>
                       {report.status}
                     </span>
                  </div>
                </div>
              </div>
              
              <button className="w-full md:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-black text-xs uppercase px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                <span>⬇️</span> Download {report.file}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LabReportsPage;
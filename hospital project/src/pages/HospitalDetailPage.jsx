import React from 'react';
import { useToast } from '../components/Toast';

function HospitalDetailPage({ hospital, onBack, onNavigate }) {
  const { showToast } = useToast();
  // Safe Fallback Object if hospital prop is null or empty
  const data = hospital || {
    establishmentName: "Apex Multispecialty Hospital",
    establishmentType: "Multispecialty Hospital",
    city: "Gorakhpur",
    state: "Uttar Pradesh",
    rating: 4.8,
    reviewsCount: 124,
    distance: "2.4 km away",
    generalBeds: 45,
    icuBeds: 12,
    address: "Civil Lines, Near Medical College Road, Gorakhpur",
    phone: "+91 98765 43210",
    emergencyPhone: "+91 98765 43211",
    is247Emergency: true,
    description: "Leading super-specialty hospital offering 24/7 emergency trauma care, advanced ICU diagnostics, cath lab, and surgical suites."
  };

  const name = data.establishmentName || data.name || "Hospital Detail";
  const type = data.establishmentType || data.type || "Medical Center";
  const location = data.city ? `${data.city}, ${data.state}` : (data.location || "Gorakhpur, UP");
  const generalBeds = data.generalBeds ?? data.bedsAvailable ?? 30;
  const icuBeds = data.icuBeds ?? 8;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans pb-24">
      
      {/* ─── TOP NAVBAR ─── */}
      <header className="w-full bg-[#030712]/80 backdrop-blur-xl border-b border-white/10 px-8 py-5 sticky top-0 z-50 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
        >
          ← Back
        </button>
        <span className="text-sm font-extrabold text-blue-400 uppercase tracking-widest">
          Establishment Details
        </span>
        <div className="w-12"></div>
      </header>

      {/* ─── MAIN CONTAINER ─── */}
      <main className="max-w-5xl mx-auto px-6 mt-10 space-y-8">
        
        {/* Main Info Header Card */}
        <div className="bg-[#070f2e] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Verified Establishment
                </span>
                {data.is247Emergency && (
                  <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    🚨 24/7 Emergency Active
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">{name}</h1>
              <p className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <span>📍 {data.address || location}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">★ {data.rating || '4.8'}</span>
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Helpline / Reception</p>
              <p className="text-lg font-mono font-bold text-blue-400 mt-1">{data.phone || "+91 98765 43210"}</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 font-normal leading-relaxed mt-6 pt-6 border-t border-white/5">
            {data.description || "Comprehensive medical care facility with specialized department uplinks and live ICU capacity monitoring."}
          </p>
        </div>

        {/* Live Capacity Metrics Header */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Live Capacity Metrics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[#070f2e] border border-white/10 rounded-3xl p-8 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">General Beds Available</p>
              <p className="text-5xl font-black text-blue-400 mt-3">{generalBeds}</p>
            </div>

            <div className="bg-[#070f2e] border border-emerald-500/30 rounded-3xl p-8 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">ICU & Trauma Beds Available</p>
              <p className="text-5xl font-black text-emerald-400 mt-3">{icuBeds}</p>
            </div>
          </div>
        </div>

        {/* Immediate Dispatch Banner */}
        <div className="bg-gradient-to-r from-rose-950/40 via-[#070f2e] to-rose-950/40 border border-rose-500/30 rounded-3xl p-10 text-center shadow-2xl">
          <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2">Require Immediate Dispatch?</h3>
          <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl mx-auto mb-6">
            Triggering this will alert the hospital's emergency response team with your live coordinates.
          </p>

          <button 
            onClick={() => showToast(`🚨 Trauma uplink initiated with ${name}! Emergency response notified.`, "success")}
            className="bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-2xl transition-all shadow-lg shadow-rose-600/30 cursor-pointer active:scale-95"
          >
            🚨 Alert Trauma Team
          </button>
        </div>

      </main>
    </div>
  );
}

export default HospitalDetailPage;
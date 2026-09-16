import React from 'react';
import Hero from '../components/Hero';
import Specializations from '../components/Specializations';
import TopHospitals from '../components/TopHospitals';

function HomePage({ BASE_URL, onNavigate, onOpenAuth, onSelectDoctor, currentUser, onLogout }) {
  return (
    <div className="w-full min-h-screen bg-slate-950 pb-28 relative">
      <Hero 
        onSearchSubmit={(val) => {
          if (val === "OPEN_TRIAGE_CONSOLE") onNavigate('ai-triage');
        }}
        onOpenTriage={() => onNavigate('ai-triage')}
        onOpenAuth={onOpenAuth}
        onDirectSpecialistSelect={() => onNavigate('doctor-search')}
        onNavigate={onNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Quick Actions Dashboard */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 mb-20">
        <div className="flex items-center gap-4 mb-6 px-1">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400 whitespace-nowrap flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            Quick Medical Access
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <button 
            onClick={() => onNavigate('doctor-search')} 
            className="text-left glass-panel-interactive p-6 rounded-3xl shadow-2xl transition-all group cursor-pointer flex flex-col justify-between h-44 border border-white/10 hover:border-blue-500/50"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              👨‍⚕️
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight mb-1">Find Doctors</h3>
              <p className="text-xs md:text-sm font-semibold text-slate-400 leading-snug">Verified specialists near you</p>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('radar')} 
            className="text-left glass-panel-interactive p-6 rounded-3xl shadow-2xl transition-all group cursor-pointer flex flex-col justify-between h-44 border border-rose-500/20 hover:border-rose-500/60 bg-rose-950/20"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              🚑
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight mb-1">Emergency Radar</h3>
                <span className="text-[10px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded uppercase font-mono">LIVE</span>
              </div>
              <p className="text-xs md:text-sm font-semibold text-rose-200/80 leading-snug">Trauma centers & ICU beds</p>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('ai-triage')} 
            className="text-left glass-panel-interactive p-6 rounded-3xl shadow-2xl transition-all group cursor-pointer flex flex-col justify-between h-44 border border-indigo-500/20 hover:border-indigo-500/60 bg-indigo-950/20"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🤖
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight mb-1">AI Triage</h3>
              <p className="text-xs md:text-sm font-semibold text-slate-400 leading-snug">Describe symptoms, get routed</p>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('patient-dashboard')} 
            className="text-left glass-panel-interactive p-6 rounded-3xl shadow-2xl transition-all group cursor-pointer flex flex-col justify-between h-44 border border-white/10 hover:border-emerald-500/50"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📁
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight mb-1">Health Vault</h3>
              <p className="text-xs md:text-sm font-semibold text-slate-400 leading-snug">Records & lab reports</p>
            </div>
          </button>
        </div>
      </div>

      <Specializations 
        onCardClick={(specName) => onNavigate('doctor-search', null, null, specName)} 
        onViewAll={() => onNavigate('doctor-search')} 
      />
      <TopHospitals 
        BASE_URL={BASE_URL} 
        onHospitalSelect={() => onNavigate('hospital-detail')} 
        onViewAll={() => onNavigate('hospital-list')} 
      />

      {/* Floating Global SOS Emergency Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-xl bg-slate-900/90 border border-rose-500/40 p-3 rounded-full shadow-[0_0_35px_rgba(244,63,94,0.3)] backdrop-blur-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 pl-3">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span>Emergency SOS Hotline</span>
              <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1 rounded font-mono">24x7</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium hidden sm:block">Need instant ambulance dispatch?</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a 
            href="tel:108"
            className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-4 py-2 rounded-full transition-transform active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <span>📞</span> Call 108
          </a>
          <button 
            onClick={() => onNavigate('radar')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-4 py-2 rounded-full transition-transform active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>🚨</span> Nearby ER
          </button>
        </div>
      </div>

    </div>
  );
}

export default HomePage;
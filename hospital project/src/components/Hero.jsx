import React, { useState, useEffect, useRef } from 'react';
import { useToast } from './Toast';

function Hero({ onNavigate, currentUser, onLogout }) {
  const words = ["Trusted Doctors.", "Lab Tests.", "Consult Online.", "Trauma Channels."];
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const [emergencyDropdown, setEmergencyDropdown] = useState(false);
  const [providerDropdown, setProviderDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const emergencyRef = useRef(null);
  const providerRef = useRef(null);
  const profileRef = useRef(null);

  const isProvider = currentUser?.role === 'provider' || localStorage.getItem('user_role') === 'provider';

  const specialties = [
    { label: '🦴 Orthopedic Care', value: 'Orthopedic' },
    { label: '🩺 Cardiology Setup', value: 'Cardiologist' },
    { label: '🧠 Neurosurgery Ward', value: 'Neurologist' },
    { label: '💥 Trauma Emergency', value: 'Trauma Surgeon' }
  ];

  let profileData = {};
  try {
    profileData = JSON.parse(localStorage.getItem('user_profile_data') || '{}');
  } catch (e) {}

  const storedName = localStorage.getItem('user_name');
  const providerHospitalName = currentUser?.hospitalName || currentUser?.establishmentName || localStorage.getItem('provider_hospital_name');

  const userName = isProvider
    ? (providerHospitalName || (currentUser?.name && currentUser?.name !== "User" ? currentUser?.name : null) || "Hospital Provider")
    : (currentUser?.fullName || (currentUser?.name && currentUser?.name !== "User" ? currentUser?.name : null) || (storedName && storedName !== "User" ? storedName : null) || profileData.fullName || "Patient");

  const userAvatar = isProvider
    ? (currentUser?.avatarUrl || profileData.avatarUrl || "")
    : (currentUser?.avatarUrl || localStorage.getItem('user_avatar') || profileData.avatarUrl || "");

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const { showToast } = useToast();

  const handleEmergencyAction = (actionCallback) => {
    setEmergencyDropdown(false);
    if (isProvider) {
      showToast("⚠️ Emergency triage features are for patients only.", "warning");
      return;
    }
    if (!currentUser) {
      showToast("🔒 Please log in to access Emergency AI Triage & Specialist Uplinks.", "info");
      onNavigate('login');
      return;
    }
    if (actionCallback) actionCallback();
  };

  useEffect(() => {
    const handleType = () => {
      const fullWord = words[currentWordIdx];
      if (!isDeleting) {
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        setTypingSpeed(100);
      } else {
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        setTypingSpeed(50);
      }
      if (!isDeleting && currentText === fullWord) {
        setTypingSpeed(2000);
        setIsDeleting(true);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentWordIdx((prev) => (prev + 1) % words.length);
        setTypingSpeed(300);
      }
    };
    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIdx, typingSpeed]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emergencyRef.current && !emergencyRef.current.contains(event.target)) setEmergencyDropdown(false);
      if (providerRef.current && !providerRef.current.contains(event.target)) setProviderDropdown(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full min-h-[85vh] py-32 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#030712] via-[#0b1536] to-[#02040a] text-white shrink-0">
      
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 w-full px-6 md:px-12 py-4 flex items-center justify-between z-50 bg-[#030712]/60 backdrop-blur-2xl border-b border-white/[0.04] shadow-sm select-none">
        
        <div className="flex items-center gap-10">
          {/* Logo */}
          <div onClick={() => onNavigate('home')} className="flex items-center gap-2 cursor-pointer group shrink-0">
            <svg className="w-7 h-7 text-blue-400 transform group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M2 12h4m12 0h4" />
              <circle cx="12" cy="12" r="3" fill="#3b82f6" />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-white flex items-center">
              nexus<span className="text-amber-500 font-bold text-3xl leading-none ml-0.5">.</span>
            </span>
          </div>

          {/* Clean Title Case Nav Links */}
          <div className="hidden lg:flex items-center gap-7 text-base font-semibold text-slate-300">
            <span onClick={() => onNavigate('home')} className="text-white cursor-pointer hover:text-blue-400 transition-colors">Home</span>
            <span onClick={() => onNavigate('hospital-list')} className="hover:text-blue-400 cursor-pointer transition-colors">Hospitals</span>
            
            {!isProvider && (
              <div className="relative inline-block text-left" ref={emergencyRef}>
                <button 
                  onClick={() => {
                    if (!currentUser) {
                      showToast("🔒 Please log in to access Emergency features.", "info");
                      onNavigate('login');
                    } else {
                      setEmergencyDropdown(!emergencyDropdown);
                    }
                  }}
                  className="text-rose-400 font-semibold cursor-pointer flex items-center gap-1.5 hover:text-rose-300 transition-colors bg-transparent border-none text-base"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Emergency ▾
                </button>

                {emergencyDropdown && (
                  <div className="absolute left-0 mt-3 w-64 rounded-2xl bg-[#070f2e] text-slate-100 shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl animate-in fade-in duration-150 p-1.5">
                    <button
                      type="button"
                      onClick={() => handleEmergencyAction(() => onNavigate('ai-triage'))}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-blue-400 hover:bg-white/5 rounded-xl border-b border-white/5 flex items-center gap-2 cursor-pointer"
                    >
                      🧠 Run AI Triage Console
                    </button>
                    {specialties.map((spec) => (
                      <button
                        key={spec.value}
                        type="button"
                        onClick={() => handleEmergencyAction(() => {
                          onNavigate('doctor-search');
                        })}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{spec.label}</span>
                        <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded font-mono text-rose-400">Uplink</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-4 shrink-0">
          
          <div className="relative inline-block text-left" ref={providerRef}>
            <button 
              type="button"
              onClick={() => setProviderDropdown(!providerDropdown)}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border border-blue-500/20 bg-blue-950/20 text-blue-400 hover:bg-blue-950/40 transition-all cursor-pointer"
            >
              <span>🏢</span>
              For Providers ▾
            </button>

            {providerDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#070f2e] text-slate-100 shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl p-2 animate-in fade-in duration-150">
                {!isProvider && (
                  <button
                    type="button"
                    onClick={() => { setProviderDropdown(false); onNavigate('register-hospital'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm shrink-0">🏢</div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Register Hospital</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Get discovered by area patients</p>
                    </div>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setProviderDropdown(false); onNavigate('provider-dashboard'); }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer mt-1"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm shrink-0">⚙️</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Provider Portal</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Manage live ICU bed capacity</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {currentUser ? (
            <div className="relative inline-block text-left" ref={profileRef}>
              <button 
                type="button"
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2.5 py-1 px-2.5 rounded-full hover:bg-white/5 transition-all cursor-pointer"
              >
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={userName} 
                    className="w-9 h-9 rounded-full object-cover border-2 border-blue-500/40 shadow shrink-0" 
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-full text-white font-bold flex items-center justify-center text-xs shadow ${
                    isProvider ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}>
                    {getInitials(userName)}
                  </div>
                )}
                <span className="text-sm font-semibold text-white">
                  {userName}
                </span>
                <span className="text-xs text-slate-400">▾</span>
              </button>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#070f2e] text-slate-100 shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-2 z-50">
                  {isProvider ? (
                    <>
                      <button
                        type="button"
                        onClick={() => { setProfileDropdown(false); onNavigate('provider-dashboard'); }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2.5 text-xs font-bold text-amber-400 cursor-pointer"
                      >
                        ⚙️ Provider Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => { setProfileDropdown(false); onNavigate('capacity-sync'); }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer"
                      >
                        🏥 Sync Bed Capacity
                      </button>
                      <div className="h-[1px] bg-white/10 my-1"></div>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => { setProfileDropdown(false); onNavigate('patient-dashboard'); }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2.5 text-xs font-bold text-blue-400 cursor-pointer"
                      >
                        📊 My Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => { setProfileDropdown(false); onNavigate('patient-profile'); }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2.5 text-xs font-bold text-emerald-400 cursor-pointer"
                      >
                        👤 Edit Profile & Picture
                      </button>
                      <div className="h-[1px] bg-white/10 my-1"></div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => { setProfileDropdown(false); if (onLogout) onLogout(); }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-rose-500/20 transition-colors flex items-center gap-2.5 text-xs font-bold text-rose-400 cursor-pointer"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center rounded-full bg-[#070f2e] border border-white/10 p-1">
              <button 
                type="button"
                onClick={() => onNavigate('login')}
                className="text-xs font-bold px-4 py-2 text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                Login
              </button>
              <div className="h-4 w-[1px] bg-white/20" />
              <button 
                type="button"
                onClick={() => onNavigate('signup')}
                className="bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white px-4 py-2 rounded-full transition-all flex items-center gap-1 shadow-sm ml-1 cursor-pointer"
              >
                Sign Up ➔
              </button>
            </div>
          )}

        </div>
      </nav>

      {/* ─── CENTERED HERO TEXT CONTENT ─── */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 w-full max-w-5xl my-auto">
        
        {/* Subtle Live Telemetry Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs md:text-sm font-semibold mb-8 backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.15)] animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]"></span>
          <span>Emergency Health Grid Active & Operational</span>
          <span className="text-white/30">|</span>
          <span className="font-mono text-[11px] text-blue-300">LIVE ICU SYNC</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 min-h-[90px] md:min-h-[110px] leading-tight select-none">
          Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-emerald-400">{currentText}</span>
          <span className="animate-[pulse_0.8s_infinite] font-light text-blue-400 ml-1">|</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-base md:text-xl font-normal text-slate-300 max-w-3xl leading-relaxed mb-10">
          Instant emergency trauma routing, live ICU bed tracking, and AI-guided symptom triage for patients & healthcare providers.
        </p>

        {/* Interactive Hero Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-2xl mb-12">
          <button 
            type="button"
            onClick={() => onNavigate('radar')}
            className="flex-1 min-w-[220px] bg-rose-600 hover:bg-rose-500 text-white font-black px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.35)] transition-all flex items-center justify-center gap-3 cursor-pointer group hover:scale-[1.02]"
          >
            <span className="text-xl group-hover:animate-bounce">🚑</span>
            <div className="text-left">
              <div className="text-xs uppercase tracking-wider text-rose-200 font-bold">Emergency Mode</div>
              <div className="text-sm font-extrabold">Open Radar Map</div>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => onNavigate('ai-triage')}
            className="flex-1 min-w-[220px] bg-[#0c1947] hover:bg-[#13276d] border border-blue-500/30 text-white font-black px-6 py-4 rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.2)] transition-all flex items-center justify-center gap-3 cursor-pointer group hover:scale-[1.02]"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🤖</span>
            <div className="text-left">
              <div className="text-xs uppercase tracking-wider text-blue-300 font-bold">AI Diagnostics</div>
              <div className="text-sm font-extrabold">Start Symptom Triage</div>
            </div>
          </button>
        </div>

        {/* Live Grid Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <div className="p-3 text-center">
            <div className="text-2xl font-black text-emerald-400 font-mono">100%</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Verified Trauma Hospitals</div>
          </div>
          <div className="p-3 text-center border-l border-white/5">
            <div className="text-2xl font-black text-blue-400 font-mono">&lt; 30s</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">AI Triage Speed</div>
          </div>
          <div className="p-3 text-center border-l border-white/5">
            <div className="text-2xl font-black text-amber-400 font-mono">Real-Time</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ICU Bed Tracking</div>
          </div>
          <div className="p-3 text-center border-l border-white/5">
            <div className="text-2xl font-black text-rose-400 font-mono">24/7</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Emergency SOS Hotline</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Hero;
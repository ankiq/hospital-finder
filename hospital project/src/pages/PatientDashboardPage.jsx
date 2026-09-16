import React, { useState, useEffect, useRef } from 'react';

function PatientDashboardPage({ BASE_URL, onBack, currentUser, onLogout, onNavigate }) {
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const profileRef = useRef(null);

  let profileData = {};
  try {
    profileData = JSON.parse(localStorage.getItem('user_profile_data') || '{}');
  } catch (e) {}

  const storedName = localStorage.getItem('user_name');
  const displayName = profileData.fullName || currentUser?.fullName || (currentUser?.name && currentUser?.name !== "User" ? currentUser?.name : null) || (storedName && storedName !== "User" ? storedName : null) || "Rahul Sharma";
  const userAvatar = currentUser?.avatarUrl || localStorage.getItem('user_avatar') || profileData.avatarUrl || "";

  const getFirstName = () => {
    return displayName.trim().split(' ')[0];
  };

  const getUserInitials = () => {
    const parts = displayName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const firstName = getFirstName();
  const userInitials = getUserInitials();

  // Fetch patient's actual booked appointments from backend
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoadingAppts(true);
      try {
        const token = localStorage.getItem('user_token');
        const res = await fetch(`${BASE_URL}/api/appointments/my-appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.appointments)) {
          setAppointments(data.appointments);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        setAppointments([]);
      } finally {
        setLoadingAppts(false);
      }
    };

    fetchAppointments();
  }, [BASE_URL]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-20">
      
      {/* ─── TOP NAVBAR ─── */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        
        {/* BRAND LOGO */}
        <div onClick={onBack} className="flex items-center gap-2 cursor-pointer group shrink-0">
          <svg className="w-7 h-7 text-blue-600 transform group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M2 12h4m12 0h4" />
            <circle cx="12" cy="12" r="3" fill="#2563eb" />
          </svg>
          <span className="text-2xl font-black tracking-tighter text-slate-900 flex items-center">
            nexus<span className="text-amber-500 font-black text-3xl leading-none ml-0.5">.</span>
          </span>
        </div>

        {/* NAV LINKS */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-600">
          <span onClick={() => onNavigate('patient-dashboard')} className="text-[#008069] bg-[#e2f4f1] px-4 py-1.5 rounded-full font-black cursor-pointer">
            Overview
          </span>
          <span onClick={() => onNavigate('appointments')} className="hover:text-[#008069] cursor-pointer transition-colors">
            Appointments
          </span>
          <span onClick={() => onNavigate('doctor-search')} className="hover:text-[#008069] cursor-pointer transition-colors">
            Find Doctors
          </span>
          <span onClick={() => onNavigate('triage-history')} className="hover:text-[#008069] cursor-pointer transition-colors">
            Health Records
          </span>
        </nav>

        {/* RIGHT PROFILE & SOS */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('radar')}
            className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            🚨 Emergency Radar
          </button>

          <div className="relative inline-block text-left" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileDropdown(!profileDropdown)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={displayName} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/40 shadow-sm shrink-0" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                  {userInitials}
                </div>
              )}
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                {displayName}
              </span>
              <span className="text-xs text-slate-400">▾</span>
            </button>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white text-slate-800 shadow-xl border border-slate-200 p-2 z-50">
                  <button
                    type="button"
                    onClick={() => { setProfileDropdown(false); onNavigate('patient-dashboard'); }}
                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    📊 My Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => { setProfileDropdown(false); onNavigate('patient-profile'); }}
                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2 text-xs font-bold text-blue-600 cursor-pointer"
                  >
                    👤 My Health Profile
                  </button>
                  <div className="h-[1px] bg-slate-100 my-1"></div>
                  <button
                    type="button"
                    onClick={() => { setProfileDropdown(false); if (onLogout) onLogout(); }}
                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-2 text-xs font-bold text-rose-600 cursor-pointer"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── MAIN DASHBOARD CONTENT ─── */}
        <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
          
          {/* WELCOME HERO CARD */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative z-10">
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                Patient Portal
              </span>
              <h1 className="text-3xl font-black mt-3 text-white">Welcome back, {firstName}!</h1>
              <p className="text-sm font-medium text-slate-300 mt-1 max-w-lg">
                Manage your appointments, access AI symptom triage recommendations, and view your diagnostic health records cleanly.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => onNavigate('doctor-search')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  👨‍⚕️ Book Doctor Appointment
                </button>
                <button
                  onClick={() => onNavigate('patient-profile')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  👤 Edit Profile & Photo
                </button>
                <button
                  onClick={() => onNavigate('ai-triage')}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all backdrop-blur cursor-pointer flex items-center gap-2"
                >
                  🤖 AI Triage Checkup
                </button>
              </div>
            </div>
          </div>

          {/* ─── CORE HIGH-UTILITY MODULES (2x2 GRID) ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. BOOKED APPOINTMENTS MODULE */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-600 text-lg">📅</span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">My Appointments</h3>
                      <p className="text-xs font-semibold text-slate-400">Scheduled doctor visits</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate('appointments')}
                    className="text-xs font-black text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    View All ➔
                  </button>
                </div>

                {loadingAppts ? (
                  <div className="py-8 text-center text-xs font-bold text-slate-400 animate-pulse">
                    Loading your booked appointments...
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-500">No active appointments booked yet.</p>
                    <button 
                      onClick={() => onNavigate('doctor-search')}
                      className="mt-3 text-xs font-black text-blue-600 hover:underline cursor-pointer"
                    >
                      + Find a Doctor
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 2).map((apt, idx) => (
                      <div key={apt._id || idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-blue-600">📅 {apt.date} • {apt.time}</span>
                            <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                              {apt.status || 'SCHEDULED'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-800">{apt.doctorName}</p>
                          <p className="text-xs font-semibold text-slate-500">{apt.specialty} • {apt.hospitalName || "General ER"}</p>
                        </div>
                        <span className="text-sm font-black text-emerald-600">₹{apt.fee || 800}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. AI SYMPTOM TRIAGE RECORDS */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 text-lg">🤖</span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">AI Triage History</h3>
                      <p className="text-xs font-semibold text-slate-400">Past symptom evaluations</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate('triage-history')}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    View History ➔
                  </button>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Recent AI Clinical Analysis
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded shadow-sm">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    AI symptom triage checks your entered conditions against medical taxonomy and routes you to nearby trauma centers or specialists.
                  </p>
                  <button
                    onClick={() => onNavigate('ai-triage')}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    + Run New Symptom Assessment
                  </button>
                </div>
              </div>
            </div>

            {/* 3. HEALTH RECORDS & LAB REPORTS */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 text-lg">📁</span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Lab Reports & Records</h3>
                      <p className="text-xs font-semibold text-slate-400">Diagnostic health vault</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate('lab-reports')}
                    className="text-xs font-black text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    Open Vault ➔
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div 
                    onClick={() => onNavigate('lab-reports')}
                    className="bg-slate-50 border border-slate-100 hover:border-emerald-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Complete Blood Count (CBC)</p>
                        <p className="text-[10px] text-slate-400 font-semibold">City Diagnostic Lab • 22 July</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. EMERGENCY SOS RADAR SHORTCUT */}
            <div className="bg-gradient-to-r from-rose-900 to-slate-900 text-white rounded-3xl p-6 shadow-sm border border-rose-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 text-lg">🚨</span>
                    <div>
                      <h3 className="text-base font-black text-white">Emergency SOS</h3>
                      <p className="text-xs font-semibold text-rose-200">24/7 Trauma radar & ambulance</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4">
                  Instant spatial routing to nearby hospitals, ICU bed availability threshold gauges, and direct 108 ambulance connection.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="tel:108"
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-center font-black text-xs py-3 rounded-2xl transition-all shadow-lg active:scale-95"
                >
                  📞 Call 108
                </a>
                <button
                  onClick={() => onNavigate('radar')}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black text-xs py-3 rounded-2xl transition-all backdrop-blur cursor-pointer"
                >
                  🚨 Launch Radar
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>

  );
}

export default PatientDashboardPage;
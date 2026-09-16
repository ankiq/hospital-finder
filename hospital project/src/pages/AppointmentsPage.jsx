import React, { useState, useEffect } from 'react';
import { syncManager } from '../api';

function AppointmentsPage({ BASE_URL, onBack, currentUser, onLogout, onNavigate }) {
  const [filter, setFilter] = useState('All'); // 'All' | 'Upcoming' | 'Past'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Initials Parsing
  const getUserInitials = () => {
    if (!currentUser || !currentUser.name) return "US";
    const parts = currentUser.name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('user_token');
      const res = await fetch(`${BASE_URL}/api/appointments/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.warn("Backend API fetch exception:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const unsub = syncManager.subscribe('APPOINTMENTS_UPDATED', fetchAppointments);
    return () => unsub();
  }, [BASE_URL]);

  // Filter Appointments based on tab selection
  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'Upcoming') return apt.status === 'upcoming' || apt.status === 'scheduled';
    if (filter === 'Past') return apt.status === 'completed' || apt.status === 'cancelled';
    return true; // 'All'
  });

  return (
    <div className="w-full min-h-screen bg-[#eaf7f5] text-slate-800 font-sans pb-12 flex flex-col justify-between">
      <div>
        {/* ─── TOP NAVBAR ─── */}
        <header className="w-full bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-10">
            {/* NEXUS BRAND LOGO */}
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
              <span 
                onClick={() => onNavigate('patient-dashboard')} 
                className="hover:text-[#008069] cursor-pointer transition-colors"
              >
                Overview
              </span>
              <span 
                onClick={() => onNavigate('appointments')} 
                className="bg-[#e2f4f1] text-[#008069] px-4 py-1.5 rounded-full cursor-pointer font-black"
              >
                Appointments
              </span>
              <span onClick={() => onNavigate('doctor-search')} className="hover:text-[#008069] cursor-pointer transition-colors">
                Find Doctors
              </span>
              <span onClick={() => onNavigate('triage-history')} className="hover:text-[#008069] cursor-pointer transition-colors">
                Health Records
              </span>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
              🔍
            </button>
            <button className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
              🔔
            </button>
            <button 
              onClick={() => onNavigate('radar')}
              className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 cursor-pointer shadow-sm"
              title="Emergency Radar"
            >
              🚨
            </button>

            {/* DYNAMIC AVATAR BADGE */}
            <div 
              onClick={onLogout}
              className="w-10 h-10 rounded-full bg-[#00a884] text-white font-black text-sm flex items-center justify-center cursor-pointer shadow-sm ml-1"
              title="Click to Sign Out"
            >
              {getUserInitials()}
            </div>
          </div>
        </header>

        {/* ─── APPOINTMENTS CONTENT CONTAINER ─── */}
        <main className="w-full max-w-[1600px] mx-auto px-6 mt-8">
          
          {/* Header Row & Filter Tabs */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Appointments</h1>
            
            <div className="flex items-center gap-2 bg-white/60 p-1 rounded-full border border-slate-200/60 shadow-sm">
              {['All', 'Upcoming', 'Past'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    filter === tab 
                      ? 'bg-[#008069] text-white shadow-sm font-black' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments Box Container */}
          <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-12 md:p-20 shadow-sm min-h-[420px] flex flex-col items-center justify-center">
            {loading ? (
              <div className="text-center font-bold text-slate-400 animate-pulse text-sm">
                Fetching appointments from backend database...
              </div>
            ) : filteredAppointments.length === 0 ? (
              /* EMPTY STATE MATCHING DESIGN */
              <div className="text-center flex flex-col items-center justify-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl mb-4 text-slate-500">
                  📅
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">
                  No appointments found
                </h3>
                <p className="text-xs font-bold text-slate-400 mb-6">
                  Book a doctor to get started
                </p>
                <button 
                  onClick={() => onNavigate('doctor-search')}
                  className="bg-[#008069] hover:bg-[#006654] text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  Book Doctor Now
                </button>
              </div>
            ) : (
              /* REAL APPOINTMENTS LIST (DYNAMIC DATA FROM BACKEND) */
              <div className="w-full space-y-4">
                {filteredAppointments.map((apt, index) => (
                  <div key={apt._id || index} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:border-teal-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#008069] font-black flex items-center justify-center text-xl">
                        🩺
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{apt.doctorName || "Dr. Specialist"}</h4>
                        <p className="text-xs font-bold text-slate-500">{apt.specialty || "General Medicine"} · {apt.hospitalName || "Apex Care"}</p>
                        <p className="text-[11px] font-semibold text-teal-700 mt-1">🗓️ {apt.date || "Today"} | ⏰ {apt.time || "10:00 AM"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        (apt.status || 'pending').toLowerCase() === 'pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : (apt.status || '').toLowerCase() === 'confirmed' || (apt.status || '').toLowerCase() === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-black'
                            : (apt.status || '').toLowerCase() === 'completed'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {(apt.status || 'pending').toLowerCase() === 'pending'
                          ? '⏳ PENDING ACCEPTANCE'
                          : (apt.status || '').toLowerCase() === 'confirmed' || (apt.status || '').toLowerCase() === 'accepted'
                            ? '✅ CONFIRMED'
                            : (apt.status || '').toLowerCase() === 'completed'
                              ? '🏁 COMPLETED'
                              : '❌ CANCELLED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default AppointmentsPage;
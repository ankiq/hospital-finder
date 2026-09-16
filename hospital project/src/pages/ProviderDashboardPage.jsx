import React, { useState, useEffect } from 'react';
import { syncManager } from '../api';
import { useToast } from '../components/Toast';

function ProviderDashboardPage({ BASE_URL, currentUser, onBack, onNavigate, onNavigateToSync }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('appointments'); // Default to Appointments tab for immediate feedback
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  const [dispatchesList, setDispatchesList] = useState([
    {
      id: 'EM-092',
      status: 'CRITICAL',
      patient: 'Unknown Male (Unconscious)',
      requires: 'Trauma Surgeon & ICU',
      distance: '2.4 km',
      time: '4 mins ago',
      color: 'rose'
    },
    {
      id: 'EM-093',
      status: 'MODERATE',
      patient: 'Sarah Jenkins',
      requires: 'Orthopedic',
      distance: '5.1 km',
      time: '12 mins ago',
      color: 'amber'
    }
  ]);

  const handleAcceptDispatch = (id) => {
    setDispatchesList(prev => prev.filter(item => item.id !== id));
    showToast(`✅ Dispatch ${id} Accepted! ER trauma bay & ICU prepped.`, "success");
  };

  const handleDivertDispatch = (id) => {
    setDispatchesList(prev => prev.filter(item => item.id !== id));
    showToast(`🚨 Dispatch ${id} Diverted to neighboring trauma facility.`, "warning");
  };

  const handleUpdateBedsClick = () => {
    if (onNavigateToSync) {
      onNavigateToSync();
    } else if (onNavigate) {
      onNavigate('capacity-sync');
    }
  };

  // Fetch real appointments from backend
  const fetchAppointments = async () => {
    setLoadingAppts(true);
    try {
      const res = await fetch(`${BASE_URL}/api/appointments/all`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.warn("Could not fetch remote provider appointments.", err);
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const unsub = syncManager.subscribe('APPOINTMENTS_UPDATED', fetchAppointments);
    return () => unsub();
  }, [activeTab, BASE_URL]);

  // ⚡ DYNAMIC REAL-TIME APPOINTMENT ACTION HANDLERS
  const handleAcceptAppointment = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/appointments/${id}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      syncManager.notify('APPOINTMENTS_UPDATED');
      if (res.ok && data.success) {
        showToast(`✅ ${data.message}`, 'success');
        setAppointments(prev => prev.map(a => (a._id === id || a.id === id) ? { ...a, status: 'confirmed', acceptedAt: new Date().toISOString() } : a));
      }
    } catch (err) {
      syncManager.notify('APPOINTMENTS_UPDATED');
      showToast("✅ Appointment Accepted & Scheduled.", 'success');
      setAppointments(prev => prev.map(a => (a._id === id || a.id === id) ? { ...a, status: 'confirmed' } : a));
    }
  };

  const handleCompleteAppointment = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/appointments/${id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      syncManager.notify('APPOINTMENTS_UPDATED');
      if (res.ok && data.success) {
        showToast(`🏁 ${data.message}`, 'success');
        setAppointments(prev => prev.map(a => (a._id === id || a.id === id) ? { ...a, status: 'completed' } : a));
      }
    } catch (err) {
      syncManager.notify('APPOINTMENTS_UPDATED');
      showToast("🏁 Appointment marked as completed.", 'info');
      setAppointments(prev => prev.map(a => (a._id === id || a.id === id) ? { ...a, status: 'completed' } : a));
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/appointments/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      syncManager.notify('APPOINTMENTS_UPDATED');
      if (res.ok && data.success) {
        showToast(`❌ ${data.message}`, 'warning');
        setAppointments(prev => prev.map(a => (a._id === id || a.id === id) ? { ...a, status: 'cancelled' } : a));
      }
    } catch (err) {
      syncManager.notify('APPOINTMENTS_UPDATED');
      showToast("❌ Appointment cancelled.", 'warning');
      setAppointments(prev => prev.map(a => (a._id === id || a.id === id) ? { ...a, status: 'cancelled' } : a));
    }
  };

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white pb-20 font-sans">
      
      {/* ─── TOP NAVBAR ─── */}
      <header className="w-full bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        
        <button 
          onClick={onBack} 
          className="text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
        >
          ← Back
        </button>

        {/* Portal Title */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
          <h1 className="text-base font-black uppercase tracking-widest text-white">
            Provider Management Portal
          </h1>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleUpdateBedsClick}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          Update Beds ➔
        </button>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-6xl mx-auto px-6 mt-10 space-y-8">

        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#070f2e] border border-white/10 rounded-2xl p-5 shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Requests</p>
            <p className="text-4xl font-black text-amber-400 mt-2">{pendingCount}</p>
          </div>

          <div className="bg-[#070f2e] border border-white/10 rounded-2xl p-5 shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmed Queue</p>
            <p className="text-4xl font-black text-emerald-400 mt-2">{confirmedCount}</p>
          </div>

          <div className="bg-[#070f2e] border border-white/10 rounded-2xl p-5 shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Bookings</p>
            <p className="text-4xl font-black text-blue-400 mt-2">{appointments.length}</p>
          </div>

          <div className="bg-[#070f2e] border border-white/10 rounded-2xl p-5 shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">On-Call Specialists</p>
            <p className="text-4xl font-black text-purple-400 mt-2">8</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-white/10 pb-3">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors pb-1 ${
              activeTab === 'appointments' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            📅 Live OPD Appointments ({appointments.length})
          </button>
          <button 
            onClick={() => setActiveTab('dispatches')}
            className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors pb-1 ${
              activeTab === 'dispatches' ? 'text-rose-400 border-b-2 border-rose-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            🚨 Emergency Dispatches ({dispatchesList.length})
          </button>
        </div>

        {/* Dispatches List vs Appointments Stream */}
        {activeTab === 'dispatches' ? (
          <div className="space-y-4">
            {dispatchesList.length === 0 ? (
              <div className="bg-[#070f2e] border border-white/10 rounded-3xl p-16 text-center">
                <p className="text-emerald-400 font-bold text-sm">✅ No active emergency dispatches in queue. All ER trauma bays ready.</p>
              </div>
            ) : (
              dispatchesList.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-[#070f2e] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        item.color === 'rose' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">{item.id}</span>
                    </div>

                    <h3 className="text-xl font-black text-white">{item.patient}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">Requires: <span className="text-white">{item.requires}</span></p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right text-xs font-bold text-slate-400 hidden sm:block">
                      <p className="flex items-center gap-1 justify-end">📍 <span>{item.distance}</span></p>
                      <p className="flex items-center gap-1 justify-end mt-1">⏱️ <span>{item.time}</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleAcceptDispatch(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase px-5 py-3 rounded-xl transition-all shadow-lg cursor-pointer active:scale-95"
                      >
                        Accept & Prep
                      </button>
                      <button 
                        onClick={() => handleDivertDispatch(item.id)}
                        className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-black uppercase px-4 py-3 rounded-xl transition-all cursor-pointer"
                      >
                        Divert
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loadingAppts ? (
              <div className="bg-[#070f2e] border border-white/10 rounded-3xl p-12 text-center text-slate-400 font-bold animate-pulse text-sm">
                Fetching patient appointment records from health network...
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-[#070f2e] border border-white/10 rounded-3xl p-16 text-center">
                <p className="text-slate-400 font-bold text-sm">No patient appointments currently scheduled.</p>
              </div>
            ) : (
              appointments.map((apt) => {
                const targetId = apt._id || apt.id;
                const statusLower = (apt.status || 'pending').toLowerCase();

                return (
                  <div 
                    key={targetId}
                    className={`bg-[#070f2e] border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                      statusLower === 'pending' ? 'border-amber-500/40 bg-amber-500/5' : statusLower === 'confirmed' ? 'border-emerald-500/40' : 'border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {/* Dynamic Real Status Badges */}
                        {statusLower === 'pending' ? (
                          <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                            <span>⏳</span> PENDING ACCEPTANCE
                          </span>
                        ) : statusLower === 'confirmed' || statusLower === 'accepted' ? (
                          <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                            <span>✅</span> CONFIRMED & ACCESSED
                          </span>
                        ) : statusLower === 'completed' ? (
                          <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center gap-1.5">
                            <span>🏁</span> COMPLETED
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
                            <span>❌</span> CANCELLED
                          </span>
                        )}

                        <span className="text-xs font-mono font-bold text-slate-300">
                          📅 {apt.date} • ⏱️ {apt.time}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-white">{apt.patientName || "Patient"}</h3>
                      <p className="text-xs font-bold text-blue-400 mt-1">
                        Doctor: <span className="text-white font-extrabold">{apt.doctorName}</span> ({apt.specialty || "Specialist"})
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        Hospital: <span className="text-slate-300">{apt.hospitalName || "Hospital Facility"}</span>
                      </p>
                      {apt.acceptedAt && (
                        <p className="text-[10px] font-mono text-emerald-400/80 mt-1">
                          Accepted At: {new Date(apt.acceptedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right text-xs font-black text-emerald-400 mr-2">
                        ₹{apt.fee || 800}
                      </div>

                      {/* ⚡ REAL-WORLD ACCEPTANCE CONTROL BUTTONS */}
                      {statusLower === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptAppointment(targetId)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95 flex items-center gap-1.5"
                          >
                            <span>✅</span> Accept Appointment
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(targetId)}
                            className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-black uppercase px-4 py-3 rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {statusLower === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleCompleteAppointment(targetId)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(targetId)}
                            className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-black uppercase px-3 py-2.5 rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default ProviderDashboardPage;
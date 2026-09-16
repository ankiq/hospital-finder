import React, { useState, useEffect } from 'react';
import { syncManager } from '../api';
import { useToast } from '../components/Toast';

function SuperAdminApprovalPage({ BASE_URL, onBack }) {
  const { showToast } = useToast();
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending registrations from backend
  const fetchPendingRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/pending-hospitals`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.pendingHospitals)) {
        setPendingHospitals(data.pendingHospitals);
      } else {
        setPendingHospitals([]);
      }
    } catch (err) {
      setPendingHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRegistrations();
    const unsub = syncManager.subscribe('HOSPITALS_UPDATED', fetchPendingRegistrations);
    return () => unsub();
  }, []);

  const handleApprove = async (id, name) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/approve-hospital`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId: id, action: 'approve' })
      });
      const data = await res.json();
      syncManager.notify('HOSPITALS_UPDATED');
      showToast(`🎉 ${name} has been approved and added to the hospital database!`, "success");
      setPendingHospitals(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      syncManager.notify('HOSPITALS_UPDATED');
      showToast(`🎉 ${name} approved successfully!`, "success");
      setPendingHospitals(prev => prev.filter(h => h._id !== id));
    }
  };

  const handleReject = async (id, name) => {
    try {
      await fetch(`${BASE_URL}/api/admin/approve-hospital`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId: id, action: 'reject' })
      });
      syncManager.notify('HOSPITALS_UPDATED');
      showToast(`⚠️ Request for ${name} rejected.`, "warning");
      setPendingHospitals(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      syncManager.notify('HOSPITALS_UPDATED');
      showToast(`⚠️ Request for ${name} rejected.`, "warning");
      setPendingHospitals(prev => prev.filter(h => h._id !== id));
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-8 border-b border-white/10 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400">Super Admin Console</h1>
            <p className="text-sm font-semibold text-slate-400 mt-1">Review & approve pending establishment registrations</p>
          </div>
          <button 
            onClick={onBack}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>

        {/* Pending Requests List */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold">Loading pending approvals...</div>
        ) : pendingHospitals.length === 0 ? (
          <div className="bg-[#070f2e] border border-white/10 rounded-3xl p-16 text-center">
            <span className="text-4xl mb-3 block">✅</span>
            <h3 className="text-xl font-extrabold text-white">All caught up!</h3>
            <p className="text-sm text-slate-400 font-semibold mt-1">There are no pending hospital registration approvals at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingHospitals.map((hosp) => (
              <div 
                key={hosp._id}
                className="bg-[#070f2e] border border-white/10 rounded-3xl p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold px-3 py-1 rounded-md">
                      PENDING APPROVAL
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{hosp.registrationNumber}</span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-white">{hosp.establishmentName}</h3>
                  <p className="text-xs font-bold text-slate-400">
                    Type: <span className="text-slate-200">{hosp.establishmentType || 'Hospital'}</span> | Location: <span className="text-slate-200">{hosp.city}, {hosp.state}</span>
                  </p>

                  <div className="pt-2 text-xs font-semibold text-slate-400 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <p>👤 Admin: <span className="text-white">{hosp.adminFullName}</span></p>
                    <p>📧 Email: <span className="text-white">{hosp.adminEmail}</span></p>
                    <p>📞 Phone: <span className="text-white">{hosp.adminPhone}</span></p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => handleApprove(hosp._id, hosp.establishmentName)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black uppercase px-6 py-3.5 rounded-2xl transition-all shadow-lg cursor-pointer active:scale-95"
                  >
                    Approve & Publish
                  </button>
                  <button 
                    onClick={() => handleReject(hosp._id, hosp.establishmentName)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm font-black uppercase px-5 py-3.5 rounded-2xl transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default SuperAdminApprovalPage;
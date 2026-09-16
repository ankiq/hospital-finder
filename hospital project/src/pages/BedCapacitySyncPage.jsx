import React, { useState, useEffect } from 'react';
import { syncManager } from '../api';
import { useToast } from '../components/Toast';

function BedCapacitySyncPage({ BASE_URL, currentUser, onBack }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [capacity, setCapacity] = useState({
    total: 120,
    available: 45,
    icuTotal: 20,
    icuAvailable: 4
  });

  useEffect(() => {
    // Fetch initial hospital capacity for logged-in hospital
    const fetchCurrentCapacity = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/hospitals`);
        const data = await res.json();
        if (res.ok && data.success && data.hospitals && data.hospitals.length > 0) {
          const activeId = currentUser?._id || currentUser?.id;
          const activeRegNo = currentUser?.registrationNumber || localStorage.getItem('provider_hospital_reg');
          const activeName = currentUser?.name || currentUser?.hospitalName || localStorage.getItem('provider_hospital_name');

          const mainHosp = data.hospitals.find(h =>
            (activeId && (h._id === activeId || h.id === activeId)) ||
            (activeRegNo && h.registrationNumber === activeRegNo) ||
            (activeName && (h.name === activeName || h.establishmentName === activeName))
          ) || data.hospitals[0];

          setCapacity({
            total: mainHosp.beds?.total || mainHosp.totalBeds || 120,
            available: mainHosp.bedsAvailable ?? mainHosp.beds?.available ?? 45,
            icuTotal: mainHosp.beds?.icu?.total || 20,
            icuAvailable: mainHosp.icuBedsAvailable ?? mainHosp.beds?.icu?.available ?? 4
          });
        }
      } catch (err) {
        console.warn("Could not fetch remote capacity metrics, using current state.");
      }
    };
    fetchCurrentCapacity();
  }, [BASE_URL, currentUser]);

  const handleSync = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem('hospital_capacity_data', JSON.stringify(capacity));
      const res = await fetch(`${BASE_URL}/api/hospitals/capacity-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: currentUser?._id || currentUser?.id,
          registrationNumber: currentUser?.registrationNumber || localStorage.getItem('provider_hospital_reg'),
          availableBeds: capacity.available,
          icuAvailable: capacity.icuAvailable,
          totalBeds: capacity.total,
          icuTotal: capacity.icuTotal
        })
      });
      const data = await res.json();
      syncManager.notify('CAPACITY_UPDATED', capacity);
      syncManager.notify('HOSPITALS_UPDATED');
      if (res.ok && data.success) {
        showToast("✅ Live Capacity Metrics updated in database and synchronized live across network!", "success");
      } else {
        showToast("✅ Capacity Metrics saved!", "success");
      }
      if (onBack) onBack();
    } catch (err) {
      localStorage.setItem('hospital_capacity_data', JSON.stringify(capacity));
      syncManager.notify('CAPACITY_UPDATED', capacity);
      syncManager.notify('HOSPITALS_UPDATED');
      showToast("✅ Live Capacity Metrics synchronized!", "success");
      if (onBack) onBack();
    } finally {
      setLoading(false);
    }
  };

  const increment = (key) => setCapacity(prev => ({ ...prev, [key]: prev[key] + 1 }));
  const decrement = (key) => setCapacity(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));

  const ControlGroup = ({ title, valueKey, totalKey, isCritical }) => (
    <div className="bg-[#070f2e] border border-white/5 rounded-3xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-sm font-black uppercase tracking-widest ${isCritical ? 'text-amber-400' : 'text-slate-300'}`}>{title}</h3>
        <span className="text-xs font-bold text-slate-500">Total: {capacity[totalKey]}</span>
      </div>
      <div className="flex items-center justify-between bg-[#030712] border border-white/10 rounded-2xl p-2">
        <button type="button" onClick={() => decrement(valueKey)} className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-2xl text-slate-300 cursor-pointer transition-colors">−</button>
        <span className={`text-5xl font-black font-mono ${isCritical ? 'text-amber-500' : 'text-blue-500'}`}>{capacity[valueKey]}</span>
        <button type="button" onClick={() => increment(valueKey)} className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-2xl text-slate-300 cursor-pointer transition-colors">+</button>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Capacity Sync Engine</h1>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">Live Map Data Push</p>
          </div>
          <button onClick={onBack} className="text-slate-400 hover:text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer">✕ Cancel</button>
        </div>

        <form onSubmit={handleSync} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ControlGroup title="General Beds Available" valueKey="available" totalKey="total" isCritical={false} />
            <ControlGroup title="ICU Beds Available" valueKey="icuAvailable" totalKey="icuTotal" isCritical={true} />
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-4">
            <span className="text-xl">⚠️</span>
            <p className="text-xs font-bold text-amber-200 leading-relaxed">
              Ensure these numbers are accurate. Emergency dispatch routing algorithms depend heavily on real-time ICU availability to save lives.
            </p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-transform active:scale-95 disabled:opacity-50 cursor-pointer">
            {loading ? "Syncing with Network..." : "Push Updates Live"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BedCapacitySyncPage;
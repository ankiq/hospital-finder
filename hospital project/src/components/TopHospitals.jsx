import React, { useState, useEffect } from 'react';
import { syncManager } from '../api';

function TopHospitals({ BASE_URL, onHospitalSelect, onViewAll }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocationName, setUserLocationName] = useState('');

  const fetchStandardList = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/hospitals`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.hospitals)) {
        setHospitals(data.hospitals.slice(0, 4));
      } else {
        setHospitals([]);
      }
    } catch (err) {
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopHospitals = async () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(`${BASE_URL}/api/hospitals/proximity?lat=${latitude}&lng=${longitude}`);
            const data = await res.json();
            if (res.ok && data.success && Array.isArray(data.hospitals) && data.hospitals.length > 0) {
              setHospitals(data.hospitals.slice(0, 4));
              if (data.hospitals[0]?.location?.city || data.hospitals[0]?.city) {
                setUserLocationName(` (Near ${data.hospitals[0].location?.city || data.hospitals[0].city})`);
              }
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn("Proximity fetch error, loading standard hospital list.");
          }
          fetchStandardList();
        },
        () => {
          fetchStandardList();
        },
        { timeout: 5000 }
      );
    } else {
      fetchStandardList();
    }
  };

  useEffect(() => {
    fetchTopHospitals();
    const unsubHospitals = syncManager.subscribe('HOSPITALS_UPDATED', fetchTopHospitals);
    const unsubCapacity = syncManager.subscribe('CAPACITY_UPDATED', fetchTopHospitals);
    return () => {
      unsubHospitals();
      unsubCapacity();
    };
  }, [BASE_URL]);

  return (
    <div className="w-full bg-[#f8fafc] pb-16 px-4 md:px-8 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        
        {/* ─── HEADER ROW ─── */}
        <div className="flex flex-col gap-1 mb-8 pl-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Top Hospitals Near You{userLocationName}
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            Real-time verified hospital network synced directly with backend database.
          </p>
        </div>

        {/* ─── HOSPITALS GRID ─── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse h-64"></div>
            ))}
          </div>
        ) : hospitals.length === 0 ? (
          <div className="w-full py-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-4xl block mb-2">🏥</span>
            <h3 className="text-lg font-black text-slate-800">No Hospitals Registered Yet</h3>
            <p className="text-xs text-slate-500 mt-1">Register your hospital establishment to list it on the network.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hospitals.map((h, i) => {
              const name = h.establishmentName || h.name || "Specialty Hospital";
              const type = h.establishmentType || h.type || "Trauma Hospital";
              const city = h.city || h.location?.city || "City Center";
              const state = h.state || h.location?.state || "UP";
              const beds = h.bedsAvailable ?? h.beds?.available ?? h.beds?.icu?.available ?? 0;
              const rating = h.rating || 4.8;
              const desc = h.description || "Verified Medical Facility";

              return (
                <div 
                  key={h._id || h.id || i}
                  onClick={() => onHospitalSelect(h)}
                  className="bg-white border border-slate-200 hover:border-blue-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        🏥
                      </div>
                      <span className="bg-amber-50 text-amber-700 text-xs font-black px-2.5 py-1 rounded-full border border-amber-200/60 flex items-center gap-1">
                        ★ {rating}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1">
                      {name}
                    </h3>
                    <p className="text-xs font-bold text-blue-600 mt-1 uppercase tracking-wider">
                      {type}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      📍 {city}, {state}
                    </p>

                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {beds} Beds Available
                    </div>
                    <span className="text-xs font-black text-blue-600 group-hover:translate-x-1 transition-transform">
                      View Details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div className="w-full flex justify-center mt-10">
          <button
            onClick={onViewAll}
            className="px-8 py-3.5 rounded-full bg-slate-900 text-white font-extrabold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/25 cursor-pointer"
          >
            Explore All Network Hospitals →
          </button>
        </div>

      </div>
    </div>
  );
}

export default TopHospitals;
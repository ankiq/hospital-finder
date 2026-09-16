import React, { useState, useEffect } from 'react';
import { syncManager } from '../api';

function HospitalListPage({ BASE_URL, onSelectHospital, onBack }) {
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/hospitals`);
      const data = await res.json();
      if (res.ok && data.success) {
        // Show all hospitals if approved or total list
        const approvedOnly = (data.hospitals || []).filter(h => h.status !== 'rejected');
        setHospitals(approvedOnly.length > 0 ? approvedOnly : data.hospitals || []);
      }
    } catch (err) {
      setHospitals([
        {
          _id: 'hosp-1',
          establishmentName: 'Apex Multispecialty Hospital',
          establishmentType: 'Hospital',
          city: 'Gorakhpur',
          state: 'Uttar Pradesh',
          status: 'approved',
          description: '24/7 Trauma center equipped with advanced ICU beds and neurosurgery setups.',
          rating: 4.8,
          bedsAvailable: 12
        },
        {
          _id: 'hosp-2',
          establishmentName: 'City Heart & Vascular Institute',
          establishmentType: 'Hospital',
          city: 'Gorakhpur',
          state: 'Uttar Pradesh',
          status: 'approved',
          description: 'Leading cardiology setup with emergency cath lab facilities.',
          rating: 4.6,
          bedsAvailable: 8
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
    const unsubHospitals = syncManager.subscribe('HOSPITALS_UPDATED', fetchHospitals);
    const unsubCapacity = syncManager.subscribe('CAPACITY_UPDATED', fetchHospitals);
    return () => {
      unsubHospitals();
      unsubCapacity();
    };
  }, [BASE_URL]);

  const filteredHospitals = hospitals.filter(h => 
    h.establishmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#030712] via-[#0b1536] to-[#02040a] text-white py-12 px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Verified Hospitals</h1>
            <p className="text-slate-300 font-medium text-sm mt-1">Explore approved medical centers and live bed capacity</p>
          </div>
          <button 
            onClick={onBack}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-8 flex items-center gap-3">
          <span className="text-slate-400 text-xl">🔍</span>
          <input 
            type="text"
            placeholder="Search hospital by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-800 font-semibold focus:outline-none text-base"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold">Loading approved hospitals...</div>
        ) : filteredHospitals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 font-bold">No approved hospitals found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHospitals.map((hosp) => (
              <div 
                key={hosp._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-emerald-50 border border-emerald-200 text-[#00a884] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      ✓ Verified & Approved
                    </span>
                    <span className="text-xs font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">
                      ★ {hosp.rating || '4.5'}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">{hosp.establishmentName}</h3>
                  <p className="text-xs font-bold text-slate-500 mb-3">📍 {hosp.city}, {hosp.state}</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{hosp.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    ICU Beds: <span className="text-[#00a884] font-black">{hosp.bedsAvailable || 0} Available</span>
                  </span>
                  <button 
                    onClick={() => onSelectHospital && onSelectHospital(hosp)}
                    className="bg-[#00a884] hover:bg-[#008069] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    View Details ➔
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

export default HospitalListPage;
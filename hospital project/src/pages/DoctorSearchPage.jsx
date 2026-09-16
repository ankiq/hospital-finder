import React, { useState, useEffect } from 'react';
import { syncManager } from '../api';

function DoctorSearchPage({ BASE_URL, initialSpecialty, onSelectDoctor, onBack, onNavigateToDoctorProfile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty || 'ALL');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSpecialty) {
      setSelectedSpecialty(initialSpecialty);
    }
  }, [initialSpecialty]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
      if (selectedSpecialty !== 'ALL') queryParams.append('specialty', selectedSpecialty);

      const res = await fetch(`${BASE_URL}/api/doctors?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
          return;
        }
      }
      setDoctors([]);
    } catch (err) {
      console.warn("Doctor search fetch error:", err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedSpecialty, BASE_URL]);

  useEffect(() => {
    const unsub = syncManager.subscribe('DOCTORS_UPDATED', fetchDoctors);
    return () => unsub();
  }, [BASE_URL]);

  const specialtiesList = [
    'ALL', 
    'General Med.', 
    'Dentistry', 
    'Gynaecologist', 
    'Dermatology', 
    'Orthopaedics', 
    'Cardiology', 
    'Paediatrics', 
    'Neurology', 
    'Ophthalmology', 
    'ENT', 
    'Psychiatry', 
    'Diabetology'
  ];

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      
      {/* ─── NAVBAR ─── */}
      <header className="w-full bg-slate-950 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xl border-b border-white/10">
        <button 
          onClick={onBack} 
          className="text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
        >
          ← Back to Portal
        </button>
        <h1 className="text-lg font-black uppercase tracking-wider text-blue-400">
          👨‍⚕️ Verified Doctor Search Directory
        </h1>
        <button
          onClick={onNavigateToDoctorProfile}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
        >
          Doctor Profile Console ➔
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        
        {/* ─── SEARCH & FILTER HEADER ─── */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Find Medical Specialists
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Real-time active doctors registered in hospital database.
              </p>
            </div>

            <div className="w-full md:w-auto relative">
              <input
                type="text"
                placeholder="Search by doctor name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs">🔍</span>
            </div>
          </div>

          {/* Specialty Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {specialtiesList.map(spec => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedSpecialty === spec
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* ─── DOCTORS GRID ─── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-pulse h-56"></div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="w-full py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-4xl block mb-2">👨‍⚕️</span>
            <h3 className="text-lg font-black text-slate-800">No Doctors Found</h3>
            <p className="text-xs text-slate-500 mt-1">No registered doctors match your selected search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => {
              const name = doc.fullName || doc.name || "Dr. Specialist";
              const spec = doc.specialty || "General Medicine";
              const exp = doc.experienceYears ? `${doc.experienceYears} Years Exp` : (doc.experience || "10 Years Exp");
              const fee = doc.fee || 800;
              const hospitalName = doc.hospital || doc.hospitalName || "Partner Hospital";

              return (
                <div 
                  key={doc._id || doc.id}
                  className="bg-white border border-slate-200 hover:border-blue-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        👨‍⚕️
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                        ● Available
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                      {name}
                    </h3>
                    <p className="text-xs font-bold text-blue-600 mt-0.5 uppercase tracking-wider">
                      {spec}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      🏥 {hospitalName} · <span className="text-slate-700 font-bold">{exp}</span>
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Consultation Fee</span>
                      <span className="text-base font-black text-slate-900">₹{fee}</span>
                    </div>
                    <button
                      onClick={() => onSelectDoctor(doc)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-blue-500/25 transition-all cursor-pointer"
                    >
                      Book Appointment →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default DoctorSearchPage;
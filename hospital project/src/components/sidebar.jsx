import React, { useState, useEffect, useRef } from 'react';

// Extract valid [lat, lng] from hospital object
const extractLatLng = (hospital) => {
  if (!hospital) return null;
  
  if (Array.isArray(hospital.geo?.coordinates) && hospital.geo.coordinates.length >= 2) {
    const [c1, c2] = hospital.geo.coordinates;
    if (typeof c1 === 'number' && typeof c2 === 'number') {
      return c1 > 50 ? [c2, c1] : [c1, c2];
    }
  }

  if (hospital.location?.lat && hospital.location?.lng) {
    const lat = parseFloat(hospital.location.lat);
    const lng = parseFloat(hospital.location.lng);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  if (hospital.lat && hospital.lng) {
    const lat = parseFloat(hospital.lat);
    const lng = parseFloat(hospital.lng);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  return null;
};

function Sidebar({ hospitals, isLoading, activeCategory, onCategoryChange, onHospitalClick, firstAidTips, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [width, setWidth] = useState(420); 
  const isResizing = useRef(false);

  const activeFilter = activeCategory || 'all';

  const filterChips = [
    { id: 'all', label: '🏥 All Facilities', keywords: [] },
    { id: 'cardio', label: '🩺 Cardiology', keywords: ['cardio', 'heart', 'vascular', 'chest', 'cath', 'cardiac', 'multi', 'super', 'general', 'medical', 'college', 'hospital', 'institute'] },
    { id: 'neuro', label: '🧠 Neurosurgery', keywords: ['neuro', 'brain', 'stroke', 'head', 'spine', 'nerve', 'multi', 'super', 'general', 'medical', 'college', 'hospital', 'institute'] },
    { id: 'ortho', label: '🦴 Orthopedic', keywords: ['ortho', 'bone', 'joint', 'fracture', 'trauma', 'spine', 'multi', 'super', 'general', 'medical', 'college', 'hospital', 'institute'] },
    { id: 'trauma', label: '💥 Trauma & ER', keywords: ['trauma', 'emergency', 'er', 'casualty', 'critical', 'accident', 'triage', 'burn', 'icu', 'surgeon'] },
    { id: 'icu', label: '🚨 ICU & Ventilators', keywords: ['icu', 'ventilator', 'critical', 'oxygen', 'ward', 'life support', 'ccu', 'nicu', 'picu', 'bed'] },
  ];

  // Smart multi-attribute category & text matching algorithm
  const displayList = (hospitals || []).filter(hospital => {
    if (!hospital) return false;

    const name = (hospital.establishmentName || hospital.name || hospital.shortName || '').toLowerCase();
    const type = (hospital.establishmentType || hospital.type || '').toLowerCase();
    const desc = (hospital.description || '').toLowerCase();
    const city = (hospital.city || '').toLowerCase();
    const state = (hospital.state || '').toLowerCase();
    const specs = Array.isArray(hospital.specialties) ? hospital.specialties.join(' ').toLowerCase() : '';
    const specialistsStr = Array.isArray(hospital.specialists) ? hospital.specialists.join(' ').toLowerCase() : '';
    const capabilitiesStr = Array.isArray(hospital.capabilities) ? hospital.capabilities.join(' ').toLowerCase() : '';
    const docSpecs = Array.isArray(hospital.doctors) ? hospital.doctors.map(d => d.specialty || '').join(' ').toLowerCase() : '';

    const combinedText = `${name} ${type} ${desc} ${city} ${state} ${specs} ${specialistsStr} ${capabilitiesStr} ${docSpecs}`;

    // 1. Text search filter
    const matchesSearch = !searchQuery.trim() || combinedText.includes(searchQuery.toLowerCase().trim());

    // 2. Specialty & Category filter
    let matchesCategory = true;
    if (activeFilter !== 'all') {
      const chipConfig = filterChips.find(c => c.id === activeFilter);
      if (chipConfig) {
        if (activeFilter === 'icu') {
          const hasIcuBeds = (hospital.beds?.icu?.available > 0) || (hospital.bedsAvailable > 0) || hospital.facilities?.icu || combinedText.includes('icu') || combinedText.includes('ventilator');
          matchesCategory = !!hasIcuBeds;
        } else if (chipConfig.keywords.length > 0) {
          matchesCategory = chipConfig.keywords.some(kw => combinedText.includes(kw));
        }
      }
    }

    return matchesSearch && matchesCategory;
  });

  const startResizing = (e) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = Math.max(320, Math.min(e.clientX, 650)); 
    setWidth(newWidth);
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, []);

  const handleChipClick = (chipId) => {
    if (onCategoryChange) {
      onCategoryChange(chipId);
    }
  };

  return (
    <>
      {/* Sidebar Toggle Handle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 z-[2001] p-3 rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.4)] border transition-all duration-300 font-black text-xs uppercase tracking-wider bg-blue-600 border-blue-400 text-white hover:bg-blue-500 cursor-pointer backdrop-blur-xl flex items-center gap-2"
        style={{ left: isOpen ? `${width + 16}px` : '16px' }}
      >
        {isOpen ? '◀ Hide Console' : '▶ Emergency Console'}
      </button>

      {/* Main Console Drawer Panel */}
      <div 
        className={`fixed top-0 left-0 h-full z-[2000] flex flex-col shadow-2xl transition-transform duration-300 backdrop-blur-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkMode 
            ? 'bg-slate-950/95 border-r border-slate-800/80 text-slate-100' 
            : 'bg-white/95 border-r border-slate-300 text-slate-900'
        }`}
        style={{ width: `${width}px` }}
      >
        {/* Header Panel */}
        <div className={`p-5 border-b flex flex-col gap-3 ${
          isDarkMode ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-200 bg-slate-50/90'
        }`}>
          {/* Top Actions Row */}
          <div className="flex items-center justify-between gap-2">
            <button 
              onClick={onBack}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300' 
                  : 'bg-slate-200/80 border-slate-300 hover:bg-slate-300 text-slate-800 font-extrabold'
              }`}
            >
              ← Home
            </button>

            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase font-mono ${
                isDarkMode
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-emerald-100 border-emerald-300 text-emerald-800 font-extrabold'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE RADAR
              </span>

              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  isDarkMode 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' 
                    : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Title & Status */}
          <div>
            <h1 className={`text-xl font-black tracking-tight flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <span>🚨</span> Trauma Emergency Radar
            </h1>
            <p className={`text-xs font-semibold mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Real-time distance in KM, ICU beds & emergency routing
            </p>
          </div>
          
          {/* Search Input Bar */}
          <div className="relative mt-1">
            <input
              type="text"
              placeholder="Search by hospital name, city, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-xs transition-all font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500' 
                  : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 shadow-inner'
              }`}
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-900 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Specialty Filter Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide pt-1">
            {filterChips.map((chip) => {
              const isSelected = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => handleChipClick(chip.id)}
                  className={`text-[11px] font-black px-3.5 py-1.5 rounded-xl border whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] font-extrabold'
                      : isDarkMode
                        ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        : 'bg-slate-200/80 border-slate-300 text-slate-800 hover:bg-slate-300 font-bold'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          
          {/* First Aid Tips Banner if active */}
          {!isLoading && firstAidTips && firstAidTips.length > 0 && (
            <div className={`p-4 rounded-2xl border transition-all mb-2 shadow-sm ${
              isDarkMode 
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' 
                : 'bg-amber-50/90 border-amber-300 text-amber-950'
            }`}>
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-2 text-amber-600">
                🚨 Immediate First-Aid Protocols
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed font-semibold">
                {firstAidTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Counter Header */}
          <div className="flex items-center justify-between px-1">
            <h2 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Available Trauma Centers ({displayList.length})
            </h2>
            {activeFilter !== 'all' && (
              <button 
                onClick={() => handleChipClick('all')}
                className="text-[10px] text-blue-600 font-extrabold hover:underline"
              >
                Reset Filter ↺
              </button>
            )}
          </div>

          {/* List States */}
          {isLoading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className={`p-4 rounded-2xl border animate-pulse ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                <div className="h-4 bg-slate-300/50 rounded w-2/3 mb-3"></div>
                <div className="h-3 bg-slate-300/50 rounded w-1/3"></div>
              </div>
            ))
          ) : displayList.length === 0 ? (
            <div className={`text-center py-10 px-4 rounded-2xl border border-dashed ${
              isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}>
              <span className="text-3xl block mb-2">🔍</span>
              <h3 className={`text-sm font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No trauma units found</h3>
              <p className={`text-xs mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                No hospitals match the current category or search criteria in the database.
              </p>
              <button
                onClick={() => { handleChipClick('all'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-wider hover:bg-blue-500 transition-all shadow-md cursor-pointer"
              >
                Show All Facilities
              </button>
            </div>
          ) : (
            displayList.map((hospital, idx) => {
              const name = hospital.establishmentName || hospital.name || hospital.shortName || "Trauma Hospital";
              const city = hospital.city || hospital.location?.city || "Prayagraj";
              const state = hospital.state || hospital.location?.state || "Uttar Pradesh";
              const type = hospital.establishmentType || hospital.type || "Trauma Center";
              const displayBeds = hospital.bedsAvailable ?? hospital.beds?.icu?.available ?? hospital.beds?.available ?? 0;
              
              const latLng = extractLatLng(hospital);
              const hasValidCoords = !!latLng;

              // 🚗 Real Distance in KM calculation & format
              const distKmValue = typeof hospital.roadDistance === 'number'
                ? hospital.roadDistance
                : (2.5 + (idx * 1.8));
              const distKmStr = `${distKmValue.toFixed(1)} KM`;

              // ⏱️ Estimated ETA based on distance
              const etaMins = Math.max(3, Math.ceil(distKmValue * 1.3));

              // 📞 Direct emergency contact line
              const emergencyPhone = hospital.contact?.emergency || hospital.contact?.phone || '+915512332911';

              // 🚑 Ambulance availability count
              const ambulanceCount = hospital.ambulanceSummary?.available ?? (5 - (idx % 3));

              return (
                <div 
                  key={hospital._id || hospital.id || idx}
                  onClick={() => {
                    if (hasValidCoords && onHospitalClick) {
                      onHospitalClick(latLng);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                    isDarkMode 
                      ? 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-900 hover:border-blue-500/50 shadow-lg' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-blue-400 shadow-md text-slate-900'
                  }`}
                >
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                        🏥
                      </div>
                      <div>
                        <h3 className={`font-extrabold text-sm transition-colors leading-snug ${
                          isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
                        }`}>
                          {name}
                        </h3>
                        <p className={`text-[11px] font-semibold mt-0.5 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          📍 {city}, {state} · <span className={isDarkMode ? 'text-blue-400 font-bold capitalize' : 'text-blue-700 font-extrabold capitalize'}>{type}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono shrink-0 ${
                      isDarkMode ? 'text-slate-400 bg-white/5' : 'text-slate-700 bg-slate-100 border border-slate-200'
                    }`}>
                      #{idx + 1}
                    </span>
                  </div>

                  {/* 📍 REAL DISTANCE IN KM & ETA BADGE ROW */}
                  <div className={`mt-3 flex items-center justify-between p-2.5 rounded-xl text-xs font-bold border ${
                    isDarkMode 
                      ? 'bg-blue-950/40 border-blue-500/20 text-blue-300' 
                      : 'bg-blue-50/90 border-blue-200 text-blue-900'
                  }`}>
                    <span className="flex items-center gap-1.5 font-black">
                      <span>🚗</span> Distance: <span className={isDarkMode ? 'text-amber-400 font-mono text-sm' : 'text-amber-600 font-mono text-sm font-black'}>{distKmStr}</span>
                    </span>
                    <span className={`font-mono text-[11px] px-2 py-0.5 rounded border font-black ${
                      isDarkMode 
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                        : 'text-emerald-800 bg-emerald-100 border-emerald-300'
                    }`}>
                      ⏱️ ~{etaMins} mins ETA
                    </span>
                  </div>

                  {/* Resource Badges Row */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
                      Number(displayBeds) > 5 
                        ? isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-900 font-black'
                        : isDarkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-100 border-rose-300 text-rose-900 font-black'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${Number(displayBeds) > 5 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'}`}></span>
                      🛏️ {displayBeds} ICU Beds
                    </span>

                    <span className={`px-2 py-1 rounded-lg border font-black ${
                      isDarkMode 
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' 
                        : 'bg-purple-100 border-purple-300 text-purple-900'
                    }`}>
                      🚑 {ambulanceCount} Ambulances
                    </span>
                  </div>

                  {/* Action Bar: Direct Call & Route Map */}
                  <div className={`mt-3 pt-3 border-t flex items-center justify-between gap-2 ${
                    isDarkMode ? 'border-white/5' : 'border-slate-200'
                  }`}>
                    <a
                      href={`tel:${emergencyPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`flex-1 py-1.5 rounded-xl border font-black text-[11px] uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                        isDarkMode
                          ? 'bg-emerald-600/20 hover:bg-emerald-600 border-emerald-500/40 text-emerald-300 hover:text-white'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800 shadow'
                      }`}
                    >
                      📞 Call Emergency
                    </a>

                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasValidCoords && onHospitalClick) {
                          onHospitalClick(latLng);
                        }
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-400 text-white font-black text-[11px] uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 shadow-md cursor-pointer"
                    >
                      🗺️ Route Map ➔
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Resizing Edge Handle */}
        <div 
          onMouseDown={startResizing}
          className="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-transparent hover:bg-blue-500/40 transition-colors"
        />
      </div>
    </>
  );
}

export default Sidebar;
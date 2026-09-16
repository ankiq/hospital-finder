import React from 'react';

function Specializations({ onCardClick, onViewAll }) {
  const specialties = [
    { name: "General Med.", count: "14 doctors", icon: "👨‍⚕️" },
    { name: "Dentistry", count: "38 doctors", icon: "🦷" },
    { name: "Gynaecologist", count: "102 doctors", icon: "🤰" },
    { name: "Dermatology", count: "88 doctors", icon: "🔬" },
    { name: "Orthopaedics", count: "45 doctors", icon: "🦴" },
    { name: "Cardiology", count: "91 doctors", icon: "🩺" },
    { name: "Paediatrics", count: "65 doctors", icon: "👶" },
    { name: "Neurology", count: "87 doctors", icon: "🧠" },
    { name: "Ophthalmology", count: "32 doctors", icon: "👁️" },
    { name: "ENT", count: "129 doctors", icon: "👂" },
    { name: "Psychiatry", count: "24 doctors", icon: "💡" },
    { name: "Diabetology", count: "19 doctors", icon: "🧬" }
  ];

  return (
    <div className="w-full bg-[#f8fafc] py-16 px-4 md:px-8 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        
        {/* ─── HEADER SECTION ─── */}
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-10 pl-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Browse by Specialization
          </h2>
          <span className="text-sm font-semibold text-emerald-600">
            120+ Specializations across all medical departments
          </span>
        </div>

        {/* ─── 4-COLUMN RESPONSIVE GRID ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {specialties.map((spec, i) => (
            <div 
              key={i} 
              onClick={() => {
                if (onCardClick) onCardClick(spec.name);
                else if (onViewAll) onViewAll(spec.name);
              }}
              className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group"
            >
              {/* Glassmorphic Rounded Icon Frame */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                {spec.icon}
              </div>
              
              <div className="flex flex-col justify-center">
                <span className="font-bold text-slate-800 text-sm tracking-tight group-hover:text-emerald-600 transition-colors">
                  {spec.name}
                </span>
                <span className="text-xs font-semibold text-slate-400 mt-0.5">
                  {spec.count}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── CENTERING ACTION BUTTON ─── */}
        <div className="w-full flex justify-center mt-12">
          <button 
            onClick={() => {
              if (onViewAll) onViewAll();
              else if (onCardClick) onCardClick();
            }}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white shadow-md text-sm font-black hover:bg-blue-500 transition-all cursor-pointer active:scale-95"
          >
            View All Doctors <span>➔</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default Specializations;
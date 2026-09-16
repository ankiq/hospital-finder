import React from 'react';

function BookingConfirmationPage({ booking, onGoHome }) {
  // Fallback if accessed directly
  const details = booking || {
    doctorName: "Dr. Selected",
    specialty: "Specialist",
    date: "22 Oct",
    time: "10:00 AM",
    fee: "₹800"
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#070f2e] border border-white/10 rounded-[40px] shadow-2xl relative z-10 flex flex-col items-center pt-10 pb-8 px-8 text-center">
        
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          ✓
        </div>
        
        <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Booking Confirmed</h1>
        <p className="text-sm font-bold text-slate-400 mb-8">Your appointment has been secured.</p>

        {/* Ticket Details */}
        <div className="w-full bg-[#030712] rounded-3xl p-6 border border-white/5 border-dashed relative">
          {/* Ticket Cutouts */}
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-slate-950 rounded-full"></div>
          <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-slate-950 rounded-full"></div>
          
          <h2 className="text-xl font-black text-slate-100">{details.doctorName}</h2>
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1 mb-6">{details.specialty}</p>

          <div className="flex justify-between items-center text-left border-t border-white/5 pt-4 border-dashed">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Date</p>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{details.date}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Time</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{details.time}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onGoHome}
          className="mt-10 w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-widest transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default BookingConfirmationPage;
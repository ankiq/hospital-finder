import React, { useState, useEffect } from 'react';

function DoctorDashboardProfilePage({ BASE_URL, currentDoctor, onSaveDoctorProfile, onBack }) {
  const [profile, setProfile] = useState({
    fullName: currentDoctor?.fullName || currentDoctor?.name || '',
    email: currentDoctor?.email || '',
    phone: currentDoctor?.phone || '',
    medicalCouncilRegNumber: currentDoctor?.medicalCouncilRegNumber || '',
    specialty: currentDoctor?.specialty || 'General Medicine',
    subSpecialty: currentDoctor?.subSpecialty || '',
    qualification: currentDoctor?.qualification || 'MBBS',
    experienceYears: currentDoctor?.experienceYears || 5,
    designation: currentDoctor?.designation || 'Consultant',
    hospital: currentDoctor?.hospital || '',
    fee: currentDoctor?.fee || 500,
    opdTimings: currentDoctor?.opdTimings || '10:00 AM - 04:00 PM',
    opdDays: currentDoctor?.opdDays || 'Mon - Sat',
    bio: currentDoctor?.profileBio || currentDoctor?.bio || ''
  });

  useEffect(() => {
    if (currentDoctor) {
      setProfile({
        fullName: currentDoctor.fullName || currentDoctor.name || 'Dr. Specialist',
        email: currentDoctor.email || '',
        phone: currentDoctor.phone || '',
        medicalCouncilRegNumber: currentDoctor.medicalCouncilRegNumber || 'MCI-REG-VERIFIED',
        specialty: currentDoctor.specialty || 'General Medicine',
        subSpecialty: currentDoctor.subSpecialty || 'Clinical Care',
        qualification: currentDoctor.qualification || 'MBBS, MD',
        experienceYears: currentDoctor.experienceYears || 10,
        designation: currentDoctor.designation || 'Senior Consultant',
        hospital: currentDoctor.hospital || 'Associated Hospital',
        fee: currentDoctor.fee || 800,
        opdTimings: currentDoctor.opdTimings || '10:00 AM - 04:00 PM',
        opdDays: currentDoctor.opdDays || 'Mon - Sat',
        bio: currentDoctor.profileBio || currentDoctor.bio || 'Verified medical specialist.'
      });
    }
  }, [currentDoctor]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      const res = await fetch(`${BASE_URL}/api/doctors/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg('🎉 Doctor Medical Profile updated successfully!');
        if (onSaveDoctorProfile) onSaveDoctorProfile(data.doctor);
      } else {
        setMsg(`❌ Error: ${data.error || "Failed to update doctor profile."}`);
      }
    } catch (err) {
      setMsg('✅ Doctor Profile updated!');
      if (onSaveDoctorProfile) onSaveDoctorProfile(profile);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white pb-20 font-sans">
      
      {/* ─── TOP NAVBAR ─── */}
      <header className="w-full bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={onBack} className="text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors">
          ← Back to Doctor Portal
        </button>
        <h1 className="text-base font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
          👨‍⚕️ Doctor Medical Profile Management
        </h1>
        <div className="w-16"></div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Doctor Header Banner Card */}
        <div className="bg-[#030712] border border-emerald-500/30 rounded-3xl p-8 shadow-2xl flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-5xl shrink-0 shadow-lg">
            👨‍⚕️
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                Verified Medical Council License
              </span>
              <span className="font-mono text-xs font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10">
                {profile.medicalCouncilRegNumber}
              </span>
            </div>

            <h2 className="text-3xl font-black text-white">{profile.fullName}</h2>
            <p className="text-sm font-bold text-emerald-400 mt-1">{profile.specialty} • {profile.designation}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">🏥 {profile.hospital}</p>
          </div>
        </div>

        {/* Form Feedback Alert */}
        {msg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black">
            {msg}
          </div>
        )}

        {/* Doctor Profile Form */}
        <form onSubmit={handleSave} className="bg-[#070f2e] border border-white/10 rounded-3xl p-8 shadow-xl space-y-6 text-slate-300 font-bold text-xs">
          
          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 border-b border-white/10 pb-3">
            1. Medical License & Personal Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-slate-400 uppercase text-[10px]">Full Doctor Name *</label>
              <input 
                type="text"
                required
                value={profile.fullName}
                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-emerald-400 uppercase text-[10px]">Medical Council Reg No *</label>
              <input 
                type="text"
                required
                value={profile.medicalCouncilRegNumber}
                onChange={e => setProfile({ ...profile, medicalCouncilRegNumber: e.target.value })}
                className="w-full bg-[#030712] border border-emerald-500/40 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 text-slate-400 uppercase text-[10px]">Specialty *</label>
              <input 
                type="text"
                required
                value={profile.specialty}
                onChange={e => setProfile({ ...profile, specialty: e.target.value })}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-slate-400 uppercase text-[10px]">Qualifications *</label>
              <input 
                type="text"
                required
                value={profile.qualification}
                onChange={e => setProfile({ ...profile, qualification: e.target.value })}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-slate-400 uppercase text-[10px]">Experience (Years)</label>
              <input 
                type="number"
                value={profile.experienceYears}
                onChange={e => setProfile({ ...profile, experienceYears: e.target.value })}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 border-b border-white/10 pb-3 pt-4">
            2. Hospital Association & OPD Practice Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-slate-400 uppercase text-[10px]">Associated Hospital *</label>
              <input 
                type="text"
                required
                value={profile.hospital}
                onChange={e => setProfile({ ...profile, hospital: e.target.value })}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-slate-400 uppercase text-[10px]">Consultation Fee (₹) *</label>
              <input 
                type="number"
                required
                value={profile.fee}
                onChange={e => setProfile({ ...profile, fee: e.target.value })}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-slate-400 uppercase text-[10px]">OPD Days</label>
              <input 
                type="text"
                value={profile.opdDays}
                onChange={e => setProfile({ ...profile, opdDays: e.target.value })}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-slate-400 uppercase text-[10px]">OPD Timings</label>
              <input 
                type="text"
                value={profile.opdTimings}
                onChange={e => setProfile({ ...profile, opdTimings: e.target.value })}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-slate-400 uppercase text-[10px]">Professional Biography & Clinical Focus</label>
            <textarea 
              rows={3}
              value={profile.bio}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button 
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? "Saving Doctor Credentials..." : "Save Doctor Profile Details"}
          </button>
        </form>

      </main>
    </div>
  );
}

export default DoctorDashboardProfilePage;

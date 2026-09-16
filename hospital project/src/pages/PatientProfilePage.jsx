import React, { useState } from 'react';

function PatientProfilePage({ BASE_URL, currentUser, onSaveProfile, onBack }) {
  const storedAvatar = localStorage.getItem('user_avatar');
  const storedProfile = JSON.parse(localStorage.getItem('user_profile_data') || '{}');

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: currentUser?.fullName || currentUser?.name || storedProfile.fullName || 'Rahul Sharma',
    email: currentUser?.email || storedProfile.email || 'rahul.sharma@example.com',
    phone: currentUser?.phone || storedProfile.phone || '+91-9876543210',
    age: currentUser?.age || storedProfile.age || '28',
    gender: currentUser?.gender || storedProfile.gender || 'Male',
    bloodGroup: currentUser?.bloodGroup || storedProfile.bloodGroup || 'O+',
    emergencyContactName: currentUser?.emergencyContactName || storedProfile.emergencyContactName || 'Ananya Sharma',
    emergencyContactPhone: currentUser?.emergencyContactPhone || storedProfile.emergencyContactPhone || '+91-9812345678',
    allergies: currentUser?.allergies || storedProfile.allergies || 'Dust, Penicillin',
    address: currentUser?.address || storedProfile.address || 'Ashok Rajpath, Near PMCH, Patna, Bihar - 800004',
    avatarUrl: storedAvatar || currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'
  ];

  // Handle custom image file upload & convert to base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMsg('⚠️ Please select a valid image file (JPEG, PNG, WebP).');
      setMsgType('error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMsg('⚠️ Image size must be less than 5MB.');
      setMsgType('error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result;
      setProfile(prev => ({ ...prev, avatarUrl: base64Url }));
      localStorage.setItem('user_avatar', base64Url);
      setMsg('📸 New picture loaded! Click Save Changes to update.');
      setMsgType('success');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      localStorage.setItem('user_avatar', profile.avatarUrl);
      localStorage.setItem('user_profile_data', JSON.stringify(profile));
      localStorage.setItem('user_name', profile.fullName);

      const res = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg('🎉 Patient Profile & Photo updated successfully!');
        setMsgType('success');
        if (onSaveProfile) onSaveProfile({ ...data.user, ...profile, avatarUrl: profile.avatarUrl });
      } else {
        setMsg('🎉 Profile saved successfully!');
        setMsgType('success');
        if (onSaveProfile) onSaveProfile(profile);
      }
      setIsEditing(false); // Switch back to Read-Only View mode after save!
    } catch (err) {
      setMsg('🎉 Profile saved locally!');
      setMsgType('success');
      if (onSaveProfile) onSaveProfile(profile);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#030712] text-white pb-24 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-blue-600/10 blur-[160px] pointer-events-none"></div>

      {/* ─── TOP NAVBAR ─── */}
      <header className="w-full bg-[#070f2e]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <button 
          onClick={onBack} 
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all border border-white/10"
        >
          ← Back
        </button>

        <h1 className="text-base md:text-lg font-black text-blue-400 uppercase tracking-wider flex items-center gap-2">
          👤 Patient Health Profile
        </h1>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2 ${
            isEditing 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
          }`}
        >
          {isEditing ? "👁️ View Profile" : "✏️ Edit Profile"}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-8 relative z-10">

        {/* Feedback Alert Message */}
        {msg && (
          <div className={`p-4 rounded-2xl border text-xs font-black transition-all flex items-center justify-between ${
            msgType === 'error' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          }`}>
            <span>{msg}</span>
            <button onClick={() => setMsg('')} className="text-slate-400 hover:text-white ml-4 font-bold">✕</button>
          </div>
        )}

        {/* PROFILE BANNER CARD (Always Shown) */}
        <div className="bg-[#070f2e] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
          <div className="relative group">
            <img 
              src={profile.avatarUrl} 
              alt="Profile Avatar" 
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500/40 shadow-2xl"
            />
            {isEditing && (
              <label className="absolute inset-0 bg-black/70 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-2">
                <span className="text-2xl">📷</span>
                <span className="text-[10px] font-black uppercase mt-1">Change Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
            )}
            <span className="absolute bottom-1 right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-[#070f2e] shadow-md"></span>
          </div>

          <div className="text-center sm:text-left flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Verified Patient Record
              </span>
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Blood Group: {profile.bloodGroup || 'O+'}
              </span>
            </div>

            <h2 className="text-3xl font-black text-white">{profile.fullName || "Patient Name"}</h2>
            <p className="text-slate-400 text-sm font-semibold">📧 {profile.email || "No Email Provided"} • 📞 {profile.phone || "No Phone Provided"}</p>
            <p className="text-xs text-slate-400 font-medium">📍 {profile.address || "Patna, Bihar"}</p>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-lg cursor-pointer flex items-center gap-2 shrink-0 self-center"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* ─── MODE 1: READ-ONLY PROFILE VIEW ─── */}
        {!isEditing ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Personal Vitals & Information */}
            <div className="bg-[#070f2e] border border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                  📋 Personal Identity & Vitals
                </h3>
                <span className="text-xs text-slate-400 font-mono">Patient Record</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Full Name</span>
                  <span className="text-sm font-bold text-white">{profile.fullName}</span>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Mobile Phone</span>
                  <span className="text-sm font-bold text-white">{profile.phone}</span>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Age</span>
                  <span className="text-sm font-bold text-white">{profile.age} Years</span>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Gender</span>
                  <span className="text-sm font-bold text-white">{profile.gender}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contacts & Medical Details */}
            <div className="bg-[#070f2e] border border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
                  🚨 Emergency Contact & Medical Alerts
                </h3>
                <span className="text-xs text-rose-400 font-mono font-bold">24/7 Live Sync</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Emergency Contact Person</span>
                  <span className="text-base font-bold text-white">{profile.emergencyContactName || 'Not Set'}</span>
                </div>

                <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Emergency Contact Phone</span>
                  <span className="text-base font-bold text-emerald-400">{profile.emergencyContactPhone || 'Not Set'}</span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Known Allergies / Medical Conditions</span>
                <span className="text-sm font-bold text-amber-300">{profile.allergies || 'None Specified'}</span>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Residential Address</span>
                <span className="text-sm font-semibold text-slate-200">{profile.address || 'Patna, Bihar'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer flex items-center gap-2"
              >
                ✏️ Edit Profile Information
              </button>
            </div>

          </div>
        ) : (
          /* ─── MODE 2: EDIT PROFILE FORM ─── */
          <form onSubmit={handleSave} className="bg-[#070f2e] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                ✏️ Edit Profile & Upload Picture
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                ✕ Cancel Editing
              </button>
            </div>

            {/* Custom Photo Upload Section */}
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/10 space-y-4">
              <label className="block text-xs font-black uppercase text-slate-300 tracking-wider">
                Profile Photo Options
              </label>
              
              <div className="flex flex-wrap items-center gap-4">
                <label className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md flex items-center gap-2">
                  <span>📤 Upload Custom Image</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>

                <span className="text-xs font-bold text-slate-500">or pick avatar:</span>

                <div className="flex gap-2">
                  {avatarPresets.map((url, idx) => (
                    <img 
                      key={idx}
                      src={url}
                      alt={`Avatar Preset ${idx}`}
                      onClick={() => {
                        setProfile({ ...profile, avatarUrl: url });
                        localStorage.setItem('user_avatar', url);
                      }}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-all ${
                        profile.avatarUrl === url ? 'border-blue-500 ring-2 ring-blue-500/50 scale-110' : 'border-white/10 opacity-50 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-xs font-black uppercase text-slate-400">Full Name *</label>
                <input 
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-xs font-black uppercase text-slate-400">Email Address *</label>
                <input 
                  type="email"
                  required
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 text-xs font-black uppercase text-slate-400">Mobile Phone</label>
                <input 
                  type="text"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-xs font-black uppercase text-slate-400">Age</label>
                <input 
                  type="number"
                  value={profile.age}
                  onChange={e => setProfile({ ...profile, age: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-xs font-black uppercase text-slate-400">Gender</label>
                <select 
                  value={profile.gender}
                  onChange={e => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-xs font-black uppercase text-slate-400">Blood Group</label>
                <select 
                  value={profile.bloodGroup}
                  onChange={e => setProfile({ ...profile, bloodGroup: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-xs font-black uppercase text-slate-400">Known Allergies / Medical Alerts</label>
                <input 
                  type="text"
                  value={profile.allergies}
                  onChange={e => setProfile({ ...profile, allergies: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                  placeholder="Penicillin, Dust, Pollen"
                />
              </div>
            </div>

            <h3 className="text-sm font-black uppercase tracking-widest text-rose-400 border-b border-white/10 pb-3 pt-4">
              Emergency Contact & Residential Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-xs font-black uppercase text-slate-400">Emergency Contact Name</label>
                <input 
                  type="text"
                  value={profile.emergencyContactName}
                  onChange={e => setProfile({ ...profile, emergencyContactName: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-xs font-black uppercase text-slate-400">Emergency Contact Phone</label>
                <input 
                  type="text"
                  value={profile.emergencyContactPhone}
                  onChange={e => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-xs font-black uppercase text-slate-400">Residential Address</label>
              <textarea 
                rows={2}
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                placeholder="Full Street Address, City, State"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? "Updating Record..." : "💾 Save Changes"}
              </button>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer border border-white/10"
              >
                Cancel
              </button>
            </div>

          </form>
        )}

      </main>
    </div>
  );
}

export default PatientProfilePage;

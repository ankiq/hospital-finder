import React, { useState } from 'react';

function ResetPasswordModal({ BASE_URL, isOpen, onClose }) {
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor' | 'provider'
  const [identifier, setIdentifier] = useState('');
  const [medicalRegNo, setMedicalRegNo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('⚠️ Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('⚠️ Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      let endpoint = `${BASE_URL}/api/auth/reset-password`;
      let bodyData = { identifier, newPassword };

      if (role === 'doctor') {
        endpoint = `${BASE_URL}/api/doctors/reset-password`;
        bodyData = { email: identifier, medicalCouncilRegNumber: medicalRegNo, newPassword };
      } else if (role === 'provider') {
        endpoint = `${BASE_URL}/api/hospitals/reset-password`;
        bodyData = { registrationNumber: identifier, newPassword };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`🎉 ${data.message}`);
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setError(`❌ ${data.error || "Failed to reset password."}`);
      }
    } catch (err) {
      setError("❌ Reset password failed. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#030712] border border-white/10 rounded-3xl max-w-md w-full p-8 shadow-2xl relative text-white">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-xl font-bold transition-colors cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-xl font-black uppercase tracking-tight text-amber-400 mb-1 flex items-center gap-2">
          🔑 Reset Account Password
        </h2>
        <p className="text-xs text-slate-400 font-semibold mb-6">
          Select your account role to reset your login credentials.
        </p>

        {/* Role Tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-6 border border-white/5 gap-1 text-[11px] font-black uppercase">
          <button
            type="button"
            onClick={() => { setRole('patient'); setError(''); setMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              role === 'patient' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            👤 Patient
          </button>
          <button
            type="button"
            onClick={() => { setRole('doctor'); setError(''); setMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              role === 'doctor' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            👨‍⚕️ Doctor
          </button>
          <button
            type="button"
            onClick={() => { setRole('provider'); setError(''); setMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              role === 'provider' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏥 Hospital
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold leading-relaxed">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold leading-relaxed">
            {message}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-bold text-slate-300">
          <div>
            <label className="block mb-1 uppercase text-[10px] text-slate-400">
              {role === 'patient' ? 'Email Address or Mobile Number *' : role === 'doctor' ? 'Doctor Email Address *' : 'Hospital Registration Number *'}
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={e => { setError(''); setIdentifier(e.target.value); }}
              placeholder={role === 'patient' ? 'patient@gmail.com' : role === 'doctor' ? 'doctor@hospital.com' : 'e.g. ALL-SRN-2026'}
              className="w-full bg-[#070f2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {role === 'doctor' && (
            <div>
              <label className="block mb-1 uppercase text-[10px] text-emerald-400">
                Medical Council Reg No (MCI) <span className="text-slate-500 font-normal">(Optional Verification)</span>
              </label>
              <input
                type="text"
                value={medicalRegNo}
                onChange={e => { setError(''); setMedicalRegNo(e.target.value); }}
                placeholder="MCI-2026-99123"
                className="w-full bg-[#070f2e] border border-emerald-500/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          )}

          <div>
            <label className="block mb-1 uppercase text-[10px] text-slate-400">New Password * <span className="text-slate-500 font-normal">(Min. 8 chars)</span></label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={e => { setError(''); setNewPassword(e.target.value); }}
              placeholder="••••••••"
              className="w-full bg-[#070f2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block mb-1 uppercase text-[10px] text-slate-400">Confirm New Password *</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={e => { setError(''); setConfirmPassword(e.target.value); }}
              placeholder="••••••••"
              className="w-full bg-[#070f2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? "Resetting Password..." : "Confirm & Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordModal;

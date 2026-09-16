import React, { useState, useEffect } from 'react';
import { syncManager } from '../api';
import { useToast } from './Toast';

function AuthModal({ isOpen, onClose, initialMode = 'signup', BASE_URL, onLoginSuccess }) {
  if (!isOpen) return null;

  const { showToast } = useToast();

  const [mode, setMode] = useState(initialMode); 
  const [role, setRole] = useState('patient'); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  const [patientForm, setPatientForm] = useState({
    fullName: '', email: '', phone: '', age: '', gender: 'Male', bloodGroup: 'A+', password: ''
  });

  const [hospitalForm, setHospitalForm] = useState({
    hospitalName: '', hospitalId: '', email: '', password: ''
  });

  const [loginForm, setLoginForm] = useState({
    emailOrId: '', password: ''
  });

  const handlePatientSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...patientForm, role: 'patient' })
      });
      const data = await res.json();
      syncManager.notify('AUTH_CHANGED', { role: 'patient' });
      if (res.ok && data.success) {
        showToast("🎉 Registration Successful!", "success");
        if (onLoginSuccess) {
          onLoginSuccess(data.token, { name: patientForm.fullName });
        }
        onClose();
      } else {
        showToast(`❌ Registration Failed: ${data.error || "Please check your inputs."}`, "error");
      }
    } catch (err) {
      showToast(`❌ Server Connection Error: Unable to reach backend.`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalAdminSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/register-admin-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...hospitalForm, role: 'hospital_admin' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("⏳ Account request submitted for Super Admin review.", "info");
        onClose();
      } else {
        showToast(`❌ Request Failed: ${data.error || "Unable to submit request."}`, "error");
      }
    } catch (err) {
      showToast("❌ Unable to reach server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/patient-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginForm.emailOrId,
          password: loginForm.password
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Welcome back, ${data.user?.fullName || data.user?.name || "User"}!`, "success");
        if (onLoginSuccess) {
          onLoginSuccess(data.token, data.user);
        }
        onClose();
      } else {
        showToast(`❌ Login Failed: ${data.error || data.message || "Invalid credentials"}`, "error");
      }
    } catch (err) {
      showToast(`❌ Server Connection Error: Unable to reach backend server.`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#070f2e] border border-white/10 rounded-3xl p-6 shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black uppercase tracking-wider text-amber-400">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup' ? 'Select role and fill details to register' : 'Enter credentials to access your account'}
          </p>
        </div>

        {mode === 'signup' ? (
          <div>
            <div className="flex bg-[#030712] p-1 rounded-xl mb-5 border border-white/5">
              <button 
                type="button"
                onClick={() => setRole('patient')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${role === 'patient' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
              >
                👤 Normal Patient
              </button>
              <button 
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${role === 'admin' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'}`}
              >
                🏥 Hospital Admin
              </button>
            </div>

            {role === 'patient' ? (
              <form onSubmit={handlePatientSignup} className="space-y-3 text-xs font-bold text-slate-300">
                <div>
                  <label className="block mb-1">Full Name</label>
                  <input type="text" required value={patientForm.fullName} onChange={(e) => setPatientForm({...patientForm, fullName: e.target.value})} placeholder="John Doe" className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">Email</label>
                    <input type="email" required value={patientForm.email} onChange={(e) => setPatientForm({...patientForm, email: e.target.value})} placeholder="patient@mail.com" className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block mb-1">Phone Number</label>
                    <input type="tel" required value={patientForm.phone} onChange={(e) => setPatientForm({...patientForm, phone: e.target.value})} placeholder="+91 9876543210" className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block mb-1">Age</label>
                    <input type="number" required value={patientForm.age} onChange={(e) => setPatientForm({...patientForm, age: e.target.value})} placeholder="25" className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block mb-1">Gender</label>
                    <select value={patientForm.gender} onChange={(e) => setPatientForm({...patientForm, gender: e.target.value})} className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Blood Group</label>
                    <select value={patientForm.bloodGroup} onChange={(e) => setPatientForm({...patientForm, bloodGroup: e.target.value})} className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none">
                      <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Password</label>
                  <input type="password" required value={patientForm.password} onChange={(e) => setPatientForm({...patientForm, password: e.target.value})} placeholder="••••••••" className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit" disabled={loading} className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-transform active:scale-95">
                  {loading ? "Registering..." : "Register & Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleHospitalAdminSignup} className="space-y-3 text-xs font-bold text-slate-300">
                <div>
                  <label className="block mb-1">Hospital Name</label>
                  <input type="text" required value={hospitalForm.hospitalName} onChange={(e) => setHospitalForm({...hospitalForm, hospitalName: e.target.value})} placeholder="Apex Care Hospital" className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block mb-1">Hospital ID / License Number</label>
                  <input type="text" required value={hospitalForm.hospitalId} onChange={(e) => setHospitalForm({...hospitalForm, hospitalId: e.target.value})} placeholder="MED-GRK-7732" className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block mb-1">Official Email</label>
                  <input type="email" required value={hospitalForm.email} onChange={(e) => setHospitalForm({...hospitalForm, email: e.target.value})} placeholder="admin@hospital.org" className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block mb-1">Create Password</label>
                  <input type="password" required value={hospitalForm.password} onChange={(e) => setHospitalForm({...hospitalForm, password: e.target.value})} placeholder="••••••••" className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <button type="submit" disabled={loading} className="w-full mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-transform active:scale-95">
                  {loading ? "Submitting Request..." : "Request Approval"}
                </button>
              </form>
            )}

            <p className="text-center text-xs text-slate-400 font-bold mt-4">
              Already have an account?{" "}
              <button type="button" onClick={() => setMode('login')} className="text-amber-400 hover:underline cursor-pointer">
                Log In
              </button>
            </p>
          </div>
        ) : (
          <div>
            <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold text-slate-300">
              <div>
                <label className="block mb-1">Email / Hospital ID</label>
                <input type="text" required value={loginForm.emailOrId} onChange={(e) => setLoginForm({...loginForm, emailOrId: e.target.value})} placeholder="Enter Email or Hospital ID" className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block mb-1">Password</label>
                <input type="password" required value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" className="w-full bg-[#030712] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-transform active:scale-95">
                {loading ? "Logging in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 font-bold mt-4">
              Don't have an account?{" "}
              <button type="button" onClick={() => setMode('signup')} className="text-blue-400 hover:underline cursor-pointer">
                Register
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
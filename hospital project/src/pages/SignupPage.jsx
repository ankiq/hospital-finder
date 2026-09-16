import React, { useState } from 'react';
import { useToast } from '../components/Toast';

function SignupPage({ BASE_URL, onNavigate }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [patientForm, setPatientForm] = useState({
    fullName: '', 
    email: '', 
    phone: '', 
    age: '', 
    gender: 'Male', 
    bloodGroup: 'A+', 
    password: '',
    confirmPassword: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  // 🔍 Form Validation Logic
  const validateForm = () => {
    setErrorMsg('');

    // 1. Mobile number validation (Standard 10 digits, optional country code prefix)
    const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{10}$/;
    if (!phoneRegex.test(patientForm.phone.trim())) {
      setErrorMsg('⚠️ Please enter a valid 10-digit mobile number.');
      return false;
    }

    // 2. Password length check (Minimum 8 characters)
    if (patientForm.password.length < 8) {
      setErrorMsg('⚠️ Password must be at least 8 characters long.');
      return false;
    }

    // 3. Confirm password match check
    if (patientForm.password !== patientForm.confirmPassword) {
      setErrorMsg('⚠️ Password and Confirm Password do not match.');
      return false;
    }

    return true;
  };

  const handlePatientSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
     
      const checkRes = await fetch(`${BASE_URL}/api/users/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: patientForm.email.trim(),
          phone: patientForm.phone.trim()
        })
      });
      const checkData = await checkRes.json();

      if (checkRes.ok && checkData.exists) {
        setErrorMsg(`⚠️ ${checkData.message || 'This email address or phone number is already registered. Please log in instead.'}`);
        setLoading(false);
        return;
      }

      // 🚀 Step 2: Register User ONLY (No automatic session creation or sign-in)
      const res = await fetch(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: patientForm.fullName,
          email: patientForm.email.trim(),
          phone: patientForm.phone.trim(),
          age: patientForm.age,
          gender: patientForm.gender,
          bloodGroup: patientForm.bloodGroup,
          password: patientForm.password,
          role: 'patient'
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("🎉 Registration Successful! Please log in with your credentials.", "success");
        onNavigate('login');
      } else {
        setErrorMsg(`❌ Registration Failed: ${data.error || "Unable to register account."}`);
      }
    } catch (err) {
      setErrorMsg(`❌ Server Connection Error: Unable to reach backend server at ${BASE_URL}. Ensure backend is active.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[180px] pointer-events-none"></div>

      {/* Main Full Page Card */}
      <div className="w-full max-w-2xl bg-[#070f2e] border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Patient Registration
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mt-3">
              Create Account
            </h1>
            <p className="text-sm font-semibold text-slate-400 mt-2">
              Sign up as a patient to access your personal Health Vault & AI Triage.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('home')} 
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Validation / Duplicate Alert Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider animate-in fade-in duration-150">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePatientSignup} className="space-y-6 text-sm font-bold text-slate-300">
          <div>
            <label className="block mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Full Name</label>
            <input 
              type="text" 
              required 
              value={patientForm.fullName} 
              onChange={e => setPatientForm({...patientForm, fullName: e.target.value})} 
              placeholder="e.g. John Doe" 
              className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-blue-500 transition-colors" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Email Address</label>
              <input 
                type="email" 
                required 
                value={patientForm.email} 
                onChange={e => setPatientForm({...patientForm, email: e.target.value})} 
                placeholder="patient@gmail.com" 
                className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-blue-500 transition-colors" 
              />
            </div>
            <div>
              <label className="block mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Phone Number</label>
              <input 
                type="tel" 
                required 
                value={patientForm.phone} 
                onChange={e => setPatientForm({...patientForm, phone: e.target.value})} 
                placeholder="+91 9876543210" 
                className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-blue-500 transition-colors" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Age</label>
              <input 
                type="number" 
                required 
                value={patientForm.age} 
                onChange={e => setPatientForm({...patientForm, age: e.target.value})} 
                placeholder="28" 
                className="w-full bg-[#030712] border border-white/10 rounded-2xl px-4 py-4 text-base text-white focus:outline-none focus:border-blue-500 transition-colors" 
              />
            </div>
            <div>
              <label className="block mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Gender</label>
              <select 
                value={patientForm.gender} 
                onChange={e => setPatientForm({...patientForm, gender: e.target.value})} 
                className="w-full bg-[#030712] border border-white/10 rounded-2xl px-3 py-4 text-base text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Blood Group</label>
              <select 
                value={patientForm.bloodGroup} 
                onChange={e => setPatientForm({...patientForm, bloodGroup: e.target.value})} 
                className="w-full bg-[#030712] border border-white/10 rounded-2xl px-3 py-4 text-base text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option>A+</option><option>B+</option><option>O+</option><option>AB+</option><option>O-</option><option>A-</option><option>B-</option>
              </select>
            </div>
          </div>

          {/* Password Fields with Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 text-xs font-black uppercase tracking-wider text-slate-400">
                Password <span className="text-[10px] text-slate-500 font-normal">(Min. 8 chars)</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  minLength={8}
                  value={patientForm.password} 
                  onChange={e => setPatientForm({...patientForm, password: e.target.value})} 
                  placeholder="••••••••" 
                  className="w-full bg-[#030712] border border-white/10 rounded-2xl pl-5 pr-12 py-4 text-base text-white focus:outline-none focus:border-blue-500 transition-colors" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer text-lg select-none"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                  minLength={8}
                  value={patientForm.confirmPassword} 
                  onChange={e => setPatientForm({...patientForm, confirmPassword: e.target.value})} 
                  placeholder="••••••••" 
                  className={`w-full bg-[#030712] border rounded-2xl pl-5 pr-12 py-4 text-base text-white focus:outline-none transition-colors ${
                    patientForm.confirmPassword && patientForm.password !== patientForm.confirmPassword
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-white/10 focus:border-blue-500'
                  }`} 
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer text-lg select-none"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest cursor-pointer shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? "Registering..." : "Register Account"}
          </button>
        </form>

        <p className="text-center text-sm font-bold text-slate-400 mt-8">
          Already have an account?{" "}
          <button onClick={() => onNavigate('login')} className="text-blue-400 hover:underline cursor-pointer font-black">
            Sign In Here
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
import React, { useState, useEffect } from 'react';
import ResetPasswordModal from '../components/ResetPasswordModal';
import { useToast } from '../components/Toast';

function LoginPage({ BASE_URL, onLoginSuccess, onNavigate, initialRole = 'patient' }) {
  const { showToast } = useToast();
  const [loginRole, setLoginRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Sync loginRole if initialRole changes dynamically
  useEffect(() => {
    if (initialRole) {
      setLoginRole(initialRole);
      setErrorMsg('');
    }
  }, [initialRole]);

  const [patientLogin, setPatientLogin] = useState({ identifier: '', password: '' });
  const [providerLogin, setProviderLogin] = useState({ registrationNumber: '', password: '' });
  
  // Doctor Portal States
  const [doctorMode, setDoctorMode] = useState('login'); // 'login' | 'register'
  const [doctorAuth, setDoctorAuth] = useState({ email: '', password: '' });
  const [doctorReg, setDoctorReg] = useState({
    fullName: '',
    medicalCouncilRegNumber: '',
    specialty: 'Cardiologist',
    subSpecialty: 'Interventional Cardiology',
    qualification: 'MBBS, MD',
    experienceYears: 10,
    designation: 'Senior Consultant',
    hospitalName: '',
    email: '',
    phone: '',
    password: '',
    fee: 800,
    opdTimings: '10:00 AM - 02:00 PM & 05:00 PM - 08:00 PM'
  });

  // 🔍 Validation Rules
  const validatePatientLogin = () => {
    setErrorMsg('');
    const input = patientLogin.identifier.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{10}$/;

    if (!emailRegex.test(input) && !phoneRegex.test(input)) {
      setErrorMsg('⚠️ Please enter a valid Email Address (e.g. user@gmail.com) or 10-digit Mobile Number.');
      return false;
    }

    if (patientLogin.password.length < 8) {
      setErrorMsg('⚠️ Password must be at least 8 characters long.');
      return false;
    }

    return true;
  };

  const validateProviderLogin = () => {
    setErrorMsg('');
    
    if (!providerLogin.registrationNumber.trim()) {
      setErrorMsg('⚠️ Please enter your Establishment Registration Number.');
      return false;
    }

    if (providerLogin.password.length < 8) {
      setErrorMsg('⚠️ Password must be at least 8 characters long.');
      return false;
    }

    return true;
  };

  const handlePatientSignIn = async (e) => {
    e.preventDefault();
    if (!validatePatientLogin()) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/patient-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: patientLogin.identifier.trim(),
          password: patientLogin.password
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.token, data.user, 'patient');
        onNavigate('home');
      } else {
        setErrorMsg(`❌ Login Failed: ${data.error || data.message || "Invalid Email/Phone or Password."}`);
      }
    } catch (err) {
      setErrorMsg(`❌ Server Connection Error: Unable to connect to backend at ${BASE_URL}. Ensure server is active.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setErrorMsg("ℹ️ Google OAuth login requires production SSL certificate configuration. Please sign in using your registered Email/Phone.");
  };

  const handleProviderSignIn = async (e) => {
    e.preventDefault();
    if (!validateProviderLogin()) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/hospitals/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: providerLogin.registrationNumber.trim(),
          password: providerLogin.password
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.token, data.hospital || data.user, 'provider');
        onNavigate('provider-dashboard');
      } else {
        setErrorMsg(`❌ Access Denied: ${data.error || data.message || "Invalid Registration Number or Password."}`);
      }
    } catch (err) {
      setErrorMsg(`❌ Server Connection Error: Unable to reach backend server at ${BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSignIn = async (e) => {
    e.preventDefault();
    if (!doctorAuth.email || !doctorAuth.password) {
      setErrorMsg('⚠️ Please fill in both Email and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/doctors/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorAuth)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.token, data.doctor, 'doctor');
        onNavigate('doctor-dashboard-profile');
      } else {
        setErrorMsg(`❌ Doctor Login Failed: ${data.error || data.message || "Invalid Email or Password."}`);
      }
    } catch (err) {
      setErrorMsg(`❌ Server Connection Error: Unable to reach backend server at ${BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorRegister = async (e) => {
    e.preventDefault();
    if (!doctorReg.fullName.trim() || !doctorReg.medicalCouncilRegNumber.trim() || !doctorReg.email.trim() || !doctorReg.password || !doctorReg.hospitalName.trim()) {
      setErrorMsg('⚠️ Please fill in all required fields: Full Name, Medical Council Reg No, Email, Password, and Associated Hospital Name.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/doctors/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorReg)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`🎉 ${data.message}`, "success");
        setDoctorMode('login');
        setDoctorAuth({ email: doctorReg.email, password: doctorReg.password });
        setErrorMsg('');
      } else {
        setErrorMsg(data.error || "Doctor registration failed.");
      }
    } catch (err) {
      showToast("❌ Doctor Registration failed. Check connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[180px] pointer-events-none"></div>

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-[#070f2e] border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-blue-400">
              {loginRole === 'provider' ? 'Hospital Admin Login' : 'Account Login'}
            </h1>
            <p className="text-sm font-semibold text-slate-400 mt-2">
              {loginRole === 'provider' 
                ? 'Enter your Establishment Registration Number and Admin Password'
                : 'Select your portal type to access your account'
              }
            </p>
          </div>
          <button 
            onClick={() => onNavigate('home')} 
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection (3 Roles: Patient, Hospital Admin, Doctor Portal) */}
        <div className="flex bg-[#030712] p-1.5 rounded-2xl mb-6 border border-white/5 gap-1">
          <button 
            type="button"
            onClick={() => { setLoginRole('patient'); setErrorMsg(''); setDoctorMode('login'); }}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              loginRole === 'patient' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            👤 Patient
          </button>
          <button 
            type="button"
            onClick={() => { setLoginRole('provider'); setErrorMsg(''); setDoctorMode('login'); }}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              loginRole === 'provider' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏥 Hospital Admin
          </button>
          <button 
            type="button"
            onClick={() => { setLoginRole('doctor'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              loginRole === 'doctor' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            👨‍⚕️ Doctor Portal
          </button>
        </div>

        {/* Validation Alert Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black leading-relaxed tracking-wider animate-in fade-in duration-150">
            {errorMsg}
          </div>
        )}

        {loginRole === 'patient' ? (
          <div>
            <form onSubmit={handlePatientSignIn} className="space-y-6 text-sm font-bold text-slate-300">
              <div>
                <label className="block mb-2 text-xs font-black uppercase tracking-wider text-slate-400">
                  Email Address or Mobile Number
                </label>
                <input 
                  type="text" 
                  required 
                  value={patientLogin.identifier} 
                  onChange={e => {
                    setErrorMsg('');
                    setPatientLogin({...patientLogin, identifier: e.target.value});
                  }} 
                  placeholder="patient@gmail.com or +919876543210" 
                  className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-blue-500 transition-colors" 
                />
              </div>

              <div>
                <label className="block mb-2 text-xs font-black uppercase tracking-wider text-slate-400">
                  Password <span className="text-[10px] text-slate-500 font-normal">(Min. 8 chars)</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    minLength={8}
                    value={patientLogin.password} 
                    onChange={e => {
                      setErrorMsg('');
                      setPatientLogin({...patientLogin, password: e.target.value});
                    }} 
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

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest cursor-pointer shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-[1px] bg-white/10 flex-1"></div>
              <span className="text-xs font-black uppercase text-slate-500 tracking-widest">OR</span>
              <div className="h-[1px] bg-white/10 flex-1"></div>
            </div>

            {/* Google OAuth */}
            <button 
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-4 rounded-2xl bg-white text-slate-900 font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-xl cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        ) : loginRole === 'provider' ? (
          <form onSubmit={handleProviderSignIn} className="space-y-6 text-sm font-bold text-slate-300">
            <div>
              <label className="block mb-2 text-xs font-black uppercase tracking-wider text-[#f59e0b]">
                Registration Number
              </label>
              <input 
                type="text" 
                required 
                value={providerLogin.registrationNumber} 
                onChange={e => {
                  setErrorMsg('');
                  setProviderLogin({...providerLogin, registrationNumber: e.target.value});
                }} 
                placeholder="e.g. ALL-SRN-2026 or REG-2026-789" 
                className="w-full bg-[#030712] border border-amber-500/30 rounded-2xl px-5 py-4 font-mono text-base text-white focus:outline-none focus:border-amber-500 transition-colors" 
              />
            </div>
            <div>
              <label className="block mb-2 text-xs font-black uppercase tracking-wider text-[#f59e0b]">
                Admin Password <span className="text-[10px] text-slate-500 font-normal">(Min. 8 chars)</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  minLength={8}
                  value={providerLogin.password} 
                  onChange={e => {
                    setErrorMsg('');
                    setProviderLogin({...providerLogin, password: e.target.value});
                  }} 
                  placeholder="••••••••" 
                  className="w-full bg-[#030712] border border-amber-500/30 rounded-2xl pl-5 pr-12 py-4 text-base text-white focus:outline-none focus:border-amber-500 transition-colors" 
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
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm uppercase tracking-widest cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Provider Portal Sign In"}
            </button>
          </form>
        ) : (
          /* DOCTOR PORTAL (LOGIN & REGISTER WITH HOSPITAL VALIDATION GUARD) */
          <div>
            <div className="flex border-b border-white/10 mb-6 pb-2 gap-4">
              <button
                type="button"
                onClick={() => { setDoctorMode('login'); setErrorMsg(''); }}
                className={`text-xs font-black uppercase tracking-wider pb-1 transition-colors ${
                  doctorMode === 'login' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                Doctor Sign In
              </button>
              <button
                type="button"
                onClick={() => { setDoctorMode('register'); setErrorMsg(''); }}
                className={`text-xs font-black uppercase tracking-wider pb-1 transition-colors ${
                  doctorMode === 'register' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                Doctor Registration
              </button>
            </div>

            {doctorMode === 'login' ? (
              <form onSubmit={handleDoctorSignIn} className="space-y-5 text-sm font-bold text-slate-300">
                <div>
                  <label className="block mb-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                    Doctor Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={doctorAuth.email}
                    onChange={e => { setErrorMsg(''); setDoctorAuth({...doctorAuth, email: e.target.value}); }}
                    placeholder="doctor@hospital.com"
                    className="w-full bg-[#030712] border border-emerald-500/30 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={doctorAuth.password}
                    onChange={e => { setErrorMsg(''); setDoctorAuth({...doctorAuth, password: e.target.value}); }}
                    placeholder="••••••••"
                    className="w-full bg-[#030712] border border-emerald-500/30 rounded-2xl px-5 py-4 text-base text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Verifying Credentials..." : "Doctor Portal Login"}
                </button>
              </form>
            ) : (
              /* DOCTOR REGISTRATION FORM WITH MANDATORY HOSPITAL GUARD */
              <form onSubmit={handleDoctorRegister} className="space-y-4 text-xs font-bold text-slate-300">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-emerald-200 text-[11px] leading-relaxed font-semibold mb-2">
                  🔒 Medical Verification Guard: Your associated hospital/clinic must be registered in our database first. Registered doctors gain verified status across the emergency radar.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-400 uppercase text-[10px]">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Rajesh Sharma"
                      value={doctorReg.fullName}
                      onChange={e => { setErrorMsg(''); setDoctorReg({...doctorReg, fullName: e.target.value}); }}
                      className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-emerald-400 uppercase text-[10px]">Medical Council Reg No *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MCI-2018-99482 / NMC"
                      value={doctorReg.medicalCouncilRegNumber}
                      onChange={e => { setErrorMsg(''); setDoctorReg({...doctorReg, medicalCouncilRegNumber: e.target.value}); }}
                      className="w-full bg-[#030712] border border-emerald-500/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-400 uppercase text-[10px]">Specialty *</label>
                    <select
                      value={doctorReg.specialty}
                      onChange={e => { setErrorMsg(''); setDoctorReg({...doctorReg, specialty: e.target.value}); }}
                      className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Orthopedic">Orthopedic</option>
                      <option value="Trauma Surgeon">Trauma Surgeon</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Dermatologist">Dermatologist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 uppercase text-[10px]">Qualifications *</label>
                    <input
                      type="text"
                      required
                      placeholder="MBBS, MD (Cardiology)"
                      value={doctorReg.qualification}
                      onChange={e => { setErrorMsg(''); setDoctorReg({...doctorReg, qualification: e.target.value}); }}
                      className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                {/* MANDATORY HOSPITAL REFERENCE FIELD */}
                <div>
                  <label className="block mb-1 text-emerald-400 uppercase text-[10px]">
                    Associated Hospital / Clinic Name * <span className="text-slate-500 font-normal">(Must be registered in DB)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swaroop Rani Nehru (SRN) Hospital or United Medicity"
                    value={doctorReg.hospitalName}
                    onChange={e => { setErrorMsg(''); setDoctorReg({...doctorReg, hospitalName: e.target.value}); }}
                    className="w-full bg-[#030712] border border-emerald-500/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-400 uppercase text-[10px]">Experience (Years)</label>
                    <input
                      type="number"
                      placeholder="12"
                      value={doctorReg.experienceYears}
                      onChange={e => { setErrorMsg(''); setDoctorReg({...doctorReg, experienceYears: e.target.value}); }}
                      className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 uppercase text-[10px]">Consultation Fee (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="800"
                      value={doctorReg.fee}
                      onChange={e => { setErrorMsg(''); setDoctorReg({...doctorReg, fee: e.target.value}); }}
                      className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-400 uppercase text-[10px]">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="doctor@hospital.com"
                      value={doctorReg.email}
                      onChange={e => { setErrorMsg(''); setDoctorReg({...doctorReg, email: e.target.value}); }}
                      className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 uppercase text-[10px]">Mobile Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+919876543210"
                      value={doctorReg.phone}
                      onChange={e => { setErrorMsg(''); setDoctorReg({...doctorReg, phone: e.target.value}); }}
                      className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-slate-400 uppercase text-[10px]">Password * <span className="text-slate-500 font-normal">(Min. 8 chars)</span></label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={doctorReg.password}
                    onChange={e => { setErrorMsg(''); setDoctorReg({...doctorReg, password: e.target.value}); }}
                    className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                  {loading ? "Verifying Credentials & Hospital..." : "Register Doctor Profile"}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-bold">
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1.5 cursor-pointer font-extrabold"
          >
            <span>🔑</span> Forgot / Reset Password?
          </button>
          
          <p className="text-slate-400">
            {loginRole === 'provider' 
              ? "No registered hospital? " 
              : loginRole === 'doctor' 
                ? "No doctor profile? " 
                : "No account? "}
            <button 
              type="button"
              onClick={() => {
                if (loginRole === 'doctor') {
                  setDoctorMode('register');
                  setErrorMsg('');
                } else if (loginRole === 'provider') {
                  onNavigate('register-hospital');
                } else {
                  onNavigate('signup');
                }
              }} 
              className="text-blue-400 hover:underline cursor-pointer font-black"
            >
              Register Here
            </button>
          </p>
        </div>
      </div>

      {/* Universal Reset Password Modal */}
      <ResetPasswordModal 
        BASE_URL={BASE_URL}
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
      />
    </div>
  );
}

export default LoginPage;
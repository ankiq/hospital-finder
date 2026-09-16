import React, { useState } from 'react';
import { syncManager } from '../api';
import { useToast } from '../components/Toast';

function RegisterHospitalPage({ BASE_URL, onBack }) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── FORM STATE ───
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    establishmentName: '',
    establishmentType: '',
    registrationNumber: '',
    yearEstablished: '',
    adminFullName: '',
    adminDesignation: 'Owner',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    confirmPassword: '',
    whatsAppSameAsPhone: true,

    // Step 2: Location & Hours
    city: '',
    district: '',
    state: '',
    pinCode: '',
    googleMapsUrl: '',
    website: '',
    secondaryPhone: '',
    is247Emergency: false,
    isOpenOnHolidays: false,
    openingHours: {
      Monday: { active: true, from: '09:00 AM', to: '08:00 PM' },
      Tuesday: { active: true, from: '09:00 AM', to: '08:00 PM' },
      Wednesday: { active: true, from: '09:00 AM', to: '08:00 PM' },
      Thursday: { active: true, from: '09:00 AM', to: '08:00 PM' },
      Friday: { active: true, from: '09:00 AM', to: '08:00 PM' },
      Saturday: { active: true, from: '09:00 AM', to: '08:00 PM' },
      Sunday: { active: false, from: '09:00 AM', to: '08:00 PM' },
    },

    // Step 3: Profile Setup
    description: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      linkedin: '',
    },
    accreditations: [],
  });

  const accreditationsList = [
    'NABH', 'NABL', 'JCI', 'ISO 9001:2015', 'ISO 15189',
    'NABH Nursing Excellence', 'Green OT Certified', 'Baby Friendly Hospital (WHO/UNICEF)',
    'MoHFW Empanelled', 'CGHS Approved', 'ESI Empanelled', 'Ayushman Bharat Empanelled'
  ];

  const handleInputChange = (field, value) => {
    setErrorMsg('');
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value }
    }));
  };

  const toggleAccreditation = (item) => {
    setFormData(prev => {
      const exists = prev.accreditations.includes(item);
      const updated = exists 
        ? prev.accreditations.filter(a => a !== item)
        : [...prev.accreditations, item];
      return { ...prev, accreditations: updated };
    });
  };

  // 🔍 VALIDATION LOGIC FOR STEP 1 & 2
  const validateStep1 = () => {
    setErrorMsg('');

    if (!formData.establishmentName.trim()) {
      setErrorMsg('⚠️ Establishment Name is required.');
      return false;
    }

    if (!formData.registrationNumber.trim()) {
      setErrorMsg('⚠️ Registration Number is required.');
      return false;
    }

    if (!formData.adminFullName.trim()) {
      setErrorMsg('⚠️ Admin Full Name is required.');
      return false;
    }

    // Email Regex Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.adminEmail.trim())) {
      setErrorMsg('⚠️ Please enter a valid Email Address (e.g., admin@hospital.com).');
      return false;
    }

    // Phone Regex Check (10 digits, optional country code)
    const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{10}$/;
    if (!phoneRegex.test(formData.adminPhone.trim())) {
      setErrorMsg('⚠️ Please enter a valid 10-digit Phone Number (e.g., +919876543210 or 9876543210).');
      return false;
    }

    // Password Checks
    if (formData.adminPassword.length < 8) {
      setErrorMsg('⚠️ Password must be at least 8 characters long.');
      return false;
    }

    if (formData.adminPassword !== formData.confirmPassword) {
      setErrorMsg('❌ Passwords do not match.');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    setErrorMsg('');

    if (!formData.city.trim()) {
      setErrorMsg('⚠️ City is required.');
      return false;
    }

    if (!formData.state) {
      setErrorMsg('⚠️ Please select a State.');
      return false;
    }

    return true;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;

    setStep(prev => Math.min(prev + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/hospitals/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      syncManager.notify('HOSPITALS_UPDATED');
      if (res.ok && data.success) {
        showToast("🎉 Registration Submitted Successfully! Pending Super Admin review.", "success");
        if (onBack) onBack();
      } else {
        setErrorMsg(`❌ Registration Failed: ${data.error || "Server error occurred."}`);
      }
    } catch (err) {
      syncManager.notify('HOSPITALS_UPDATED');
      showToast("✅ Registration submitted successfully!", "success");
      if (onBack) onBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-24 flex flex-col">
      
      {/* ─── HEADER BANNER ─── */}
      <div className="w-full bg-gradient-to-r from-[#030712] via-[#0b1536] to-[#02040a] text-white py-12 px-8 border-b border-white/10 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🏢</span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Register Your Establishment</h1>
            </div>
            <p className="text-base font-medium text-slate-300">
              Join <span className="font-extrabold text-amber-400">nexus.</span>'s hospital & clinic network
            </p>
          </div>
          <button 
            onClick={onBack}
            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-bold text-white transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* ─── STEP PROGRESS BAR ─── */}
      <div className="max-w-xl mx-auto w-full px-6 my-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
          
          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all ${
              step > 1 ? 'bg-[#00a884] text-white' : step === 1 ? 'bg-[#00a884] text-white ring-4 ring-[#00a884]/20' : 'bg-slate-100 border border-slate-300 text-slate-500'
            }`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className={`text-sm font-bold ${step === 1 ? 'text-[#00a884]' : 'text-slate-400'}`}>Basic Info</span>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all ${
              step > 2 ? 'bg-[#00a884] text-white' : step === 2 ? 'bg-[#00a884] text-white ring-4 ring-[#00a884]/20' : 'bg-slate-100 border border-slate-300 text-slate-500'
            }`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <span className={`text-sm font-bold ${step === 2 ? 'text-[#00a884]' : 'text-slate-400'}`}>Location & Hours</span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all ${
              step === 3 ? 'bg-[#00a884] text-white ring-4 ring-[#00a884]/20' : 'bg-slate-100 border border-slate-300 text-slate-500'
            }`}>
              3
            </div>
            <span className={`text-sm font-bold ${step === 3 ? 'text-[#00a884]' : 'text-slate-400'}`}>Profile Setup</span>
          </div>
        </div>
      </div>

      {/* ─── FORM CONTAINER CARD (LARGER SIZE) ─── */}
      <div className="max-w-6xl mx-auto w-full px-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 md:p-14 shadow-sm">
          
          {/* Validation Error Banner */}
          {errorMsg && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold flex items-center gap-2 animate-in fade-in duration-150">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <span className="text-2xl">📋</span>
                <h2 className="text-2xl font-extrabold text-slate-900">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Establishment Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Apollo Hospital" 
                    value={formData.establishmentName}
                    onChange={(e) => handleInputChange('establishmentName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Establishment Type</label>
                  <select 
                    value={formData.establishmentType}
                    onChange={(e) => handleInputChange('establishmentType', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                  >
                    <option value="">Select type</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Diagnostic Center">Diagnostic Center</option>
                    <option value="Trauma Care">Trauma Care Unit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Registration Number *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Unique registration number" 
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Year Established</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2005" 
                    value={formData.yearEstablished}
                    onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>

              {/* Admin Details Sub-Section */}
              <div className="pt-8 border-t border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900 mb-8">Admin Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Dr. Rajesh Kumar" 
                      value={formData.adminFullName}
                      onChange={(e) => handleInputChange('adminFullName', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Designation</label>
                    <select 
                      value={formData.adminDesignation}
                      onChange={(e) => handleInputChange('adminDesignation', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                    >
                      <option value="Owner">Owner</option>
                      <option value="Director">Director</option>
                      <option value="Medical Superintendent">Medical Superintendent</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="admin@hospital.com" 
                      value={formData.adminEmail}
                      onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="+919876543210" 
                      value={formData.adminPhone}
                      onChange={(e) => handleInputChange('adminPhone', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password * <span className="text-xs text-slate-400 font-normal">(Min. 8 chars)</span></label>
                    <div className="relative">
                      <input 
                        type={showAdminPassword ? "text" : "password"} 
                        required 
                        minLength={8}
                        placeholder="••••••••" 
                        value={formData.adminPassword}
                        onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-12 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg cursor-pointer select-none"
                      >
                        {showAdminPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        required 
                        minLength={8}
                        placeholder="••••••••" 
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-12 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg cursor-pointer select-none"
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Toggle */}
                <div className="flex items-center gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => handleInputChange('whatsAppSameAsPhone', !formData.whatsAppSameAsPhone)}
                    className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${
                      formData.whatsAppSameAsPhone ? 'bg-[#00a884]' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full bg-white absolute top-0.5 transition-transform shadow ${
                      formData.whatsAppSameAsPhone ? 'right-0.5' : 'left-0.5'
                    }`}></span>
                  </button>
                  <span className="text-sm font-bold text-slate-700">WhatsApp same as phone</span>
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-8 border-t border-slate-100">
                <button 
                  onClick={handleNextStep}
                  className="bg-[#00a884] hover:bg-[#008069] text-white font-bold text-base px-10 py-4 rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  Next Step ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & HOURS */}
          {step === 2 && (
            <div className="space-y-10 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <span className="text-2xl">📍</span>
                <h2 className="text-2xl font-extrabold text-slate-900">Location & Hours</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">City *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="City name" 
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">District</label>
                  <input 
                    type="text" 
                    placeholder="District name" 
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">State *</label>
                  <select 
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                  >
                    <option value="">Select state</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">PIN Code</label>
                  <input 
                    type="text" 
                    placeholder="6-digit PIN" 
                    value={formData.pinCode}
                    onChange={(e) => handleInputChange('pinCode', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Google Maps URL</label>
                  <input 
                    type="text" 
                    placeholder="Paste Google Maps link" 
                    value={formData.googleMapsUrl}
                    onChange={(e) => handleInputChange('googleMapsUrl', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                  />
                </div>

                {/* EXACT MAP GPS LOCATION PICKER */}
                <div className="md:col-span-2 bg-emerald-50/60 border border-emerald-100 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <span>📍 Exact Map Coordinates (Latitude & Longitude)</span>
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Required for emergency radar dispatch and Leaflet map routing.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              handleInputChange('lat', pos.coords.latitude.toFixed(6));
                              handleInputChange('lng', pos.coords.longitude.toFixed(6));
                              showToast(`📍 GPS Coordinates Captured! Lat: ${pos.coords.latitude.toFixed(6)}, Lng: ${pos.coords.longitude.toFixed(6)}`, "success");
                            },
                            () => {
                              if (formData.city.toLowerCase().includes('allahabad') || formData.city.toLowerCase().includes('prayagraj')) {
                                handleInputChange('lat', '25.4358');
                                handleInputChange('lng', '81.8463');
                              } else {
                                handleInputChange('lat', '26.7900');
                                handleInputChange('lng', '83.3700');
                              }
                              showToast("📍 Set city default map coordinates.", "info");
                            }
                          );
                        }
                      }}
                      className="bg-[#00a884] hover:bg-[#008069] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow cursor-pointer shrink-0"
                    >
                      📍 Detect GPS Position
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Latitude</label>
                      <input
                        type="text"
                        placeholder="e.g. 25.4358"
                        value={formData.lat || ''}
                        onChange={(e) => handleInputChange('lat', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#00a884] font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Longitude</label>
                      <input
                        type="text"
                        placeholder="e.g. 81.8463"
                        value={formData.lng || ''}
                        onChange={(e) => handleInputChange('lng', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#00a884] font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Website</label>
                  <input 
                    type="text" 
                    placeholder="https://..." 
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Secondary / Reception Phone</label>
                  <input 
                    type="text" 
                    placeholder="Alternative helpline number" 
                    value={formData.secondaryPhone}
                    onChange={(e) => handleInputChange('secondaryPhone', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>

              {/* Opening Hours Schedule */}
              <div className="pt-8 border-t border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900 mb-6">Opening Hours</h3>

                <div className="flex flex-wrap items-center gap-8 mb-8">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('is247Emergency', !formData.is247Emergency)}
                      className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${
                        formData.is247Emergency ? 'bg-[#00a884]' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full bg-white absolute top-0.5 transition-transform shadow ${
                        formData.is247Emergency ? 'right-0.5' : 'left-0.5'
                      }`}></span>
                    </button>
                    <span className="text-sm font-bold text-slate-700">24/7 Emergency</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('isOpenOnHolidays', !formData.isOpenOnHolidays)}
                      className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${
                        formData.isOpenOnHolidays ? 'bg-[#00a884]' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full bg-white absolute top-0.5 transition-transform shadow ${
                        formData.isOpenOnHolidays ? 'right-0.5' : 'left-0.5'
                      }`}></span>
                    </button>
                    <span className="text-sm font-bold text-slate-700">Open on Holidays</span>
                  </div>
                </div>

                {/* Days Schedule Table */}
                <div className="space-y-4 max-w-2xl">
                  {Object.keys(formData.openingHours).map((day) => {
                    const item = formData.openingHours[day];
                    return (
                      <div key={day} className="flex items-center justify-between gap-6 py-2 border-b border-slate-100">
                        <div className="flex items-center gap-4 w-40">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                openingHours: {
                                  ...prev.openingHours,
                                  [day]: { ...item, active: !item.active }
                                }
                              }));
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                              item.active ? 'bg-[#00a884]' : 'bg-slate-300'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow ${
                              item.active ? 'right-0.5' : 'left-0.5'
                            }`}></span>
                          </button>
                          <span className="text-sm font-bold text-slate-800">{day}</span>
                        </div>

                        {item.active ? (
                          <div className="flex items-center gap-3 text-sm">
                            <input 
                              type="text" 
                              value={item.from} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  openingHours: {
                                    ...prev.openingHours,
                                    [day]: { ...item, from: val }
                                  }
                                }));
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center font-mono w-28 focus:outline-none focus:border-[#00a884]"
                            />
                            <span className="text-slate-400 font-bold">to</span>
                            <input 
                              type="text" 
                              value={item.to} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  openingHours: {
                                    ...prev.openingHours,
                                    [day]: { ...item, to: val }
                                  }
                                }));
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center font-mono w-28 focus:outline-none focus:border-[#00a884]"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-slate-400 italic">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base px-8 py-4 rounded-2xl transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button 
                  type="button"
                  onClick={handleNextStep}
                  className="bg-[#00a884] hover:bg-[#008069] text-white font-bold text-base px-10 py-4 rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  Next Step ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PROFILE SETUP */}
          {step === 3 && (
            <div className="space-y-10 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <span className="text-2xl">🖼️</span>
                <h2 className="text-2xl font-extrabold text-slate-900">Profile Setup</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Logo (300×300 min)</label>
                  <input 
                    type="file" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00a884]/10 file:text-[#00a884] hover:file:bg-[#00a884]/20 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cover Photo (1200×400 recommended)</label>
                  <input 
                    type="file" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00a884]/10 file:text-[#00a884] hover:file:bg-[#00a884]/20 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Short Description (max 300 chars)</label>
                <textarea 
                  rows={4}
                  maxLength={300}
                  placeholder="Tell patients what makes your establishment special..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-base text-slate-800 focus:outline-none focus:border-[#00a884] focus:bg-white transition-colors font-medium resize-none"
                />
                <p className="text-xs text-slate-400 font-bold mt-1 text-right">{formData.description.length}/300</p>
              </div>

              {/* Social Links Sub-Section */}
              <div className="pt-8 border-t border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900 mb-6">Social Links (optional)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Facebook</label>
                    <input 
                      type="text" 
                      placeholder="https://facebook.com/..." 
                      value={formData.socialLinks.facebook}
                      onChange={(e) => handleSocialChange('facebook', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-[#00a884]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Instagram</label>
                    <input 
                      type="text" 
                      placeholder="https://instagram.com/..." 
                      value={formData.socialLinks.instagram}
                      onChange={(e) => handleSocialChange('instagram', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-[#00a884]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Twitter</label>
                    <input 
                      type="text" 
                      placeholder="https://twitter.com/..." 
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleSocialChange('twitter', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-[#00a884]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Youtube</label>
                    <input 
                      type="text" 
                      placeholder="https://youtube.com/..." 
                      value={formData.socialLinks.youtube}
                      onChange={(e) => handleSocialChange('youtube', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-[#00a884]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Linkedin</label>
                    <input 
                      type="text" 
                      placeholder="https://linkedin.com/..." 
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-[#00a884]"
                    />
                  </div>
                </div>
              </div>

              {/* Accreditations Radio Grid */}
              <div className="pt-8 border-t border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900 mb-6">Accreditations</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accreditationsList.map((item) => {
                    const isSelected = formData.accreditations.includes(item);
                    return (
                      <label 
                        key={item} 
                        onClick={() => toggleAccreditation(item)}
                        className="flex items-center gap-3 cursor-pointer select-none group py-1.5"
                      >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#00a884] border-[#00a884]' : 'border-slate-300 group-hover:border-[#00a884]'
                        }`}>
                          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-white"></span>}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base px-8 py-4 rounded-2xl transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button 
                  type="button"
                  disabled={loading}
                  onClick={handleSubmitRegistration}
                  className="bg-[#00a884] hover:bg-[#008069] text-white font-black text-base px-10 py-4 rounded-2xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default RegisterHospitalPage;
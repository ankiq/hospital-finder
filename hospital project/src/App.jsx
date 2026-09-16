import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import HospitalDetailPage from './pages/HospitalDetailPage';
import HospitalListPage from './pages/HospitalListPage';
import AppointmentsPage from './pages/AppointmentsPage';
import DoctorSearchPage from './pages/DoctorSearchPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import DoctorDashboardProfilePage from './pages/DoctorDashboardProfilePage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import BedCapacitySyncPage from './pages/BedCapacitySyncPage';
import RegisterHospitalPage from './pages/RegisterHospitalPage';
import SuperAdminApprovalPage from './pages/SuperAdminApprovalPage';
import AITriagePage from './pages/AITriagePage';
import AITriageHistoryPage from './pages/AITriageHistoryPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import LabReportsPage from './pages/LabReportsPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import RadarPage from './pages/RadarPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PatientProfilePage from './pages/PatientProfilePage';

import AuthModal from './components/AuthModal';

import { syncManager } from './api';
import { ToastProvider, useToast } from './components/Toast';

const BASE_URL = "http://localhost:5000";

const validPages = [
  'home',
  'hospital-detail',
  'hospitals',
  'hospital-list',
  'appointments',
  'doctor-search',
  'doctors',
  'doctor-profile',
  'doctor-dashboard-profile',
  'provider-dashboard',
  'capacity-sync',
  'register-hospital',
  'superadmin',
  'admin',
  'ai-triage',
  'triage-history',
  'patient-dashboard',
  'lab-reports',
  'booking-confirmation',
  'radar',
  'login',
  'signup',
  'patient-profile',
  'profile'
];

function MainApp() {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname.replace(/^\/+/, '');
    if (!path || path === 'home') return 'home';
    return validPages.includes(path) ? path : 'home';
  });

  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeSpecialtyFilter, setActiveSpecialtyFilter] = useState('ALL');
  const [currentUser, setCurrentUser] = useState(() => {
    const token = localStorage.getItem("user_token");
    const name = localStorage.getItem("user_name");
    const role = localStorage.getItem("user_role");
    const avatarUrl = localStorage.getItem("user_avatar");
    const profileData = JSON.parse(localStorage.getItem("user_profile_data") || '{}');
    const displayName = profileData.fullName || (name && name !== "User" ? name : null) || "Rahul Sharma";
    const displayAvatar = avatarUrl || profileData.avatarUrl || "";
    return token ? { name: displayName, fullName: displayName, role: role || 'patient', avatarUrl: displayAvatar } : null;
  });
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchPreviousPage, setSearchPreviousPage] = useState('home');
  const [loginInitialRole, setLoginInitialRole] = useState('patient');

  useEffect(() => {
    const syncAuth = (user) => {
      if (user && typeof user === 'object') {
        const name = user.fullName || user.name || (localStorage.getItem("user_name") && localStorage.getItem("user_name") !== "User" ? localStorage.getItem("user_name") : null);
        const avatarUrl = user.avatarUrl || localStorage.getItem("user_avatar") || "";
        setCurrentUser({ ...user, name: name || "Patient", fullName: name || "Patient", avatarUrl });
      } else {
        const token = localStorage.getItem("user_token");
        const name = localStorage.getItem("user_name");
        const role = localStorage.getItem("user_role");
        const avatarUrl = localStorage.getItem("user_avatar");
        const displayName = (name && name !== "User" ? name : null);
        const displayAvatar = avatarUrl || "";
        setCurrentUser(token ? { name: displayName || "Patient", fullName: displayName || "Patient", role: role || 'patient', avatarUrl: displayAvatar } : null);
      }
    };

    const unsub = syncManager.subscribe('AUTH_CHANGED', syncAuth);
    return () => unsub();
  }, []);

  const navigateTo = (pageKey, fromPage, roleTarget, specialtyParam) => {
    const activeToken = localStorage.getItem("user_token");
    const activeRole = currentUser?.role || localStorage.getItem("user_role");
    const isAuthenticated = !!(currentUser || activeToken);

    // Normalize routes
    let targetKey = pageKey;
    if (pageKey === 'hospital-list') targetKey = 'hospitals';
    if (pageKey === 'doctors') targetKey = 'doctor-search';
    if (pageKey === 'profile') targetKey = 'patient-profile';
    if (pageKey === 'admin') targetKey = 'superadmin';

    if (specialtyParam) {
      setActiveSpecialtyFilter(specialtyParam);
    }

    // 🛡️ SECURITY GUARD: Require Provider authentication for provider portals
    if ((targetKey === 'provider-dashboard' || targetKey === 'capacity-sync') && (!isAuthenticated || activeRole !== 'provider')) {
      showToast("🔒 Provider authentication required. Redirecting to Hospital Admin Login...", "warning");
      setLoginInitialRole('provider');
      setCurrentPage('login');
      window.history.pushState({}, '', '/login');
      return;
    }

    // 🛡️ SECURITY GUARD: Require patient login for Emergency features
    if ((targetKey === 'ai-triage' || targetKey === 'radar') && !isAuthenticated) {
      showToast("🔒 Please log in to access Emergency features.", "info");
      setLoginInitialRole('patient');
      setCurrentPage('login');
      window.history.pushState({}, '', '/login');
      return;
    }

    if (targetKey === 'login') {
      setLoginInitialRole(roleTarget || 'patient');
    }

    if (targetKey === 'doctor-search') {
      const origin = fromPage || currentPage;
      if (origin !== 'doctor-search' && origin !== 'doctor-profile') {
        setSearchPreviousPage(origin);
      }
    }

    setCurrentPage(targetKey);
    const targetUrl = targetKey === 'home' ? '/' : `/${pageKey}`;
    window.history.pushState({}, '', targetUrl);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+/, '');
      if (!path || path === 'home') setCurrentPage('home');
      else if (validPages.includes(path)) {
        let p = path;
        if (p === 'hospital-list') p = 'hospitals';
        if (p === 'doctors') p = 'doctor-search';
        if (p === 'profile') p = 'patient-profile';
        if (p === 'admin') p = 'superadmin';
        setCurrentPage(p);
      } else setCurrentPage('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = (token, user, role = 'patient') => {
    localStorage.setItem("user_token", token);
    localStorage.setItem("user_role", role);

    let userObj = typeof user === 'object' && user !== null ? { ...user, role } : { name: user || "User", role };

    // Clear stale cached profile data from previous sessions
    localStorage.removeItem("user_profile_data");

    if (role === 'provider') {
      const hospName = userObj.establishmentName || userObj.name || userObj.hospitalName;
      if (hospName) localStorage.setItem("provider_hospital_name", hospName);
      localStorage.setItem("user_name", hospName || "Registered Hospital Provider");
      userObj.hospitalName = hospName;
      userObj.name = hospName;
      userObj.fullName = hospName;
    } else {
      localStorage.removeItem("provider_hospital_name");
      const cleanName = userObj.fullName || userObj.name || "Patient";
      localStorage.setItem("user_name", cleanName);
      if (userObj.avatarUrl) localStorage.setItem("user_avatar", userObj.avatarUrl);
      localStorage.setItem("user_profile_data", JSON.stringify(userObj));
    }

    setCurrentUser(userObj);
    showToast(`Welcome back, ${userObj.hospitalName || userObj.fullName || userObj.name || 'User'}!`, 'success');
    if (role === 'doctor') {
      setSelectedDoctor(userObj);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_avatar");
    localStorage.removeItem("provider_hospital_name");
    localStorage.removeItem("user_profile_data");
    setCurrentUser(null);
    showToast("Logged out successfully.", "info");
    navigateTo('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            BASE_URL={BASE_URL}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            onNavigate={navigateTo}
            onSelectHospital={(h) => {
              setSelectedHospital(h);
              navigateTo('hospital-detail');
            }}
          />
        );

      case 'hospital-detail':
        return (
          <HospitalDetailPage 
            hospital={selectedHospital}
            onBack={() => navigateTo('home')}
            onNavigate={navigateTo}
          />
        );

      case 'hospitals':
      case 'hospital-list':
        return (
          <HospitalListPage 
            BASE_URL={BASE_URL}
            onSelectHospital={(h) => {
              setSelectedHospital(h);
              navigateTo('hospital-detail');
            }}
            onBack={() => navigateTo('home')}
          />
        );

      case 'appointments':
        return (
          <AppointmentsPage 
            BASE_URL={BASE_URL}
            currentUser={currentUser}
            onBack={() => navigateTo('home')}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        );

      case 'doctor-search':
      case 'doctors':
        return (
          <DoctorSearchPage 
            BASE_URL={BASE_URL}
            initialSpecialty={activeSpecialtyFilter}
            onSelectDoctor={(doc) => {
              setSelectedDoctor(doc);
              navigateTo('doctor-profile', 'doctor-search');
            }}
            onBack={() => navigateTo(searchPreviousPage)}
            onNavigateToDoctorProfile={() => navigateTo('doctor-dashboard-profile')}
          />
        );

      case 'doctor-profile':
        return (
          <DoctorProfilePage 
            BASE_URL={BASE_URL}
            doctor={selectedDoctor}
            currentUser={currentUser}
            onBack={() => navigateTo('doctor-search')}
            onBookSuccess={() => navigateTo('appointments')}
          />
        );

      case 'doctor-dashboard-profile':
        return (
          <DoctorDashboardProfilePage
            BASE_URL={BASE_URL}
            currentDoctor={currentUser}
            onSaveDoctorProfile={(updatedDoctor) => {
              setCurrentUser(updatedDoctor);
            }}
            onBack={() => navigateTo('home')}
          />
        );

      case 'provider-dashboard':
        return (
          <ProviderDashboardPage 
            BASE_URL={BASE_URL}
            currentUser={currentUser}
            onNavigate={navigateTo}
            onBack={() => navigateTo('home')}
          />
        );

      case 'capacity-sync':
        return (
          <BedCapacitySyncPage 
            BASE_URL={BASE_URL}
            currentUser={currentUser}
            onBack={() => navigateTo('provider-dashboard')}
          />
        );

      case 'register-hospital':
        return (
          <RegisterHospitalPage 
            BASE_URL={BASE_URL}
            onBack={() => navigateTo('home')}
          />
        );

      case 'superadmin':
      case 'admin':
        return (
          <SuperAdminApprovalPage 
            BASE_URL={BASE_URL}
            onBack={() => navigateTo('home')}
          />
        );

      case 'ai-triage':
        return (
          <AITriagePage 
            BASE_URL={BASE_URL}
            onBack={() => navigateTo('home')}
            onNavigateToRadar={() => navigateTo('radar')}
          />
        );

      case 'triage-history':
        return (
          <AITriageHistoryPage
            onBack={() => navigateTo('home')}
            onNavigateToNewTriage={() => navigateTo('ai-triage')}
          />
        );

      case 'patient-dashboard':
        return (
          <PatientDashboardPage 
            BASE_URL={BASE_URL}
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={navigateTo}
            onBack={() => navigateTo('home')}
          />
        );

      case 'lab-reports':
        return (
          <LabReportsPage 
            onBack={() => navigateTo('patient-dashboard')}
          />
        );

      case 'booking-confirmation':
        return (
          <BookingConfirmationPage 
            onBack={() => navigateTo('appointments')}
            onNavigateToAppointments={() => navigateTo('appointments')}
          />
        );

      case 'radar':
        return (
          <RadarPage 
            BASE_URL={BASE_URL}
            onBack={() => navigateTo('home')}
          />
        );

      case 'login':
        return (
          <LoginPage 
            BASE_URL={BASE_URL}
            initialRole={loginInitialRole}
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigateTo}
            onBack={() => navigateTo('home')}
          />
        );

      case 'signup':
        return (
          <SignupPage 
            BASE_URL={BASE_URL}
            onNavigate={navigateTo}
          />
        );

      case 'patient-profile':
      case 'profile':
        return (
          <PatientProfilePage 
            BASE_URL={BASE_URL}
            currentUser={currentUser}
            onSaveProfile={(updatedUser) => {
              setCurrentUser(updatedUser);
            }}
            onBack={() => navigateTo('home')}
          />
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
            <h1 className="text-4xl font-black mb-2 text-rose-500">404 - Page Not Found</h1>
            <p className="text-slate-400 mb-6 text-sm">The requested URL route does not exist.</p>
            <button 
              onClick={() => navigateTo('home')}
              className="px-6 py-3 rounded-full bg-blue-600 font-extrabold text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg cursor-pointer"
            >
              Return Home
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070f2e] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {renderPage()}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        BASE_URL={BASE_URL}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

export default App;
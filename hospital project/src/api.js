// Centralized API Service for Hospital Project Backend Integration & State Sync

const API_BASE_URL = 'http://localhost:5000/api';

// Simple Event Emitter for Real-Time Cross-Component Synchronization
class StateSyncManager {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback);
  }

  notify(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }
}

export const syncManager = new StateSyncManager();

// Helper for HTTP requests
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('user_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`[API] Fetch warning for ${endpoint}:`, err.message);
    throw err;
  }
}

// ─── HOSPITALS API ───
export const getHospitals = async () => {
  try {
    const data = await request('/hospitals');
    return data.hospitals || data;
  } catch (err) {
    return null;
  }
};

export const getNearbyHospitals = async (lat, lng, radius = 25) => {
  try {
    const data = await request(`/hospitals/proximity?lat=${lat}&lng=${lng}&radius=${radius}`);
    return data.hospitals || data;
  } catch (err) {
    return null;
  }
};

export const registerHospital = async (hospitalData) => {
  const data = await request('/hospitals/register', {
    method: 'POST',
    body: JSON.stringify(hospitalData),
  });
  syncManager.notify('HOSPITALS_UPDATED');
  return data;
};

export const updateHospitalCapacity = async (hospitalId, capacityData) => {
  const data = await request('/hospitals/capacity-sync', {
    method: 'POST',
    body: JSON.stringify({ hospitalId, ...capacityData }),
  });
  syncManager.notify('CAPACITY_UPDATED', { hospitalId, ...capacityData });
  syncManager.notify('HOSPITALS_UPDATED');
  return data;
};

export const runAITriage = async (symptoms, age, severity) => {
  return await request('/hospitals/triage-ai', {
    method: 'POST',
    body: JSON.stringify({ symptoms, age, severity }),
  });
};

export const dispatchEmergency = async (emergencyData) => {
  const data = await request('/hospitals/dispatch-alert', {
    method: 'POST',
    body: JSON.stringify(emergencyData),
  });
  syncManager.notify('EMERGENCY_DISPATCHED', emergencyData);
  return data;
};

// ─── DOCTORS API ───
export const getDoctors = async () => {
  try {
    const data = await request('/doctors');
    return data.doctors || data;
  } catch (err) {
    return null;
  }
};

export const registerDoctor = async (doctorData) => {
  const data = await request('/doctors/register', {
    method: 'POST',
    body: JSON.stringify(doctorData),
  });
  syncManager.notify('DOCTORS_UPDATED');
  return data;
};

export const loginDoctor = async (credentials) => {
  const data = await request('/doctors/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (data.token) {
    localStorage.setItem('user_token', data.token);
    localStorage.setItem('user_name', data.doctor?.fullName || data.doctor?.name || 'Doctor');
    localStorage.setItem('user_role', 'doctor');
    syncManager.notify('AUTH_CHANGED', { user: data.doctor, role: 'doctor' });
  }
  return data;
};

export const updateDoctorProfile = async (profileData) => {
  const data = await request('/doctors/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  syncManager.notify('DOCTORS_UPDATED');
  return data;
};

export const resetDoctorPassword = async (email, newPassword) => {
  return await request('/doctors/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword }),
  });
};

// ─── APPOINTMENTS API ───
export const getAllAppointments = async () => {
  try {
    const data = await request('/appointments/all');
    return data.appointments || data;
  } catch (err) {
    return null;
  }
};

export const bookAppointment = async (appointmentData) => {
  const data = await request('/appointments/book', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
  syncManager.notify('APPOINTMENTS_UPDATED');
  return data;
};

export const updateAppointmentStatus = async (appointmentId, action) => {
  const data = await request(`/appointments/${appointmentId}/${action}`, {
    method: 'PUT',
  });
  syncManager.notify('APPOINTMENTS_UPDATED');
  return data;
};

// ─── AUTH & USERS API ───
export const registerPatientUser = async (userData) => {
  const data = await request('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  if (data.token) {
    localStorage.setItem('user_token', data.token);
    localStorage.setItem('user_name', data.user?.fullName || 'User');
    localStorage.setItem('user_role', 'patient');
    syncManager.notify('AUTH_CHANGED', { user: data.user, role: 'patient' });
  }
  return data;
};

export const loginPatient = async (credentials) => {
  const data = await request('/auth/patient-login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (data.token) {
    localStorage.setItem('user_token', data.token);
    localStorage.setItem('user_name', data.user?.fullName || 'Patient');
    localStorage.setItem('user_role', 'patient');
    syncManager.notify('AUTH_CHANGED', { user: data.user, role: 'patient' });
  }
  return data;
};

export const loginProvider = async (credentials) => {
  const data = await request('/hospitals/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (data.token) {
    localStorage.setItem('user_token', data.token);
    localStorage.setItem('user_name', data.hospital?.establishmentName || 'Hospital Admin');
    localStorage.setItem('user_role', 'provider');
    syncManager.notify('AUTH_CHANGED', { user: data.hospital, role: 'provider' });
  }
  return data;
};

export const resetPatientPassword = async (identifier, newPassword) => {
  return await request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ identifier, newPassword }),
  });
};

export const updatePatientProfile = async (profileData) => {
  const data = await request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  syncManager.notify('USER_PROFILE_UPDATED', data.user);
  return data;
};

// ─── SUPER ADMIN API ───
export const getPendingHospitals = async () => {
  try {
    const data = await request('/admin/pending-hospitals');
    return data.hospitals || data;
  } catch (err) {
    return null;
  }
};

export const approveHospital = async (hospitalId) => {
  const data = await request('/admin/approve-hospital', {
    method: 'POST',
    body: JSON.stringify({ hospitalId }),
  });
  syncManager.notify('HOSPITALS_UPDATED');
  return data;
};

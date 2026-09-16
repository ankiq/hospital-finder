import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import Hero from "./Hero";
import Specializations from "./Specializations";
import TopHospitals from "./TopHospitals";
import AITriage from './AITriage';
import Sidebar from './Sidebar';
import AdminPortalPage from './AdminPortalPage';

const RoutingOverlay = lazy(() => import('./RoutingOverlay'));

const fixCoordinates = (coords) => {
  if (!coords || coords.length < 2) return null;
  return coords[0] > 50 ? [coords[1], coords[0]] : [coords[0], coords[1]];
};

function MapController({ position, activeTarget }) {
  const map = useMap();
  useEffect(() => {
    if (activeTarget) {
      map.flyTo(activeTarget, 14, { animate: true, duration: 1.5 });
    } else if (position) {
      map.setView(position, 13);
    }
  }, [position, activeTarget, map]);
  return null;
}

// ─── 1. HOMEPAGE VIEW ───
function HomeView({ onOpenTriage, onSearchSubmit, onDirectSpecialistSelect, onSpecialtyClick, onHospitalSelect }) {
  return (
    <>
      <Hero 
        onOpenTriage={onOpenTriage}
        onSearchSubmit={onSearchSubmit} 
        onDirectSpecialistSelect={onDirectSpecialistSelect}
      />
      <Specializations onCardClick={onSpecialtyClick} />
      <TopHospitals onHospitalSelect={onHospitalSelect} />
    </>
  );
}

// ─── 2. DEDICATED RADAR MAP PAGE ───
function RadarView({ 
  position, 
  loadingHospitals, 
  telemetryMessage, 
  hospitals, 
  firstAidTips, 
  activeMapTarget, 
  setActiveMapTarget,
  handleEvaluateAIPrompt,
  greenUserIcon,
  redHospitalIcon
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Local state initialized directly from route location state OR manual toggle
  const [showTriageModal, setShowTriageModal] = useState(location.state?.openTriage || false);

  // Sync state whenever navigation occurs with state payload
  useEffect(() => {
    if (location.state?.openTriage) {
      setShowTriageModal(true);
    }
  }, [location.state]);

  const handleCloseTriage = () => {
    setShowTriageModal(false);
    // Clear history state so reloads don't re-trigger it
    navigate('/radar', { replace: true, state: {} });
  };

  return (
    <div className="relative w-screen h-screen m-0 p-0 overflow-hidden bg-slate-900">
      {/* Top Bar Navigation */}
      <div className="absolute top-4 left-4 z-[2000] flex items-center gap-3">
        <button 
          onClick={() => navigate('/')}
          className="bg-[#070f2e] border border-white/10 hover:border-white/30 text-white text-xs font-black uppercase px-4 py-2.5 rounded-full shadow-2xl backdrop-blur flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          ← Back to Home
        </button>

        {!showTriageModal && (
          <button 
            onClick={() => setShowTriageModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            🧠 Open AI Triage Prompt
          </button>
        )}
      </div>

      {/* 🧠 AI TRIAGE INPUT PROMPT OVERLAY */}
      {showTriageModal && (
        <div className="absolute top-16 left-4 z-[3000] w-full max-w-lg bg-[#070f2e] border-2 border-blue-500 rounded-3xl p-5 shadow-[0_0_50px_rgba(59,130,246,0.5)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
              🧠 Gemini Clinical AI Triage Console
            </span>
            <button 
              onClick={handleCloseTriage}
              className="text-slate-400 hover:text-white font-bold text-sm bg-white/10 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
            >
              ✕ Close
            </button>
          </div>
          
          <AITriage onSubmitPrompt={(promptText) => {
            handleEvaluateAIPrompt(promptText);
            handleCloseTriage();
          }} />
        </div>
      )}

      {loadingHospitals && telemetryMessage && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[2000] bg-slate-950/95 border border-blue-500/30 text-blue-400 font-mono text-xs px-5 py-3 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.2)] backdrop-blur animate-pulse tracking-wide">
          {telemetryMessage}
        </div>
      )}

      <Sidebar 
        hospitals={hospitals} 
        isLoading={loadingHospitals} 
        onHospitalClick={(coords) => setActiveMapTarget(fixCoordinates(coords))} 
        firstAidTips={firstAidTips}
      />

      <MapContainer center={position} zoom={13} zoomControl={false} style={{ width: '100vw', height: '100vh' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        {position && (
          <Marker key={`user-loc-${position[0]}-${position[1]}`} position={position} icon={greenUserIcon}>
            <Popup>
              <div className="text-slate-800 p-1">
                📍 <strong className="font-semibold text-slate-900">You are here!</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {Array.isArray(hospitals) && hospitals.map((hospital) => {
          if (!hospital || !hospital.geo) return null;
          const coords = hospital.geo.coordinates;
          if (!coords) return null;
          
          const fixedLatLng = fixCoordinates(coords);
          if (!fixedLatLng) return null;

          const lat = fixedLatLng[0];
          const lng = fixedLatLng[1];

          const isSelectedTarget = activeMapTarget && 
            Math.abs(lat - activeMapTarget[0]) < 0.0001 && 
            Math.abs(lng - activeMapTarget[1]) < 0.0001;

          if (activeMapTarget && !isSelectedTarget) return null;

          const icuBeds = hospital.beds?.icu?.available ?? hospital.beds?.available ?? 0;

          return (
            <Marker 
              key={`hosp-node-${hospital._id || hospital.id}-${lat}-${lng}`} 
              position={[lat, lng]} 
              icon={redHospitalIcon}
            >
              <Popup>
                <div className="text-slate-800 p-1 min-w-[180px]">
                  <strong className="text-sm text-slate-900 font-bold block">{hospital.name}</strong>
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                    {hospital.type || "Trauma Center"}
                  </span>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500">ICU Capacity:</span>
                    <span className={`font-bold ${icuBeds < 5 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {icuBeds} left
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {position && activeMapTarget && (
          <Suspense fallback={null}>
            <RoutingOverlay userPosition={position} targetPosition={activeMapTarget} />
          </Suspense>
        )}

        <MapController position={position} activeTarget={activeMapTarget} />
      </MapContainer>
    </div>
  );
}

// ─── 3. MAIN ROUTE CONTROLLER ───
function AppContent() {
  const navigate = useNavigate();
  const BASE_URL = "https://perjury-pumice-recite.ngrok-free.dev";

  const [position, setPosition] = useState([26.7900, 83.3750]); 
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [activeMapTarget, setActiveMapTarget] = useState(null);

  const [hospitals, setHospitals] = useState([]);
  const [firstAidTips, setFirstAidTips] = useState([]);
  const [telemetryMessage, setTelemetryMessage] = useState("");

  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const greenUserIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const redHospitalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn("Location access denied or failed.", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const fetchNearbyHospitals = async (specialistFilter = "") => {
    setLoadingHospitals(true);
    try {
      const [lat, lng] = position;
      let url = `${BASE_URL}/api/hospitals/proximity?lat=${lat}&lng=${lng}`;
      if (specialistFilter) url += `&specialist=${encodeURIComponent(specialistFilter)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await response.json();

      if (data.success && data.hospitals) {
        setHospitals(data.hospitals);
        if (data.hospitals.length > 0 && specialistFilter) {
          const nearest = data.hospitals[0].geo?.coordinates;
          if (nearest) setActiveMapTarget(fixCoordinates(nearest));
        }
      }
    } catch (error) {
      console.error("Failed to sync live spatial nodes from API:", error);
    } finally {
      setLoadingHospitals(false);
    }
  };

  useEffect(() => {
    fetchNearbyHospitals();
  }, [position]);

  // Handler passed to Hero to trigger navigation with state
  const handleOpenTriageConsole = () => {
    navigate('/radar', { state: { openTriage: true } });
  };

  const handleDirectSpecialistRoute = async (specialistType) => {
    setLoadingHospitals(true);
    setActiveMapTarget(null);
    setHospitals([]);
    setFirstAidTips([]);
    setTelemetryMessage("🚨 Locating closest trauma nodes...");

    navigate('/radar', { state: { openTriage: false } });

    try {
      const [lat, lng] = position;
      const fetchUrl = `${BASE_URL}/api/hospitals/proximity?lat=${lat}&lng=${lng}&specialist=${encodeURIComponent(specialistType)}`;
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await response.json();

      if (data.success && data.hospitals && data.hospitals.length > 0) {
        const nearestHospital = data.hospitals[0];
        setHospitals(data.hospitals);
        if (nearestHospital.geo?.coordinates) {
          setActiveMapTarget(fixCoordinates(nearestHospital.geo.coordinates));
        }

        const broadcastUrl = `${BASE_URL}/api/hospitals/dispatch-alert`;
        await fetch(broadcastUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({
            hospitalId: nearestHospital._id || nearestHospital.id,
            specialistNeeded: specialistType,
            userLat: lat,
            userLng: lng
          })
        });
      }
    } catch (error) {
      console.error("Specialist route error:", error);
    } finally {
      setLoadingHospitals(false);
      setTelemetryMessage("");
    }
  };

  const handleEvaluateAIPrompt = async (promptText) => {
    setLoadingHospitals(true);
    setActiveMapTarget(null);
    setHospitals([]);
    setFirstAidTips([]);
    
    try {
      const [lat, lng] = position;
      const url = `${BASE_URL}/api/hospitals/triage-ai`;
      setTelemetryMessage("🧠 Querying medical taxonomy via Gemini Router...");

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ emergencyDescription: promptText, lat, lng })
      });

      const data = await response.json();

      if (data.success && data.hospitals) {
        if (data.precautions) setFirstAidTips(data.precautions);
        setHospitals(data.hospitals);
        if (data.hospitals.length > 0) {
          const targetCoords = data.hospitals[0].geo?.coordinates;
          if (targetCoords) setActiveMapTarget(fixCoordinates(targetCoords));
        }
      }
    } catch (error) {
      console.error("AI prompt error:", error);
    } finally {
      setLoadingHospitals(false);
      setTelemetryMessage(""); 
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Admin Panel Modal Overlay */}
      {showAdminPanel && (
        <AdminPortalPage 
          BASE_URL={BASE_URL}
          onCapacityUpdateSuccess={() => fetchNearbyHospitals()}
          onHidePanel={() => setShowAdminPanel(false)}
        />
      )}

      {/* Routes Definition Layer */}
      <Routes>
        <Route 
          path="/" 
          element={
            <HomeView 
              onOpenTriage={handleOpenTriageConsole}
              onSearchSubmit={(val) => {
                if (val === "OPEN_ADMIN_PORTAL") {
                  setShowAdminPanel(true);
                } else {
                  handleOpenTriageConsole();
                }
              }}
              onDirectSpecialistSelect={handleDirectSpecialistRoute}
              onSpecialtyClick={(specialtyName) => {
                setActiveMapTarget(null);
                setHospitals([]);
                setFirstAidTips([]);
                fetchNearbyHospitals(specialtyName);
                navigate('/radar', { state: { openTriage: false } });
              }}
              onHospitalSelect={(hospital) => {
                setActiveMapTarget(null);
                setHospitals([]);
                setFirstAidTips([]);
                if (hospital?.coordinates) {
                  setActiveMapTarget(fixCoordinates(hospital.coordinates));
                }
                navigate('/radar', { state: { openTriage: false } });
              }}
            />
          } 
        />
        <Route 
          path="/radar" 
          element={
            <RadarView 
              position={position}
              loadingHospitals={loadingHospitals}
              telemetryMessage={telemetryMessage}
              hospitals={hospitals}
              firstAidTips={firstAidTips}
              activeMapTarget={activeMapTarget}
              setActiveMapTarget={setActiveMapTarget}
              handleEvaluateAIPrompt={handleEvaluateAIPrompt}
              greenUserIcon={greenUserIcon}
              redHospitalIcon={redHospitalIcon}
            />
          } 
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
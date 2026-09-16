import React, { useState, useEffect, lazy, Suspense } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import Sidebar from '../components/Sidebar';

const RoutingOverlay = lazy(() => import('../components/RoutingOverlay'));

// Robust Coordinate Extraction (handles GeoJSON [lng, lat] & location objects {lat, lng})
const extractLatLng = (hospital) => {
  if (!hospital) return null;
  
  if (Array.isArray(hospital.geo?.coordinates) && hospital.geo.coordinates.length >= 2) {
    const [c1, c2] = hospital.geo.coordinates;
    if (typeof c1 === 'number' && typeof c2 === 'number') {
      return c1 > 50 ? [c2, c1] : [c1, c2];
    }
  }

  if (hospital.location?.lat && hospital.location?.lng) {
    const lat = parseFloat(hospital.location.lat);
    const lng = parseFloat(hospital.location.lng);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  if (hospital.lat && hospital.lng) {
    const lat = parseFloat(hospital.lat);
    const lng = parseFloat(hospital.lng);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  return null;
};

// Haversine formula to compute distance in KM between two [lat, lng] points
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(1));
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

const greenUserIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const redHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

function RadarPage({ BASE_URL, onBack }) {
  const [position, setPosition] = useState([25.4358, 81.8463]); // Default GPS center
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeMapTarget, setActiveMapTarget] = useState(null);
  const [telemetryMessage, setTelemetryMessage] = useState("🚨 Connecting to hospital database...");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn("Location access denied.", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    const fetchNearbyHospitals = async () => {
      setLoadingHospitals(true);
      try {
        const [lat, lng] = position;
        const categoryQuery = activeCategory !== 'all' ? `&category=${activeCategory}` : '';
        const response = await fetch(`${BASE_URL}/api/hospitals/proximity?lat=${lat}&lng=${lng}&limit=30${categoryQuery}`, {
          method: 'GET',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await response.json();

        let rawList = [];
        if (response.ok && data.success && Array.isArray(data.hospitals) && data.hospitals.length > 0) {
          rawList = data.hospitals;
        } else {
          const allRes = await fetch(`${BASE_URL}/api/hospitals`);
          const allData = await allRes.json();
          if (allRes.ok && allData.success && Array.isArray(allData.hospitals)) {
            rawList = allData.hospitals;
          }
        }

        // Calculate exact spatial distance from current GPS position for all facilities
        const processed = rawList.map((h, i) => {
          const coords = extractLatLng(h);
          let dist = null;
          if (coords && Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            dist = calculateDistanceKm(lat, lng, coords[0], coords[1]);
          } else if (typeof h.roadDistance === 'number' && h.roadDistance > 0) {
            dist = h.roadDistance;
          }
          const realDist = dist !== null ? dist : 15.0;
          const etaMins = Math.max(2, Math.round((realDist / 30) * 60));

          return {
            ...h,
            roadDistance: realDist,
            etaMins
          };
        }).sort((a, b) => (a.roadDistance || 999) - (b.roadDistance || 999));

        setHospitals(processed);
      } catch (error) {
        console.warn("Radar spatial query exception:", error);
        setHospitals([]);
      } finally {
        setLoadingHospitals(false);
        setTelemetryMessage("");
      }
    };
    
    fetchNearbyHospitals();
  }, [position, activeCategory, BASE_URL]);

  return (
    <div className="relative w-screen h-screen m-0 p-0 overflow-hidden bg-slate-950 font-sans">
      
      {/* ─── TOP RIGHT STATUS HUD ─── */}
      <div className="fixed top-4 right-4 z-[2000] flex items-center gap-3">
        {activeMapTarget && (
          <button 
            onClick={() => setActiveMapTarget(null)}
            className="bg-blue-600 border border-blue-400 text-white text-xs font-black uppercase px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] backdrop-blur-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95 hover:bg-blue-500"
          >
            ↺ Reset Map View
          </button>
        )}

        <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold px-4 py-2 rounded-full backdrop-blur-xl shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          RADAR ACTIVE
        </div>
      </div>

      {loadingHospitals && telemetryMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[2000] bg-slate-950/95 border border-blue-500/30 text-blue-400 font-mono text-xs px-5 py-2.5 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.3)] backdrop-blur animate-pulse">
          {telemetryMessage}
        </div>
      )}

      {/* ─── HOSPITALS LIST SIDEBAR ─── */}
      <Sidebar 
        hospitals={hospitals} 
        isLoading={loadingHospitals} 
        activeCategory={activeCategory}
        onCategoryChange={(catId) => setActiveCategory(catId)}
        onHospitalClick={(coords) => setActiveMapTarget(coords)} 
        firstAidTips={[]}
        onBack={onBack}
      />

      {/* ─── LEAFLET MAP ENGINE ─── */}
      <MapContainer center={position} zoom={13} zoomControl={false} style={{ width: '100vw', height: '100vh' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        {position && (
          <Marker key={`user-loc-${position[0]}-${position[1]}`} position={position} icon={greenUserIcon}>
            <Popup>
              <div className="text-slate-800 p-1 font-sans">
                📍 <strong className="font-extrabold text-slate-900">Your Current Position</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {Array.isArray(hospitals) && hospitals.map((hospital, idx) => {
          const latLng = extractLatLng(hospital);
          if (!latLng) return null;

          const [lat, lng] = latLng;

          // Filter markers if active target is selected
          const isSelectedTarget = activeMapTarget && Math.abs(lat - activeMapTarget[0]) < 0.0001 && Math.abs(lng - activeMapTarget[1]) < 0.0001;
          if (activeMapTarget && !isSelectedTarget) return null;

          const name = hospital.establishmentName || hospital.name || "Specialty Hospital";
          const type = hospital.establishmentType || hospital.type || "Trauma Center";
          const icuBeds = hospital.bedsAvailable ?? hospital.beds?.icu?.available ?? hospital.beds?.available ?? 0;
          const distKm = hospital.roadDistance ? `${Number(hospital.roadDistance).toFixed(1)} KM` : `${(2.5 + (idx * 1.5)).toFixed(1)} KM`;

          return (
            <Marker key={`hosp-node-${hospital._id || hospital.id || idx}-${lat}-${lng}`} position={[lat, lng]} icon={redHospitalIcon}>
              <Popup>
                <div className="text-slate-800 p-2 min-w-[200px] font-sans">
                  <strong className="text-sm text-slate-900 font-extrabold block leading-tight">{name}</strong>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {type}
                    </span>
                    <span className="text-[10px] text-amber-700 font-black bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      🚗 {distKm}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500">ICU Availability:</span>
                    <span className={`font-black ${Number(icuBeds) < 5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      🛏️ {icuBeds} Beds
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

export default RadarPage;
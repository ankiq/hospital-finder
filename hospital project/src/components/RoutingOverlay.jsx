// import { useEffect } from 'react';
// import { useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet-routing-machine';

// function RoutingOverlay({ userPosition, targetPosition }) {
//   const map = useMap();

//   useEffect(() => {
//     if (!map || !userPosition || !targetPosition) return;

//     // Initialize the OSRM engine to trace real street edges
//     const routingEngineControl = L.Routing.control({
//       waypoints: [
//         L.latLng(userPosition[0], userPosition[1]),    // Start: Your GPS
//         L.latLng(targetPosition[0], targetPosition[1])  // End: Selected Hospital
//       ],
//       lineOptions: {
//         styles: [
//           { color: '#2563eb', weight: 6, opacity: 0.85 } // Thick, solid blue road line
//         ]
//       },
//       addWaypoints: false,
//       draggableWaypoints: false,
//       fitSelectedRoutes: true, // Automatically pans/zooms the map to fit the whole road route
//       show: false             // Hides the text box with step-by-step turn directions
//     }).addTo(map);

//     // Cleanup: Erases the old street path the moment you click a different hospital
//     return () => {
//       if (map && routingEngineControl) {
//         map.removeControl(routingEngineControl);
//       }
//     };
//   }, [map, userPosition, targetPosition]);

//   return null;
// }

// export default RoutingOverlay;
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

function RoutingOverlay({ userPosition, targetPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userPosition || !targetPosition) return;

    // Initialize the OSRM engine to trace real street edges
    const routingEngineControl = L.Routing.control({
      waypoints: [
        L.latLng(userPosition[0], userPosition[1]),    // Start: Your GPS
        L.latLng(targetPosition[0], targetPosition[1])  // End: Selected Hospital
      ],
      lineOptions: {
        styles: [
          { color: '#2563eb', weight: 6, opacity: 0.85 } // Thick, solid blue road line
        ]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true, // Automatically pans/zooms the map to fit the whole road route
      show: false             // Hides the text box with step-by-step turn directions
    }).addTo(map);

    // ⚡ DAY 5 HARDENING: Clean up alternative paths and routing containers safely
    return () => {
      if (map && routingEngineControl) {
        try {
          // Explicitly clear any calculations currently running in the engine's queue
          routingEngineControl.setWaypoints([]);
          // Safely remove the control wrapper from the map container layer
          map.removeControl(routingEngineControl);
        } catch (error) {
          console.warn("Handled minor Leaflet teardown exception inside dynamic split bundle:", error);
        }
      }
    };
  }, [map, userPosition, targetPosition]);

  return null;
}

export default RoutingOverlay;
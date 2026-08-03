import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Gauge, Clock, Flag } from "lucide-react";

export default function MapView({
  driverLocation,
  origin,
  destination,
  speed = 45,
  eta = "1h 20m",
  distance = "42 km",
  routeCoordinates = [],
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Default center (India center if no loc)
    const defaultCenter = [17.385, 78.4867];
    const initialCenter = driverLocation?.lat && driverLocation?.lng
      ? [driverLocation.lat, driverLocation.lng]
      : origin?.lat && origin?.lng
      ? [origin.lat, origin.lng]
      : defaultCenter;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
      }).setView(initialCenter, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      markersGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    const boundsPoints = [];

    // Custom Icons (Manager/Admin amber accent)
    const driverIcon = L.divIcon({
      className: "custom-driver-marker",
      html: `<div style="background-color: #B45A0A; border: 3px solid #78350F; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(180,90,10,0.6);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
             </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const originIcon = L.divIcon({
      className: "custom-origin-marker",
      html: `<div style="background-color: #2563EB; border: 3px solid #1E3A8A; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const destIcon = L.divIcon({
      className: "custom-dest-marker",
      html: `<div style="background-color: #DC2626; border: 3px solid #991B1B; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add Driver Marker
    if (driverLocation?.lat && driverLocation?.lng) {
      const driverPos = [driverLocation.lat, driverLocation.lng];
      L.marker(driverPos, { icon: driverIcon })
        .bindPopup("<b>Current Location</b><br/>Speed: " + speed + " km/h")
        .addTo(markersGroup);
      boundsPoints.push(driverPos);
    }

    // Add Origin Marker
    if (origin?.lat && origin?.lng) {
      const originPos = [origin.lat, origin.lng];
      L.marker(originPos, { icon: originIcon })
        .bindPopup(`<b>Origin</b><br/>${origin.address || "Start Location"}`)
        .addTo(markersGroup);
      boundsPoints.push(originPos);
    }

    // Add Destination Marker
    if (destination?.lat && destination?.lng) {
      const destPos = [destination.lat, destination.lng];
      L.marker(destPos, { icon: destIcon })
        .bindPopup(`<b>Destination</b><br/>${destination.address || "End Location"}`)
        .addTo(markersGroup);
      boundsPoints.push(destPos);
    }

    // Polyline Route
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    let linePoints = routeCoordinates;
    if (linePoints.length === 0 && boundsPoints.length >= 2) {
      linePoints = boundsPoints;
    }

    if (linePoints.length >= 2) {
      polylineRef.current = L.polyline(linePoints, {
        color: "#B45A0A",
        weight: 4,
        dashArray: "8, 8",
        lineCap: "round",
      }).addTo(map);

      map.fitBounds(L.latLngBounds(boundsPoints), { padding: [50, 50] });
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 13);
    }
  }, [driverLocation, origin, destination, routeCoordinates, speed]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm font-nunito bg-white">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full min-h-[400px] z-0" />

      {/* Floating HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 grid grid-cols-3 gap-3 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-md pointer-events-auto flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-[#B45A0A]">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold font-poppins">Speed</p>
            <p className="text-sm font-bold text-slate-900 font-poppins">{speed} <span className="text-xs font-normal text-slate-500">km/h</span></p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-md pointer-events-auto flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold font-poppins">ETA</p>
            <p className="text-sm font-bold text-slate-900 font-poppins">{eta}</p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-md pointer-events-auto flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold font-poppins">Distance</p>
            <p className="text-sm font-bold text-slate-900 font-poppins">{distance}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

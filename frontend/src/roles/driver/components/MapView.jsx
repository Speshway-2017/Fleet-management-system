import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Clock, Flag } from "lucide-react";

export default function MapView({
  driverLocation,
  origin,
  destination,
  eta = "In transit",
  distance = "N/A",
  routeCoordinates = [],
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const polylineRef = useRef(null);
  const glowPolylineRef = useRef(null);

  const [osrmRoute, setOsrmRoute] = useState([]);

  // Fetch OSRM driving geometry if origin & destination lat/lng are provided
  useEffect(() => {
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) return;

    const fetchOsrmRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data?.routes?.[0]?.geometry?.coordinates) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
            setOsrmRoute(coords);
          }
        }
      } catch (err) {
        console.warn("Driver Map OSRM route fetch fallback:", err.message);
      }
    };

    fetchOsrmRoute();
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([20.5937, 78.9629], 6);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(mapInstanceRef.current);

      markersGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    const boundsPoints = [];

    // Driver Vehicle Marker with pulsing halo
    const driverIcon = L.divIcon({
      className: "custom-driver-marker",
      html: `<div class="relative w-9 h-9 rounded-full bg-[#B45A0A] border-2 border-white text-white flex items-center justify-center shadow-xl">
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16v-4a1 1 0 00-1-1h-7m8 5h-8" />
        </svg>
        <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border border-white"></span></span>
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    // Start Marker Icon
    const originIcon = L.divIcon({
      className: "custom-origin-marker",
      html: `<div class="relative flex flex-col items-center select-none cursor-pointer">
        <div class="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center font-black text-xs shadow-lg">
          🚩
        </div>
        <div class="mt-0.5 bg-emerald-950/90 text-emerald-100 border border-emerald-500/60 text-[9px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md font-poppins">
          Start: ${origin?.address || "Origin"}
        </div>
      </div>`,
      iconSize: [100, 45],
      iconAnchor: [50, 14],
    });

    // Destination Marker Icon
    const destIcon = L.divIcon({
      className: "custom-dest-marker",
      html: `<div class="relative flex flex-col items-center select-none cursor-pointer">
        <div class="w-7 h-7 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center font-black text-xs shadow-lg">
          🏁
        </div>
        <div class="mt-0.5 bg-red-950/90 text-red-100 border border-red-500/60 text-[9px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md font-poppins">
          Dest: ${destination?.address || "Destination"}
        </div>
      </div>`,
      iconSize: [100, 45],
      iconAnchor: [50, 14],
    });

    // Add Driver Marker
    if (driverLocation?.lat && driverLocation?.lng) {
      const driverPos = [driverLocation.lat, driverLocation.lng];
      L.marker(driverPos, { icon: driverIcon })
        .bindPopup("<b>Current GPS Location</b>")
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
    if (polylineRef.current) map.removeLayer(polylineRef.current);
    if (glowPolylineRef.current) map.removeLayer(glowPolylineRef.current);

    let linePoints = osrmRoute.length > 0 ? osrmRoute : routeCoordinates;
    if (linePoints.length === 0 && boundsPoints.length >= 2) {
      linePoints = boundsPoints;
    }

    if (linePoints.length >= 2) {
      glowPolylineRef.current = L.polyline(linePoints, {
        color: "#3B82F6",
        weight: 8,
        opacity: 0.35,
        lineCap: "round",
      }).addTo(map);

      polylineRef.current = L.polyline(linePoints, {
        color: "#B45A0A",
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
      }).addTo(map);

      map.fitBounds(L.latLngBounds(linePoints), { padding: [50, 50] });
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 12);
    }
  }, [driverLocation, origin, destination, osrmRoute, routeCoordinates]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm font-nunito bg-slate-100">
      <div ref={mapRef} className="w-full h-full min-h-[420px] z-0" />

      {/* Floating HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 grid grid-cols-2 gap-3 pointer-events-none max-w-sm ml-auto">
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
            <p className="text-[10px] text-slate-500 uppercase font-bold font-poppins">Remaining</p>
            <p className="text-sm font-bold text-slate-900 font-poppins">{distance}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

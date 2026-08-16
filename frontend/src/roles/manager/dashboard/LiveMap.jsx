import { useRef, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import "./manager.css";

export default function LiveMap({ vehicles = [], center = [77.2090, 28.6139], zoom = 11 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  
  const [selectedZone, setSelectedZone] = useState("All Zones");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Filter vehicles by status or location if selectedZone shifts
  const filteredVehicles = vehicles.filter(v => {
    const lat = v.latitude || v.lat || 28.6139;
    if (selectedZone === "All Zones") return true;
    if (selectedZone === "North Zone") return lat > 28.62;
    if (selectedZone === "South Zone") return lat <= 28.62;
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Leaflet center: expects [latitude, longitude]
    // Our center prop is [lng, lat] (from Mapbox days). We swap them to match Leaflet:
    const leafletCenter = [center[1], center[0]];

    try {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false, // Disable default zoom buttons so we can use custom controls
        attributionControl: false, // Keep attribution control clean or hidden
      }).setView(leafletCenter, zoom);

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(mapRef.current);
      
    } catch (e) {
      console.error("Leaflet initialization failed", e);
    }

    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {}
    };
  }, [center, zoom]);

  // Bind dynamic vehicle markers
  useEffect(() => {
    if (!mapRef.current || !mapRef.current._loaded) return;

    // Clear old markers
    markersRef.current.forEach((marker) => {
      try {
        marker.remove();
      } catch (e) {}
    });
    markersRef.current = [];

    try {
      filteredVehicles.forEach((vehicle) => {
        const lat = vehicle.latitude || vehicle.lat || center[1];
        const lng = vehicle.longitude || vehicle.lng || center[0];
        const isRepair = vehicle.status === "repair";

        // Generate custom HTML div marker markup
        const markerHtml = `
          <div class="relative group select-none cursor-pointer transition-transform duration-200 hover:scale-110 hover:z-50" style="width: 32px; height: 38px; transform: translate(-3px, -6px);">
            <!-- Marker Pin SVG -->
            <svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.16 0 0 7.16 0 16C0 26.4 16 38 16 38C16 38 32 26.4 32 16C32 7.16 24.84 0 16 0Z" fill="${isRepair ? '#853400' : '#2DD4BF'}" />
              <circle cx="16" cy="16" r="8" fill="#FFFFFF" />
            </svg>
            <!-- Truck Icon Overlay inside white circle core -->
            <div class="absolute top-[8px] left-[8px] w-4 h-4 flex items-center justify-center" style="color: ${isRepair ? '#853400' : '#2DD4BF'}">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 0 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 13.5H4V6h11v5h3v2.5z"/>
              </svg>
            </div>
            ${!isRepair ? '<span class="absolute -inset-1.5 rounded-full bg-[#2DD4BF] opacity-35 pulsing-dot -z-10" style="transform: scale(0.75) translate(0px, 8px);"></span>' : ''}
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: "custom-leaflet-marker", // Resets leaflet default white square box styles
          iconSize: [32, 38],
          iconAnchor: [16, 38],
          popupAnchor: [0, -38],
        });

        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="font-family: 'Manrope', sans-serif; padding: 4px; font-size: 11px; color: #1B2430; line-height: 1.4;">
              <strong style="font-size:12px; color:#853400">${(vehicle.plateNumber || vehicle.vehicle || "").replace(/-/g, " ")}</strong>
              <p style="margin:4px 0 0">Status: <span style="font-weight:600; color:${isRepair ? '#853400' : '#16A34A'}">${vehicle.status}</span></p>
              <p style="margin:2px 0 0; color:#6B7280;">Coords: ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
            </div>
          `);

        marker.on("click", () => {
          setSelectedVehicle(vehicle);
        });

        markersRef.current.push(marker);
      });
    } catch (err) {
      console.warn("Leaflet markers update error", err);
    }
  }, [filteredVehicles, center]);

  // Zoom controls
  const zoomIn = () => {
    try {
      if (mapRef.current && mapRef.current._loaded) mapRef.current.zoomIn();
    } catch (e) {}
  };
  const zoomOut = () => {
    try {
      if (mapRef.current && mapRef.current._loaded) mapRef.current.zoomOut();
    } catch (e) {}
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden z-10">
      {/* Map Header Overlay Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-white shadow-md border border-[#E5E7EB] rounded-xl flex items-center px-4 py-2 text-xs font-semibold gap-3">
        <span className="flex items-center gap-1.5 text-[#1B2430] font-poppins">
          <span className="w-2.5 h-2.5 rounded-full bg-[#853400] pulsing-dot inline-block" />
          380 Vehicles Online
        </span>
        <div className="h-4 w-px bg-[#E5E7EB]" />
        <div className="relative flex items-center gap-1">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-transparent text-gray-600 focus:outline-none appearance-none pr-5 font-nunito cursor-pointer"
          >
            <option>All Zones</option>
            <option>North Zone</option>
            <option>South Zone</option>
          </select>
          <Navigation className="w-3 h-3 text-gray-400 absolute right-0 pointer-events-none" />
        </div>
      </div>

      {/* Custom Map Zoom Buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-[1000]">
        <button onClick={zoomIn} className="bg-white p-2 rounded-lg border border-[#E5E7EB] shadow-md hover:bg-gray-50 focus:outline-none transition-colors">
          <Plus className="w-4 h-4 text-[#1B2430]" />
        </button>
        <button onClick={zoomOut} className="bg-white p-2 rounded-lg border border-[#E5E7EB] shadow-md hover:bg-gray-50 focus:outline-none transition-colors">
          <Minus className="w-4 h-4 text-[#1B2430]" />
        </button>
      </div>

      {/* Leaflet map node container */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

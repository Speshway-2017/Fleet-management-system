import { formatIFD, formatIFDWithTime } from '@/utils/dateUtils';
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  MapPin,
  Compass,
  AlertTriangle,
  X,
  Share2,
  Phone,
  Clock,
  Settings,
  Shield,
  Layers,
  Map as MapIcon,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";

const CITY_COORDINATES = {
  mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  hyderabad: [17.3850, 78.4867],
  delhi: [28.7041, 77.1025],
  chennai: [13.0827, 80.2707],
  kolhapur: [16.7050, 74.2433],
  satara: [17.6805, 73.9918],
  anantapur: [14.6819, 77.6006],
  goa: [15.2993, 74.1240],
  visakhapatnam: [17.6868, 83.2185],
  vizag: [17.6868, 83.2185],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462]
};

export default function FleetMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [isSatellite, setIsSatellite] = useState(false);
  const [isTrafficOn, setIsTrafficOn] = useState(true);

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from database on mount + polling every 10s
  const fetchMapData = async () => {
    try {
      const response = await managerApi.getLiveTracking();
      setVehicles(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch map tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getCoordinates = (cityName) => {
    if (!cityName) return [18.5204, 73.8567]; // default Pune
    const norm = cityName.toLowerCase().trim();
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      if (norm.includes(key)) return coords;
    }
    return [18.5204, 73.8567]; // default Pune
  };

  const trackingVehicles = vehicles.map((v, index) => {
    const activeTrip = v.activeTrip;

    let status = "IDLE";
    if (v.assignmentStatus === "On Trip") {
      status = "ON TRANSIT";
    } else if (v.assignmentStatus === "Maintenance") {
      status = "MAINT";
    } else if (v.assignmentStatus === "Inactive") {
      status = "STOPPED";
    } else if (v.assignmentStatus === "Assigned") {
      status = "ASSIGNED";
    }

    const startLocationName = activeTrip ? activeTrip.startLocation : "Pune";
    const endLocationName = activeTrip ? activeTrip.endLocation : "Pune";
    const startCoords = getCoordinates(startLocationName);
    const endCoords = getCoordinates(endLocationName);

    const offset = (index * 0.007);
    const idleCoords = [18.5204 + offset * Math.sin(index), 73.8567 + offset * Math.cos(index)];
    
    const transitCoords = [
      (startCoords[0] + endCoords[0]) / 2,
      (startCoords[1] + endCoords[1]) / 2
    ];

    const coords = activeTrip 
      ? (activeTrip.status === "Scheduled" ? startCoords : transitCoords) 
      : idleCoords;

    const routeCoords = activeTrip 
      ? [startCoords, coords, endCoords]
      : [coords, coords];

    const driverName = v.assignedDriver?.fullName || "Unassigned";
    const driverPhone = v.assignedDriver?.phoneNumber || "";

    return {
      id: v._id,
      plateNumber: v.vehicleNumber,
      name: v.vehicleName,
      driver: driverName,
      type: v.vehicleType,
      rating: 4.8,
      status: status,
      phone: driverPhone,
      engineStatus: activeTrip ? "Running" : "Stopped",
      temperature: activeTrip ? "24 °C" : "21 °C",
      speed: activeTrip ? "65 km/h" : "0 km/h",
      fuelLevel: v.fuelCapacity ? `${Math.round(v.fuelCapacity * 0.85)} L` : "N/A",
      currentLocation: activeTrip ? `En route to ${activeTrip.endLocation}` : "At Depot / Idle",
      lastUpdated: v.updatedAt ? formatIFDWithTime() : "N/A",
      routeStart: startLocationName,
      routeEnd: endLocationName,
      eta: activeTrip ? formatIFD() + ", " + formatIFDWithTime() : "N/A",
      remaining: activeTrip ? "In transit" : "0 km",
      coords,
      routeCoords,
      rawAssignmentStatus: v.assignmentStatus
    };
  });

  const selectedVehicle = trackingVehicles.find(v => v.id === selectedVehicleId);

  // Check if navigated from notification with specific vehicle
  useEffect(() => {
    if (location.state?.vehicleId) {
      setSelectedVehicleId(location.state.vehicleId);
      toast.success("Vehicle Located on Map");
    }
  }, [location]);

  useEffect(() => {
    if (trackingVehicles.length > 0) {
      const exists = trackingVehicles.some(v => v.id === selectedVehicleId);
      if (!exists) {
        setSelectedVehicleId(trackingVehicles[0].id);
      }
    }
  }, [trackingVehicles, selectedVehicleId]);

  // Map DOM references
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routesGroupRef = useRef(null);
  const trafficGroupRef = useRef(null);

  // Tile layers
  const defaultTileLayerRef = useRef(null);
  const satelliteTileLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Pune / Lonavala region center default coords
    const centerCoords = [18.5204, 73.8567];
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(centerCoords, 9);

    // Standard street layer
    defaultTileLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      className: "map-tiles-grayscale"
    }).addTo(map);

    // Satellite imagery layer
    satelliteTileLayerRef.current = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19
    });

    // Custom Zoom controls at top-right
    L.control.zoom({
      position: "topright"
    }).addTo(map);

    // Layer Groups
    markersGroupRef.current = L.layerGroup().addTo(map);
    routesGroupRef.current = L.layerGroup().addTo(map);
    trafficGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update satellite layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isSatellite) {
      map.removeLayer(defaultTileLayerRef.current);
      satelliteTileLayerRef.current.addTo(map);
    } else {
      map.removeLayer(satelliteTileLayerRef.current);
      defaultTileLayerRef.current.addTo(map);
    }
  }, [isSatellite]);

  // Update markers and route lines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old layer items
    markersGroupRef.current.clearLayers();
    routesGroupRef.current.clearLayers();
    trafficGroupRef.current.clearLayers();

    // 1. Draw vehicle markers
    trackingVehicles.forEach(v => {
      const isSelected = v.id === selectedVehicleId;
      const markerColor = 
        v.status === "ON TRANSIT" ? "#B45A0A" : 
        v.status === "ASSIGNED" ? "#2563EB" : 
        v.status === "MAINT" ? "#D97706" : 
        v.status === "STOPPED" ? "#EF4444" : 
        "#64748B";

      const iconHtml = `<div class="relative w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg transition-transform ${isSelected ? "scale-125 z-50" : ""}" style="background-color: ${markerColor};">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16v-4a1 1 0 00-1-1h-7m8 5h-8" />
        </svg>
        ${isSelected ? `<span class="absolute -top-1 -right-1 flex h-3.5 w-3.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: ${markerColor};"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 border border-white" style="background-color: ${markerColor};"></span></span>` : ""}
      </div>`;

      const divIcon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(v.coords, { icon: divIcon })
        .bindPopup(`<div class="font-nunito"><strong>${v.plateNumber}</strong><br/>Driver: ${v.driver}<br/>Status: ${v.status}</div>`)
        .addTo(markersGroupRef.current);

      // Handle marker click selection
      marker.on("click", () => {
        setSelectedVehicleId(v.id);
      });
    });

    // 2. Draw polyline route for selected vehicle
    if (selectedVehicle) {
      const routePolyline = L.polyline(selectedVehicle.routeCoords, {
        color: "#B45A0A",
        weight: 5,
        dashArray: "8, 10",
        opacity: 0.8
      }).addTo(routesGroupRef.current);

      // Pan & zoom map to fit selected vehicle route bounds
      map.setView(selectedVehicle.coords, 13);
    }

    // 3. Draw simulated traffic lines if Traffic ON
    if (isTrafficOn) {
      const trafficLine = L.polyline([
        [18.5204, 73.8567],
        [18.7508, 73.4218]
      ], {
        color: "#EF4444",
        weight: 6,
        opacity: 0.6
      }).addTo(trafficGroupRef.current);
    }

  }, [selectedVehicleId, isTrafficOn, vehicles]);

  const filteredVehicles = trackingVehicles.filter(v => {
    const q = search.toLowerCase();
    const matchesSearch = (v.plateNumber || "").toLowerCase().includes(q) ||
                          (v.driver || "").toLowerCase().includes(q) ||
                          (v.name || "").toLowerCase().includes(q);

    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && v.rawAssignmentStatus === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "ON TRANSIT":
        return "bg-orange-50 text-[#B45A0A] border border-orange-100";
      case "ASSIGNED":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "IDLE":
        return "bg-slate-50 text-[#64748B] border border-slate-100";
      case "MAINT":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      case "STOPPED":
        return "bg-red-50 text-red-600 border border-red-100";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Live Tracking</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">Track all active vehicles and routes in real-time</p>
        </div>
        <span className="text-[10px] font-bold px-3 py-1.5 bg-orange-50 border border-orange-100 text-[#B45A0A] rounded-lg font-poppins tracking-wide">
          {trackingVehicles.length} LIVE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vehicles List */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-5 flex flex-col space-y-4 max-h-[600px] overflow-hidden">
          <h3 className="font-poppins font-black text-sm text-[#1E293B]">Active Vehicles</h3>

          {/* Filter search bar and status filter dropdown */}
          <div className="relative shrink-0 flex flex-col gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search active vehicles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] font-medium"
              />
            </div>
            <div className="relative w-full">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 bg-white border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] font-medium appearance-none"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="Assigned">Assigned</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#64748B]">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Vehicles items list */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {filteredVehicles.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No matching vehicles</p>
            ) : (
              filteredVehicles.map(v => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-3 border.5 rounded-xl cursor-pointer transition-all flex items-start justify-between select-none ${selectedVehicleId === v.id
                      ? "border-[#B45A0A] bg-orange-50/20 shadow-sm"
                      : "border-[#E7EAF0] bg-white hover:bg-gray-50/60"
                    }`}
                >
                  <div>
                    <p className="font-bold text-xs text-[#1E293B] font-poppins">{v.plateNumber}</p>
                    <span className="text-[10px] text-[#64748B] font-medium block mt-0.5">
                      {v.driver} • {v.name} ({v.type || "Truck"})
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getStatusBadge(v.status)}`}>
                    {v.status === "ON TRANSIT" ? "TRANSIT" : (v.status === "IDLE" ? "AVAILABLE" : v.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle Column: Map */}
        <div className="lg:col-span-6 relative rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
          <div ref={mapRef} className="w-full h-[600px]" />

          {/* Map Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 border border-[#E7EAF0] rounded-2xl shadow-xl z-[1000] flex items-center gap-3 select-none font-poppins text-xs font-bold text-[#1E293B]">
            <button
              onClick={() => setIsTrafficOn(!isTrafficOn)}
              className={`px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all ${isTrafficOn
                  ? "bg-[#B45A0A] text-white"
                  : "bg-white hover:bg-gray-50 border border-[#E7EAF0] text-[#64748B]"
                }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Traffic {isTrafficOn ? "ON" : "OFF"}</span>
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setIsSatellite(!isSatellite)}
              className={`px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all ${isSatellite
                  ? "bg-[#B45A0A] text-white"
                  : "bg-white hover:bg-gray-50 border border-[#E7EAF0] text-[#64748B]"
                }`}
            >
              {isSatellite ? <MapIcon className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
              <span>{isSatellite ? "Default Map" : "Satellite View"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Vehicle Details */}
        <div className="lg:col-span-3">
          {selectedVehicle && (
            <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-5 flex flex-col space-y-4 h-full max-h-[600px] overflow-y-auto custom-scrollbar select-none">

              {/* Header card info */}
              <div className="flex items-center justify-between border-b border-[#E7EAF0]/60 pb-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#B45A0A]" />
                  <span className="font-poppins font-black text-sm text-[#1E293B] uppercase">{selectedVehicle.plateNumber}</span>
                </div>
                <button
                  onClick={() => toast.success("Share link copied to clipboard")}
                  title="Share Live link"
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Driver info row */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 border border-orange-200 text-[#B45A0A] rounded-xl flex items-center justify-center font-poppins font-black text-sm shrink-0">
                    {selectedVehicle.driver.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h5 className="font-poppins font-bold text-[#1E293B] text-xs">{selectedVehicle.driver}</h5>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">Exp: 8 Years</span>
                  </div>
                </div>
                <a
                  href={`tel:${selectedVehicle.phone}`}
                  className="p-2 bg-white border border-[#E7EAF0] hover:bg-gray-50 text-[#B45A0A] rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* State Diagnostics Row */}
              <div className="grid grid-cols-2 gap-3 shrink-0">

                {/* Engine status */}
                <div className="bg-white border border-[#E7EAF0] rounded-xl p-3 flex flex-col space-y-1">
                  <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Engine</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${selectedVehicle.engineStatus === "Running" ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                    <span className="text-xs font-bold text-[#1E293B]">{selectedVehicle.engineStatus}</span>
                  </div>
                </div>

                {/* Temperature Box */}
                <div className="bg-white border border-[#E7EAF0] rounded-xl p-3 flex flex-col space-y-1">
                  <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Temperature</span>
                  <span className="text-xs font-bold text-[#1E293B] mt-0.5">{selectedVehicle.temperature}</span>
                </div>

                {/* Speed Box */}
                <div className="bg-white border border-[#E7EAF0] rounded-xl p-3 flex flex-col space-y-1">
                  <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Speed</span>
                  <span className="text-xs font-bold text-[#1E293B] mt-0.5">{selectedVehicle.speed}</span>
                </div>

                {/* Fuel Level Box */}
                <div className="bg-white border border-[#E7EAF0] rounded-xl p-3 flex flex-col space-y-1">
                  <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Fuel Level</span>
                  <span className="text-xs font-bold text-[#1E293B] mt-0.5">{selectedVehicle.fuelLevel}</span>
                </div>

              </div>

              {/* Additional Details */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex flex-col space-y-2.5 text-xs text-[#64748B] shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Type:</span>
                  <span className="font-bold text-[#1E293B]">{selectedVehicle.type || "Truck"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Current Location:</span>
                  <span className="font-bold text-[#1E293B]">{selectedVehicle.currentLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Last Updated:</span>
                  <span className="font-bold text-[#1E293B]">{selectedVehicle.lastUpdated}</span>
                </div>
              </div>

              {/* Route Progress indicator card */}
              <div className="bg-slate-900 border border-slate-950 rounded-2xl p-4 text-white flex flex-col space-y-3 shadow-md shrink-0">
                <div className="flex flex-col space-y-1">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-poppins">Current Route</span>
                  <p className="text-[11px] font-bold text-white mt-0.5 flex items-center gap-1">
                    <span>{selectedVehicle.routeStart}</span>
                    <span className="text-gray-400 font-normal">→</span>
                    <span>{selectedVehicle.routeEnd}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 select-none">
                  <div>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-poppins">Estimated Arrival</span>
                    <p className="text-xs font-black text-white mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      {selectedVehicle.eta}
                    </p>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-poppins">Remaining</span>
                    <p className="text-xs font-black text-white mt-1 leading-tight">{selectedVehicle.remaining}</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

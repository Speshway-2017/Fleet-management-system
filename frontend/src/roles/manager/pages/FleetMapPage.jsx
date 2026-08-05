import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  MapPin,
  Compass,
  Phone,
  Clock,
  Layers,
  Map as MapIcon,
  ChevronDown,
  Navigation,
  Share2,
  Truck
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { formatDisplayLocation } from "@/utils/locationFormatter";
import { managerApi } from "../api/managerApi";
import { calculateDrivingRoute, geocodeLocation } from "../services/routingService";
import { getSocket } from "@/api/socket";
import { useAuth } from "@/context/AuthContext";

export default function FleetMapPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [isSatellite, setIsSatellite] = useState(false);
  const [isTrafficOn, setIsTrafficOn] = useState(true);

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvedCoordsMap, setResolvedCoordsMap] = useState({});
  const [routeDataMap, setRouteDataMap] = useState({});
  const [routeStepMap, setRouteStepMap] = useState({});

  // Fetch live tracking vehicles from MongoDB (5s polling)
  const fetchMapData = async () => {
    try {
      const response = await managerApi.getLiveTracking();
      const rawVehicles = response.data?.data || response.data || [];
      setVehicles(rawVehicles);
    } catch (error) {
      console.error("Failed to fetch map tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Socket.IO Listeners for auto-update without refresh
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      if (user?._id || user?.id) {
        socket.emit("joinManagerRoom", user._id || user.id);
      }
      const handleUpdate = () => fetchMapData();
      socket.on("driverLocationUpdated", handleUpdate);
      socket.on("driver:location-update", handleUpdate);
      socket.on("tripStatusUpdated", handleUpdate);
      socket.on("notification:new", handleUpdate);

      return () => {
        socket.off("driverLocationUpdated", handleUpdate);
        socket.off("driver:location-update", handleUpdate);
        socket.off("tripStatusUpdated", handleUpdate);
        socket.off("notification:new", handleUpdate);
      };
    }
  }, [user]);

  // Dynamically resolve latitude & longitude from MongoDB vehicle.currentLocation or vehicle.branch
  useEffect(() => {
    if (vehicles.length === 0) return;

    vehicles.forEach(async (v) => {
      const locStr = v.currentLocation || v.branchDepot || v.branch;
      if (!locStr) return;
      const key = locStr.toLowerCase().trim();

      if (v.currentLatitude && v.currentLongitude && !isNaN(v.currentLatitude) && !isNaN(v.currentLongitude)) {
        if (!resolvedCoordsMap[key]) {
          setResolvedCoordsMap((prev) => ({
            ...prev,
            [key]: [v.currentLatitude, v.currentLongitude]
          }));
        }
        return;
      }

      if (resolvedCoordsMap[key] === undefined) {
        try {
          const coords = await geocodeLocation(locStr);
          setResolvedCoordsMap((prev) => ({
            ...prev,
            [key]: coords
          }));
        } catch (err) {
          setResolvedCoordsMap((prev) => ({
            ...prev,
            [key]: null
          }));
        }
      }
    });
  }, [vehicles]);

  // Asynchronously fetch OSRM road driving routes for active vehicle trips
  useEffect(() => {
    if (vehicles.length === 0) return;

    vehicles.forEach(async (v) => {
      const activeTrip = v.activeTrip;
      if (!activeTrip || !activeTrip.startLocation || !activeTrip.endLocation) return;

      const startLoc = activeTrip.startLocation;
      const endLoc = activeTrip.endLocation;
      const cacheKey = `${startLoc.toLowerCase().trim()}:${endLoc.toLowerCase().trim()}`;

      if (!routeDataMap[cacheKey]) {
        try {
          const res = await calculateDrivingRoute(startLoc, endLoc);
          if (res && res.success) {
            setRouteDataMap((prev) => ({
              ...prev,
              [cacheKey]: res
            }));
          }
        } catch (err) {
          console.warn("Failed to calculate driving route for:", startLoc, endLoc);
        }
      }
    });
  }, [vehicles]);

  // Smooth Point-by-Point Truck Movement Animation along OSRM Polyline for Active Trips
  useEffect(() => {
    const timer = setInterval(() => {
      setRouteStepMap((prevMap) => {
        const nextMap = { ...prevMap };

        vehicles.forEach((v) => {
          const activeTrip = v.activeTrip;
          if (!activeTrip) return;

          const startLoc = activeTrip.startLocation;
          const endLoc = activeTrip.endLocation;
          if (!startLoc || !endLoc) return;

          const cacheKey = `${startLoc.toLowerCase().trim()}:${endLoc.toLowerCase().trim()}`;
          const routeInfo = routeDataMap[cacheKey];
          const coordsArr = routeInfo?.routeGeometry || [];

          if (coordsArr.length >= 2) {
            const rawSt = (activeTrip.status || v.assignmentStatus || "").toUpperCase();
            const isTransit = ["ON TRANSIT", "IN TRANSIT", "IN PROGRESS", "EN ROUTE", "STARTED", "DISPATCHED"].includes(rawSt);

            if (isTransit) {
              const currentStep = prevMap[v._id] !== undefined ? prevMap[v._id] : 0;
              if (currentStep < coordsArr.length - 1) {
                nextMap[v._id] = currentStep + 1;
              } else {
                nextMap[v._id] = coordsArr.length - 1; // Stay at destination (DELIVERED)
              }
            }
          }
        });

        return nextMap;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [vehicles, routeDataMap]);

  // Process vehicles using only real geocoded coordinates & OSRM polyline animation
  const trackingVehicles = vehicles.map((v) => {
    const activeTrip = v.activeTrip;

    let status = "IDLE";
    if (v.assignmentStatus === "On Trip" || (activeTrip && ["In Transit", "In Progress", "En Route", "Dispatched"].includes(activeTrip.status))) {
      status = "ON TRANSIT";
    } else if (v.assignmentStatus === "Maintenance") {
      status = "MAINT";
    } else if (v.assignmentStatus === "Inactive") {
      status = "STOPPED";
    } else if (v.assignmentStatus === "Assigned") {
      status = "ASSIGNED";
    }

    const rawLoc = v.currentLocation || v.branchDepot || v.branch;
    const locKey = rawLoc ? rawLoc.toLowerCase().trim() : "";

    let dbCoords = null;
    if (v.currentLatitude && v.currentLongitude && !isNaN(v.currentLatitude) && !isNaN(v.currentLongitude)) {
      dbCoords = [v.currentLatitude, v.currentLongitude];
    } else if (locKey && resolvedCoordsMap[locKey]) {
      dbCoords = resolvedCoordsMap[locKey];
    }

    const startLocationName = activeTrip ? activeTrip.startLocation : null;
    const endLocationName = activeTrip ? activeTrip.endLocation : null;
    const routeKey = startLocationName && endLocationName ? `${startLocationName.toLowerCase().trim()}:${endLocationName.toLowerCase().trim()}` : null;
    const routeInfo = routeKey ? routeDataMap[routeKey] : null;

    const startCoords = routeInfo?.startCoords || activeTrip?.startCoords || null;
    const endCoords = routeInfo?.endCoords || activeTrip?.endCoords || null;

    const routeCoords = routeInfo?.routeGeometry && routeInfo.routeGeometry.length > 0
      ? routeInfo.routeGeometry
      : (startCoords && endCoords ? [startCoords, dbCoords || startCoords, endCoords] : []);

    // Calculate Truck Position strictly on OSRM Polyline
    let truckCoords = dbCoords;
    let stepIndex = routeStepMap[v._id] || 0;

    if (routeCoords.length >= 2) {
      if (stepIndex >= routeCoords.length) stepIndex = routeCoords.length - 1;
      truckCoords = routeCoords[stepIndex];
      if (stepIndex >= routeCoords.length - 1) {
        status = "DELIVERED";
      }
    }

    // Dynamic metrics calculation along polyline
    const totalDistanceKm = routeInfo?.distanceKm || activeTrip?.routeDistance || 38;
    const percentCompleted = routeCoords.length > 1 ? Math.round((stepIndex / (routeCoords.length - 1)) * 100) : 0;
    const remainingKm = routeCoords.length > 1
      ? Math.max(0, Math.round(totalDistanceKm * (1 - stepIndex / (routeCoords.length - 1))))
      : (activeTrip ? 18 : 0);

    const totalMins = routeInfo?.durationMins || 45;
    const remainingMins = Math.max(0, Math.round(totalMins * (1 - stepIndex / (routeCoords.length - 1))));
    const etaFormatted = remainingMins > 0 ? `${remainingMins} mins` : "Arrived / Delivered";

    const driverName = v.assignedDriver?.fullName || (activeTrip ? activeTrip.driverName : null);
    const driverPhone = v.assignedDriver?.phoneNumber || (activeTrip ? activeTrip.driverPhone : null);

    const locationDisplay = truckCoords
      ? (formatDisplayLocation(v.currentLocation, v.branch) !== "Unknown Location"
          ? formatDisplayLocation(v.currentLocation, v.branch)
          : rawLoc)
      : "Location unavailable";

    return {
      id: v._id,
      plateNumber: v.vehicleNumber,
      name: v.vehicleName,
      driver: driverName || "Unassigned",
      phone: driverPhone || "",
      type: v.vehicleType || "Truck",
      status: status,
      currentLocation: locationDisplay,
      isLocationUnavailable: !truckCoords,
      lastUpdated: v.updatedAt ? new Date(v.updatedAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) : "N/A",
      routeStart: startLocationName,
      routeEnd: endLocationName,
      eta: activeTrip ? etaFormatted : "N/A",
      totalDistance: totalDistanceKm ? `${totalDistanceKm} km` : "N/A",
      remaining: activeTrip ? `${remainingKm} km` : "N/A",
      percentCompleted,
      coords: truckCoords,
      startCoords,
      endCoords,
      routeCoords,
      rawAssignmentStatus: v.assignmentStatus
    };
  });

  const selectedVehicle = trackingVehicles.find(v => v.id === selectedVehicleId);

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

  // Tile layers
  const defaultTileLayerRef = useRef(null);
  const satelliteTileLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([20.5937, 78.9629], 5);

      defaultTileLayerRef.current = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      satelliteTileLayerRef.current = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19
      });

      L.control.zoom({
        position: "topright"
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      routesGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    } catch (e) {
      console.warn("Leaflet init warning:", e.message);
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (e) {}
    };
  }, []);

  // Update satellite layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map._loaded) return;

    try {
      if (isSatellite) {
        if (map.hasLayer(defaultTileLayerRef.current)) map.removeLayer(defaultTileLayerRef.current);
        if (!map.hasLayer(satelliteTileLayerRef.current)) satelliteTileLayerRef.current.addTo(map);
      } else {
        if (map.hasLayer(satelliteTileLayerRef.current)) map.removeLayer(satelliteTileLayerRef.current);
        if (!map.hasLayer(defaultTileLayerRef.current)) defaultTileLayerRef.current.addTo(map);
      }
    } catch (e) {}
  }, [isSatellite]);

  // Draw markers & route polylines dynamically and Auto-Pan moving truck
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersGroupRef.current.clearLayers();
    routesGroupRef.current.clearLayers();

    const validBounds = [];

    // 1. Draw vehicle markers for vehicles with valid resolved coordinates
    trackingVehicles.forEach(v => {
      if (!v.coords) return;

      validBounds.push(v.coords);
      const isSelected = v.id === selectedVehicleId;
      const markerColor = 
        v.status === "ON TRANSIT" ? "#B45A0A" : 
        v.status === "DELIVERED" ? "#10B981" :
        v.status === "ASSIGNED" ? "#2563EB" : 
        v.status === "MAINT" ? "#D97706" : 
        v.status === "STOPPED" ? "#EF4444" : 
        "#64748B";

      const iconHtml = `<div class="relative w-9 h-9 rounded-full flex items-center justify-center text-white border-2 border-white shadow-xl transition-all duration-500 ${isSelected ? "scale-125 z-50 ring-4 ring-orange-400/50" : ""}" style="background-color: ${markerColor};">
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16v-4a1 1 0 00-1-1h-7m8 5h-8" />
        </svg>
        <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: ${markerColor};"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 border border-white" style="background-color: ${markerColor};"></span></span>
      </div>`;

      const divIcon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const hoverTooltipContent = `
        <div class="font-poppins p-1 space-y-1">
          <div class="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <span>🚚 ${v.plateNumber}</span>
            <span class="text-[10px] text-amber-700 font-semibold">(${v.name})</span>
          </div>
          <div class="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-md flex items-center gap-1">
            <span>📍 Location:</span>
            <span class="text-slate-900 font-black">${v.currentLocation}</span>
          </div>
          <div class="text-[10px] text-slate-600 font-medium flex items-center gap-2">
            <span>👤 Driver: <strong class="text-slate-800">${v.driver}</strong></span>
            <span>|</span>
            <span>Status: <strong class="uppercase text-emerald-700">${v.status}</strong></span>
          </div>
        </div>
      `;

      const marker = L.marker(v.coords, { icon: divIcon })
        .bindTooltip(hoverTooltipContent, {
          direction: "top",
          offset: [0, -14],
          opacity: 0.98,
          className: "custom-map-tooltip"
        })
        .addTo(markersGroupRef.current);

      marker.on("click", () => {
        setSelectedVehicleId(v.id);
      });
    });

    // 2. Plot OSRM Route & Auto-pan map for selected vehicle
    if (selectedVehicle) {
      if (selectedVehicle.coords) {
        map.panTo(selectedVehicle.coords, { animate: true, duration: 0.8 });
      }

      if (selectedVehicle.routeCoords && selectedVehicle.routeCoords.length >= 2) {
        L.polyline(selectedVehicle.routeCoords, {
          color: "#3B82F6",
          weight: 8,
          opacity: 0.35,
          lineCap: "round"
        }).addTo(routesGroupRef.current);

        L.polyline(selectedVehicle.routeCoords, {
          color: "#B45A0A",
          weight: 5,
          opacity: 0.95,
          lineCap: "round"
        }).addTo(routesGroupRef.current);

        // Pickup (Start) Flag Marker
        if (selectedVehicle.startCoords) {
          const startIcon = L.divIcon({
            html: `<div class="relative flex flex-col items-center select-none cursor-pointer">
              <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center font-black text-xs shadow-xl ring-2 ring-emerald-300">
                🚩
              </div>
              <div class="mt-1 bg-emerald-950/90 text-emerald-100 border border-emerald-500/60 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-lg font-poppins flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Pickup: ${selectedVehicle.routeStart}</span>
              </div>
            </div>`,
            className: "",
            iconSize: [120, 50],
            iconAnchor: [60, 16]
          });

          L.marker(selectedVehicle.startCoords, { icon: startIcon })
            .bindPopup(`<b>Pickup Location</b><br/>${selectedVehicle.routeStart}`)
            .addTo(routesGroupRef.current);
        }

        // Destination Flag Marker
        if (selectedVehicle.endCoords) {
          const destIcon = L.divIcon({
            html: `<div class="relative flex flex-col items-center select-none cursor-pointer">
              <div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center font-black text-xs shadow-xl ring-2 ring-red-300">
                🏁
              </div>
              <div class="mt-1 bg-red-950/90 text-red-100 border border-red-500/60 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-lg font-poppins flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>Dest: ${selectedVehicle.routeEnd}</span>
              </div>
            </div>`,
            className: "",
            iconSize: [120, 50],
            iconAnchor: [60, 16]
          });

          L.marker(selectedVehicle.endCoords, { icon: destIcon })
            .bindPopup(`<b>Destination</b><br/>${selectedVehicle.routeEnd}`)
            .addTo(routesGroupRef.current);
        }
      }
    } else if (validBounds.length > 0) {
      map.fitBounds(L.latLngBounds(validBounds), { padding: [50, 50] });
    }

  }, [selectedVehicleId, isTrafficOn, vehicles, resolvedCoordsMap, routeDataMap, routeStepMap]);

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
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
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
    <div className="p-6 lg:p-8 space-y-6 font-nunito">
      <Breadcrumb />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-2xl lg:text-3xl text-[#1E293B]">Live Fleet Tracking</h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">Real-time OSRM GPS route tracking & live vehicle monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-800 font-poppins">Live GPS Connected</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Vehicle List */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-4 flex flex-col space-y-4 max-h-[620px] select-none">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search truck, driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-medium text-[#1E293B] placeholder-gray-400 focus:outline-none focus:border-[#B45A0A] transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {filteredVehicles.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No matching vehicles</p>
            ) : (
              filteredVehicles.map(v => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all flex items-start justify-between select-none ${selectedVehicleId === v.id
                      ? "border-[#B45A0A] bg-orange-50/20 shadow-sm ring-1 ring-orange-400/30"
                      : "border-[#E7EAF0] bg-white hover:bg-gray-50/60"
                    }`}
                >
                  <div>
                    <p className="font-bold text-xs text-[#1E293B] font-poppins flex items-center gap-1.5">
                      <span>{v.plateNumber}</span>
                    </p>
                    <span className="text-[10px] text-[#64748B] font-medium block mt-0.5">
                      {v.driver} • {v.name} ({v.type})
                    </span>
                    <span className={`text-[10px] font-bold block mt-1 ${v.isLocationUnavailable ? "text-red-500" : "text-amber-700"}`}>
                      📍 {v.currentLocation}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getStatusBadge(v.status)}`}>
                    {v.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle Column: Map & Dynamic Live Progress Header */}
        <div className="lg:col-span-6 relative rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden bg-slate-100">
          
          {/* Uber-Style Top Floating Progress Bar for Selected Active Trip */}
          {selectedVehicle?.routeStart && selectedVehicle?.routeEnd && (
            <div className="absolute top-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-xl font-poppins text-xs">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span className="text-emerald-600">Pickup ●</span>
                  <span className="text-slate-400 font-normal">━━━━━━━━🚚━━━━━━━━</span>
                  <span className="text-red-600">● Destination</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getStatusBadge(selectedVehicle.status)}`}>
                  {selectedVehicle.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center select-none">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Progress</span>
                  <p className="font-extrabold text-[#B45A0A] text-xs">{selectedVehicle.percentCompleted}%</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Remaining</span>
                  <p className="font-extrabold text-slate-900 text-xs">{selectedVehicle.remaining}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">ETA</span>
                  <p className="font-extrabold text-blue-600 text-xs">{selectedVehicle.eta}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={mapRef} className="w-full h-[620px]" />

          {/* Bottom Map Controls */}
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

        {/* Right Column: Vehicle & Trip Details */}
        <div className="lg:col-span-3">
          {selectedVehicle && (
            <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-5 flex flex-col space-y-4 h-full max-h-[620px] overflow-y-auto custom-scrollbar select-none">

              {/* Header card info */}
              <div className="flex items-center justify-between border-b border-[#E7EAF0]/60 pb-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-[#B45A0A]" />
                  <span className="font-poppins font-black text-sm text-[#1E293B] uppercase">{selectedVehicle.plateNumber}</span>
                </div>
                <button
                  onClick={() => toast.success("Live GPS link copied to clipboard")}
                  title="Share Live link"
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Driver info row */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 border border-amber-200 text-[#B45A0A] rounded-xl flex items-center justify-center font-poppins font-black text-sm shrink-0">
                    {selectedVehicle.driver.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h5 className="font-poppins font-bold text-[#1E293B] text-xs">{selectedVehicle.driver}</h5>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">
                      {selectedVehicle.phone ? `Phone: ${selectedVehicle.phone}` : "No phone number"}
                    </span>
                  </div>
                </div>
                {selectedVehicle.phone && (
                  <a
                    href={`tel:${selectedVehicle.phone}`}
                    className="p-2 bg-white border border-[#E7EAF0] hover:bg-gray-50 text-[#B45A0A] rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Dynamic Location Details */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex flex-col space-y-2.5 text-xs text-[#64748B] shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Vehicle Model / Type:</span>
                  <span className="font-bold text-[#1E293B]">{selectedVehicle.name} ({selectedVehicle.type})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Current Location:</span>
                  <span className={`font-bold ${selectedVehicle.isLocationUnavailable ? "text-red-500" : "text-[#1E293B]"}`}>
                    {selectedVehicle.currentLocation}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusBadge(selectedVehicle.status)}`}>
                    {selectedVehicle.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Last Sync:</span>
                  <span className="font-bold text-[#1E293B]">{selectedVehicle.lastUpdated}</span>
                </div>
              </div>

              {/* Active Trip Route Details (Origin, Destination, Polyline info, ETA, Remaining distance) */}
              {selectedVehicle.routeStart && selectedVehicle.routeEnd ? (
                <div className="bg-slate-900 border border-slate-950 rounded-2xl p-4 text-white flex flex-col space-y-3 shadow-md shrink-0">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest font-poppins">Active Trip Route</span>
                    <p className="text-[11px] font-bold text-white mt-0.5 flex items-center gap-1.5">
                      <span className="text-emerald-400">🚩 {selectedVehicle.routeStart}</span>
                      <span className="text-gray-400">➔</span>
                      <span className="text-red-400">🏁 {selectedVehicle.routeEnd}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 select-none">
                    <div>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-poppins">ETA</span>
                      <p className="text-xs font-black text-white mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {selectedVehicle.eta}
                      </p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-poppins">Remaining Distance</span>
                      <p className="text-xs font-black text-amber-400 mt-1 leading-tight">{selectedVehicle.remaining}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center text-xs text-slate-500 shrink-0">
                  No active trip assigned to this vehicle
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft,
  Route,
  ChevronDown,
  Clock,
  Calendar,
  Truck,
  User,
  MapPin,
  Compass,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  X,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

export default function TripDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [tripsList, setTripsList] = useState([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Coordinates dictionary for routing simulation
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
    goa: [15.2993, 74.1240]
  };

  const getCoordinates = (cityName) => {
    if (!cityName) return [18.5204, 73.8567]; // default Pune
    const norm = cityName.toLowerCase().trim();
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      if (norm.includes(key)) return coords;
    }
    return [18.5204, 73.8567]; // default Pune
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!trip || !mapRef.current) return;
    
    // Clear old map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const startCoords = getCoordinates(trip.startLocation);
    const endCoords = getCoordinates(trip.endLocation);

    // Initialize map
    const map = L.map(mapRef.current);
    
    // Set view to center or fit bounds
    map.setView(startCoords, 8);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Start Marker
    const startIcon = L.divIcon({
      html: `<div class="bg-[#B45A0A] rounded-full w-6 h-6 flex items-center justify-center text-white shadow-lg border-2 border-white animate-pulse">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Destination Marker
    const endIcon = L.divIcon({
      html: `<div class="bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-white shadow-lg border-2 border-white animate-pulse">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker(startCoords, { icon: startIcon }).bindPopup(`<strong>Start Location</strong><br/>${trip.startLocation}`).addTo(map);
    L.marker(endCoords, { icon: endIcon }).bindPopup(`<strong>Destination</strong><br/>${trip.endLocation}`).addTo(map);

    // Beautiful Polyline connecting them
    const polyline = L.polyline([startCoords, endCoords], {
      color: '#B45A0A',
      weight: 4,
      dashArray: '6, 8',
      opacity: 0.8
    }).addTo(map);

    // Zoom to fit polyline path bounds
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trip]);

  // Load trip record
  useEffect(() => {
    const saved = localStorage.getItem("fleet_trips");
    if (saved) {
      const list = JSON.parse(saved);
      setTripsList(list);
      const matched = list.find(t => t.id === id);
      setTrip(matched);
    }
  }, [id]);

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6 lg:p-8 font-poppins">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-9 h-9 text-red-500 animate-bounce" />
          <p className="text-gray-500 font-semibold">Trip record not found</p>
          <button onClick={() => navigate("/manager/trips")} className="text-xs text-[#B45A0A] hover:underline font-bold font-poppins mt-2">
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  // Calculate mock metrics for details view
  const isTransit = trip.status === "On Transit";
  const isCompleted = trip.status === "Completed";
  const isDelayed = trip.status === "Delayed";

  const handleUpdateStatus = (newStatus) => {
    const updatedList = tripsList.map(t => {
      if (t.id === trip.id) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTripsList(updatedList);
    localStorage.setItem("fleet_trips", JSON.stringify(updatedList));
    setTrip({ ...trip, status: newStatus });
    toast.success(`Trip status updated to ${newStatus}`);
  };

  const handleCancelTrip = () => {
    const updatedList = tripsList.filter(t => t.id !== trip.id);
    localStorage.setItem("fleet_trips", JSON.stringify(updatedList));
    setShowCancelConfirm(false);
    toast.success("Trip record cancelled and deleted");
    navigate("/manager/trips");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "On Transit":
        return "bg-[#FDF3EC] text-[#B45A0A] border border-[#FDF3EC]";
      case "Scheduled":
        return "bg-indigo-50 text-indigo-700 border border-indigo-100";
      case "Completed":
        return "bg-slate-900 text-white border border-slate-950";
      case "Delayed":
        return "bg-red-50 text-red-600 border border-red-100";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const formatDateTime = (dtString) => {
    if (!dtString) return "N/A";
    return new Date(dtString).toLocaleDateString("en-IN", {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    if (diffMs <= 0) return "0 hrs";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours} hrs ${diffMins} mins`;
    }
    return `${diffMins} mins`;
  };

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      {/* Back Navigation Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/manager/trips")}
          className="p-2.5 bg-white border border-[#E7EAF0] hover:bg-[#F5F7FB] rounded-xl text-[#64748B] hover:text-[#1E293B] transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-[#64748B] font-poppins">Back to Trips</span>
      </div>

      {/* Heading summary header card */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black font-poppins text-[#1E293B]">
              {trip.id}
            </h1>
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(trip.status)}`}>
              {trip.status}
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-2 font-medium">
            {trip.vehicleName} dispatch, route from <strong>{trip.startLocation}</strong> to <strong>{trip.endLocation}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {!isCompleted && (
            <button
              onClick={() => handleUpdateStatus("Completed")}
              className="flex-1 md:flex-none px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-[#B45A0A]/20 cursor-pointer text-center"
            >
              Complete Trip
            </button>
          )}
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all border border-red-100 cursor-pointer text-center"
          >
            Cancel Dispatch
          </button>
        </div>
      </div>

      {/* KPI statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        
        {/* Distance Travelled */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider font-poppins">Distance Travelled</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black text-[#1E293B] font-poppins">{isCompleted ? "320" : "180"}</span>
            <span className="text-xs text-[#64748B] font-bold">/ 320 km</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#B45A0A] h-full rounded-full transition-all" style={{ width: isCompleted ? "100%" : "56%" }}></div>
          </div>
        </div>

        {/* Estimated Arrival */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider font-poppins">Estimated Arrival</p>
          <p className="text-base font-bold text-[#1E293B] mt-2 font-poppins">
            {formatDateTime(trip.eta)}
          </p>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${isDelayed ? "text-red-500" : "text-emerald-500"}`}>
            <Clock className="w-3.5 h-3.5" />
            {isDelayed ? "Delayed" : "On Schedule"}
          </span>
        </div>

        {/* Time Taken to Destination */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider font-poppins">Time Taken to Destination</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-[#1E293B] font-poppins">
              {calculateDuration(trip.departureTime, trip.eta)}
            </span>
          </div>
          <span className="text-[10px] text-indigo-500 font-bold block">Total Dispatch Duration</span>
        </div>

      </div>

      {/* Form details / Map grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Column: Live Map */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-[#1E293B] text-[14px]">Live Transit Tracking</h3>
              <span className="px-2.5 py-1 bg-emerald-50 text-[#22C55E] border border-emerald-100 rounded-lg text-[9px] font-bold flex items-center gap-1 select-none">
                <Compass className="w-3 h-3 animate-spin" />
                GPS Connection Active
              </span>
            </div>

            {/* Leaflet map node container */}
            <div className="relative h-[360px] border border-[#DCE2E6] rounded-xl overflow-hidden shadow-inner">
              <div ref={mapRef} className="w-full h-full z-0" />
              
              {/* Floating Route indicators */}
              <div className="absolute bottom-3 left-3 z-[1000] flex flex-col gap-2 max-w-[220px] bg-white/95 backdrop-blur-sm border border-[#E7EAF0] p-3.5 rounded-xl shadow-lg font-poppins text-[10px] text-[#1E293B]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B45A0A]"></div>
                  <span><strong>Start:</strong> {trip.startLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                  <span><strong>Target:</strong> {trip.endLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkpoints Route Timeline */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
            <h3 className="font-poppins font-bold text-[#1E293B] text-[14px]">Route Timeline & Checkpoints</h3>
            
            <div className="relative pl-6 border-l-2 border-dashed border-gray-200 ml-3 space-y-6 pt-2">
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-[#B45A0A] rounded-full border-4 border-orange-100 z-10"></div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B] font-poppins">{trip.startLocation}</p>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Departed: {formatDateTime(trip.departureTime)}</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-emerald-500 rounded-full border-4 border-emerald-100 z-10"></div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B] font-poppins">Transit Diagnostic Checkpoint</p>
                  <span className="text-[10px] text-emerald-500 font-bold block mt-0.5">Passed: 2 Hours Ago</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4.5 h-4.5 bg-gray-300 rounded-full border-4 border-gray-100 z-10"></div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B] font-poppins">{trip.endLocation}</p>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Estimated Arrival: {formatDateTime(trip.eta)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Driver and Vehicle Details */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Assigned Driver Profile Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm space-y-4">
            <h4 className="font-poppins font-bold text-xs text-[#64748B] uppercase tracking-wider">Assigned Driver</h4>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 text-[#B45A0A] rounded-xl flex items-center justify-center shrink-0 font-poppins font-black text-base border border-orange-200">
                {trip.driverName.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              <div>
                <h5 className="font-poppins font-bold text-[#1E293B] text-sm">{trip.driverName}</h5>
                <div className="flex items-center gap-1 text-[11px] text-[#64748B] font-semibold mt-0.5">
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`tel:${trip.driverPhone}`}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-[#E7EAF0] rounded-xl text-[10px] font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Driver
              </a>
              <button
                onClick={() => toast.success("Chat service loading...")}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-[#E7EAF0] rounded-xl text-[10px] font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                Message
              </button>
            </div>
          </div>

          {/* Vehicle Details Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm space-y-4">
            <h4 className="font-poppins font-bold text-xs text-[#64748B] uppercase tracking-wider">Vehicle Details</h4>
            
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium font-poppins">Model</span>
                <span className="font-bold text-[#1E293B]">{trip.vehicleName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium font-poppins">Plate Number</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-poppins uppercase text-[10px] tracking-wide border border-indigo-100">
                  {trip.vehiclePlate}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium font-poppins">Current Speed</span>
                <span className="font-bold text-[#1E293B]">{isTransit ? "62 km/h" : "0 km/h"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium font-poppins">Fuel Level</span>
                <span className="font-bold text-[#1E293B]">84%</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/manager/vehicles-list")}
              className="w-full py-2 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-[10px] font-bold text-[#64748B] hover:text-[#1E293B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              View Fleet Diagnostics
            </button>
          </div>

        </div>

      </div>

      {/* --- CANCEL DISPATCH CONFIRMATION MODAL --- */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative animate-scale-up">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins text-[#1E293B] flex items-center gap-2 text-[#EF4444]">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                  Cancel Trip Dispatch
                </h3>
                <p className="text-xs text-[#64748B] mt-1 font-medium">
                  Are you absolutely sure you want to cancel and delete trip logs for dispatch <strong>{trip.id}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                >
                  Keep Trip
                </button>
                <button
                  onClick={handleCancelTrip}
                  className="px-5 py-2.5 bg-[#EF4444] hover:bg-red-700 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                >
                  Cancel Trip Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

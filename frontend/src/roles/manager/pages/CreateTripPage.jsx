import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowRight,
  TrendingUp,
  Percent,
  Layers,
  Search,
  DollarSign,
  Activity,
  Wallet
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
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
  lucknow: [26.8467, 80.9462],
  manali: [32.2396, 77.1887]
};

const getCoordinates = (cityName) => {
  if (!cityName) return [18.5204, 73.8567];
  const norm = cityName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (norm.includes(key)) return coords;
  }
  return [18.5204, 73.8567];
};

const calculateDistance = (startCity, endCity) => {
  if (!startCity || !endCity) return 0;
  const startCoords = getCoordinates(startCity);
  const endCoords = getCoordinates(endCity);

  if (startCoords[0] === 18.5204 && startCoords[1] === 73.8567 && 
      endCoords[0] === 18.5204 && endCoords[1] === 73.8567) {
    return 350;
  }

  const R = 6371;
  const dLat = (endCoords[0] - startCoords[0]) * Math.PI / 180;
  const dLon = (endCoords[1] - startCoords[1]) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startCoords[0] * Math.PI / 180) * Math.cos(endCoords[0] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d);
};

const CITIES_SUGGESTIONS = [
  "Ahmedabad",
  "Bengaluru",
  "Chennai",
  "Delhi",
  "Hyderabad",
  "Jaipur",
  "Kolkata",
  "Mumbai",
  "Pune",
  "Surat",
  "Vijayawada",
  "Visakhapatnam"
];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isViewOnly = user?.subscriptionStatus !== "ACTIVE";

  // Lists loaded from backend
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [tripNumber, setTripNumber] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [tripNotes, setTripNotes] = useState("");

  // Filters
  const [filterAvailableVehicles, setFilterAvailableVehicles] = useState(true);
  const [filterAvailableDrivers, setFilterAvailableDrivers] = useState(true);

  const [loading, setLoading] = useState(false);

  // Form inputs
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [eta, setEta] = useState("");
  const [status, setStatus] = useState("Assigned");
  const [description, setDescription] = useState("");

  const [departureError, setDepartureError] = useState("");
  const [etaError, setEtaError] = useState("");

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);

  const handleStartLocationChange = (val) => {
    setStartLocation(val);
    if (val.trim().length > 0) {
      const filtered = CITIES_SUGGESTIONS.filter(c =>
        c.toLowerCase().includes(val.toLowerCase())
      );
      setStartSuggestions(filtered);
      setShowStartSuggestions(true);
    } else {
      setStartSuggestions([]);
      setShowStartSuggestions(false);
    }
  };

  const handleEndLocationChange = (val) => {
    setEndLocation(val);
    if (val.trim().length > 0) {
      const filtered = CITIES_SUGGESTIONS.filter(c =>
        c.toLowerCase().includes(val.toLowerCase())
      );
      setEndSuggestions(filtered);
      setShowEndSuggestions(true);
    } else {
      setEndSuggestions([]);
      setShowEndSuggestions(false);
    }
  };

  const getCurrentDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinEtaString = (depTime) => {
    if (!depTime) return getCurrentDateTimeString();
    const d = new Date(depTime);
    d.setMinutes(d.getMinutes() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const validateDates = (depVal, etaVal) => {
    let depErr = "";
    let etaErr = "";

    const currentDate = new Date();

    if (depVal) {
      const depDate = new Date(depVal);
      if (depDate.getTime() + 60000 < currentDate.getTime()) {
        depErr = "Departure Time cannot be in the past.";
      }
    }

    if (depVal && etaVal) {
      const depDate = new Date(depVal);
      const etaDate = new Date(etaVal);
      if (etaDate.getTime() <= depDate.getTime()) {
        etaErr = "Estimated Arrival (ETA) must be later than the Departure Time.";
      }
    }

    setDepartureError(depErr);
    setEtaError(etaErr);

    return { depErr, etaErr };
  };

  const handleDepartureTimeChange = (val) => {
    setDepartureTime(val);
    
    let updatedEta = eta;
    if (val && eta) {
      const depDate = new Date(val);
      const etaDate = new Date(eta);
      if (depDate.getTime() >= etaDate.getTime()) {
        setEta("");
        updatedEta = "";
      }
    }

    validateDates(val, updatedEta);
  };

  const handleEtaChange = (val) => {
    setEta(val);
    validateDates(departureTime, val);
  };

  const handleBlur = () => {
    validateDates(departureTime, eta);
  };

  // Generate trip ID on mount
  useEffect(() => {
    setTripNumber(`TRP-${Math.floor(100000 + Math.random() * 900000)}`);
  }, []);

  // Load resources dynamically from backend based on startLocation
  useEffect(() => {
    if (!startLocation.trim()) {
      setVehicles([]);
      setDrivers([]);
      setSelectedDriverId("");
      setSelectedVehicleId("");
      return;
    }

    const fetchResources = async () => {
      setLoading(true);
      try {
        const cleanLoc = startLocation.trim();
        const [vRes, dRes] = await Promise.all([
          managerApi.getAvailableVehicles({ location: cleanLoc }),
          managerApi.getAvailableDrivers({ location: cleanLoc })
        ]);
        
        const allVehicles = vRes.data?.data || vRes.data || [];
        const allDrivers = dRes.data?.data || dRes.data || [];

        const normalize = (str) => (str || "").trim().toLowerCase();

        const isLocationMatch = (driverLoc, targetLoc) => {
          if (!driverLoc || !targetLoc) return false;
          const normDriver = normalize(driverLoc);
          const normTarget = normalize(targetLoc);
          const targetFirstWord = normTarget.split(/[\s,]+/)[0];
          const driverFirstWord = normDriver.split(/[\s,]+/)[0];
          return (
            normDriver === normTarget ||
            normDriver.includes(targetFirstWord) ||
            targetFirstWord.includes(driverFirstWord)
          );
        };

        // Filter vehicles strictly by current location stored in database
        const filteredVehs = allVehicles.filter(v => {
          const vLoc = v.currentLocation || v.branch || "";
          return isLocationMatch(vLoc, cleanLoc);
        });

        // Filter drivers strictly by current location stored in database
        const filteredDrvs = allDrivers.filter(d => {
          const dLoc = d.currentLocation || d.driverLocation || d.branch || "";
          return isLocationMatch(dLoc, cleanLoc);
        });

        const vehiclesData = filteredVehs.map(v => {
          const isAvailable = v.currentStatus === 'Available' || v.currentStatus === 'Active';
          return {
            ...v,
            id: v._id,
            name: v.vehicleName || `${v.brand} ${v.model}`,
            plateNumber: v.vehicleNumber,
            status: isAvailable ? 'Available' : 'Under Maintenance'
          };
        });

        const driversData = filteredDrvs.map(d => {
          const isAvailable = d.driverStatus === 'AVAILABLE';
          return {
            ...d,
            id: d._id,
            name: d.fullName,
            status: isAvailable ? 'Available' : 'Not Available'
          };
        });

        setDrivers(driversData);
        setVehicles(vehiclesData);

        // Auto-clear selection if it is not in the new filtered location list
        setSelectedDriverId(prev => {
          if (prev && !driversData.some(d => String(d.id) === String(prev))) {
            return "";
          }
          return prev;
        });
        setSelectedVehicleId(prev => {
          if (prev && !vehiclesData.some(v => String(v.id) === String(prev))) {
            return "";
          }
          return prev;
        });
      } catch (error) {
        toast.error("Failed to load driver/vehicle lists from database");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchResources();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [startLocation]);

  const handleDispatch = async (e) => {
    e.preventDefault();

    const { depErr, etaErr } = validateDates(departureTime, eta);
    if (depErr || etaErr) {
      toast.error(depErr || etaErr);
      return;
    }

    if (!startLocation.trim()) {
      toast.error("Pickup Location is required.");
      return;
    }
    if (!endLocation.trim()) {
      toast.error("Destination is required.");
      return;
    }
    if (startLocation.trim().toLowerCase() === endLocation.trim().toLowerCase()) {
      toast.error("Pickup and Destination cannot be the same.");
      return;
    }
    if (!departureTime) {
      toast.error("Departure Time is required.");
      return;
    }
    if (!eta) {
      toast.error("Estimated Arrival is required.");
      return;
    }

    const pickupDate = new Date(departureTime);
    const currentDate = new Date();
    if (pickupDate.getTime() + 300000 < currentDate.getTime()) {
      toast.error("Pickup Date and Time cannot be in the past.");
      return;
    }

    if (!selectedVehicleId) {
      toast.error("Please select a vehicle from Asset Allocation");
      return;
    }

    const driver = selectedDriverId ? drivers.find(d => String(d.id) === String(selectedDriverId)) : null;
    const vehicle = vehicles.find(v => String(v.id) === String(selectedVehicleId));

    if (!vehicle) {
      toast.error("Selected vehicle is not from the selected Start Location or is no longer available.");
      return;
    }
    if (selectedDriverId && !driver) {
      toast.error("Selected driver is not from the selected Start Location or is no longer available.");
      return;
    }

    try {
      const distance = calculateDistance(startLocation, endLocation) || 250;
      await managerApi.createTrip({
        tripNumber,
        vehicle: vehicle._id,
        driver: driver ? driver._id : undefined,
        driverName: driver ? driver.name : "",
        driverPhone: driver ? driver.phone : "",
        vehicleName: vehicle.name,
        vehiclePlate: vehicle.plateNumber,
        startLocation,
        endLocation,
        departureTime,
        eta,
        status,
        description: description || "General Dispatch Cargo",
        cargoType,
        cargoWeight: cargoWeight ? Number(cargoWeight) : undefined,
        tripNotes,
        estimatedDistance: distance
      });

      toast.success("Trip dispatched successfully!");
      navigate("/manager/trips");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to dispatch trip");
      console.error(error);
    }
  };

  const distance = calculateDistance(startLocation, endLocation) || 250;
  const isWeightValid = cargoWeight !== null && cargoWeight !== undefined && cargoWeight.toString().trim() !== "";
  const cargoWeightDisplay = isWeightValid ? `${cargoWeight} kg` : "--";

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />
      {/* Breadcrumbs & Title header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E7EAF0] pb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Dispatch New Trip
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px] font-medium">
            Configure vehicle, route details, and driver assignment.
          </p>
        </div>

        <div className="flex items-center gap-3 select-none w-full md:w-auto">
          <button
            type="button"
            onClick={() => navigate("/manager/trips")}
            className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            disabled={!!departureError || !!etaError || !departureTime || !eta}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md cursor-pointer text-center ${
              (departureError || etaError || !departureTime || !eta)
                ? "bg-gray-300 shadow-none cursor-not-allowed opacity-60"
                : "bg-[#B45A0A] hover:bg-[#9A4D08] shadow-[#B45A0A]/20"
            }`}
          >
            Dispatch Trip
          </button>
        </div>
      </div>

      {/* Form Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Column: Trip Specifications */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Trip Specifications Form Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E7EAF0]">
              <Route className="w-5 h-5 text-[#B45A0A]" />
              <h3 className="font-poppins font-bold text-[#1E293B] text-[16px]">Trip Specifications</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trip ID */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Trip ID (Auto-generated)
                </label>
                <input
                  type="text"
                  value={tripNumber}
                  disabled
                  className="w-full px-3.5 py-2.5 h-[44px] bg-slate-50 border border-[#E7EAF0] rounded-xl text-sm text-[#64748B] font-medium focus:outline-none select-none"
                />
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Initial Trip Status *
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none cursor-pointer font-medium"
                    required
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="On Transit">On Transit</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Start Location */}
               <div>
                 <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                   Start Location *
                 </label>
                 <div className="relative">
                   <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                   <input
                     type="text"
                     placeholder="e.g. Mumbai, MH"
                     value={startLocation}
                     onChange={(e) => handleStartLocationChange(e.target.value)}
                     onFocus={() => {
                       if (startLocation.trim().length > 0) {
                         setShowStartSuggestions(true);
                       }
                     }}
                     onBlur={() => {
                       setTimeout(() => setShowStartSuggestions(false), 200);
                     }}
                     className="w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                     required
                   />
                   {showStartSuggestions && startSuggestions.length > 0 && (
                     <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E7EAF0] rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                       {startSuggestions.map((city) => (
                         <div
                           key={city}
                           onMouseDown={() => {
                             setStartLocation(city);
                             setShowStartSuggestions(false);
                           }}
                           className="px-4 py-2 hover:bg-orange-50/50 hover:text-[#B45A0A] text-sm text-gray-700 font-medium cursor-pointer transition-colors"
                         >
                           {city}
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
 
               {/* End Location */}
               <div>
                 <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                   Destination *
                 </label>
                 <div className="relative">
                   <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                   <input
                     type="text"
                     placeholder="e.g. Pune, MH"
                     value={endLocation}
                     onChange={(e) => handleEndLocationChange(e.target.value)}
                     onFocus={() => {
                       if (endLocation.trim().length > 0) {
                         setShowEndSuggestions(true);
                       }
                     }}
                     onBlur={() => {
                       setTimeout(() => setShowEndSuggestions(false), 200);
                     }}
                     className="w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                     required
                   />
                   {showEndSuggestions && endSuggestions.length > 0 && (
                     <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E7EAF0] rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                       {endSuggestions.map((city) => (
                         <div
                           key={city}
                           onMouseDown={() => {
                             setEndLocation(city);
                             setShowEndSuggestions(false);
                           }}
                           className="px-4 py-2 hover:bg-orange-50/50 hover:text-[#B45A0A] text-sm text-gray-700 font-medium cursor-pointer transition-colors"
                         >
                           {city}
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Departure Time */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Departure Time *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => handleDepartureTimeChange(e.target.value)}
                    onBlur={handleBlur}
                    min={getCurrentDateTimeString()}
                    className={`w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium ${
                      departureError ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0]"
                    }`}
                    required
                  />
                </div>
                {departureError && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">{departureError}</p>
                )}
              </div>

              {/* ETA */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Estimated Arrival (ETA) *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="datetime-local"
                    value={eta}
                    onChange={(e) => handleEtaChange(e.target.value)}
                    onBlur={handleBlur}
                    min={getMinEtaString(departureTime)}
                    className={`w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium ${
                      etaError ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0]"
                    }`}
                    required
                  />
                </div>
                {etaError && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">{etaError}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cargo Type */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Cargo Type (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Perishable Goods, Electronics"
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                />
              </div>

              {/* Cargo Weight */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Cargo Weight (Optional, kg)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cargo Description */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Cargo / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Express Deliveries"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                />
              </div>

              {/* Trip Notes */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Trip Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handle with care, route via tollway"
                  value={tripNotes}
                  onChange={(e) => setTripNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Asset Allocation & Driver Assignment */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Asset Allocation Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#B45A0A]" />
                <h3 className="font-poppins font-bold text-[#1E293B] text-[16px]">Asset Allocation</h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterAvailableVehicles(!filterAvailableVehicles)}
                className="text-[10px] font-bold text-[#B45A0A] bg-orange-50 border border-orange-100 hover:bg-orange-100/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer select-none font-poppins"
              >
                {filterAvailableVehicles ? "Show All Vehicles" : "Filter Available"}
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {!startLocation.trim() ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <MapPin className="w-8 h-8 text-[#94A3B8] mb-2" />
                  <p className="text-xs text-gray-400 font-semibold font-poppins">Please select a Start Location to view available vehicles and drivers.</p>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-400 mt-2 font-semibold">Fetching available vehicles...</p>
                </div>
              ) : (filterAvailableVehicles 
                ? vehicles.filter(v => v.status === "Available" || v.status === "Active")
                : vehicles
              ).length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center font-semibold">No available vehicles found for the selected start location.</p>
              ) : (
                (filterAvailableVehicles 
                  ? vehicles.filter(v => v.status === "Available" || v.status === "Active")
                  : vehicles
                ).map(v => (
                  <div
                    key={v.id}
                    onClick={() => {
                      if (v.status === "Under Maintenance") return;
                      setSelectedVehicleId(String(v.id));
                    }}
                    className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
                      v.status === "Under Maintenance"
                        ? "border-[#E7EAF0] bg-gray-50/50 opacity-60 cursor-not-allowed"
                        : String(selectedVehicleId) === String(v.id)
                        ? "border-[#B45A0A] bg-orange-50/20 shadow-sm cursor-pointer"
                        : "border-[#E7EAF0] bg-white hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-[#1E293B]">{v.name}</p>
                      <span className="text-[10px] text-[#64748B] font-semibold block mt-0.5 uppercase">Reg: {v.plateNumber}</span>
                      <div className="text-[10px] text-gray-500 mt-1 font-semibold flex flex-wrap gap-x-2 gap-y-0.5">
                        <span>Type: <strong className="text-[#1E293B]">{v.vehicleType || v.type || "Truck"}</strong></span>
                        <span>|</span>
                        <span>Location: <strong className="text-[#1E293B]">{v.branch || "Pune"}</strong></span>
                      </div>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-[6px] text-[8px] font-bold uppercase ${
                        v.status === "Active" || v.status === "Available"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}>
                        {v.status}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      disabled={v.status === "Under Maintenance"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVehicleId(String(v.id));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        v.status === "Under Maintenance"
                          ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed font-poppins"
                          : String(selectedVehicleId) === String(v.id)
                          ? "bg-[#B45A0A] text-white shadow-sm font-poppins"
                          : "bg-white hover:bg-gray-50 border border-[#E7EAF0] text-[#64748B] font-poppins"
                      }`}
                    >
                      {String(selectedVehicleId) === String(v.id) ? "Allocated" : "Allocate"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Driver Assignment Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#B45A0A]" />
                <h3 className="font-poppins font-bold text-[#1E293B] text-[16px]">Driver Assignment</h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterAvailableDrivers(!filterAvailableDrivers)}
                className="text-[10px] font-bold text-[#B45A0A] bg-orange-50 border border-orange-100 hover:bg-orange-100/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer select-none font-poppins"
              >
                {filterAvailableDrivers ? "Show All Drivers" : "Filter Available"}
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {!startLocation.trim() ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <User className="w-8 h-8 text-[#94A3B8] mb-2" />
                  <p className="text-xs text-gray-400 font-semibold font-poppins">Please select a Start Location to view available vehicles and drivers.</p>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-400 mt-2 font-semibold">Fetching available drivers...</p>
                </div>
              ) : (filterAvailableDrivers 
                ? drivers.filter(d => d.status === "Available" && (!d.licenseExpiry || new Date(d.licenseExpiry) >= new Date()))
                : drivers
              ).length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center font-semibold font-poppins">No drivers available in the selected location.</p>
              ) : (
                (filterAvailableDrivers 
                  ? drivers.filter(d => d.status === "Available" && (!d.licenseExpiry || new Date(d.licenseExpiry) >= new Date()))
                  : drivers
                ).map(d => {
                  const isExpired = d.licenseExpiry && new Date(d.licenseExpiry) < new Date();
                  return (
                    <div
                      key={d.id}
                      onClick={() => {
                        if (isExpired) {
                          toast.error("This driver has an expired license and cannot be assigned.");
                          return;
                        }
                        if (d.status === "Not Available") {
                          return;
                        }
                        setSelectedDriverId(String(d.id));
                      }}
                      className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
                        (isExpired || d.status === "Not Available")
                          ? "border-red-150 bg-red-50/10 opacity-60 cursor-not-allowed"
                          : String(selectedDriverId) === String(d.id)
                          ? "border-[#B45A0A] bg-orange-50/20 shadow-sm cursor-pointer"
                          : "border-[#E7EAF0] bg-white hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs text-[#1E293B]">{d.name}</p>
                        <span className="text-[10px] text-[#64748B] block mt-0.5 font-semibold">
                          Emp ID: {d.employeeId || "N/A"}
                        </span>
                        <div className="text-[10px] text-gray-500 mt-1 font-semibold flex flex-wrap gap-x-2 gap-y-0.5">
                          <span>Lic Validity: <strong className={isExpired ? "text-red-500" : "text-[#1E293B]"}>{d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : "Valid"}</strong></span>
                          <span>|</span>
                          <span>Location: <strong className="text-[#1E293B]">{d.driverLocation || d.branch || "Pune"}</strong></span>
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[8px] font-bold uppercase ${
                            isExpired
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : d.status === "Available"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}>
                            {isExpired ? "Expired License" : d.status}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        disabled={isExpired || d.status === "Not Available"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isExpired) {
                            toast.error("This driver has an expired license and cannot be assigned.");
                            return;
                          }
                          setSelectedDriverId(String(d.id));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          (isExpired || d.status === "Not Available")
                            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed font-poppins"
                            : String(selectedDriverId) === String(d.id)
                            ? "bg-[#B45A0A] text-white shadow-sm font-poppins"
                            : "bg-white hover:bg-gray-50 border border-[#E7EAF0] text-[#64748B] font-poppins"
                        }`}
                      >
                        {String(selectedDriverId) === String(d.id) ? "Assigned" : "Assign"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Row containing Map and Cost Projections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Map Diagnostics Viewport Card */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
          <h4 className="font-poppins font-bold text-xs text-[#64748B] uppercase tracking-wider">Active Route Simulation Map</h4>
          
          <div className="relative h-[240px] bg-[#E8ECEF] border border-[#DCE2E6] rounded-xl overflow-hidden flex flex-col justify-between p-4">
            {/* Mock Map Background Details */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#64748b_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
            
            {/* Top Floating Badge */}
            <div className="z-10 flex items-center justify-between">
              <span className="px-2.5 py-1 bg-white border border-[#E7EAF0] rounded-lg text-[9px] font-bold text-[#B45A0A] flex items-center gap-1">
                <Compass className="w-3 h-3 animate-spin" />
                Active Diagnostics Routing
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-[#22C55E] border border-emerald-100 rounded-lg text-[9px] font-bold">
                Route Connected
              </span>
            </div>

            {/* Route Dot representation */}
            <div className="z-10 flex items-center justify-between max-w-[280px] mx-auto w-full relative pt-12">
              <div className="absolute left-1 right-1 top-[56px] h-0.5 border-t-2 border-dashed border-[#B45A0A]"></div>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-white border-4 border-[#B45A0A] rounded-full z-10"></div>
                <span className="text-[10px] font-bold text-[#1E293B] mt-1.5">{startLocation || "Source Point"}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-[#B45A0A] rounded-full z-10"></div>
                <span className="text-[10px] font-bold text-[#1E293B] mt-1.5">{endLocation || "Destination Point"}</span>
              </div>
            </div>

            {/* Bottom traffic metrics */}
            <div className="z-10 bg-white border border-[#E7EAF0] rounded-xl p-3 flex items-center justify-between text-[10px] font-semibold text-[#64748B] font-poppins">
              <span>Simulation Live</span>
              <span>Heavy Traffic Detected</span>
              <span className="text-[#B45A0A] hover:underline cursor-pointer">Fit View Route</span>
            </div>
          </div>
        </div>

        {/* Cost & Earnings Projection Card */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
          <h4 className="font-poppins font-bold text-xs text-[#64748B] uppercase tracking-wider">Route Projections</h4>
          
          {!startLocation.trim() || !endLocation.trim() ? (
            <div className="p-4 bg-orange-50/30 rounded-xl border border-orange-100/50 text-center text-xs text-[#B45A0A] font-semibold font-poppins">
              Enter both Start Location and Destination to view route projections.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider font-poppins block">Route Distance</span>
                  <span className="text-lg font-black text-[#1E293B] font-poppins mt-1 block">{distance} KM</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider font-poppins block">Cargo Weight</span>
                  <span className="text-lg font-black text-[#1E293B] font-poppins mt-1 block">{cargoWeightDisplay}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

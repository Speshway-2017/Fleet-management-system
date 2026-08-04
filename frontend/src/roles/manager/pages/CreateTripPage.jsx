import { useState, useEffect, useRef } from "react";
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
  Wallet,
  Navigation,
  Phone,
  Building2,
  Trash2,
  Check,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { formatDisplayLocation } from "@/utils/locationFormatter";
import { formatEmployeeId } from "@/utils/employeeIdFormatter";
import { useAuth } from "@/context/AuthContext";
import { managerApi } from "../api/managerApi";
import { calculateDrivingRoute, calculateEtaFromDuration } from "../services/routingService";
import { INDIAN_STATES, getCitiesForState, getStateForCity } from "@/constants/indianStates";
import { cleanCityName } from "@/utils/locationFormatter";

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

function SearchableSelect({
  label,
  required,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  error,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => {
    const optName = typeof opt === "object" ? opt.name : opt;
    return String(optName).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelect = (optVal) => {
    const valStr = typeof optVal === "object" ? optVal.name : optVal;
    onChange(valStr);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-[#B45A0A]/20 ${disabled
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : error
              ? "border-red-300 focus:border-red-500 text-[#1E293B]"
              : "border-[#E7EAF0] focus:border-[#B45A0A] text-[#1E293B]"
          }`}
      >
        <span className={value ? "text-[#1E293B] font-semibold font-poppins" : "text-gray-400 font-normal font-poppins"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-[#E7EAF0] rounded-xl shadow-lg overflow-hidden py-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-2.5 pb-2 border-b border-[#E7EAF0]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                autoFocus
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-[#E7EAF0] rounded-lg text-xs focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-poppins"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto custom-scrollbar py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-gray-400 text-center font-medium font-poppins">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const optStr = typeof opt === "object" ? opt.name : opt;
                const isSelected = value === optStr;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between font-poppins transition-colors ${isSelected
                        ? "bg-amber-50 text-[#B45A0A] font-bold"
                        : "text-[#1E293B] hover:bg-gray-50 font-medium"
                      }`}
                  >
                    <span>{optStr}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#B45A0A]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
}

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
  const [isNearbyVehiclesFallback, setIsNearbyVehiclesFallback] = useState(false);
  const [isNearbyDriversFallback, setIsNearbyDriversFallback] = useState(false);

  const [loading, setLoading] = useState(false);

  // Form inputs
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [eta, setEta] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [description, setDescription] = useState("");

  const normalizeCityName = (loc) => {
    if (!loc || typeof loc !== 'string') return '';
    return loc.trim().split(',')[0].trim().toLowerCase();
  };

  const isSameLocation = (start, end) => {
    const normStart = normalizeCityName(start);
    const normEnd = normalizeCityName(end);
    return !!(normStart && normEnd && normStart === normEnd);
  };

  const isSameLocError = isSameLocation(startLocation, endLocation);

  useEffect(() => {
    if (isSameLocError) {
      toast.error("Trip cannot be created because the pickup and destination locations are the same.", {
        id: "same-location-warning"
      });
    }
  }, [startLocation, endLocation, isSameLocError]);

  const [departureError, setDepartureError] = useState("");
  const [etaError, setEtaError] = useState("");

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);

  // Address States for Logistics & Invoice
  const [pickupAddress, setPickupAddress] = useState({
    companyName: "",
    contactPerson: "",
    mobile: "",
    streetAddress: "",
    area: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [deliveryAddress, setDeliveryAddress] = useState({
    companyName: "",
    contactPerson: "",
    mobile: "",
    streetAddress: "",
    area: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [pickupErrors, setPickupErrors] = useState({});
  const [deliveryErrors, setDeliveryErrors] = useState({});

  const validateAddressField = (type, field, val) => {
    let err = "";
    if (field === 'companyName') {
      if (!val || !val.trim()) err = "Company Name is required.";
    } else if (field === 'contactPerson') {
      if (!val || !val.trim()) err = "Contact Person is required.";
    } else if (field === 'mobile') {
      if (!val) err = "Mobile Number is required.";
      else if (!/^\d{10}$/.test(val)) err = "Mobile number must be exactly 10 digits.";
    } else if (field === 'streetAddress') {
      if (!val || !val.trim()) err = "Street Address is required.";
      else if (val.trim().length < 10) err = "Street Address must be at least 10 characters.";
    } else if (field === 'city') {
      if (!val || !val.trim()) err = "City is required.";
    } else if (field === 'state') {
      if (!val || !val.trim()) err = "State is required.";
    } else if (field === 'pincode') {
      if (!val) err = "Pincode is required.";
      else if (!/^\d{6}$/.test(val)) err = "Pincode must be exactly 6 digits.";
    }
    return err;
  };

  const handleAddressChange = (type, field, val) => {
    if (type === 'pickup') {
      setPickupAddress(prev => ({ ...prev, [field]: val }));
      const err = validateAddressField('pickup', field, val);
      setPickupErrors(prev => ({ ...prev, [field]: err }));
    } else {
      setDeliveryAddress(prev => ({ ...prev, [field]: val }));
      const err = validateAddressField('delivery', field, val);
      setDeliveryErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleUseCurrentBranch = () => {
    const rawCity = (startLocation.trim() || user?.city || user?.branch || "Pune").split(',')[0].trim();
    const city = cleanCityName(rawCity) || "Pune";

    let state = user?.state || "";
    if (!state || !INDIAN_STATES.some(s => s.name.toLowerCase() === state.trim().toLowerCase())) {
      state = getStateForCity(city) || "Maharashtra";
    }

    const pincodeMap = {
      Hyderabad: "500001",
      Pune: "411001",
      Visakhapatnam: "530001",
      Mumbai: "400001",
      Bengaluru: "560001",
      Chennai: "600001",
      Delhi: "110001",
      Tirupati: "517501"
    };

    const newAddress = {
      companyName: user?.companyName || user?.fullName || "Speshway Logistics Pvt Ltd",
      contactPerson: user?.fullName || user?.name || "G Sai Kiran",
      mobile: (user?.mobile || user?.phone || "9876543210").replace(/\D/g, '').slice(0, 10),
      streetAddress: user?.branchAddress || user?.address || "Plot 42, Central Freight Yard, Highway Zone",
      area: user?.area || user?.branchArea || "Industrial Area",
      state: state,
      city: city,
      pincode: user?.pincode || pincodeMap[city] || "411001"
    };
    setPickupAddress(newAddress);
    setPickupErrors({});
    toast.success(`Pickup address populated for ${city}, ${state}.`);
  };

  const handleClearDeliveryAddress = () => {
    setDeliveryAddress({
      companyName: "",
      contactPerson: "",
      mobile: "",
      streetAddress: "",
      area: "",
      city: "",
      state: "",
      pincode: ""
    });
    setDeliveryErrors({});
    toast.success("Delivery address cleared.");
  };

  // Dynamic Routing State
  const [routeInfo, setRouteInfo] = useState({
    loading: false,
    distanceKm: 0,
    durationFormatted: "N/A",
    durationHours: 0,
    durationSeconds: 0,
    errorMessage: "",
    success: false
  });

  // Calculate driving route whenever startLocation or endLocation changes
  useEffect(() => {
    if (!startLocation.trim() || !endLocation.trim()) {
      setRouteInfo({
        loading: false,
        distanceKm: 0,
        durationFormatted: "N/A",
        durationHours: 0,
        durationSeconds: 0,
        errorMessage: "",
        success: false
      });
      return;
    }

    const timer = setTimeout(async () => {
      setRouteInfo(prev => ({ ...prev, loading: true, errorMessage: "" }));
      const res = await calculateDrivingRoute(startLocation, endLocation);
      if (res.success) {
        setRouteInfo({
          loading: false,
          distanceKm: res.distanceKm,
          durationFormatted: res.durationFormatted,
          durationHours: res.durationHours,
          durationSeconds: res.durationSeconds,
          errorMessage: "",
          success: true
        });
      } else {
        setRouteInfo({
          loading: false,
          distanceKm: 0,
          durationFormatted: "N/A",
          durationHours: 0,
          durationSeconds: 0,
          errorMessage: res.errorMessage || "Unable to calculate route between selected locations.",
          success: false
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [startLocation, endLocation]);

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

        const vPayload = vRes.data?.data || vRes.data || {};
        const dPayload = dRes.data?.data || dRes.data || {};

        const rawVehicles = Array.isArray(vPayload)
          ? vPayload
          : (vPayload.vehicles || vPayload.nearbyVehicles || vPayload.localVehicles || []);

        const rawDrivers = Array.isArray(dPayload)
          ? dPayload
          : (dPayload.drivers || dPayload.nearbyDrivers || dPayload.localDrivers || []);

        const isVehFallback = !!(vPayload.isNearbyFallback || vPayload.isNearbyVehiclesFallback);
        const isDrvFallback = !!(dPayload.isNearbyFallback || dPayload.isNearbyDriversFallback);

        setIsNearbyVehiclesFallback(isVehFallback);
        setIsNearbyDriversFallback(isDrvFallback);

        const vehiclesData = rawVehicles.map(v => {
          const isAvailable = v.currentStatus === 'Available' || v.currentStatus === 'Active' || v.status === 'Available' || v.status === 'Active';
          return {
            ...v,
            id: v._id || v.id,
            name: v.vehicleName || v.name || `${v.brand || ''} ${v.model || ''}`,
            plateNumber: v.vehicleNumber || v.plateNumber,
            status: isAvailable ? 'Available' : (v.status || 'Under Maintenance'),
            isNearby: v.isNearby || isVehFallback,
            distanceKm: v.distanceKm,
            estimatedTravelTime: v.estimatedTravelTime,
            currentLocation: formatDisplayLocation(v.currentLocation, v.branch || v.branchDepot)
          };
        });

        const driversData = rawDrivers.map(d => {
          const isAvailable = d.driverStatus === 'AVAILABLE' || d.status === 'Available';
          return {
            ...d,
            id: d._id || d.id,
            name: d.fullName || d.name,
            employeeId: formatEmployeeId(d.employeeId),
            status: isAvailable ? 'Available' : (d.status || 'Not Available'),
            isNearby: d.isNearby || isDrvFallback,
            distanceKm: d.distanceKm,
            estimatedTravelTime: d.estimatedTravelTime,
            currentLocation: formatDisplayLocation(d.currentLocation || d.driverLocation, d.branch)
          };
        });

        const cleanStartCity = cleanLoc.split(',')[0].trim().toLowerCase();
        
        let finalVehicles = vehiclesData;
        if (cleanStartCity && !isVehFallback) {
          const matchedVehs = vehiclesData.filter(v => {
            const vLoc = (v.currentLocation || v.branch || '').toLowerCase();
            return vLoc.includes(cleanStartCity) || cleanStartCity.includes(vLoc.split(',')[0].trim());
          });
          if (matchedVehs.length > 0) finalVehicles = matchedVehs;
        }

        setDrivers(driversData);
        setVehicles(finalVehicles);

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

  const handleVehicleSelection = (vehicle) => {
    if (isSameLocError) {
      toast.error("Trip cannot be created because the pickup and destination locations are the same.", {
        id: "same-location-warning"
      });
      return;
    }
    if (vehicle.status === "Under Maintenance" || vehicle.currentStatus === "Under Maintenance") {
      toast.error("This vehicle is under maintenance and cannot be allocated.");
      return;
    }
    if (vehicle.currentStatus === "Assigned" || vehicle.currentStatus === "In Trip" || vehicle.currentStatus === "On Trip") {
      toast.error("This Vehicle is already assigned to an active trip.");
      return;
    }
    const vehicleIdStr = String(vehicle.id || vehicle._id);
    if (String(selectedVehicleId) === vehicleIdStr) {
      setSelectedVehicleId("");
      toast.info(`Unallocated vehicle ${vehicle.name}`);
    } else {
      setSelectedVehicleId(vehicleIdStr);
      toast.success(`Allocated vehicle ${vehicle.name}`);
    }
  };

  const handleDriverSelection = (driver) => {
    if (isSameLocError) {
      toast.error("Trip cannot be created because the pickup and destination locations are the same.", {
        id: "same-location-warning"
      });
      return;
    }
    const isExpired = driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date();
    if (isExpired) {
      toast.error("This driver has an expired license and cannot be assigned.");
      return;
    }
    if (driver.driverStatus === "ASSIGNED" || driver.driverStatus === "ON_TRIP" || driver.status === "Not Available") {
      toast.error("This Driver is already assigned to an active trip.");
      return;
    }
    const driverIdStr = String(driver.id || driver._id);
    if (String(selectedDriverId) === driverIdStr) {
      setSelectedDriverId("");
      toast.info(`Unassigned driver ${driver.name}`);
    } else {
      setSelectedDriverId(driverIdStr);
      toast.success(`Assigned driver ${driver.name}`);
    }
  };

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
    if (isSameLocError || normalizeCityName(startLocation) === normalizeCityName(endLocation)) {
      toast.error("Trip cannot be created because the pickup and destination locations are the same.", {
        id: "same-location-warning"
      });
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
    if (!cargoWeight || Number(cargoWeight) <= 0) {
      toast.error("Cargo Weight (KG) is required.");
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

    // Pickup Address Validations (inline error updates)
    const pErrs = {
      companyName: validateAddressField('pickup', 'companyName', pickupAddress.companyName),
      contactPerson: validateAddressField('pickup', 'contactPerson', pickupAddress.contactPerson),
      mobile: validateAddressField('pickup', 'mobile', pickupAddress.mobile),
      streetAddress: validateAddressField('pickup', 'streetAddress', pickupAddress.streetAddress),
      city: validateAddressField('pickup', 'city', pickupAddress.city),
      state: validateAddressField('pickup', 'state', pickupAddress.state),
      pincode: validateAddressField('pickup', 'pincode', pickupAddress.pincode),
    };
    setPickupErrors(pErrs);

    // Delivery Address Validations (inline error updates)
    const dErrs = {
      companyName: validateAddressField('delivery', 'companyName', deliveryAddress.companyName),
      contactPerson: validateAddressField('delivery', 'contactPerson', deliveryAddress.contactPerson),
      mobile: validateAddressField('delivery', 'mobile', deliveryAddress.mobile),
      streetAddress: validateAddressField('delivery', 'streetAddress', deliveryAddress.streetAddress),
      city: validateAddressField('delivery', 'city', deliveryAddress.city),
      state: validateAddressField('delivery', 'state', deliveryAddress.state),
      pincode: validateAddressField('delivery', 'pincode', deliveryAddress.pincode),
    };
    setDeliveryErrors(dErrs);

    const hasPickupErr = Object.values(pErrs).some(Boolean);
    const hasDeliveryErr = Object.values(dErrs).some(Boolean);

    if (hasPickupErr || hasDeliveryErr) {
      toast.error("Please fill in all required address fields accurately.");
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
      const distance = routeInfo.distanceKm || 0;
      await managerApi.createTrip({
        tripNumber,
        vehicle: vehicle._id || vehicle.id,
        driver: driver ? (driver._id || driver.id) : undefined,
        driverName: driver ? driver.name : "",
        driverPhone: driver ? (driver.phoneNumber || driver.phone || "") : "",
        vehicleName: vehicle.name,
        vehiclePlate: vehicle.plateNumber,
        startLocation,
        endLocation,
        pickupAddress: {
          companyName: pickupAddress.companyName.trim(),
          contactPerson: pickupAddress.contactPerson.trim(),
          mobile: pickupAddress.mobile.trim(),
          mobileNumber: pickupAddress.mobile.trim(),
          streetAddress: pickupAddress.streetAddress.trim(),
          area: pickupAddress.area?.trim() || "",
          areaLocality: pickupAddress.area?.trim() || "",
          city: pickupAddress.city.trim(),
          state: pickupAddress.state.trim(),
          pincode: pickupAddress.pincode.trim()
        },
        deliveryAddress: {
          companyName: deliveryAddress.companyName.trim(),
          contactPerson: deliveryAddress.contactPerson.trim(),
          mobile: deliveryAddress.mobile.trim(),
          mobileNumber: deliveryAddress.mobile.trim(),
          streetAddress: deliveryAddress.streetAddress.trim(),
          area: deliveryAddress.area?.trim() || "",
          areaLocality: deliveryAddress.area?.trim() || "",
          city: deliveryAddress.city.trim(),
          state: deliveryAddress.state.trim(),
          pincode: deliveryAddress.pincode.trim()
        },
        fromAddress: {
          companyName: pickupAddress.companyName.trim(),
          contactPerson: pickupAddress.contactPerson.trim(),
          mobile: pickupAddress.mobile.trim(),
          mobileNumber: pickupAddress.mobile.trim(),
          streetAddress: pickupAddress.streetAddress.trim(),
          area: pickupAddress.area?.trim() || "",
          areaLocality: pickupAddress.area?.trim() || "",
          city: pickupAddress.city.trim(),
          state: pickupAddress.state.trim(),
          pincode: pickupAddress.pincode.trim()
        },
        toAddress: {
          companyName: deliveryAddress.companyName.trim(),
          contactPerson: deliveryAddress.contactPerson.trim(),
          mobile: deliveryAddress.mobile.trim(),
          mobileNumber: deliveryAddress.mobile.trim(),
          streetAddress: deliveryAddress.streetAddress.trim(),
          area: deliveryAddress.area?.trim() || "",
          areaLocality: deliveryAddress.area?.trim() || "",
          city: deliveryAddress.city.trim(),
          state: deliveryAddress.state.trim(),
          pincode: deliveryAddress.pincode.trim()
        },
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

  const distance = routeInfo.distanceKm || 0;
  const isWeightValid = cargoWeight !== null && cargoWeight !== undefined && cargoWeight.toString().trim() !== "";
  const cargoWeightDisplay = isWeightValid ? `${cargoWeight} kg` : "--";

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E7EAF0] pb-6">
        <div>
          <h1 className="font-poppins font-bold text-[28px] text-[#1E293B] leading-none">
            Create Trip
          </h1>
          <p className="text-xs text-[#64748B] mt-2 font-medium font-poppins">
            Configure vehicle, route details, and driver assignment.
          </p>
        </div>

        <div className="flex items-center gap-3 select-none w-full md:w-auto">
          <button
            type="button"
            onClick={() => navigate("/manager/trips")}
            className="px-4 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 transition-all cursor-pointer text-center flex items-center gap-1.5 shadow-2xs font-poppins"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Trips
          </button>
        </div>
      </div>

      <div className="space-y-6 mt-6">

        {/* 1. Trip Specifications Card (100% Width) */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-5 font-poppins">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7EAF0]">
            <Route className="w-5 h-5 text-[#B45A0A]" />
            <h3 className="font-poppins font-bold text-[#1E293B] text-[16px]">Trip Specifications</h3>
          </div>

          {/* Row 1: Start Location | Destination (2-Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Location */}
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                Start Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="e.g. Pune, MH"
                  value={startLocation}
                  onChange={(e) => handleStartLocationChange(e.target.value)}
                  onFocus={() => {
                    if (startLocation.trim().length > 0) setShowStartSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowStartSuggestions(false), 200)}
                  className={`w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none transition-all text-[#1E293B] font-medium font-poppins ${
                    isSameLocError
                      ? "border-red-500 focus:border-red-500 bg-red-50/20 ring-1 ring-red-500/30"
                      : "border-[#E7EAF0] focus:border-[#B45A0A]"
                  }`}
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
                        className="px-4 py-2 hover:bg-orange-50/50 hover:text-[#B45A0A] text-sm text-gray-700 font-medium cursor-pointer transition-colors font-poppins"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                Destination <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="e.g. Hyderabad, TS"
                  value={endLocation}
                  onChange={(e) => handleEndLocationChange(e.target.value)}
                  onFocus={() => {
                    if (endLocation.trim().length > 0) setShowEndSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowEndSuggestions(false), 200)}
                  className={`w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none transition-all text-[#1E293B] font-medium font-poppins ${
                    isSameLocError
                      ? "border-red-500 focus:border-red-500 bg-red-50/20 ring-1 ring-red-500/30"
                      : "border-[#E7EAF0] focus:border-[#B45A0A]"
                  }`}
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
                        className="px-4 py-2 hover:bg-orange-50/50 hover:text-[#B45A0A] text-sm text-gray-700 font-medium cursor-pointer transition-colors font-poppins"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {isSameLocError && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 font-poppins animate-in fade-in duration-150">
                  <span>⚠️</span> Start Location and Destination cannot be the same. Please select a different destination.
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Required Specifications (Departure Time | Estimated Arrival | Cargo Weight) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Departure Time */}
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                Departure Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="datetime-local"
                  value={departureTime}
                  onChange={(e) => handleDepartureTimeChange(e.target.value)}
                  onBlur={handleBlur}
                  min={getCurrentDateTimeString()}
                  className={`w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium font-poppins ${
                    departureError ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0]"
                  }`}
                  required
                />
              </div>
              {departureError && (
                <p className="text-red-500 text-xs mt-1 font-semibold font-poppins">{departureError}</p>
              )}
            </div>

            {/* Estimated Arrival (ETA) */}
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                Estimated Arrival (ETA) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="datetime-local"
                  value={eta}
                  onChange={(e) => handleEtaChange(e.target.value)}
                  onBlur={handleBlur}
                  min={getMinEtaString(departureTime)}
                  className={`w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium font-poppins ${
                    etaError ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0]"
                  }`}
                  required
                />
              </div>
              {etaError && (
                <p className="text-red-500 text-xs mt-1 font-semibold font-poppins">{etaError}</p>
              )}
            </div>

            {/* Cargo Weight (REQUIRED) */}
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                Cargo Weight (KG) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium font-poppins"
                required
              />
            </div>
          </div>

          {/* Row 3: Optional Details (Cargo Type | Cargo Description | Trip Notes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium font-poppins"
              />
            </div>

            {/* Cargo Description */}
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                Cargo / Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Express Deliveries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium font-poppins"
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
                className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium font-poppins"
              />
            </div>
          </div>
        </div>

        {/* 2. Asset Allocation & Driver Assignment (Side-by-Side 2-Column Grid, Fixed Height with Internal Scrollbar) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Asset Allocation Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex flex-col justify-between space-y-4 font-poppins h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0] shrink-0">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#B45A0A]" />
                <h3 className="font-bold text-[#1E293B] text-[16px]">Asset Allocation</h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterAvailableVehicles(!filterAvailableVehicles)}
                className="text-[10px] font-bold text-[#B45A0A] bg-orange-50 border border-orange-100 hover:bg-orange-100/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer select-none font-poppins"
              >
                {filterAvailableVehicles ? "Show All Vehicles" : "Filter Available"}
              </button>
            </div>

            {startLocation.trim() && isNearbyVehiclesFallback && (
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 font-medium flex items-start gap-2.5 shrink-0">
                <AlertTriangle className="w-4 h-4 text-[#B45A0A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">No vehicles are available at {startLocation}.</span>
                  <span className="text-[11px] text-amber-700 font-medium">Showing the nearest available vehicles.</span>
                </div>
              </div>
            )}

            <div className="space-y-2.5 overflow-y-auto pr-1 custom-scrollbar flex-1">
              {!startLocation.trim() ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <MapPin className="w-8 h-8 text-[#94A3B8] mb-2" />
                  <p className="text-xs text-gray-400 font-semibold font-poppins">Please select a Start Location to view available vehicles and drivers.</p>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-400 mt-2 font-semibold">Fetching available vehicles...</p>
                </div>
              ) : (filterAvailableVehicles 
                ? vehicles.filter(v => v.status === "Available" || v.status === "Active")
                : vehicles
              ).length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center font-semibold">No available vehicles found for the selected start location.</p>
              ) : (
                (filterAvailableVehicles 
                  ? vehicles.filter(v => v.status === "Available" || v.status === "Active")
                  : vehicles
                ).map(v => (
                  <div
                    key={v.id}
                    onClick={() => {
                      if (v.status === "Under Maintenance") return;
                      handleVehicleSelection(v);
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
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs text-[#1E293B]">{v.name}</p>
                        {(v.isNearby || isNearbyVehiclesFallback) && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded font-poppins">Nearby</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#64748B] font-semibold block mt-0.5 uppercase">Reg: {v.plateNumber}</span>
                      <div className="text-[10px] text-gray-500 mt-1 font-semibold flex flex-wrap gap-x-2 gap-y-0.5">
                        <span>Type: <strong className="text-[#1E293B]">{v.vehicleType || v.type || "Truck"}</strong></span>
                        <span>|</span>
                        <span>Location: <strong className="text-[#1E293B]">{formatDisplayLocation(v.currentLocation, v.branch)}</strong></span>
                      </div>
                      {(v.isNearby || isNearbyVehiclesFallback || (v.distanceKm !== undefined && v.distanceKm > 0)) && (
                        <div className="text-[10px] text-amber-700 font-bold mt-1 flex items-center gap-2 font-poppins">
                          <span>📍 {v.distanceKm || 0} km away</span>
                          <span>•</span>
                          <span>⏱️ {v.estimatedTravelTime || "30 mins"}</span>
                        </div>
                      )}
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
                        handleVehicleSelection(v);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
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
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex flex-col justify-between space-y-4 font-poppins h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0] shrink-0">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#B45A0A]" />
                <h3 className="font-bold text-[#1E293B] text-[16px]">Driver Assignment</h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterAvailableDrivers(!filterAvailableDrivers)}
                className="text-[10px] font-bold text-[#B45A0A] bg-orange-50 border border-orange-100 hover:bg-orange-100/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer select-none font-poppins"
              >
                {filterAvailableDrivers ? "Show All Drivers" : "Filter Available"}
              </button>
            </div>

            {startLocation.trim() && isNearbyDriversFallback && (
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 font-medium flex items-start gap-2.5 shrink-0">
                <AlertTriangle className="w-4 h-4 text-[#B45A0A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">No drivers are available at {startLocation}.</span>
                  <span className="text-[11px] text-amber-700 font-medium">Showing the nearest available drivers.</span>
                </div>
              </div>
            )}

            <div className="space-y-2.5 overflow-y-auto pr-1 custom-scrollbar flex-1">
              {!startLocation.trim() ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <User className="w-8 h-8 text-[#94A3B8] mb-2" />
                  <p className="text-xs text-gray-400 font-semibold font-poppins">Please select a Start Location to view available vehicles and drivers.</p>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-400 mt-2 font-semibold">Fetching available drivers...</p>
                </div>
              ) : (filterAvailableDrivers 
                ? drivers.filter(d => d.status === "Available" && (!d.licenseExpiry || new Date(d.licenseExpiry) >= new Date()))
                : drivers
              ).length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center font-semibold font-poppins">No drivers available in the selected location.</p>
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
                        if (d.status === "Not Available") return;
                        handleDriverSelection(d);
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
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-[#1E293B]">{d.name}</p>
                          {(d.isAtPickupLocation || d.distanceKm === 0) ? (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded font-poppins">Nearby</span>
                          ) : (d.isNearby || isNearbyDriversFallback) ? (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded font-poppins">Nearby</span>
                          ) : null}
                        </div>
                        <span className="text-[10px] text-[#64748B] block mt-0.5 font-semibold">Emp ID: {formatEmployeeId(d.employeeId)}</span>
                        <div className="text-[10px] text-gray-500 mt-1 font-semibold flex flex-wrap gap-x-2 gap-y-0.5">
                          <span>Lic Validity: <strong className={isExpired ? "text-red-500" : "text-[#1E293B]"}>{d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : "Valid"}</strong></span>
                          <span>|</span>
                          <span>Location: <strong className="text-[#1E293B]">{formatDisplayLocation(d.currentLocation || d.driverLocation, d.branch)}</strong></span>
                        </div>
                        {d.distanceKm !== undefined && (
                          <div className="text-[10px] text-amber-700 font-bold mt-1 flex items-center gap-2 font-poppins">
                            <span>📍 {d.distanceKm || 0} km away</span>
                            <span>•</span>
                            <span>⏱️ {d.estimatedTravelTime || "0 mins"}</span>
                          </div>
                        )}
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
                          handleDriverSelection(d);
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
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

        {/* 3. Pickup & Delivery Address (Side-by-Side 2-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Pickup Address Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7EAF0] shadow-sm space-y-4 font-poppins flex flex-col justify-between h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E7EAF0] gap-2">
              <div>
                <h2 className="text-base font-bold text-[#1E293B] font-poppins flex items-center gap-2">
                  📍 Pickup Address
                </h2>
                <p className="text-xs text-[#64748B] font-medium mt-0.5 font-poppins">
                  Sender / Loading Location Details
                </p>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentBranch}
                className="text-xs font-bold text-[#B45A0A] bg-amber-50 hover:bg-amber-100/70 border border-amber-200/60 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs font-poppins shrink-0"
              >
                <Building2 className="w-3.5 h-3.5 text-[#B45A0A]" /> Use Current Branch
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Company Name"
                    value={pickupAddress.companyName}
                    onChange={(e) => handleAddressChange('pickup', 'companyName', e.target.value)}
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B45A0A]/20 transition-all font-poppins ${
                      pickupErrors.companyName ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#B45A0A] text-[#1E293B]"
                    }`}
                  />
                  {pickupErrors.companyName && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {pickupErrors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Contact Person Name"
                    value={pickupAddress.contactPerson}
                    onChange={(e) => handleAddressChange('pickup', 'contactPerson', e.target.value)}
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B45A0A]/20 transition-all font-poppins ${
                      pickupErrors.contactPerson ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#B45A0A] text-[#1E293B]"
                    }`}
                  />
                  {pickupErrors.contactPerson && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {pickupErrors.contactPerson}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center gap-1.5 text-[#64748B] pointer-events-none border-r border-[#E7EAF0] pr-2.5 h-6">
                      <Phone className="w-3.5 h-3.5 text-[#B45A0A]" />
                      <span className="text-xs font-bold text-[#1E293B] font-poppins">+91</span>
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="9876543210"
                      value={pickupAddress.mobile}
                      onChange={(e) => handleAddressChange('pickup', 'mobile', e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-[72px] pr-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B45A0A]/20 transition-all font-poppins ${
                        pickupErrors.mobile ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#B45A0A] text-[#1E293B]"
                      }`}
                    />
                  </div>
                  {pickupErrors.mobile && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {pickupErrors.mobile}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter Complete Street Address"
                    value={pickupAddress.streetAddress}
                    onChange={(e) => handleAddressChange('pickup', 'streetAddress', e.target.value)}
                    className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B45A0A]/20 transition-all resize-none font-poppins ${
                      pickupErrors.streetAddress ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#B45A0A] text-[#1E293B]"
                    }`}
                  />
                  {pickupErrors.streetAddress && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {pickupErrors.streetAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SearchableSelect
                  label="State"
                  required={true}
                  value={pickupAddress.state}
                  placeholder="Select State"
                  options={INDIAN_STATES.map(s => s.name)}
                  onChange={(stateVal) => {
                    handleAddressChange('pickup', 'state', stateVal);
                    handleAddressChange('pickup', 'city', '');
                  }}
                  error={pickupErrors.state}
                />

                <SearchableSelect
                  label="City"
                  required={true}
                  disabled={!pickupAddress.state}
                  value={pickupAddress.city}
                  placeholder={!pickupAddress.state ? "Select State First" : "Select City"}
                  options={pickupAddress.state ? getCitiesForState(pickupAddress.state) : []}
                  onChange={(cityVal) => handleAddressChange('pickup', 'city', cityVal)}
                  error={pickupErrors.city}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Area or Locality"
                    value={pickupAddress.area}
                    onChange={(e) => handleAddressChange('pickup', 'area', e.target.value)}
                    className="w-full px-3.5 py-2.5 h-[42px] bg-white border border-[#E7EAF0] rounded-xl text-xs font-medium text-[#1E293B] focus:outline-none focus:border-[#B45A0A] focus:ring-2 focus:ring-[#B45A0A]/20 transition-all font-poppins"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter Pincode"
                    value={pickupAddress.pincode}
                    onChange={(e) => handleAddressChange('pickup', 'pincode', e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B45A0A]/20 transition-all font-poppins ${
                      pickupErrors.pincode ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#B45A0A] text-[#1E293B]"
                    }`}
                  />
                  {pickupErrors.pincode && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {pickupErrors.pincode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7EAF0] shadow-sm space-y-4 font-poppins flex flex-col justify-between h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E7EAF0] gap-2">
              <div>
                <h2 className="text-base font-bold text-[#1E293B] font-poppins flex items-center gap-2">
                  🚚 Delivery Address
                </h2>
                <p className="text-xs text-[#64748B] font-medium mt-0.5 font-poppins">
                  Receiver / Unloading Location Details
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearDeliveryAddress}
                className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/60 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs font-poppins shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Clear Address
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Company Name"
                    value={deliveryAddress.companyName}
                    onChange={(e) => handleAddressChange('delivery', 'companyName', e.target.value)}
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B45A0A]/20 transition-all font-poppins ${
                      deliveryErrors.companyName ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#B45A0A] text-[#1E293B]"
                    }`}
                  />
                  {deliveryErrors.companyName && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {deliveryErrors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Contact Person Name"
                    value={deliveryAddress.contactPerson}
                    onChange={(e) => handleAddressChange('delivery', 'contactPerson', e.target.value)}
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B45A0A]/20 transition-all font-poppins ${
                      deliveryErrors.contactPerson ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#B45A0A] text-[#1E293B]"
                    }`}
                  />
                  {deliveryErrors.contactPerson && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {deliveryErrors.contactPerson}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center gap-1.5 text-[#64748B] pointer-events-none border-r border-[#E7EAF0] pr-2.5 h-6">
                      <Phone className="w-3.5 h-3.5 text-[#B45A0A]" />
                      <span className="text-xs font-bold text-[#1E293B] font-poppins">+91</span>
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="9876543210"
                      value={deliveryAddress.mobile}
                      onChange={(e) => handleAddressChange('delivery', 'mobile', e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-[72px] pr-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B45A0A]/20 transition-all font-poppins ${
                        deliveryErrors.mobile ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#B45A0A] text-[#1E293B]"
                      }`}
                    />
                  </div>
                  {deliveryErrors.mobile && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {deliveryErrors.mobile}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter Complete Street Address"
                    value={deliveryAddress.streetAddress}
                    onChange={(e) => handleAddressChange('delivery', 'streetAddress', e.target.value)}
                    className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B45A0A]/20 transition-all resize-none font-poppins ${
                      deliveryErrors.streetAddress ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#B45A0A] text-[#1E293B]"
                    }`}
                  />
                  {deliveryErrors.streetAddress && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {deliveryErrors.streetAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SearchableSelect
                  label="State"
                  required={true}
                  value={deliveryAddress.state}
                  placeholder="Select State"
                  options={INDIAN_STATES.map(s => s.name)}
                  onChange={(stateVal) => {
                    handleAddressChange('delivery', 'state', stateVal);
                    handleAddressChange('delivery', 'city', '');
                  }}
                  error={deliveryErrors.state}
                />

                <SearchableSelect
                  label="City"
                  required={true}
                  disabled={!deliveryAddress.state}
                  value={deliveryAddress.city}
                  placeholder={!deliveryAddress.state ? "Select State First" : "Select City"}
                  options={deliveryAddress.state ? getCitiesForState(deliveryAddress.state) : []}
                  onChange={(cityVal) => handleAddressChange('delivery', 'city', cityVal)}
                  error={deliveryErrors.city}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Area or Locality"
                    value={deliveryAddress.area}
                    onChange={(e) => handleAddressChange('delivery', 'area', e.target.value)}
                    className="w-full px-3.5 py-2.5 h-[42px] bg-white border border-[#E7EAF0] rounded-xl text-xs font-medium text-[#1E293B] focus:outline-none focus:border-[#B45A0A] focus:ring-2 focus:ring-[#B45A0A]/20 transition-all font-poppins"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter Pincode"
                    value={deliveryAddress.pincode}
                    onChange={(e) => handleAddressChange('delivery', 'pincode', e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B45A0A]/20 transition-all font-poppins ${
                      deliveryErrors.pincode ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#B45A0A] text-[#1E293B]"
                    }`}
                  />
                  {deliveryErrors.pincode && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {deliveryErrors.pincode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4. Bottom Action Bar (Cancel & Create Trip / Dispatch Trip) */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#E7EAF0]">
          <button
            type="button"
            onClick={() => navigate("/manager/trips")}
            className="px-6 py-3 bg-white border border-[#E7EAF0] rounded-xl text-sm font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 transition-all cursor-pointer shadow-2xs font-poppins"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDispatch}
            disabled={!!departureError || !!etaError || !departureTime || !eta || !cargoWeight || isSameLocError}
            className={`px-8 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-md cursor-pointer flex items-center gap-2 font-poppins ${
              (departureError || etaError || !departureTime || !eta || !cargoWeight || isSameLocError)
                ? "bg-gray-300 shadow-none cursor-not-allowed opacity-60"
                : "bg-[#B45A0A] hover:bg-[#9A4D08] shadow-[#B45A0A]/20"
            }`}
          >
            <Navigation className="w-4 h-4" /> Create Trip
          </button>
        </div>

      </div>
    </div>
  );
}

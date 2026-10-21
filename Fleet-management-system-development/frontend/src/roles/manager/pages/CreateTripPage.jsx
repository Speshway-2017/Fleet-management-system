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
  AlertTriangle,
  AlertCircle
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
import { isSunday, validateSearchQuery } from "@/validations/common.schema.js";
import CustomDatePicker from "@/components/common/CustomDatePicker";

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

  const [searchError, setSearchError] = useState("");

  const sortedOptions = [...options].sort((a, b) => {
    const aName = String(typeof a === "object" ? a.name : a);
    const bName = String(typeof b === "object" ? b.name : b);
    return aName.localeCompare(bName);
  });

  const filteredOptions = sortedOptions.filter((opt) => {
    if (searchError) return false;
    const optName = typeof opt === "object" ? opt.name : opt;
    return String(optName).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelect = (optVal) => {
    const valStr = typeof optVal === "object" ? optVal.name : optVal;
    onChange(valStr);
    setIsOpen(false);
    setSearchTerm("");
    setSearchError("");
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
        className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 ${disabled
          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          : error
            ? "border-red-300 focus:border-red-500 text-[#1E293B]"
            : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
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
                maxLength={50}
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  const err = validateSearchQuery(val, 50);
                  setSearchError(err);
                }}
                className={`w-full pl-8 pr-3 py-1.5 bg-gray-50 border rounded-lg text-xs focus:outline-none text-[#1E293B] font-poppins transition-colors ${
                  searchError
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
            </div>
            {searchError && (
              <p className="text-[11px] text-red-500 mt-1 font-medium font-poppins">{searchError}</p>
            )}
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
                      ? "bg-amber-50 text-[#A14000] font-bold"
                      : "text-[#1E293B] hover:bg-gray-50 font-medium"
                      }`}
                  >
                    <span>{optStr}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#A14000]" />}
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

  // Service & Payment fields (Parcelix Image 2 style)
  const [serviceType, setServiceType] = useState("Standard (3-5 days)");
  const [paymentMethod, setPaymentMethod] = useState("Prepaid");
  const [codAmount, setCodAmount] = useState("0");
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  // Filters
  const [filterAvailableVehicles, setFilterAvailableVehicles] = useState(true);
  const [filterAvailableDrivers, setFilterAvailableDrivers] = useState(true);
  const [isNearbyVehiclesFallback, setIsNearbyVehiclesFallback] = useState(false);
  const [isNearbyDriversFallback, setIsNearbyDriversFallback] = useState(false);
  const [isExtendedVehiclesFallback, setIsExtendedVehiclesFallback] = useState(false);
  const [isExtendedDriversFallback, setIsExtendedDriversFallback] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form inputs
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [eta, setEta] = useState("");
  const [status, setStatus] = useState("Assigned");
  const [description, setDescription] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    startLocation: "",
    endLocation: "",
    departureTime: "",
    eta: "",
    cargoWeight: "",
    cargoType: "",
    description: "",
    tripNotes: "",
  });

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

  const validateTripField = (field, val, overrides = {}) => {
    let err = "";
    const str = String(val ?? "").trim();
    const currentValues = {
      startLocation,
      endLocation,
      departureTime,
      eta,
      cargoWeight,
      cargoType,
      description,
      tripNotes,
      ...overrides
    };

    if (field === "startLocation") {
      if (!str) {
        err = "Start Location is required.";
      } else if (str.length < 2) {
        err = "Start Location must be at least 2 characters.";
      } else if (str.length > 50) {
        err = "Start Location must not exceed 50 characters.";
      } else if (/\d/.test(str)) {
        err = "Start Location must contain letters only (numbers are not allowed).";
      } else if (!/^[a-zA-Z\s.,'-]+$/.test(str)) {
        err = "Start Location contains invalid characters.";
      } else if (/(.)\1{3,}/i.test(str) || /([a-zA-Z]{2,4})\1{2,}/i.test(str)) {
        err = "Repeated characters are not allowed.";
      } else if (
        currentValues.endLocation &&
        normalizeCityName(str) &&
        normalizeCityName(currentValues.endLocation) &&
        normalizeCityName(str) === normalizeCityName(currentValues.endLocation)
      ) {
        err = "Start Location and Destination cannot be the same.";
      }
    } else if (field === "endLocation") {
      if (!str) {
        err = "Destination is required.";
      } else if (str.length < 2) {
        err = "Destination must be at least 2 characters.";
      } else if (str.length > 50) {
        err = "Destination must not exceed 50 characters.";
      } else if (/\d/.test(str)) {
        err = "Destination must contain letters only (numbers are not allowed).";
      } else if (!/^[a-zA-Z\s.,'-]+$/.test(str)) {
        err = "Destination contains invalid characters.";
      } else if (/(.)\1{3,}/i.test(str) || /([a-zA-Z]{2,4})\1{2,}/i.test(str)) {
        err = "Repeated characters are not allowed.";
      } else if (
        currentValues.startLocation &&
        normalizeCityName(currentValues.startLocation) &&
        normalizeCityName(str) &&
        normalizeCityName(currentValues.startLocation) === normalizeCityName(str)
      ) {
        err = "Start Location and Destination cannot be the same.";
      }
    } else if (field === "departureTime") {
      if (!val) {
        err = "Departure Time is required.";
      } else {
        const depDate = new Date(val);
        if (isNaN(depDate.getTime())) {
          err = "Invalid Departure Time format.";
        } else if (depDate.getTime() + 60000 < new Date().getTime()) {
          err = "Departure Time cannot be in the past.";
        }
      }
    } else if (field === "eta") {
      if (!val) {
        err = "Estimated Arrival (ETA) is required.";
      } else {
        const etaDate = new Date(val);
        if (isNaN(etaDate.getTime())) {
          err = "Invalid ETA date format.";
        } else if (currentValues.departureTime) {
          const depDate = new Date(currentValues.departureTime);
          if (!isNaN(depDate.getTime()) && etaDate.getTime() <= depDate.getTime()) {
            err = "Estimated Arrival (ETA) must be later than the Departure Time.";
          }
        }
      }
    } else if (field === "cargoWeight") {
      if (val === "" || val === null || val === undefined || str === "") {
        err = "Cargo Weight is required.";
      } else if (isNaN(Number(str)) || /e/i.test(str)) {
        err = "Cargo Weight must be a valid number.";
      } else if (Number(str) < 1) {
        err = "Cargo Weight must be at least 1 KG.";
      } else if (Number(str) > 100000) {
        err = "Cargo Weight must not exceed 1,00,000 KG.";
      } else if (str.includes(".") && str.split(".")[1].length > 2) {
        err = "Cargo Weight can have at most 2 decimal places.";
      }
    } else if (field === "cargoType") {
      if (str) {
        if (str.length < 2) {
          err = "Cargo Type must be at least 2 characters.";
        } else if (str.length > 50) {
          err = "Cargo Type must not exceed 50 characters.";
        } else if (/\d/.test(str)) {
          err = "Cargo Type must contain letters only (numbers are not allowed).";
        } else if (!/^[a-zA-Z\s.,&'-]+$/.test(str)) {
          err = "Cargo Type contains invalid characters.";
        } else if (/(.)\1{3,}/i.test(str) || /([a-zA-Z]{2,4})\1{2,}/i.test(str)) {
          err = "Repeated characters are not allowed.";
        }
      }
    } else if (field === "description") {
      if (str) {
        if (str.length < 2) {
          err = "Cargo Description must be at least 2 characters.";
        } else if (str.length > 200) {
          err = "Cargo Description must not exceed 200 characters.";
        } else if (/(.)\1{4,}/i.test(str) || /([a-zA-Z0-9]{2,4})\1{3,}/i.test(str)) {
          err = "Repeated characters are not allowed.";
        }
      }
    } else if (field === "tripNotes") {
      if (str) {
        if (str.length < 2) {
          err = "Trip Notes must be at least 2 characters.";
        } else if (str.length > 250) {
          err = "Trip Notes must not exceed 250 characters.";
        } else if (/(.)\1{4,}/i.test(str) || /([a-zA-Z0-9]{2,4})\1{3,}/i.test(str)) {
          err = "Repeated characters are not allowed.";
        }
      }
    }

    return err;
  };

  const handleFieldBlur = (field, val) => {
    const err = validateTripField(field, val);
    setFieldErrors(prev => ({ ...prev, [field]: err }));
  };

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
    const str = String(val ?? "").trim();
    if (field === 'companyName') {
      if (!str) err = "Company Name is required.";
      else if (str.length < 2) err = "Company Name must be at least 2 characters.";
      else if (str.length > 60) err = "Company Name must not exceed 60 characters.";
      else if (/\d/.test(str)) err = "Company Name must contain letters only (numbers are not allowed).";
      else if (!/^[a-zA-Z\s.'&,\-]+$/.test(str)) err = "Company Name contains invalid characters.";
    } else if (field === 'contactPerson') {
      if (!str) err = "Contact Person is required.";
      else if (str.length < 2) err = "Contact Person must be at least 2 characters.";
      else if (str.length > 50) err = "Contact Person must not exceed 50 characters.";
      else if (/\d/.test(str)) err = "Contact Person must contain letters only (numbers are not allowed).";
      else if (!/^[a-zA-Z\s.'-]+$/.test(str)) err = "Contact Person contains invalid characters.";
    } else if (field === 'mobile') {
      if (!str) err = "Mobile Number is required.";
      else if (!/^\d+$/.test(str)) err = "Mobile number must contain digits only.";
      else if (!/^[1-9]/.test(str)) err = "Mobile number must start with 1-9 (cannot start with 0).";
      else if (str.length !== 10) err = "Mobile number must be exactly 10 digits.";
    } else if (field === 'streetAddress') {
      if (!str) err = "Street Address is required.";
      else if (str.length < 5) err = "Street Address must be at least 5 characters.";
      else if (str.length > 100) err = "Street Address must not exceed 100 characters.";
    } else if (field === 'area') {
      if (str) {
        if (str.length < 2) err = "Area / Locality must be at least 2 characters.";
        else if (str.length > 50) err = "Area / Locality must not exceed 50 characters.";
        else if (!/^[a-zA-Z0-9\s,.'&/\-]+$/.test(str)) err = "Area / Locality contains invalid characters.";
        else if (/(.)\1{3,}/i.test(str)) err = "Repeated characters are not allowed.";
      }
    } else if (field === 'city') {
      if (!str) err = "City is required.";
      else if (str.length < 2) err = "City must be at least 2 characters.";
      else if (str.length > 30) err = "City must not exceed 30 characters.";
      else if (/\d/.test(str)) err = "City must contain letters only (numbers are not allowed).";
      else if (!/^[a-zA-Z\s.'-]+$/.test(str)) err = "City contains invalid characters.";
    } else if (field === 'state') {
      if (!str) err = "State is required.";
      else if (str.length < 2) err = "State must be at least 2 characters.";
      else if (str.length > 30) err = "State must not exceed 30 characters.";
      else if (/\d/.test(str)) err = "State must contain letters only (numbers are not allowed).";
      else if (!/^[a-zA-Z\s.'-]+$/.test(str)) err = "State contains invalid characters.";
    } else if (field === 'pincode') {
      if (!str) err = "Pincode is required.";
      else if (!/^\d{6}$/.test(str)) err = "Pincode must be exactly 6 digits.";
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
    const startErr = validateTripField("startLocation", val, { startLocation: val });
    const endErr = endLocation ? validateTripField("endLocation", endLocation, { startLocation: val }) : fieldErrors.endLocation;
    setFieldErrors(prev => ({
      ...prev,
      startLocation: startErr,
      endLocation: endErr
    }));
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
    const endErr = validateTripField("endLocation", val, { endLocation: val });
    const startErr = startLocation ? validateTripField("startLocation", startLocation, { endLocation: val }) : fieldErrors.startLocation;
    setFieldErrors(prev => ({
      ...prev,
      endLocation: endErr,
      startLocation: startErr
    }));
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

    const depErr = validateTripField("departureTime", val, { departureTime: val, eta: updatedEta });
    const etaErr = updatedEta ? validateTripField("eta", updatedEta, { departureTime: val, eta: updatedEta }) : "";
    setFieldErrors(prev => ({
      ...prev,
      departureTime: depErr,
      eta: etaErr
    }));
  };

  const handleEtaChange = (val) => {
    setEta(val);
    const etaErr = validateTripField("eta", val, { eta: val });
    setFieldErrors(prev => ({
      ...prev,
      eta: etaErr
    }));
  };

  const handleCargoWeightChange = (val) => {
    setCargoWeight(val);
    const err = validateTripField("cargoWeight", val);
    setFieldErrors(prev => ({ ...prev, cargoWeight: err }));
  };

  const handleCargoTypeChange = (val) => {
    setCargoType(val);
    const err = validateTripField("cargoType", val);
    setFieldErrors(prev => ({ ...prev, cargoType: err }));
  };

  const handleDescriptionChange = (val) => {
    setDescription(val);
    const err = validateTripField("description", val);
    setFieldErrors(prev => ({ ...prev, description: err }));
  };

  const handleTripNotesChange = (val) => {
    setTripNotes(val);
    const err = validateTripField("tripNotes", val);
    setFieldErrors(prev => ({ ...prev, tripNotes: err }));
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
        const isVehExt = !!(vPayload.isExtendedFallback || (vPayload.hasNearby === false && rawVehicles.length > 0));
        const isDrvExt = !!(dPayload.isExtendedFallback || (dPayload.hasNearby === false && rawDrivers.length > 0));

        setIsNearbyVehiclesFallback(isVehFallback);
        setIsNearbyDriversFallback(isDrvFallback);
        setIsExtendedVehiclesFallback(isVehExt);
        setIsExtendedDriversFallback(isDrvExt);

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
          const isAvailable = d.driverStatus === 'AVAILABLE' || d.driverStatus === 'Available' || d.status === 'Available' || d.status === 'Active';
          let veh = d.assignedVehicle || d.vehiclePlate || d.vehicleRegistration || d.vehicle || "";
          if (veh === "Unassigned") veh = "";

          return {
            ...d,
            id: d._id || d.id,
            name: d.fullName || d.name,
            employeeId: formatEmployeeId(d.employeeId),
            status: isAvailable ? 'Available' : (d.status || 'Not Available'),
            isNearby: d.isNearby || isDrvFallback,
            distanceKm: d.distanceKm,
            estimatedTravelTime: d.estimatedTravelTime,
            currentLocation: formatDisplayLocation(d.currentLocation || d.driverLocation || d.city, d.branch),
            assignedVehicle: veh
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
    if (driver.driverStatus === "ON_TRIP" || driver.driverStatus === "ON TRANSIT") {
      toast.error("This Driver is currently on an active trip in progress.");
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

    // Validate all specification fields
    const allFieldErrors = {
      startLocation: validateTripField("startLocation", startLocation),
      endLocation: validateTripField("endLocation", endLocation),
      departureTime: validateTripField("departureTime", departureTime),
      eta: validateTripField("eta", eta),
      cargoWeight: validateTripField("cargoWeight", cargoWeight),
      cargoType: validateTripField("cargoType", cargoType),
      description: validateTripField("description", description),
      tripNotes: validateTripField("tripNotes", tripNotes),
    };
    setFieldErrors(allFieldErrors);

    const firstSpecErr = Object.values(allFieldErrors).find(Boolean);
    if (firstSpecErr) {
      toast.error(firstSpecErr);
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
      area: validateAddressField('pickup', 'area', pickupAddress.area),
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
      area: validateAddressField('delivery', 'area', deliveryAddress.area),
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

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const distance = routeInfo.distanceKm || 0;
      const parsedWeight = parseFloat(cargoWeight);
      const safeCargoWeight = (!isNaN(parsedWeight) && parsedWeight > 0) ? parsedWeight : 0;
      const serviceFeeVal = serviceType.includes("Express") ? 1500 : serviceType.includes("Same Day") ? 3000 : 500;
      const baseFreightVal = Math.round(distance * 52 + safeCargoWeight * 4.5);
      const loadingChargesVal = 2500;
      const unloadingChargesVal = 2500;
      const subtotalVal = baseFreightVal + serviceFeeVal + loadingChargesVal + unloadingChargesVal;
      const gstTaxVal = Math.round(subtotalVal * 0.18);
      const estimatedTotalVal = subtotalVal + gstTaxVal;

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
          contactPhone: pickupAddress.mobile.trim(),
          phone: pickupAddress.mobile.trim(),
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
          contactPhone: deliveryAddress.mobile.trim(),
          phone: deliveryAddress.mobile.trim(),
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
          contactPhone: pickupAddress.mobile.trim(),
          phone: pickupAddress.mobile.trim(),
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
          contactPhone: deliveryAddress.mobile.trim(),
          phone: deliveryAddress.mobile.trim(),
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
        cargoWeight: safeCargoWeight,
        tripNotes,
        serviceType,
        paymentMethod,
        codAmount: paymentMethod === "COD" ? Number(codAmount) : 0,
        paymentStatus,
        estimatedDistance: distance,
        freightCharges: baseFreightVal,
        serviceFee: serviceFeeVal,
        loadingCharges: loadingChargesVal,
        unloadingCharges: unloadingChargesVal,
        subtotal: subtotalVal,
        gstTax: gstTaxVal,
        totalAmount: estimatedTotalVal,
        billingAmount: estimatedTotalVal,
        revenue: estimatedTotalVal
      });

      toast.success("Trip dispatched successfully!");
      navigate("/manager/trips");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to dispatch trip");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
      </div>

      <div className="space-y-6 mt-6">

        {/* 1. Trip Specifications Card (100% Width) */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-5 font-poppins">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7EAF0]">
            <Route className="w-5 h-5 text-[#A14000]" />
            <h3 className="font-poppins font-bold text-[#1E293B] text-[16px]">Trip Specifications</h3>
          </div>

          {/* Row 1: Start Location | Destination (2-Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Start Location */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5 h-5">
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                  Start Location <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Pune, MH"
                  value={startLocation}
                  onChange={(e) => handleStartLocationChange(e.target.value)}
                  onFocus={() => {
                    if (startLocation.trim().length > 0) setShowStartSuggestions(true);
                  }}
                  onBlur={() => {
                    handleFieldBlur('startLocation', startLocation);
                    setTimeout(() => setShowStartSuggestions(false), 200);
                  }}
                  className={`w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none transition-all text-[#1E293B] font-medium font-poppins ${
                    fieldErrors.startLocation || isSameLocError
                      ? "border-red-400 bg-red-50/20 ring-1 ring-red-400/30 text-red-900 focus:border-red-500"
                      : "border-[#E7EAF0] focus:border-[#A14000]"
                  }`}
                  required
                />
                {showStartSuggestions && startSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E7EAF0] rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                    {startSuggestions.map((city) => (
                      <div
                        key={city}
                        onMouseDown={() => {
                          handleStartLocationChange(city);
                          setShowStartSuggestions(false);
                        }}
                        className="px-4 py-2 hover:bg-orange-50/50 hover:text-[#A14000] text-sm text-gray-700 font-medium cursor-pointer transition-colors font-poppins"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {fieldErrors.startLocation && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.startLocation}</span>
                </p>
              )}
            </div>

            {/* Destination */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5 h-5">
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                  Destination <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Hyderabad, TS"
                  value={endLocation}
                  onChange={(e) => handleEndLocationChange(e.target.value)}
                  onFocus={() => {
                    if (endLocation.trim().length > 0) setShowEndSuggestions(true);
                  }}
                  onBlur={() => {
                    handleFieldBlur('endLocation', endLocation);
                    setTimeout(() => setShowEndSuggestions(false), 200);
                  }}
                  className={`w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none transition-all text-[#1E293B] font-medium font-poppins ${
                    fieldErrors.endLocation || isSameLocError
                      ? "border-red-400 bg-red-50/20 ring-1 ring-red-400/30 text-red-900 focus:border-red-500"
                      : "border-[#E7EAF0] focus:border-[#A14000]"
                  }`}
                  required
                />
                {showEndSuggestions && endSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E7EAF0] rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                    {endSuggestions.map((city) => (
                      <div
                        key={city}
                        onMouseDown={() => {
                          handleEndLocationChange(city);
                          setShowEndSuggestions(false);
                        }}
                        className="px-4 py-2 hover:bg-orange-50/50 hover:text-[#A14000] text-sm text-gray-700 font-medium cursor-pointer transition-colors font-poppins"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {fieldErrors.endLocation && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.endLocation}</span>
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Required Specifications (Departure Time | Estimated Arrival | Cargo Weight) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Departure Time */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5 h-5">
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                  Departure Time <span className="text-red-500">*</span>
                </label>
                {isSunday(departureTime) && (
                  <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                )}
              </div>
              <CustomDatePicker
                type="datetime-local"
                value={departureTime}
                onChange={(e) => handleDepartureTimeChange(e.target.value)}
                onBlur={() => handleFieldBlur('departureTime', departureTime)}
                min={getCurrentDateTimeString()}
                error={Boolean(fieldErrors.departureTime)}
                placeholder="Select Departure Date & Time"
                required
              />
              {fieldErrors.departureTime && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.departureTime}</span>
                </p>
              )}
            </div>

            {/* Estimated Arrival (ETA) */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5 h-5">
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                  Estimated Arrival (ETA) <span className="text-red-500">*</span>
                </label>
                {isSunday(eta) && (
                  <span className="text-[11px] font-bold text-red-500 font-poppins">● Sunday</span>
                )}
              </div>
              <CustomDatePicker
                type="datetime-local"
                value={eta}
                onChange={(e) => handleEtaChange(e.target.value)}
                onBlur={() => handleFieldBlur('eta', eta)}
                min={getMinEtaString(departureTime)}
                error={Boolean(fieldErrors.eta)}
                placeholder="Select ETA Date & Time"
                required
              />
              {fieldErrors.eta && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.eta}</span>
                </p>
              )}
            </div>

            {/* Cargo Weight (REQUIRED) */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5 h-5">
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                  Cargo Weight (KG) <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={cargoWeight}
                  onChange={(e) => handleCargoWeightChange(e.target.value)}
                  onBlur={() => handleFieldBlur('cargoWeight', cargoWeight)}
                  className={`w-full px-3.5 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none transition-all text-[#1E293B] font-medium font-poppins ${
                    fieldErrors.cargoWeight
                      ? "border-red-400 bg-red-50/20 ring-1 ring-red-400/30 text-red-900 focus:border-red-500"
                      : "border-[#E7EAF0] focus:border-[#A14000]"
                  }`}
                  required
                />
              </div>
              {fieldErrors.cargoWeight && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.cargoWeight}</span>
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Optional Details (Cargo Type | Cargo Description | Trip Notes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Cargo Type */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5 h-5">
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                  Cargo Type (Optional)
                </label>
              </div>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. Perishable Goods, Electronics"
                value={cargoType}
                onChange={(e) => handleCargoTypeChange(e.target.value)}
                onBlur={() => handleFieldBlur('cargoType', cargoType)}
                className={`w-full px-3.5 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none transition-all text-[#1E293B] font-medium font-poppins ${
                  fieldErrors.cargoType
                    ? "border-red-400 bg-red-50/20 ring-1 ring-red-400/30 text-red-900 focus:border-red-500"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
              {fieldErrors.cargoType && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.cargoType}</span>
                </p>
              )}
            </div>

            {/* Cargo Description */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5 h-5">
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                  Cargo / Description (Optional)
                </label>
              </div>
              <input
                type="text"
                maxLength={300}
                placeholder="e.g. Express Deliveries"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                onBlur={() => handleFieldBlur('description', description)}
                className={`w-full px-3.5 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none transition-all text-[#1E293B] font-medium font-poppins ${
                  fieldErrors.description
                    ? "border-red-400 bg-red-50/20 ring-1 ring-red-400/30 text-red-900 focus:border-red-500"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
              {fieldErrors.description && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.description}</span>
                </p>
              )}
            </div>

            {/* Trip Notes */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5 h-5">
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">
                  Trip Notes (Optional)
                </label>
              </div>
              <input
                type="text"
                maxLength={350}
                placeholder="e.g. Handle with care, route via tollway"
                value={tripNotes}
                onChange={(e) => handleTripNotesChange(e.target.value)}
                onBlur={() => handleFieldBlur('tripNotes', tripNotes)}
                className={`w-full px-3.5 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none transition-all text-[#1E293B] font-medium font-poppins ${
                  fieldErrors.tripNotes
                    ? "border-red-400 bg-red-50/20 ring-1 ring-red-400/30 text-red-900 focus:border-red-500"
                    : "border-[#E7EAF0] focus:border-[#A14000]"
                }`}
              />
              {fieldErrors.tripNotes && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.tripNotes}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Asset Allocation & Driver Assignment (Side-by-Side 2-Column Grid, Fixed Height with Internal Scrollbar) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

          {/* Asset Allocation Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex flex-col justify-between space-y-4 font-poppins h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0] shrink-0">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#A14000]" />
                <h3 className="font-bold text-[#1E293B] text-[16px]">Asset Allocation</h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterAvailableVehicles(!filterAvailableVehicles)}
                className="text-[10px] font-bold text-[#A14000] bg-orange-50 border border-orange-100 hover:bg-orange-100/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer select-none font-poppins"
              >
                {filterAvailableVehicles ? "Show All Vehicles" : "Filter Available"}
              </button>
            </div>

            {startLocation.trim() && isExtendedVehiclesFallback ? (
              <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-800 font-medium flex items-start gap-2.5 shrink-0 font-poppins">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-rose-900">❌ No nearby vehicles found within 50 km of {startLocation}.</span>
                  <span className="text-[11px] text-rose-700 font-medium">Displaying all available vehicles sorted from nearest to farthest:</span>
                </div >
              </div >
            ) : startLocation.trim() && isNearbyVehiclesFallback ? (
    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 font-medium flex items-start gap-2.5 shrink-0 font-poppins">
      <AlertTriangle className="w-4 h-4 text-[#A14000] shrink-0 mt-0.5" />
      <div>
        <span className="font-bold block text-amber-900">No vehicles located directly in {startLocation}.</span>
        <span className="text-[11px] text-amber-700 font-medium">Showing nearest available vehicles within 50 km radius:</span>
      </div>
    </div>
  ) : null
}

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
        className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${v.status === "Under Maintenance"
          ? "border-[#E7EAF0] bg-gray-50/50 opacity-60 cursor-not-allowed"
          : String(selectedVehicleId) === String(v.id)
            ? "border-[#A14000] bg-orange-50/20 shadow-sm cursor-pointer"
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
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-[6px] text-[8px] font-bold uppercase ${v.status === "Active" || v.status === "Available"
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
          className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${v.status === "Under Maintenance"
            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed font-poppins"
            : String(selectedVehicleId) === String(v.id)
              ? "bg-[#A14000] text-white shadow-sm font-poppins"
              : "bg-white hover:bg-gray-50 border border-[#E7EAF0] text-[#64748B] font-poppins"
            }`}
        >
          {String(selectedVehicleId) === String(v.id) ? "Allocated" : "Allocate"}
        </button>
      </div>
    ))
  )}
</div>
          </div >

  {/* Driver Assignment Card */ }
  < div className = "bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex flex-col justify-between space-y-4 font-poppins h-[420px]" >
    <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0] shrink-0">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-[#A14000]" />
        <h3 className="font-bold text-[#1E293B] text-[16px]">Driver Assignment</h3>
      </div>
      <button
        type="button"
        onClick={() => setFilterAvailableDrivers(!filterAvailableDrivers)}
        className="text-[10px] font-bold text-[#A14000] bg-orange-50 border border-orange-100 hover:bg-orange-100/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer select-none font-poppins"
      >
        {filterAvailableDrivers ? "Show All Drivers" : "Filter Available"}
      </button>
    </div>

{
  startLocation.trim() && isExtendedDriversFallback ? (
    <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-800 font-medium flex items-start gap-2.5 shrink-0 font-poppins">
      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
      <div>
                  <span className="font-bold block text-rose-900">❌ No nearby drivers found within 50 km of {startLocation}.</span>
                  <span className="text-[11px] text-rose-700 font-medium">Displaying all available drivers sorted from nearest to farthest:</span>
                </div >
              </div >
            ) : startLocation.trim() && isNearbyDriversFallback ? (
    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 font-medium flex items-start gap-2.5 shrink-0 font-poppins">
      <AlertTriangle className="w-4 h-4 text-[#A14000] shrink-0 mt-0.5" />
      <div>
        <span className="font-bold block text-amber-900">No drivers located directly in {startLocation}.</span>
        <span className="text-[11px] text-amber-700 font-medium">Showing nearest available drivers within 50 km radius:</span>
      </div>
    </div>
  ) : null
}

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
    ? drivers.filter(d => (d.status === "Available" || d.driverStatus === "AVAILABLE" || d.driverStatus === "Available") && (!d.licenseExpiry || new Date(d.licenseExpiry) >= new Date()))
    : drivers
  ).length === 0 ? (
    <p className="text-xs text-gray-400 py-8 text-center font-semibold font-poppins">No drivers available in the selected location.</p>
  ) : (
    (filterAvailableDrivers
      ? drivers.filter(d => (d.driverStatus === "AVAILABLE" || d.driverStatus === "Available" || d.status === "Available" || d.status === "Active") && (!d.licenseExpiry || new Date(d.licenseExpiry) >= new Date()))
      : drivers
    ).map(d => {
      const isExpired = d.licenseExpiry && new Date(d.licenseExpiry) < new Date();
      const isOffline = d.driverStatus === "OFFLINE" || d.driverStatus === "OFF_DUTY" || d.driverStatus === "SUSPENDED" || d.driverStatus === "INACTIVE" || d.status === "Offline" || d.status === "Inactive";
      const isAvailable = (d.driverStatus === "AVAILABLE" || d.driverStatus === "Available" || d.status === "Available" || d.status === "Active") && !isOffline;

      return (
        <div
          key={d.id}
          onClick={() => {
            if (isExpired) {
              toast.error("This driver has an expired license and cannot be assigned.");
              return;
            }
            if (isOffline) {
              toast.error("This driver is currently Offline / Off Duty and cannot be assigned to a trip.");
              return;
            }
            if (d.status === "Not Available") return;
            handleDriverSelection(d);
          }}
          className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${(isExpired || isOffline || d.status === "Not Available")
            ? "border-red-150 bg-red-50/10 opacity-60 cursor-not-allowed"
            : String(selectedDriverId) === String(d.id)
              ? "border-[#A14000] bg-orange-50/20 shadow-sm cursor-pointer"
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
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-[10px] text-[#64748B] font-semibold">Emp ID: {formatEmployeeId(d.employeeId)}</span>
            </div>
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
              <span className={`inline-block px-2.5 py-0.5 rounded-[6px] text-[9px] font-extrabold uppercase font-poppins ${isExpired
                ? "bg-red-50 text-red-600 border border-red-200"
                : isOffline
                  ? "bg-red-50 text-red-600 border border-red-200 font-bold"
                  : isAvailable
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold"
                    : "bg-amber-50 text-amber-700 border border-amber-200 font-bold"
                }`}>
                {isExpired
                  ? "EXPIRED LICENSE 🔴"
                  : isOffline
                    ? "OFFLINE 🔴"
                    : isAvailable
                      ? "ONLINE 🟢"
                      : "OFFLINE 🔴"}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isExpired || isOffline || d.status === "Not Available"}
            onClick={(e) => {
              e.stopPropagation();
              if (isExpired) {
                toast.error("This driver has an expired license and cannot be assigned.");
                return;
              }
              if (isOffline) {
                toast.error("This driver is currently Offline / Off Duty and cannot be assigned to a trip.");
                return;
              }
              handleDriverSelection(d);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${(isExpired || isOffline || d.status === "Not Available")
              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed font-poppins"
              : String(selectedDriverId) === String(d.id)
                ? "bg-[#A14000] text-white shadow-sm font-poppins"
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
          </div >
        </div >

  {/* 3. Pickup & Delivery Address (Side-by-Side 2-Column Grid) */ }
  < div className = "grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch" >

    {/* Pickup Address Card */ }
    < div className = "bg-white rounded-2xl p-6 border border-[#E7EAF0] shadow-sm space-y-4 font-poppins flex flex-col justify-between h-full" >
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
                className="text-xs font-bold text-[#A14000] bg-amber-50 hover:bg-amber-100/70 border border-amber-200/60 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs font-poppins shrink-0"
              >
                <Building2 className="w-3.5 h-3.5 text-[#A14000]" /> Use Current Branch
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
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${pickupErrors.companyName ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
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
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${pickupErrors.contactPerson ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
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
                      <Phone className="w-3.5 h-3.5 text-[#A14000]" />
                      <span className="text-xs font-bold text-[#1E293B] font-poppins">+91</span>
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="9876543210"
                      value={pickupAddress.mobile}
                      onChange={(e) => handleAddressChange('pickup', 'mobile', e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-[72px] pr-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${pickupErrors.mobile ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
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
                    className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all resize-none font-poppins ${pickupErrors.streetAddress ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
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
                    maxLength={50}
                    placeholder="Enter Area or Locality"
                    value={pickupAddress.area}
                    onChange={(e) => handleAddressChange('pickup', 'area', e.target.value)}
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${
                      pickupErrors.area ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                    }`}
                  />
                  {pickupErrors.area && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {pickupErrors.area}
                    </p>
                  )}
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
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${pickupErrors.pincode ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
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
          </div >

  {/* Delivery Address Card */ }
  < div className = "bg-white rounded-2xl p-6 border border-[#E7EAF0] shadow-sm space-y-4 font-poppins flex flex-col justify-between h-full" >
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
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${deliveryErrors.companyName ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
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
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${deliveryErrors.contactPerson ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
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
                      <Phone className="w-3.5 h-3.5 text-[#A14000]" />
                      <span className="text-xs font-bold text-[#1E293B] font-poppins">+91</span>
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="9876543210"
                      value={deliveryAddress.mobile}
                      onChange={(e) => handleAddressChange('delivery', 'mobile', e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-[72px] pr-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${deliveryErrors.mobile ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
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
                    className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all resize-none font-poppins ${deliveryErrors.streetAddress ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
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
                    maxLength={50}
                    placeholder="Enter Area or Locality"
                    value={deliveryAddress.area}
                    onChange={(e) => handleAddressChange('delivery', 'area', e.target.value)}
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${
                      deliveryErrors.area ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                    }`}
                  />
                  {deliveryErrors.area && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 font-poppins">
                      <span>•</span> {deliveryErrors.area}
                    </p>
                  )}
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
                    className={`w-full px-3.5 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${deliveryErrors.pincode ? "border-red-300 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
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

        {/* Service & Payment Card (Parcelix Image 2 style) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7EAF0] shadow-sm space-y-4 font-poppins">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] font-poppins flex items-center gap-2">
                💳 Service & Payment
              </h2>
              <p className="text-xs text-[#64748B] font-medium mt-0.5 font-poppins">
                Configure shipping service tier and payment method (Prepaid / Cash on Delivery COD)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                  Service Type
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 h-[42px] bg-white border border-[#E7EAF0] rounded-xl text-xs font-medium text-[#1E293B] focus:outline-none focus:border-[#A14000] focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins"
                >
                  <option value="Standard (3-5 days)">Standard (3-5 days)</option>
                  <option value="Express (1-2 days)">Express (1-2 days)</option>
                  <option value="Same Day Delivery">Same Day Delivery</option>
                  <option value="Heavy Cargo Fleet">Heavy Cargo Fleet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 h-[42px] bg-white border border-[#E7EAF0] rounded-xl text-xs font-medium text-[#1E293B] focus:outline-none focus:border-[#A14000] focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins"
                >
                  <option value="Prepaid">Prepaid</option>
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="Bill to Account">Bill to Account / Credit</option>
                </select>
              </div>

              {paymentMethod === "COD" && (
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 font-poppins">
                    COD Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={codAmount}
                    onChange={(e) => setCodAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 h-[42px] bg-white border border-[#E7EAF0] rounded-xl text-xs font-medium text-[#1E293B] focus:outline-none focus:border-[#A14000] focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins"
                  />
                </div>
              )}
            </div>

            {(() => {
              const parsedWeight = parseFloat(cargoWeight);
              const safeCargoWeight = (!isNaN(parsedWeight) && parsedWeight > 0) ? parsedWeight : 0;
              const distanceKm = routeInfo.distanceKm || 0;
              const serviceFeeVal = serviceType.includes("Express") ? 1500 : serviceType.includes("Same Day") ? 3000 : 500;
              const baseFreightVal = Math.round(distanceKm * 52 + safeCargoWeight * 4.5);
              const loadingChargesVal = 2500;
              const unloadingChargesVal = 2500;
              const subtotalVal = baseFreightVal + serviceFeeVal + loadingChargesVal + unloadingChargesVal;
              const gstTaxVal = Math.round(subtotalVal * 0.18);
              const estimatedTotalVal = subtotalVal + gstTaxVal;

              const formattedBaseFreight = baseFreightVal.toLocaleString("en-IN", { maximumFractionDigits: 2 });
              const formattedSubtotal = subtotalVal.toLocaleString("en-IN", { maximumFractionDigits: 2 });
              const formattedGst = gstTaxVal.toLocaleString("en-IN", { maximumFractionDigits: 2 });
              const formattedTotal = estimatedTotalVal.toLocaleString("en-IN", { maximumFractionDigits: 2 });

              return (
                <div className="bg-slate-50/80 p-4.5 rounded-xl border border-slate-200/80 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Estimated Payment Summary</h3>
                  <div className="flex justify-between items-center gap-3 text-xs text-slate-600">
                    <span className="shrink-0 font-medium">Base Freight Transport</span>
                    <span className="font-semibold text-right truncate max-w-[60%] shrink min-w-0" title={`Distance: ${distanceKm} KM, Weight: ${safeCargoWeight} kg`}>
                      ₹{formattedBaseFreight}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3 text-xs text-slate-600">
                    <span className="shrink-0 font-medium">Loading & Handling Charges</span>
                    <span className="font-semibold text-right shrink-0">₹{loadingChargesVal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center gap-3 text-xs text-slate-600">
                    <span className="shrink-0 font-medium">Unloading Charges</span>
                    <span className="font-semibold text-right shrink-0">₹{unloadingChargesVal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center gap-3 text-xs text-slate-600">
                    <span className="shrink-0 font-medium">Service Fee ({serviceType.split(' ')[0]})</span>
                    <span className="font-semibold text-right shrink-0">₹{serviceFeeVal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center gap-3 text-xs text-slate-600">
                    <span className="shrink-0 font-medium">GST / Taxes (18%)</span>
                    <span className="font-semibold text-right shrink-0">₹{formattedGst}</span>
                  </div>
                  <div className="flex justify-between items-center gap-3 text-xs text-slate-600">
                    <span className="shrink-0 font-medium">Payment Method</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] shrink-0 ${paymentMethod === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {paymentMethod}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center gap-3 text-sm font-black text-[#0D1B2A]">
                    <span className="shrink-0">Estimated Total</span>
                    <span className="text-base text-[#A14000] text-right font-black truncate max-w-[65%] shrink min-w-0" title={`₹${formattedTotal}`}>
                      ₹{formattedTotal}
                    </span>
                  </div>
                </div>
              );
            })()}
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
            disabled={isSubmitting || Object.values(fieldErrors).some(Boolean) || !departureTime || !eta || !cargoWeight || !startLocation || !endLocation || isSameLocError}
            className={`px-8 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-md cursor-pointer flex items-center gap-2 font-poppins ${(isSubmitting || Object.values(fieldErrors).some(Boolean) || !departureTime || !eta || !cargoWeight || !startLocation || !endLocation || isSameLocError)
                ? "bg-gray-300 shadow-none cursor-not-allowed opacity-60"
                : "bg-[#A14000] hover:bg-[#853400] shadow-[#A14000]/20"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 font-semibold">Creating Trip...</span>
            ) : (
              <>
                <Navigation className="w-4 h-4" /> Create Trip
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

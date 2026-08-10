import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, Search, ChevronDown, Eye, Edit2, Trash2, FileText, MapPin, X, AlertTriangle, SlidersHorizontal, Users, Loader, Truck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { vehicleApi } from "@/api/vehicleApi";
import L from "leaflet";
import { managerApi } from "../api/managerApi";


// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

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

export default function VehiclesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isViewOnly = user?.subscriptionStatus !== "ACTIVE";
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [fuelTypeFilter, setFuelTypeFilter] = useState("All Fuel Types");
  const [ownershipFilter, setOwnershipFilter] = useState("All Ownerships");
  const [availabilityFilter, setAvailabilityFilter] = useState("All Availabilities");
  const [insuranceFilter, setInsuranceFilter] = useState("All Insurances");
  const [permitFilter, setPermitFilter] = useState("All Permits");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [loading, setLoading] = useState(true);

  const getDocumentStatus = (expiryDate) => {
    if (!expiryDate) return "Pending";
    const exp = new Date(expiryDate);
    const today = new Date();
    exp.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Expired";
    if (diffDays <= 30) return "Expiring Soon";
    return "Active";
  };

  const normaliseVehicle = (v) => {
    const insExp = v.insuranceDetails?.expiryDate || v.insuranceExpiry;
    const permExp = v.permitDetails?.expiryDate || v.permitExpiry;
    let mappedStatus = v.currentStatus || 'Available';
    if (mappedStatus === 'Under Maintenance') {
      mappedStatus = 'Maintenance';
    }
    return {
      ...v,
      id:           v._id,
      name:         v.vehicleName || `${v.brand} ${v.model}`,
      manufacturer: v.brand || "",
      plateNumber:  v.vehicleNumber || "",
      type:         v.vehicleType || "Truck",
      driver:       v.assignedDriver && typeof v.assignedDriver === 'object'
        ? v.assignedDriver.fullName
        : (typeof v.assignedDriver === 'string' ? v.assignedDriver : 'Unassigned'),
      fuelLevel:    v.fuelCapacity ? Math.round((v.odometer % v.fuelCapacity) || 50) : 50,
      fastagBalance: v.fastagBalance ?? 0,
      branch:       v.branch || "Pune",
      dateAdded:    v.createdAt ? v.createdAt.split('T')[0] : '',
      status:       mappedStatus,
      chassisNumber: v.chassisNumber || "N/A",
      loadCapacity:  v.loadCapacity ?? 0,
      ownershipType: v.ownershipType || "Owned",
      insuranceDetails: v.insuranceDetails || {},
      permitDetails: v.permitDetails || {},
      insuranceStatus: getDocumentStatus(insExp),
      permitStatus: getDocumentStatus(permExp),
    };
  };

  const fetchVehicles = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await vehicleApi.list();
      const raw = res.data?.data ?? [];
      setVehicles(raw.map(normaliseVehicle));
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
      if (isInitial) toast.error("Failed to load vehicles from server.");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(true);
    const interval = setInterval(() => fetchVehicles(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Calculate filtered vehicles
  const processedVehicles = vehicles
    .filter((v) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        v.name?.toLowerCase().includes(query) ||
        v.plateNumber?.toLowerCase().includes(query) ||
        v.manufacturer?.toLowerCase().includes(query);
      
      const matchesStatus = statusFilter === "All Statuses" || v.status === statusFilter;
      const matchesType = typeFilter === "All Types" || v.type === typeFilter;
      const matchesBranch = branchFilter === "All Branches" || v.branch === branchFilter;
      const matchesFuelType = fuelTypeFilter === "All Fuel Types" || v.fuelType === fuelTypeFilter;
      const matchesOwnership = ownershipFilter === "All Ownerships" || v.ownershipType === ownershipFilter;
      const matchesAvailability = availabilityFilter === "All Availabilities" || v.availability === availabilityFilter;
      const matchesInsurance = insuranceFilter === "All Insurances" || v.insuranceStatus === insuranceFilter;
      const matchesPermit = permitFilter === "All Permits" || v.permitStatus === permitFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesBranch &&
        matchesFuelType &&
        matchesOwnership &&
        matchesAvailability &&
        matchesInsurance &&
        matchesPermit
      );
    })
    .sort((a, b) => {
      if (sortField === "createdAt" || sortField === "id" || sortField === "_id") {
        const getTimestamp = (item) => {
          if (item.createdAt) {
            const t = new Date(item.createdAt).getTime();
            if (!isNaN(t)) return t;
          }
          if (item._id && typeof item._id === "string" && item._id.length === 24) {
            return parseInt(item._id.substring(0, 8), 16) * 1000;
          }
          return 0;
        };
        const timeA = getTimestamp(a);
        const timeB = getTimestamp(b);
        return sortDirection === "desc" ? timeB - timeA : timeA - timeB;
      }

      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const paginatedVehicles = processedVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(processedVehicles.length / itemsPerPage);

  const filteredVehicles = processedVehicles; // For backward compatibility with map and markers

  // Initialize and update map
  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Center of India

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for each vehicle
    filteredVehicles.forEach((vehicle, idx) => {
      // Mock coordinates based on vehicle index and branch
      const coordinates = getVehicleCoordinates(vehicle.branch, idx);

      const color = getMarkerColor(vehicle.status);
      const marker = L.circleMarker(coordinates, {
        radius: 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<div class="font-bold text-sm">${vehicle.name}</div>
           <div class="text-xs text-gray-600">${vehicle.plateNumber}</div>
           <div class="text-xs text-gray-600">Status: ${vehicle.status}</div>
           <div class="text-xs text-gray-600">Driver: ${vehicle.driver}</div>`
        );

      markersRef.current.push(marker);
    });
  }, [filteredVehicles]);

  // Get marker color based on status
  const getMarkerColor = (status) => {
    const s = String(status || '').toLowerCase().trim();
    if (s.includes('available')) return "#22c55e"; // green
    if (s.includes('trip')) return "#f97316";      // orange
    if (s.includes('assigned')) return "#f97316";   // orange / on trip
    if (s.includes('maintenance')) return "#ef4444"; // red
    return "#6b7280";                              // grey (Idle / Out of Service)
  };

  // Get coordinates for vehicles
  const getVehicleCoordinates = (branch, index) => {
    if (!branch) return [18.5204, 73.8567]; // default Pune
    const norm = branch.toLowerCase().trim();
    let baseCoord = null;
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      if (norm.includes(key)) {
        baseCoord = coords;
        break;
      }
    }
    if (!baseCoord) {
      baseCoord = [18.5204, 73.8567]; // default Pune
    }
    
    // Add slight variation to coordinates for visualization to avoid overlapping markers
    const offset = (index % 5) * 0.02 - 0.04;
    const offset2 = ((index + 2) % 5) * 0.02 - 0.04;
    return [baseCoord[0] + offset, baseCoord[1] + offset2];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "Assigned":
        return "bg-blue-50 text-blue-700 border border-blue-100";
      case "On Trip":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "Under Maintenance":
        return "bg-rose-50 text-rose-700 border border-rose-100";
      case "Out of Service":
        return "bg-zinc-800 text-zinc-100 border border-zinc-950";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-100";
    }
  };

  const getDocStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
      case "Expiring Soon":
        return "bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold";
      case "Expired":
        return "bg-rose-50 text-rose-700 border border-rose-200/60 font-bold animate-pulse";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200/60";
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    const vehicleId = selectedVehicle._id || selectedVehicle.id;

    try {
      setIsDeletingVehicle(true);
      
      // Call API to delete the vehicle
      await vehicleApi.remove(vehicleId);
      
      // Remove from local state immediately
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success("Vehicle deleted successfully!");
    } catch (err) {
      // Handle different HTTP error responses
      if (!err.response) {
        toast.error("Unable to connect to the server. Please try again.");
      } else {
        const statusCode = err.response.status;
        const message = err.response?.data?.message;

        switch (statusCode) {
          case 400:
            toast.error(message || "Invalid request.");
            break;
          case 401:
            toast.error("You are not authenticated. Please log in again.");
            break;
          case 403:
            toast.error("You do not have permission to delete this vehicle.");
            break;
          case 404:
            toast.error("Vehicle not found.");
            setVehicles(prev => prev.filter(v => v.id !== vehicleId));
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(message || "Failed to delete vehicle.");
        }
      }
    } finally {
      setIsDeletingVehicle(false);
      setDeleteModalOpen(false);
      setSelectedVehicle(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Breadcrumb />
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#E7EAF0] pb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Vehicles List
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">
            Complete list of all registered vehicles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/manager/add-vehicle")}
            disabled={isViewOnly}
            title={isViewOnly ? "This feature is available after activating a subscription." : ""}
            className={`px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 cursor-pointer ${isViewOnly ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">TOTAL</p>
              <p className="text-2xl font-extrabold text-[#1E293B] mt-2">{vehicles.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">AVAILABLE</p>
              <p className="text-2xl font-extrabold text-green-600 mt-2">
                {vehicles.filter((v) => v.status === "Available").length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">ON TRIP</p>
              <p className="text-2xl font-extrabold text-orange-600 mt-2">
                {vehicles.filter((v) => v.status === "On Trip").length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">MAINTENANCE</p>
              <p className="text-2xl font-extrabold text-red-600 mt-2">
                {vehicles.filter((v) => v.status === "Maintenance").length}
              </p>
            </div>
          </div>

          {/* Search Bar with Filters on Same Line */}
          <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                />
              </div>

              {/* Status Filter */}
              <div className="relative w-full lg:w-auto lg:min-w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 h-10 bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
                >
                  <option>All Statuses</option>
                  <option>Available</option>
                  <option>On Trip</option>
                  <option>Idle</option>
                  <option>Maintenance</option>
                </select>
                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#64748B]">
                  <ChevronDown className="w-4 h-4" />
                </span>
              </div>

              {/* Vehicle Type Filter */}
              <div className="relative w-full lg:w-auto lg:min-w-40">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 h-10 bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
                >
                  <option>All Types</option>
                  <option>Truck</option>
                  <option>Lorry</option>
                  <option>Van</option>
                  <option>Bus</option>
                  <option>Pickup</option>
                  <option>Trailer</option>
                  <option>Mini Truck</option>
                  <option>Tanker</option>
                  <option>Container</option>
                </select>
                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#64748B]">
                  <ChevronDown className="w-4 h-4" />
                </span>
              </div>

              {/* More Filters Button */}
              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="w-full lg:w-auto px-4 py-2.5 text-sm font-semibold text-[#64748B] hover:text-[#1E293B] border border-[#E7EAF0] hover:bg-[#F5F7FB] rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>More Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMoreFilters ? "rotate-180" : ""}`} />
              </button>

              {/* Vehicle Count */}
              <p className="text-xs font-medium text-[#64748B] lg:ml-auto whitespace-nowrap">
                Showing <span className="font-bold text-[#1E293B]">{filteredVehicles.length}</span> of <span className="font-bold text-[#1E293B]">{vehicles.length}</span>
              </p>
            </div>

            {/* More Filters - Collapsible Section */}
            {showMoreFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-[#E7EAF0]">
                {/* Branch */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Branch</label>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
                  >
                    <option>All Branches</option>
                    <option>Pune</option>
                    <option>Mumbai</option>
                    <option>Delhi</option>
                    <option>Bengaluru</option>
                  </select>
                  <span className="absolute bottom-2.5 right-3 flex items-center pointer-events-none text-[#64748B]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Fuel Type */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Fuel Type</label>
                  <select
                    value={fuelTypeFilter}
                    onChange={(e) => setFuelTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
                  >
                    <option>All Fuel Types</option>
                    <option>Diesel</option>
                    <option>Petrol</option>
                    <option>CNG</option>
                    <option>Electric</option>
                  </select>
                  <span className="absolute bottom-2.5 right-3 flex items-center pointer-events-none text-[#64748B]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Ownership */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Ownership</label>
                  <select
                    value={ownershipFilter}
                    onChange={(e) => setOwnershipFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
                  >
                    <option>All Ownerships</option>
                    <option>Owned</option>
                    <option>Leased</option>
                    <option>Financed</option>
                  </select>
                  <span className="absolute bottom-2.5 right-3 flex items-center pointer-events-none text-[#64748B]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Availability */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Availability</label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
                  >
                    <option>All Availabilities</option>
                    <option>Immediate</option>
                    <option>Scheduled</option>
                  </select>
                  <span className="absolute bottom-2.5 right-3 flex items-center pointer-events-none text-[#64748B]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Insurance Status Filter */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Insurance Status</label>
                  <select
                    value={insuranceFilter}
                    onChange={(e) => setInsuranceFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
                  >
                    <option>All Insurances</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <span className="absolute bottom-2.5 right-3 flex items-center pointer-events-none text-[#64748B]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Permit Status Filter */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Permit Status</label>
                  <select
                    value={permitFilter}
                    onChange={(e) => setPermitFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
                  >
                    <option>All Permits</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <span className="absolute bottom-2.5 right-3 flex items-center pointer-events-none text-[#64748B]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Vehicles Table */}
          <div className="bg-white rounded-xl border border-[#E7EAF0] overflow-hidden w-full min-w-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm font-nunito">
                <thead>
                  <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                    <th className="py-4 px-6 text-left whitespace-nowrap cursor-pointer hover:bg-gray-100/50" onClick={() => handleSort("plateNumber")}>
                      Registration No {sortField === "plateNumber" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 text-left whitespace-nowrap cursor-pointer hover:bg-gray-100/50" onClick={() => handleSort("name")}>
                      Vehicle Name {sortField === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 text-left whitespace-nowrap cursor-pointer hover:bg-gray-100/50" onClick={() => handleSort("type")}>
                      Type {sortField === "type" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 text-left whitespace-nowrap cursor-pointer hover:bg-gray-100/50" onClick={() => handleSort("driver")}>
                      Assigned Driver {sortField === "driver" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 text-left whitespace-nowrap cursor-pointer hover:bg-gray-100/50" onClick={() => handleSort("status")}>
                      Availability Status {sortField === "status" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 text-left whitespace-nowrap cursor-pointer hover:bg-gray-100/50" onClick={() => handleSort("insuranceStatus")}>
                      Insurance {sortField === "insuranceStatus" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 text-left whitespace-nowrap cursor-pointer hover:bg-gray-100/50" onClick={() => handleSort("permitStatus")}>
                      Permit {sortField === "permitStatus" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 text-left whitespace-nowrap cursor-pointer hover:bg-gray-100/50" onClick={() => handleSort("updatedAt")}>
                      Last Updated {sortField === "updatedAt" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 text-center whitespace-nowrap">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                   {loading ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-[#64748B]">
                          <Loader className="w-7 h-7 animate-spin text-[#B45A0A]" />
                          <span className="text-sm font-semibold">Loading vehicles...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedVehicles.length > 0 ? (
                    paginatedVehicles.map((vehicle, idx) => (
                      <tr key={vehicle._id} className="border-b border-[#E7EAF0]/60 hover:bg-[#F5F7FB]/50 transition-colors">
                        <td className="py-4 px-6 whitespace-nowrap font-poppins font-semibold text-xs tracking-wider text-[#1E293B]">
                          {vehicle.plateNumber || vehicle.vehicleNumber}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {vehicle.vehicleImage?.secure_url || vehicle.image ? (
                              <img
                                src={vehicle.vehicleImage?.secure_url || vehicle.image}
                                alt={vehicle.name}
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-[#FDF3EC] border border-[#B45A0A]/20 flex items-center justify-center shrink-0">
                                <Truck className="w-5 h-5 text-[#B45A0A]" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <p className="font-bold text-[#1E293B] text-sm">{vehicle.name}</p>
                              <p className="text-xs text-[#64748B]">{vehicle.manufacturer}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="text-[#64748B] text-sm">{vehicle.type}</p>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {vehicle.driver === "Unassigned" ? (
                            <span className="text-rose-600 font-bold text-xs bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg flex items-center w-max gap-1">
                              Unassigned
                            </span>
                          ) : (
                            <span className="text-[#1E293B] font-medium text-xs">{vehicle.driver}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${getDocStatusBadge(vehicle.insuranceStatus)}`}>
                            {vehicle.insuranceStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${getDocStatusBadge(vehicle.permitStatus)}`}>
                            {vehicle.permitStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-xs text-[#64748B]">
                          {new Date(vehicle.updatedAt || vehicle.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => navigate(`/manager/vehicle-details/${vehicle._id}`)}
                              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/manager/vehicle-edit/${vehicle._id}`)}
                              disabled={isViewOnly}
                              title={isViewOnly ? "This feature is available after activating a subscription." : "Edit"}
                              className={`p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl active:scale-95 transition-all cursor-pointer ${isViewOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedVehicle(vehicle);
                                setDeleteModalOpen(true);
                              }}
                              disabled={isViewOnly}
                              title={isViewOnly ? "This feature is available after activating a subscription." : "Delete"}
                              className={`p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl active:scale-95 transition-all cursor-pointer ${isViewOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center">
                        <p className="text-[#64748B] font-medium">No vehicles found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            {processedVehicles.length > 0 && (
              <div className="px-6 py-4 bg-[#FDFDFD] border-t border-[#E7EAF0] flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-4 text-xs text-[#64748B] font-semibold font-poppins">
                  <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <div className="relative">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="pl-2.5 pr-8 py-1.5 bg-white border border-[#E7EAF0] rounded-lg text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <span>|</span>
                  <span>
                    Showing <span className="text-[#1E293B] font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, processedVehicles.length)}</span> - <span className="text-[#1E293B] font-bold">{Math.min(currentPage * itemsPerPage, processedVehicles.length)}</span> of <span className="text-[#1E293B] font-bold">{processedVehicles.length}</span> vehicles
                  </span>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 select-none font-poppins">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-1.5 border border-[#E7EAF0] rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === i + 1
                            ? "bg-[#B45A0A] text-white border border-[#B45A0A]"
                            : "border border-[#E7EAF0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="px-3 py-1.5 border border-[#E7EAF0] rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fleet Location Map */}
          <div className="bg-white rounded-xl border border-[#E7EAF0] overflow-hidden">
            <div className="p-6 border-b border-[#E7EAF0]">
              <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#B45A0A]" />
                Fleet Location Map
              </h2>
              <p className="text-xs text-[#64748B] mt-1">Real-time vehicle locations across regions</p>
            </div>

            {/* Leaflet Map Container */}
            <div 
              ref={mapRef}
              className="w-full h-96 bg-[#F5F7FB]"
              style={{ zIndex: 1 }}
            />

            {/* Legend */}
            <div className="p-4 border-t border-[#E7EAF0] bg-[#F5F7FB]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-[#64748B] font-medium">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-xs text-[#64748B] font-medium">On Trip</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-[#64748B] font-medium">Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span className="text-xs text-[#64748B] font-medium">Idle</span>
                </div>
              </div>
            </div>
          </div>


      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1E293B]">Confirm Deletion</h3>
              </div>
            </div>

            <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
              <p className="text-sm text-red-800">
                Are you sure you want to delete <strong>{selectedVehicle.name}</strong> ({selectedVehicle.plateNumber})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2.5 border border-[#E7EAF0] rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVehicle}
                disabled={isDeletingVehicle}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeletingVehicle ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Vehicle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, Search, ChevronDown, Eye, Edit2, Trash2, FileText, MapPin, X, AlertTriangle, SlidersHorizontal, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import L from "leaflet";
import Sidebar from "../dashboard/Sidebar";
import Header from "../dashboard/Header";
import "../dashboard/manager.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

export default function VehiclesListPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [fuelTypeFilter, setFuelTypeFilter] = useState("All Fuel Types");
  const [ownershipFilter, setOwnershipFilter] = useState("All Ownerships");
  const [availabilityFilter, setAvailabilityFilter] = useState("All Availabilities");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Load vehicles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("fleet_vehicles");
    if (saved) {
      setVehicles(JSON.parse(saved));
    }
  }, []);

  // Calculate filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      v.name?.toLowerCase().includes(query) ||
      v.plateNumber?.toLowerCase().includes(query) ||
      v.manufacturer?.toLowerCase().includes(query);
    
    const matchesStatus = statusFilter === "All Statuses" || v.status === statusFilter;
    const matchesType = typeFilter === "All Types" || v.type === typeFilter;
    const matchesBranch = branchFilter === "All Branches" || v.branch === branchFilter;
    const matchesFuelType = fuelTypeFilter === "All Fuel Types" || v.fuelType === fuelTypeFilter;
    const matchesOwnership = ownershipFilter === "All Ownerships" || v.ownership === ownershipFilter;
    const matchesAvailability = availabilityFilter === "All Availabilities" || v.availability === availabilityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesBranch &&
      matchesFuelType &&
      matchesOwnership &&
      matchesAvailability
    );
  });

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
    switch (status) {
      case "Available":
        return "#22c55e"; // green
      case "On Trip":
        return "#f97316"; // orange
      case "Maintenance":
        return "#ef4444"; // red
      case "Idle":
        return "#6b7280"; // gray
      default:
        return "#6b7280";
    }
  };

  // Get mock coordinates for vehicles
  const getVehicleCoordinates = (branch, index) => {
    const locations = {
      "Pune": [18.5204, 73.8567],
      "Mumbai": [19.076, 72.8777],
      "Delhi": [28.7041, 77.1025],
      "Bengaluru": [12.9716, 77.5946],
      "Chennai": [13.0827, 80.2707]
    };

    const baseCoord = locations[branch] || [20.5937, 78.9629];
    
    // Add slight variation to coordinates for visualization
    const offset = (index % 5) * 0.05;
    return [baseCoord[0] + offset, baseCoord[1] + offset];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-700";
      case "On Trip":
        return "bg-orange-100 text-orange-700";
      case "Maintenance":
        return "bg-red-100 text-red-700";
      case "Idle":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getInsuranceStyle = (expiry) => {
    const expDate = new Date(expiry);
    const today = new Date();
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-600 font-bold";
    if (diffDays <= 30) return "text-orange-600 font-bold";
    return "text-gray-700";
  };

  // Delete vehicle
  const handleDeleteVehicle = () => {
    const updated = vehicles.filter((v) => v.id !== selectedVehicle.id);
    setVehicles(updated);
    localStorage.setItem("fleet_vehicles", JSON.stringify(updated));
    toast.success("Vehicle deleted successfully!");
    setDeleteModalOpen(false);
    setSelectedVehicle(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F5F7FB] font-nunito text-[#1E293B]">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onMenuToggle={() => setMobileSidebarOpen(true)} showMenuButton={true} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 border-b border-[#E7EAF0] pb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/manager")}
                className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-[#64748B]" />
              </button>
              <div>
                <h1 className="text-3xl font-black font-poppins text-[#1E293B]">
                  Vehicles List
                </h1>
                <p className="text-sm text-[#64748B] mt-1">
                  Complete list of all registered vehicles
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/manager/drivers")}
                className="px-4 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all flex items-center gap-2 shadow-sm font-poppins cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>View All Drivers</span>
              </button>
              <button
                onClick={() => navigate("/manager/add-vehicle")}
                className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 cursor-pointer"
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
                  <option>Van</option>
                  <option>Tipper</option>
                  <option>Trailer</option>
                  <option>Bus</option>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#E7EAF0]">
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
              </div>
            )}
          </div>

          {/* Vehicles Table */}
          <div className="bg-white rounded-xl border border-[#E7EAF0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0]">
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      VEHICLE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      PLATE NO.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      TYPE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      DRIVER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      INSURANCE
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle, idx) => (
                      <tr key={vehicle.id} className="border-b border-[#E7EAF0] hover:bg-[#F5F7FB] transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <p className="font-bold text-[#1E293B] text-sm">{vehicle.name}</p>
                            <p className="text-xs text-[#64748B]">{vehicle.manufacturer}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <p className="font-bold text-[#1E293B] uppercase text-sm">{vehicle.plateNumber}</p>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <p className="text-[#64748B] text-sm">{vehicle.type}</p>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <p className="text-[#64748B] text-sm">{vehicle.driver}</p>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <p className={`text-xs font-bold ${getInsuranceStyle(vehicle.insuranceExpiry)}`}>
                            {new Date(vehicle.insuranceExpiry).toLocaleDateString("en-IN")}
                          </p>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => navigate(`/manager/vehicle-details/${vehicle.id}`)}
                              className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => navigate(`/manager/vehicle-edit/${vehicle.id}`)}
                              className="p-1.5 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-orange-600" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedVehicle(vehicle);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <p className="text-[#64748B] font-medium">No vehicles found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 bg-[#F5F7FB] border-t border-[#E7EAF0] flex items-center justify-between">
              <p className="text-xs font-medium text-[#64748B]">
                Showing <span className="font-bold text-[#1E293B]">{filteredVehicles.length}</span> of{" "}
                <span className="font-bold text-[#1E293B]">{vehicles.length}</span> vehicles
              </p>
            </div>
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
        </main>
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
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

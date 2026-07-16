import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  RefreshCw,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Route,
  X,
  AlertTriangle,
  Play,
  CheckCircle2,
  Pencil
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

const getDistance = (startCity, endCity) => {
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

export default function TripsListPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [driversList, setDriversList] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [driverFilter, setDriverFilter] = useState("All Drivers");
  const [vehicleFilter, setVehicleFilter] = useState("All Vehicles");
  const [dateFilter, setDateFilter] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);

  // Form State for Edit Modal
  const [formData, setFormData] = useState({
    driverId: "",
    vehicleId: "",
    startLocation: "",
    endLocation: "",
    departureTime: "",
    eta: "",
    status: "",
    description: "",
    cargoType: "",
    cargoWeight: "",
    tripNotes: ""
  });

  const [departureError, setDepartureError] = useState("");
  const [etaError, setEtaError] = useState("");

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
    let updatedEta = formData.eta;
    if (val && formData.eta) {
      const depDate = new Date(val);
      const etaDate = new Date(formData.eta);
      if (depDate.getTime() >= etaDate.getTime()) {
        updatedEta = "";
      }
    }

    setFormData(prev => ({
      ...prev,
      departureTime: val,
      eta: updatedEta
    }));

    validateDates(val, updatedEta);
  };

  const handleEtaChange = (val) => {
    setFormData(prev => ({
      ...prev,
      eta: val
    }));
    validateDates(formData.departureTime, val);
  };

  const handleBlur = () => {
    validateDates(formData.departureTime, formData.eta);
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchTrips = async () => {
    try {
      const response = await managerApi.getTrips();
      const result = response.data?.data || response.data;
      if (Array.isArray(result)) {
        const sortedResult = [...result].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.departureTime || 0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.departureTime || 0);
          return dateB - dateA;
        });
        setTrips(sortedResult.map(t => ({ ...t, id: t._id })));
      } else {
        setTrips([]);
      }
    } catch (error) {
      toast.error("Failed to load trips from database");
      console.error(error);
    }
  };

  const fetchResources = async () => {
    try {
      const [dRes, vRes] = await Promise.all([
        managerApi.getDrivers(),
        managerApi.getVehicles()
      ]);
      setDriversList(dRes.data?.data || dRes.data || []);
      setVehiclesList(vRes.data?.data || vRes.data || []);
    } catch (err) {
      console.error("Failed to fetch resource lists", err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchResources();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, driverFilter, vehicleFilter, dateFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All Statuses");
    setDriverFilter("All Drivers");
    setVehicleFilter("All Vehicles");
    setDateFilter("");
    setCurrentPage(1);
    toast.success("Filters reset successfully");
  };

  const handleStartTrip = async (id) => {
    try {
      await managerApi.updateTrip(id, { status: "In Progress" });
      toast.success("Trip started successfully!");
      fetchTrips();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start trip");
      console.error(err);
    }
  };

  const handleEndTrip = async (id) => {
    try {
      await managerApi.updateTrip(id, { status: "Completed" });
      toast.success("Trip completed successfully!");
      fetchTrips();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to end trip");
      console.error(err);
    }
  };

  const handleOpenEdit = (t) => {
    fetchResources();
    setEditingTrip(t);
    setFormData({
      driverId: t.driver?._id || t.driver || "",
      vehicleId: t.vehicle?._id || t.vehicle || "",
      startLocation: t.startLocation,
      endLocation: t.endLocation,
      departureTime: t.departureTime ? new Date(t.departureTime).toISOString().slice(0, 16) : "",
      eta: t.eta ? new Date(t.eta).toISOString().slice(0, 16) : "",
      status: t.status,
      description: t.description || "",
      cargoType: t.cargoType || "",
      cargoWeight: t.cargoWeight || "",
      tripNotes: t.tripNotes || ""
    });
    setDepartureError("");
    setEtaError("");
    setShowEditModal(true);
  };

  const handleEditTrip = async (e) => {
    e.preventDefault();

    const { depErr, etaErr } = validateDates(formData.departureTime, formData.eta);
    if (depErr || etaErr) {
      toast.error(depErr || etaErr);
      return;
    }

    if (!formData.startLocation || !formData.endLocation || !formData.departureTime || !formData.eta) {
      toast.error("Required fields cannot be empty");
      return;
    }
    if (formData.startLocation.trim().toLowerCase() === formData.endLocation.trim().toLowerCase()) {
      toast.error("Pickup and Destination cannot be the same");
      return;
    }

    try {
      await managerApi.updateTrip(editingTrip.id, {
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        departureTime: formData.departureTime,
        eta: formData.eta,
        description: formData.description,
        cargoType: formData.cargoType,
        cargoWeight: formData.cargoWeight ? Number(formData.cargoWeight) : undefined,
        tripNotes: formData.tripNotes
      });
      toast.success("Trip updated successfully");
      setShowEditModal(false);
      setEditingTrip(null);
      fetchTrips();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update trip");
      console.error(error);
    }
  };

  const handleDeleteTrip = async () => {
    if (!selectedTrip) return;
    try {
      await managerApi.deleteTrip(selectedTrip._id);
      setDeleteModalOpen(false);
      setSelectedTrip(null);
      toast.success("Trip record deleted successfully");
      fetchTrips();
    } catch (error) {
      toast.error("Failed to delete trip");
      console.error(error);
    }
  };

  const filteredTrips = trips.filter(t => {
    const query = search.toLowerCase();
    const matchesSearch =
      (t.tripNumber || "").toLowerCase().includes(query) ||
      (t.driverName || "").toLowerCase().includes(query) ||
      (t.vehiclePlate || "").toLowerCase().includes(query) ||
      (t.vehicleName || "").toLowerCase().includes(query) ||
      (t.startLocation || "").toLowerCase().includes(query) ||
      (t.endLocation || "").toLowerCase().includes(query) ||
      (t.description || "").toLowerCase().includes(query);

    const matchesStatus = statusFilter === "All Statuses" || t.status === statusFilter;

    const matchesDriver = driverFilter === "All Drivers" || String(t.driver) === String(driverFilter);

    const matchesVehicle = vehicleFilter === "All Vehicles" || String(t.vehicle) === String(vehicleFilter);

    let matchesDate = true;
    if (dateFilter) {
      const filterYMD = new Date(dateFilter).toDateString();
      const tripYMD = t.departureTime ? new Date(t.departureTime).toDateString() : "";
      matchesDate = filterYMD === tripYMD;
    }

    return matchesSearch && matchesStatus && matchesDriver && matchesVehicle && matchesDate;
  });

  // Pagination helper calculations
  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / rowsPerPage));
  const indexOfLastRow = Math.min(currentPage * rowsPerPage, filteredTrips.length);
  const indexOfFirstRow = Math.min((currentPage - 1) * rowsPerPage, filteredTrips.length);
  const currentRows = filteredTrips.slice(indexOfFirstRow, indexOfLastRow);

  const getStatusBadge = (status) => {
    switch (status) {
      case "In Progress":
      case "On Transit":
        return "bg-[#FDF3EC] text-[#B45A0A] border border-[#FDF3EC] font-semibold";
      case "Scheduled":
        return "bg-blue-50 text-blue-700 border border-blue-100 font-semibold";
      case "Assigned":
        return "bg-indigo-50 text-indigo-700 border border-indigo-150 font-semibold";
      case "Completed":
        return "bg-slate-900 text-white border border-slate-950 font-semibold";
      case "Cancelled":
        return "bg-red-50 text-red-600 border border-red-100 font-semibold";
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

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Trips List
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px] font-medium">
            Complete database of all registered trip dispatches
          </p>
        </div>
      </div>

      {/* Search Bar with Filter Fields */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-sm mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search ID, route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 h-[44px] border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B] font-semibold"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none cursor-pointer font-semibold"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#64748B]">
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Driver Filter */}
          <div className="relative">
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none cursor-pointer font-semibold"
            >
              <option value="All Drivers">All Drivers</option>
              {driversList.map((drv) => (
                <option key={drv._id} value={drv._id}>{drv.fullName || drv.name}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#64748B]">
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Vehicle Filter */}
          <div className="relative">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none cursor-pointer font-semibold"
            >
              <option value="All Vehicles">All Vehicles</option>
              {vehiclesList.map((veh) => (
                <option key={veh._id} value={veh._id}>{veh.vehicleNumber || veh.plateNumber}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#64748B]">
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E7EAF0]/60 pt-3 text-xs text-[#64748B] font-semibold font-poppins">
          <span>Total Matches: <strong>{filteredTrips.length}</strong> dispatches</span>
          {(search || statusFilter !== "All Statuses" || driverFilter !== "All Drivers" || vehicleFilter !== "All Vehicles" || dateFilter) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#EF4444] hover:underline font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                <th className="py-4 px-6 whitespace-nowrap">Trip ID</th>
                <th className="py-4 px-6 whitespace-nowrap">Pickup Location</th>
                <th className="py-4 px-6 whitespace-nowrap">Destination</th>
                <th className="py-4 px-6 whitespace-nowrap">Assigned Driver</th>
                <th className="py-4 px-6 whitespace-nowrap">Assigned Vehicle</th>
                <th className="py-4 px-6 whitespace-nowrap">Trip Status</th>
                <th className="py-4 px-6 whitespace-nowrap">Pickup Date</th>
                <th className="py-4 px-6 whitespace-nowrap">Expected Arrival</th>
                <th className="py-4 px-6 whitespace-nowrap">Distance</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400 font-medium font-nunito">
                    No trips found matching the selections.
                  </td>
                </tr>
              ) : (
                currentRows.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F5F7FB]/50 transition-colors group">
                    
                    {/* Trip ID */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg w-max font-poppins">
                          {t.tripNumber}
                        </span>
                        <span className="text-[10px] text-[#64748B] mt-1 block font-semibold max-w-[150px] truncate">
                          {t.description}
                        </span>
                      </div>
                    </td>

                    {/* Start Location */}
                    <td className="py-4 px-6 whitespace-nowrap font-semibold text-xs text-[#1E293B]">
                      {t.startLocation}
                    </td>

                    {/* Destination */}
                    <td className="py-4 px-6 whitespace-nowrap font-semibold text-xs text-[#1E293B]">
                      {t.endLocation}
                    </td>

                    {/* Driver */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#1E293B] font-poppins group-hover:text-[#B45A0A] transition-colors">
                          {t.driverName || "Unassigned"}
                        </span>
                        <span className="text-[10px] text-[#64748B] mt-0.5 block font-semibold">
                          {t.driverPhone || ""}
                        </span>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#1E293B]">
                          {t.vehicleName || "Unassigned"}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-500 mt-0.5 uppercase tracking-wide block font-poppins">
                          {t.vehiclePlate || ""}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(t.status)}`}>
                        {t.status === "Completed" ? "Complete" : t.status}
                      </span>
                    </td>

                    {/* Departure */}
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-[#1E293B] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{formatDateTime(t.departureTime)}</span>
                      </div>
                    </td>

                    {/* ETA */}
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-[#1E293B] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{formatDateTime(t.eta)}</span>
                      </div>
                    </td>

                    {/* Distance */}
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-[#1E293B] font-bold">
                      {(() => {
                        const est = (t.estimatedDistance && t.estimatedDistance !== 120) ? t.estimatedDistance : getDistance(t.startLocation, t.endLocation);
                        const act = (t.actualDistance && t.actualDistance !== 120) ? t.actualDistance : est;
                        return t.status === "Completed" ? act : est;
                      })()} KM
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right select-none whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View */}
                        <button
                          onClick={() => navigate(`/manager/trip-details/${t.id}`)}
                          title="View details"
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>



                        {/* End Trip */}
                        {t.status === "In Progress" && (
                          <button
                            onClick={() => handleEndTrip(t.id)}
                            title="End Trip"
                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit */}
                        {(t.status === "Scheduled" || t.status === "Assigned") && (
                          <button
                            onClick={() => handleOpenEdit(t)}
                            title="Edit trip"
                            className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        {(t.status === "Scheduled" || t.status === "Assigned") && (
                          <button
                            onClick={() => {
                              setSelectedTrip(t);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete trip record"
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredTrips.length > 0 && (
          <div className="px-6 py-4.5 border-t border-[#E7EAF0] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FDFDFD]">
            <div className="flex items-center gap-4 text-xs text-[#64748B] font-semibold font-poppins">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <div className="relative">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="pl-2.5 pr-8 py-1.5 bg-white border border-[#E7EAF0] rounded-lg text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <span>|</span>
              <span>
                Showing <span className="text-[#1E293B] font-bold">{indexOfFirstRow + 1}</span> - <span className="text-[#1E293B] font-bold">{indexOfLastRow}</span> of <span className="text-[#1E293B] font-bold">{filteredTrips.length}</span> entries
              </span>
            </div>

            <div className="flex items-center gap-1.5 select-none font-poppins">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 border border-[#E7EAF0] rounded-lg text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-[#B45A0A] text-white border border-[#B45A0A]"
                      : "border border-[#E7EAF0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 border border-[#E7EAF0] rounded-lg text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteModalOpen && selectedTrip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative animate-scale-up">
            <button
              onClick={() => { setDeleteModalOpen(false); setSelectedTrip(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins flex items-center gap-2 text-[#EF4444]">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                  Cancel Trip Dispatch
                </h3>
                <p className="text-xs text-[#64748B] mt-1 font-medium">
                  Are you absolutely sure you want to cancel and delete trip logs for dispatch <strong>{selectedTrip.tripNumber}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                <button
                  onClick={() => { setDeleteModalOpen(false); setSelectedTrip(null); }}
                  className="px-4.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                >
                  Keep Trip
                </button>
                <button
                  onClick={handleDeleteTrip}
                  className="px-5 py-2.5 bg-[#EF4444] hover:bg-red-700 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                >
                  Cancel Trip Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT TRIP MODAL --- */}
      {showEditModal && editingTrip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 animate-scale-up">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0 font-poppins">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-white">Edit Trip Specifications: {editingTrip.tripNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditingTrip(null); }}
                className="p-1.5 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditTrip} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar text-left font-nunito">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Location */}
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                    Start Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.startLocation}
                    onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                  />
                </div>

                {/* End Location */}
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                    Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.endLocation}
                    onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Departure Time */}
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                    Departure Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.departureTime}
                    onChange={(e) => handleDepartureTimeChange(e.target.value)}
                    onBlur={handleBlur}
                    min={getCurrentDateTimeString()}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium ${
                      departureError ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0]"
                    }`}
                  />
                  {departureError && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{departureError}</p>
                  )}
                </div>

                {/* ETA */}
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                    Estimated Arrival (ETA) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.eta}
                    onChange={(e) => handleEtaChange(e.target.value)}
                    onBlur={handleBlur}
                    min={getMinEtaString(formData.departureTime)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium ${
                      etaError ? "border-red-500 focus:border-red-500" : "border-[#E7EAF0]"
                    }`}
                  />
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
                    value={formData.cargoType}
                    onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                  />
                </div>

                {/* Cargo Weight */}
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                    Cargo Weight (Optional, kg)
                  </label>
                  <input
                    type="number"
                    value={formData.cargoWeight}
                    onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cargo Description */}
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                    Cargo Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                  />
                </div>

                {/* Trip Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                    Trip Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tripNotes}
                    onChange={(e) => setFormData({ ...formData, tripNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-gray-100 bg-white text-right shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingTrip(null); setDepartureError(""); setEtaError(""); }}
                  className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!departureError || !!etaError || !formData.departureTime || !formData.eta}
                  className={`px-6 py-2.5 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md ${
                    (departureError || etaError || !formData.departureTime || !formData.eta)
                      ? "bg-gray-300 shadow-none cursor-not-allowed opacity-60"
                      : "bg-[#B45A0A] hover:bg-[#9A4D08]"
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

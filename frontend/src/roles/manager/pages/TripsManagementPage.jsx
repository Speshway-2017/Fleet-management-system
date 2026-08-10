import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  RefreshCw,
  Plus,
  Route,
  Compass,
  Calendar,
  Clock,
  Eye,
  Trash2,
  X,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CheckSquare,
  Percent,
  Play,
  CheckCircle2,
  Pencil,
  SlidersHorizontal,
  MapPin,
  User,
  Truck
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { getSocket } from "@/api/socket";
import { managerApi } from "../api/managerApi";
import { calculateDrivingRoute, calculateEtaFromDuration } from "../services/routingService";
import { getNormalizedTripCategory, calculateTripKPIs } from "@/utils/tripStatusHelper";

export default function TripsManagementPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tripDistances, setTripDistances] = useState({});
  const [editRouteInfo, setEditRouteInfo] = useState({ distanceKm: 0, loading: false, errorMessage: "" });
  const [unreadCounts, setUnreadCounts] = useState({});

  const fetchUnreadCounts = async () => {
    try {
      const res = await managerApi.getUnreadChatCounts();
      const data = res.data?.data || res.data || {};
      setUnreadCounts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUnreadCounts();
    const socket = getSocket();
    const handleNewMsg = (msg) => {
      if (msg.senderRole === "Driver" && msg.tripId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.tripId]: (prev[msg.tripId] || 0) + 1
        }));
      }
    };
    socket.on("chat:new-message", handleNewMsg);
    return () => socket.off("chat:new-message", handleNewMsg);
  }, []);

  // Resources list for assignment dropdowns
  const [driversList, setDriversList] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);

  // States
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Trips"); // All Trips, Active, Scheduled, Completed, Delayed
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    driverId: "",
    vehicleId: "",
    startLocation: "",
    endLocation: "",
    departureTime: "",
    eta: "",
    status: "Assigned",
    description: ""
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



  const fetchTrips = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
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
      if (isInitial) toast.error("Failed to load trips from database");
      console.error(error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(true);
    const socket = getSocket();
    const handleRefresh = () => fetchTrips(false);

    socket.on("trip:created", handleRefresh);
    socket.on("trip:updated", handleRefresh);
    socket.on("trip:status-updated", handleRefresh);
    socket.on("trip:deleted", handleRefresh);

    const interval = setInterval(() => fetchTrips(false), 5000);
    return () => {
      clearInterval(interval);
      socket.off("trip:created", handleRefresh);
      socket.off("trip:updated", handleRefresh);
      socket.off("trip:status-updated", handleRefresh);
      socket.off("trip:deleted", handleRefresh);
    };
  }, []);

  // Compute dynamic driving distances for fetched trips
  useEffect(() => {
    if (!trips.length) return;
    trips.forEach(async (t) => {
      if (t.startLocation && t.endLocation) {
        const tripKey = t.id || t._id;
        const res = await calculateDrivingRoute(t.startLocation, t.endLocation);
        if (res.success && res.distanceKm) {
          setTripDistances(prev => ({ ...prev, [tripKey]: res.distanceKm }));
        }
      }
    });
  }, [trips]);

  // Recalculate route whenever edit modal location inputs change
  useEffect(() => {
    if (!showEditModal || !formData.startLocation.trim() || !formData.endLocation.trim()) return;
    const timer = setTimeout(async () => {
      setEditRouteInfo(prev => ({ ...prev, loading: true, errorMessage: "" }));
      const res = await calculateDrivingRoute(formData.startLocation, formData.endLocation);
      if (res.success) {
        setEditRouteInfo({ distanceKm: res.distanceKm, loading: false, errorMessage: "" });
      } else {
        setEditRouteInfo({ distanceKm: 0, loading: false, errorMessage: res.errorMessage || "Invalid route" });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.startLocation, formData.endLocation, showEditModal]);

  const fetchResources = async () => {
    try {
      const vRes = await managerApi.getVehicles();
      const vehicles = vRes.data?.data || vRes.data || [];
      setDriversList([]);
      setVehiclesList(vehicles);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
    }
  };

  useEffect(() => {
    if (showCreateModal) {
      fetchResources();
    }
  }, [showCreateModal]);

  const handleResetFilters = () => {
    setSearch("");
    setActiveTab("All Trips");
    toast.success("Filters reset successfully");
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.startLocation || !formData.endLocation || !formData.departureTime || !formData.eta) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedDriver = formData.driverId ? driversList.find(d => String(d._id) === String(formData.driverId)) : null;
    const selectedVehicle = vehiclesList.find(v => String(v._id) === String(formData.vehicleId));

    if (!selectedVehicle) {
      toast.error("Invalid vehicle selected");
      return;
    }

    try {
      const tripNum = `TRP-${Math.floor(100000 + Math.random() * 900000)}`;
      await managerApi.createTrip({
        tripNumber: tripNum,
        vehicle: selectedVehicle._id,
        driver: selectedDriver ? selectedDriver._id : undefined,
        driverName: selectedDriver ? (selectedDriver.name || selectedDriver.fullName) : "",
        driverPhone: selectedDriver ? (selectedDriver.phoneNumber || selectedDriver.phone) : "",
        vehicleName: selectedVehicle.name || selectedVehicle.vehicleName,
        vehiclePlate: selectedVehicle.plateNumber || selectedVehicle.vehicleNumber,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        departureTime: formData.departureTime,
        eta: formData.eta,
        status: formData.status,
        description: formData.description || "General Transport",
        cargoType: formData.cargoType || "",
        cargoWeight: formData.cargoWeight ? Number(formData.cargoWeight) : undefined,
        tripNotes: formData.tripNotes || ""
      });

      setShowCreateModal(false);
      setFormData({
        driverId: "",
        vehicleId: "",
        startLocation: "",
        endLocation: "",
        departureTime: "",
        eta: "",
        status: "Assigned",
        description: "",
        cargoType: "",
        cargoWeight: "",
        tripNotes: ""
      });
      toast.success("New trip created successfully!");
      fetchTrips();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create trip");
      console.error(error);
    }
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

  const formatDateTimeForInput = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleOpenEdit = (t) => {
    fetchResources();
    setEditingTrip(t);
    const pAddr = t.pickupAddress || t.fromAddress || {};
    const dAddr = t.deliveryAddress || t.toAddress || {};
    setFormData({
      driverId: t.driver?._id || t.driver || "",
      vehicleId: t.vehicle?._id || t.vehicle || "",
      startLocation: t.startLocation,
      endLocation: t.endLocation,
      departureTime: formatDateTimeForInput(t.departureTime),
      eta: formatDateTimeForInput(t.eta),
      status: t.status,
      description: t.description || "",
      cargoType: t.cargoType || "",
      cargoWeight: t.cargoWeight || "",
      tripNotes: t.tripNotes || "",
      pickupAddress: {
        companyName: pAddr.companyName || "",
        contactPerson: pAddr.contactPerson || "",
        mobile: pAddr.mobile || pAddr.mobileNumber || "",
        streetAddress: pAddr.streetAddress || "",
        area: pAddr.area || pAddr.areaLocality || "",
        city: pAddr.city || "",
        state: pAddr.state || "",
        pincode: pAddr.pincode || ""
      },
      deliveryAddress: {
        companyName: dAddr.companyName || "",
        contactPerson: dAddr.contactPerson || "",
        mobile: dAddr.mobile || dAddr.mobileNumber || "",
        streetAddress: dAddr.streetAddress || "",
        area: dAddr.area || dAddr.areaLocality || "",
        city: dAddr.city || "",
        state: dAddr.state || "",
        pincode: dAddr.pincode || ""
      }
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
      await managerApi.updateTrip(editingTrip._id || editingTrip.id, {
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        departureTime: formData.departureTime,
        eta: formData.eta,
        description: formData.description,
        cargoType: formData.cargoType,
        cargoWeight: formData.cargoWeight ? Number(formData.cargoWeight) : undefined,
        tripNotes: formData.tripNotes,
        pickupAddress: formData.pickupAddress,
        deliveryAddress: formData.deliveryAddress,
        fromAddress: formData.pickupAddress,
        toAddress: formData.deliveryAddress,
        estimatedDistance: editRouteInfo.distanceKm || undefined
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
      setShowDeleteConfirm(false);
      setSelectedTrip(null);
      toast.success("Trip record deleted successfully");
      fetchTrips();
    } catch (error) {
      toast.error("Failed to delete trip");
      console.error(error);
    }
  };

  // KPIs Calculations using standard normalization
  const {
    totalTrips,
    activeTripsCount,
    scheduledTripsCount,
    completedTripsCount,
    delayedTripsCount,
    cancelledTripsCount,
    otherTripsCount
  } = calculateTripKPIs(trips);

  const totalFinished = completedTripsCount + delayedTripsCount;
  const onTimeRate = totalFinished > 0 
    ? Math.round((completedTripsCount / totalFinished) * 100) 
    : 94; // fallback to 94%

  // Tab Filtering
  const getTabFilteredTrips = () => {
    switch (activeTab) {
      case "Active":
        return trips.filter(t => getNormalizedTripCategory(t.status) === "active");
      case "Scheduled":
        return trips.filter(t => getNormalizedTripCategory(t.status) === "scheduled");
      case "Completed":
        return trips.filter(t => getNormalizedTripCategory(t.status) === "completed");
      case "Delayed":
        return trips.filter(t => getNormalizedTripCategory(t.status) === "delayed");
      default:
        return trips;
    }
  };

  // Search Filtering
  const getFilteredTrips = () => {
    const tabFiltered = getTabFilteredTrips();
    return tabFiltered.filter(t => {
      const q = search.toLowerCase();
      return (
        (t.tripNumber || "").toLowerCase().includes(q) ||
        (t.driverName || "").toLowerCase().includes(q) ||
        (t.vehicleName || "").toLowerCase().includes(q) ||
        (t.vehiclePlate || "").toLowerCase().includes(q) ||
        (t.startLocation || "").toLowerCase().includes(q) ||
        (t.endLocation || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
      );
    });
  };

  const finalFilteredTrips = getFilteredTrips();

  const currentRows = finalFilteredTrips.slice(0, 10);

  const getStatusBadge = (status) => {
    const category = getNormalizedTripCategory(status);
    switch (category) {
      case "active":
        return "bg-[#FDF3EC] text-[#B45A0A] border border-[#FDF3EC] font-semibold";
      case "scheduled":
        if (status === "Pending Driver Acceptance") {
          return "bg-amber-50 text-amber-700 border border-amber-200 font-semibold";
        }
        return "bg-blue-50 text-blue-700 border border-blue-100 font-semibold";
      case "completed":
        return "bg-slate-900 text-white border border-slate-950 font-semibold";
      case "delayed":
        return "bg-rose-50 text-rose-700 border border-rose-200 font-semibold";
      case "cancelled":
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
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <Breadcrumb />
          
          {/* Header Area */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E7EAF0] pb-6">
            <div>
              <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
                Trips Management
              </h1>
              <p className="text-[18px] text-[#64748B] mt-[12px]">
                Monitor logistics routing, ETAs, active drivers and trip statuses
              </p>
            </div>
            
            <div className="flex items-center gap-2 select-none w-full sm:w-auto">
              <button
                onClick={() => navigate("/manager/create-trip")}
                className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Create New Trip</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Trips */}
            <div className="bg-white rounded-xl border-l-4 border-l-blue-600 border border-[#E7EAF0] p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider font-poppins">Total Trips</p>
                <p className="text-3xl font-black text-[#1E293B] mt-2 font-poppins">{totalTrips}</p>
                <span className="text-[10px] text-[#64748B] mt-1 block font-medium">
                  {cancelledTripsCount + otherTripsCount > 0 
                    ? `Includes ${cancelledTripsCount + otherTripsCount} cancelled/other`
                    : "All dispatch logs"}
                </span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Route className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Active Trips */}
            <div className="bg-white rounded-xl border-l-4 border-l-[#B45A0A] border border-[#E7EAF0] p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider font-poppins">Active Trips</p>
                <p className="text-3xl font-black text-[#1E293B] mt-2 font-poppins">{activeTripsCount}</p>
                <span className="text-[10px] text-[#64748B] mt-1 block font-medium">Currently in transit</span>
              </div>
              <div className="p-3 bg-orange-50 text-[#B45A0A] rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Scheduled Trips */}
            <div className="bg-white rounded-xl border-l-4 border-l-indigo-600 border border-[#E7EAF0] p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider font-poppins">Scheduled Trips</p>
                <p className="text-3xl font-black text-[#1E293B] mt-2 font-poppins">{scheduledTripsCount}</p>
                <span className="text-[10px] text-[#64748B] mt-1 block font-medium">Upcoming & assigned</span>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Completed */}
            <div className="bg-white rounded-xl border-l-4 border-l-[#1E293B] border border-[#E7EAF0] p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider font-poppins">Completed</p>
                <p className="text-3xl font-black text-[#1E293B] mt-2 font-poppins">{completedTripsCount}</p>
                <span className="text-[10px] text-[#64748B] mt-1 block font-medium">Successfully completed</span>
              </div>
              <div className="p-3 bg-gray-50 text-[#1E293B] rounded-xl">
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Search bar and Filters Card */}
          <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search trip ID, driver, vehicle, or route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              />
            </div>

            {/* Reset Button */}
            {(search || activeTab !== "All Trips") && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#EF4444] hover:underline font-bold flex items-center gap-1 cursor-pointer py-2 self-start md:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          {/* Tab filters header */}
          <div className="border-b border-[#E7EAF0] flex items-center overflow-x-auto custom-scrollbar select-none gap-2">
            {["All Trips", "Active", "Scheduled", "Completed", "Delayed"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                }}
                className={`py-3.5 px-6 font-poppins text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? "border-[#B45A0A] text-[#B45A0A]"
                    : "border-transparent text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Trips Table Component */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E7EAF0] flex items-center justify-between shrink-0">
              <h3 className="font-poppins font-black text-lg text-[#1E293B]">Trips List</h3>
              <button
                onClick={() => navigate("/manager/trips-list")}
                className="text-xs text-[#B45A0A] hover:text-[#9A4D08] hover:underline font-bold font-poppins flex items-center gap-1 cursor-pointer"
              >
                <span>View All Trips</span>
              </button>
            </div>

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
                    <th className="py-4 px-6 text-center whitespace-nowrap">Actions</th>
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
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg w-max font-poppins">
                                {t.tripNumber}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#64748B] mt-1 block font-semibold max-w-[150px] truncate">
                              {t.description}
                            </span>
                          </div>
                        </td>

                        {/* Pickup Location */}
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
                            const tripKey = t.id || t._id;
                            const dynamicDist = tripDistances[tripKey];
                            const est = (dynamicDist && dynamicDist < 4000)
                              ? dynamicDist
                              : ((t.estimatedDistance && t.estimatedDistance > 0 && t.estimatedDistance < 4000) ? t.estimatedDistance : 0);
                            const act = (t.actualDistance && t.actualDistance > 0 && t.actualDistance < 4000) ? t.actualDistance : est;
                            const finalDist = t.status === "Completed" ? act : est;
                            return finalDist > 0 ? `${finalDist} KM` : "Calculating...";
                          })()}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center select-none whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View */}
                            <button
                              onClick={() => navigate(`/manager/trip-details/${t.id}`)}
                              title="View details"
                              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>





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
                                  setShowDeleteConfirm(true);
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
          </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteConfirm && selectedTrip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative animate-scale-up">
            <button
              onClick={() => { setShowDeleteConfirm(false); setSelectedTrip(null); }}
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
                  Are you sure you want to cancel and delete trip logs for dispatch <strong>{selectedTrip.tripNumber}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setSelectedTrip(null); }}
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
            <form onSubmit={handleEditTrip} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar text-left">
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

              {/* Pickup Address Edit Section */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3 font-nunito">
                <h4 className="font-poppins font-bold text-xs text-[#B45A0A] uppercase tracking-wider border-b border-slate-200 pb-1.5">
                  Pickup Address (From Address)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.pickupAddress?.companyName || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, companyName: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={formData.pickupAddress?.contactPerson || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, contactPerson: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Mobile Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.pickupAddress?.mobile || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, mobile: e.target.value.replace(/\D/g, '') }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Street Address</label>
                    <input
                      type="text"
                      value={formData.pickupAddress?.streetAddress || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, streetAddress: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Area / Locality</label>
                    <input
                      type="text"
                      value={formData.pickupAddress?.area || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, area: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={formData.pickupAddress?.city || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, city: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">State</label>
                    <input
                      type="text"
                      value={formData.pickupAddress?.state || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, state: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.pickupAddress?.pincode || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickupAddress: { ...formData.pickupAddress, pincode: e.target.value.replace(/\D/g, '') }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address Edit Section */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3 font-nunito">
                <h4 className="font-poppins font-bold text-xs text-[#B45A0A] uppercase tracking-wider border-b border-slate-200 pb-1.5">
                  Delivery Address (To Address)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress?.companyName || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliveryAddress: { ...formData.deliveryAddress, companyName: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress?.contactPerson || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliveryAddress: { ...formData.deliveryAddress, contactPerson: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Mobile Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.deliveryAddress?.mobile || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliveryAddress: { ...formData.deliveryAddress, mobile: e.target.value.replace(/\D/g, '') }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Street Address</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress?.streetAddress || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliveryAddress: { ...formData.deliveryAddress, streetAddress: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Area / Locality</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress?.area || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliveryAddress: { ...formData.deliveryAddress, area: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress?.city || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliveryAddress: { ...formData.deliveryAddress, city: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">State</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress?.state || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliveryAddress: { ...formData.deliveryAddress, state: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.deliveryAddress?.pincode || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliveryAddress: { ...formData.deliveryAddress, pincode: e.target.value.replace(/\D/g, '') }
                      })}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-lg text-xs font-medium"
                    />
                  </div>
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

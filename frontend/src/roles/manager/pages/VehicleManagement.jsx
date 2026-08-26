import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Truck,
  Zap,
  Clock,
  AlertTriangle,
  AlertCircle,
  Wrench,
  Users,
  Fuel,
  Wallet,
  Plus,
  Search,
  Calendar,
  ChevronDown,
  Check,
  X,
  Eye,
  Edit2,
  UserCheck,
  Trash2,
  FileText,
  Download,
  Filter,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  MapPin,
  ArrowRight,
  Route
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import KPICard from "@/components/common/KPICard";
import { vehicleApi } from "@/api/vehicleApi";
import { managerApi } from "../api/managerApi";
import { getSocket } from "@/api/socket";
import TableRowSkeleton from "@/components/common/TableRowSkeleton";

export default function VehicleManagement() {
  const navigate = useNavigate();

  /**
   * Normalise a backend vehicle document to the shape this component expects.
   * Backend uses: _id, brand, vehicleNumber, currentStatus (Available/Active/etc.)
   */
  const normaliseVehicle = (v) => {
    let rawStatus = v.currentStatus || v.status || 'Available';
    let mappedStatus = rawStatus;
    if (rawStatus === 'Under Maintenance' || rawStatus === 'Need Maintenance' || rawStatus === 'Out of Service' || rawStatus === 'In Maintenance') {
      mappedStatus = 'Maintenance';
    }

    let insExp = v.insuranceExpiry || v.insuranceDetails?.expiryDate || v.documents?.insurance?.expiryDate;
    if (!insExp && (v.documents?.insurance?.fileUrl || v.documents?.insurance?.uploadDate)) {
      const upDate = new Date(v.documents.insurance.uploadDate || v.documents.insurance.uploadedAt || Date.now());
      if (!isNaN(upDate.getTime())) {
        upDate.setFullYear(upDate.getFullYear() + 1);
        insExp = upDate;
      }
    }

    return {
      ...v,
      id:           v._id,
      name:         v.vehicleName || `${v.brand || ''} ${v.model || ''}`.trim() || v.vehicleNumber,
      manufacturer: v.brand || "",
      plateNumber:  v.vehicleNumber || "",
      type:         v.vehicleType || 'Truck',
      driver:       v.assignedDriver?.fullName || v.assignedDriver?.name || 'Unassigned',
      fuelLevel:    v.fuelCapacity ? Math.round((v.odometer % v.fuelCapacity) || 50) : 50,
      fastagBalance:v.fastagBalance ?? 0,
      branch:       v.branch       || 'Pune',
      dateAdded:    v.createdAt ? v.createdAt.split('T')[0] : '',
      status:       mappedStatus,
      currentStatus: rawStatus,
      insuranceExpiry: insExp,
      assignedDriver: v.assignedDriver || v.driverId || v.driver,
    };
  };

  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [complaints, setComplaints] = useState([]);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [fuelFilter, setFuelFilter] = useState("All Fuel Types");
  const [ownershipFilter, setOwnershipFilter] = useState("All Ownerships");
  const [availFilter, setAvailFilter] = useState("All Availabilities");
  const [dateAddedFilter, setDateAddedFilter] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);


  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return "Yesterday";
    }
    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getActivityIconAndColor = (act) => {
    const mod = (act.relatedModule || "").toLowerCase();
    const type = (act.activityType || act.title || "").toLowerCase();

    if (mod === "trip" || type.includes("trip")) {
      return { icon: Route, color: "text-indigo-600 bg-indigo-50 border-indigo-100" };
    }
    if (mod === "driver" || type.includes("driver")) {
      return { icon: UserCheck, color: "text-amber-600 bg-amber-50 border-amber-100" };
    }
    if (mod === "maintenance" || type.includes("maintenance")) {
      return { icon: Wrench, color: "text-teal-600 bg-teal-50 border-teal-100" };
    }
    if (mod === "fuel" || type.includes("fuel")) {
      return { icon: Fuel, color: "text-purple-600 bg-purple-50 border-purple-100" };
    }
    if (mod === "document" || type.includes("document") || type.includes("insurance") || type.includes("rc") || type.includes("permit") || type.includes("fitness")) {
      return { icon: FileText, color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    }
    if (type.includes("deleted")) {
      return { icon: Trash2, color: "text-rose-600 bg-rose-50 border-rose-100" };
    }
    return { icon: Truck, color: "text-blue-600 bg-blue-50 border-blue-100" };
  };

  const handleActivityClick = (act) => {
    const mod = (act.relatedModule || "").toLowerCase();
    const type = (act.activityType || act.title || "").toLowerCase();

    if (mod === "trip" || type.includes("trip")) {
      if (act.relatedId) {
        navigate(`/manager/trip-details/${act.relatedId}`);
      } else {
        navigate("/manager/trips");
      }
    } else if (mod === "maintenance" || type.includes("maintenance")) {
      navigate("/manager/maintenance");
    } else if (mod === "fuel" || type.includes("fuel")) {
      navigate("/manager/fuel-management");
    } else if (mod === "document" || type.includes("document") || type.includes("insurance") || type.includes("rc") || type.includes("permit") || type.includes("fitness")) {
      if (act.relatedId) {
        navigate(`/manager/vehicle-details/${act.relatedId}?tab=documents`);
      } else {
        navigate("/manager/vehicles-list");
      }
    } else {
      if (act.relatedId) {
        navigate(`/manager/vehicle-details/${act.relatedId}`);
      } else {
        navigate("/manager/vehicles-list");
      }
    }
  };

  // Fetch vehicles from backend on mount and poll
  useEffect(() => {
    const fetchVehicles = async (isInitial = false) => {
      try {
        const vehRes = await vehicleApi.list();
        const rawVeh = vehRes.data?.data ?? [];
        setVehicles(rawVeh.map(normaliseVehicle));

        // Fetch dynamic activity logs
        try {
          const actRes = await managerApi.getActivities();
          const rawActs = actRes.data?.data || actRes.data || [];
          setActivities(rawActs);
        } catch (actErr) {
          console.error("Failed to fetch activity logs:", actErr);
        }

        // Fetch maintenance records
        try {
          const maintRes = await managerApi.getMaintenance();
          const rawMaint = maintRes.data?.data || maintRes.data || [];
          setMaintenance(rawMaint);
        } catch (maintErr) {
          console.error("Failed to fetch maintenance logs:", maintErr);
        }

        // Fetch vehicle issue tickets / complaints
        try {
          const compRes = await managerApi.getVehicleComplaints();
          const rawComp = compRes.data?.data || compRes.data || [];
          setComplaints(rawComp);
        } catch (compErr) {
          console.error("Failed to fetch vehicle complaints:", compErr);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        if (isInitial) toast.error('Failed to load vehicles from server.');
      } finally {
        if (isInitial) setVehiclesLoading(false);
      }
    };

    fetchVehicles(true);

    const socket = getSocket();
    const handleRefresh = () => fetchVehicles(false);

    socket.on("vehicle:created", handleRefresh);
    socket.on("vehicle:updated", handleRefresh);
    socket.on("vehicle:deleted", handleRefresh);
    socket.on("driver:assigned", handleRefresh);
    socket.on("driver:unassigned", handleRefresh);
    socket.on("driver:deleted", handleRefresh);
    socket.on("driver:status-updated", handleRefresh);
    socket.on("trip:status-updated", handleRefresh);

    const interval = setInterval(() => fetchVehicles(false), 5000);
    return () => {
      clearInterval(interval);
      socket.off("vehicle:created", handleRefresh);
      socket.off("vehicle:updated", handleRefresh);
      socket.off("vehicle:deleted", handleRefresh);
      socket.off("driver:assigned", handleRefresh);
      socket.off("driver:unassigned", handleRefresh);
      socket.off("driver:deleted", handleRefresh);
      socket.off("driver:status-updated", handleRefresh);
      socket.off("trip:status-updated", handleRefresh);
    };
  }, []);

  // Sorting: Default to newest first so newly added vehicles appear at the top
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Modals & CRUD UI States
  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'delete' | 'assign' | 'details'
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Prevent body scrolling when management modals are open
  useEffect(() => {
    if (modalType) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalType]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    plateNumber: "",
    type: "Truck",
    status: "Available",
    fuelLevel: 50,
    fastagBalance: 1000,
    insuranceExpiry: "",
    lastService: "",
    nextService: "",
    branch: "Pune",
    fuelType: "Diesel",
    ownership: "Owned",
    availability: "Immediate",
    dateAdded: new Date().toISOString().split('T')[0]
  });


  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter & Search computation
  const filteredVehicles = vehicles.filter((v) => {
    const query = search.toLowerCase();
    const matchesSearch =
      v.name.toLowerCase().includes(query) ||
      v.manufacturer.toLowerCase().includes(query) ||
      v.plateNumber.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "All Statuses" || v.status === statusFilter;
    const matchesType = typeFilter === "All Types" || v.type === typeFilter;
    const matchesBranch = branchFilter === "All Branches" || v.branch === branchFilter;
    const matchesFuel = fuelFilter === "All Fuel Types" || v.fuelType === fuelFilter;
    const matchesOwnership = ownershipFilter === "All Ownerships" || v.ownership === ownershipFilter;
    const matchesAvail = availFilter === "All Availabilities" || v.availability === availFilter;
    const matchesDate = !dateAddedFilter || v.dateAdded === dateAddedFilter;

    return matchesSearch && matchesStatus && matchesType && matchesBranch && matchesFuel && matchesOwnership && matchesAvail && matchesDate;
  }).sort((a, b) => {
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

  // KPIs
  const totalVehicles = vehicles.length;
  const maintVehicles = vehicles.filter(v => {
    const s = (v.status || v.currentStatus || "").toLowerCase();
    return s.includes("maintenance") || s.includes("repair") || s.includes("service") || s === "need maintenance" || s === "under maintenance";
  }).length;
  const idleVehicles = vehicles.filter(v => {
    const s = (v.status || v.currentStatus || "").toLowerCase();
    return s === "idle" || s === "out of service";
  }).length;
  const activeVehicles = vehicles.filter(v => {
    const s = (v.status || v.currentStatus || "").toLowerCase();
    const isMaint = s.includes("maintenance") || s.includes("repair") || s.includes("service") || s === "need maintenance" || s === "under maintenance";
    const isIdle = s === "idle" || s === "out of service";
    return !isMaint && !isIdle;
  }).length;

  const overdueRepairsCount = maintenance.filter(m => {
    if (m.status === "Completed") return false;
    const due = new Date(m.scheduledDate);
    const now = new Date();
    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    return due < now;
  }).length;

  // Chart Details (Usage & Status Distribution)
  // Generate dynamic monthly usage based on vehicle data
  const generateMonthlyUsage = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const currentDate = new Date();
    
    return months.map((label, index) => {
      // Calculate mileage based on active vehicles and random daily usage
      const baseUsage = 3500 + (index * 400); // Increasing trend
      const variability = Math.sin(index) * 800; // Add some variation
      const vehicleMultiplier = Math.max(1, Math.min(vehicles.length, 8)); // Scale by active vehicles
      
      return {
        label,
        value: Math.round((baseUsage + variability) * vehicleMultiplier * 0.85)
      };
    });
  };

  const monthlyUsage = generateMonthlyUsage();
  const maxUsage = Math.max(...monthlyUsage.map(m => m.value), 1);

  const hasAssignedDriver = (v) => {
    const driver = v.assignedDriver || v.driverId || v.driver;
    if (!driver) return false;
    if (typeof driver === 'string') {
      return driver !== 'Unassigned' && driver !== 'N/A' && driver.trim() !== '';
    }
    if (typeof driver === 'object' && driver !== null) {
      return Boolean(driver._id || driver.fullName || driver.name);
    }
    return false;
  };

  // Compute status distribution percentages
  const statusCounts = {
    "Available": vehicles.filter(v => (v.status === "Available" || v.status === "AVAILABLE") && !hasAssignedDriver(v)).length,
    "Assigned": vehicles.filter(v => (v.status === "Assigned" || v.status === "ASSIGNED" || ((v.status === "Available" || v.status === "AVAILABLE") && hasAssignedDriver(v)))).length,
    "On Trip": vehicles.filter(v => v.status === "On Trip" || v.status === "ON_TRIP").length,
    "Idle": vehicles.filter(v => v.status === "Idle" || v.status === "IDLE").length,
    "Maintenance": vehicles.filter(v => v.status === "Maintenance" || v.status === "Under Maintenance").length,
    "Out of Service": vehicles.filter(v => v.status === "Out of Service" || v.status === "OUT_OF_SERVICE").length
  };
  const distributionColors = {
    "Available": "#22C55E",
    "Assigned": "#3B82F6",
    "On Trip": "#A14000",
    "Idle": "#64748B",
    "Maintenance": "#EF4444",
    "Out of Service": "#1E293B"
  };

  const donutTotal = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  // SVG Donut Arc Helper
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.91
  let currentOffset = 0;
  const donutSegments = Object.entries(statusCounts).map(([status, count]) => {
    const value = count;
    const strokeLength = donutTotal > 0 ? (value / donutTotal) * circumference : 0;
    const strokeOffset = -currentOffset;
    currentOffset += strokeLength;
    return {
      status,
      count,
      color: distributionColors[status],
      strokeDasharray: `${strokeLength} ${circumference}`,
      strokeDashoffset: strokeOffset
    };
  });

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All Statuses");
    setTypeFilter("All Types");
    setBranchFilter("All Branches");
    setFuelFilter("All Fuel Types");
    setOwnershipFilter("All Ownerships");
    setAvailFilter("All Availabilities");
    setDateAddedFilter("");
    toast.success("Filters reset successfully");
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Manufacturer", "Plate Number", "Type", "Driver", "Status", "Fuel Level (%)", "FASTag Balance (INR)", "Insurance Expiry", "Last Service", "Branch", "Fuel Type", "Ownership", "Availability", "Date Added"];
    const rows = vehicles.map(v => [
      v.id,
      v.name,
      v.manufacturer,
      v.plateNumber,
      v.type,
      v.driver,
      v.status,
      v.fuelLevel,
      v.fastagBalance,
      v.insuranceExpiry,
      v.lastService,
      v.branch,
      v.fuelType,
      v.ownership,
      v.availability,
      v.dateAdded
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_vehicles_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported fleet inventory CSV file!");
  };

  // CRUD Actions
  const openAddModal = () => {
    navigate("/manager/add-vehicle");
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      ...vehicle
    });
    setModalType("edit");
  };

  const openDetailsModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalType("details");
  };

  const openDeleteModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalType("delete");
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    const vehicleId = selectedVehicle._id || selectedVehicle.id;
    
    try {
      // Send delete request with proper error handling
      await vehicleApi.remove(vehicleId);
      
      // Remove from local state immediately after successful deletion
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success("Vehicle deleted successfully");
    } catch (err) {
      // Handle different HTTP error responses
      if (!err.response) {
        toast.error("Unable to connect to the server. Please try again.");
      } else {
        const statusCode = err.response.status;
        const message = err.response?.data?.message;

        switch (statusCode) {
          case 400:
            toast.error(message || "Invalid request. Please check the vehicle details.");
            break;
          case 401:
            toast.error("You are not authenticated. Please log in again.");
            break;
          case 403:
            toast.error("You do not have permission to delete this vehicle.");
            break;
          case 404:
            toast.error("Vehicle not found. It may have been already deleted.");
            // Remove from UI anyway if it doesn't exist on server
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
      setModalType(null);
      setSelectedVehicle(null);
    }
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.plateNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const vehicleId = selectedVehicle?._id || selectedVehicle?.id;

    try {
      if (modalType === "edit") {
        const payload = {
          vehicleName:        `${formData.manufacturer || formData.brand} ${formData.model}`,
          brand:              formData.manufacturer || formData.brand,
          model:              formData.model,
          vehicleNumber:      formData.plateNumber?.toUpperCase(),
          vehicleType:        formData.type,
          branch:             formData.branch,
          fuelType:           formData.fuelType,
          ownership:          formData.ownership,
          availability:       formData.availability,
          insuranceExpiry:    formData.insuranceExpiry || undefined,
          lastService:        formData.lastService || undefined,
          nextService:        formData.nextService || undefined,
          fuelCapacity:       Number(formData.fuelCapacity) || 0,
          fastagBalance:      Number(formData.fastagBalance) || 0,
          currentStatus:      formData.status || "Available",
        };
        const res = await vehicleApi.update(vehicleId, payload);
        
        // Fetch fresh vehicles list
        const listRes = await vehicleApi.list();
        const rawVeh = listRes.data?.data ?? [];
        setVehicles(rawVeh.map(normaliseVehicle));
        
        toast.success("Vehicle updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setModalType(null);
      setSelectedVehicle(null);
    }
  };

  // Helpers for formatting
  const getFASTagStyle = (balance) => {
    if (balance > 5000) return "text-[#22C55E] bg-[#22C55E]/10";
    if (balance >= 1000) return "text-[#F59E0B] bg-[#F59E0B]/10";
    return "text-[#EF4444] bg-[#EF4444]/10 font-bold border border-[#EF4444]/20 animate-pulse";
  };

  const getFuelStyle = (level) => {
    if (level > 50) return "bg-[#22C55E]";
    if (level > 20) return "bg-[#F59E0B]";
    return "bg-[#EF4444]";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-50 text-[#22C55E] border border-emerald-100";
      case "On Trip":
        return "bg-amber-50 text-[#A14000] border border-amber-100";
      case "Idle":
        return "bg-slate-50 text-[#64748B] border border-slate-100";
      case "Maintenance":
        return "bg-red-50 text-[#EF4444] border border-red-100";
      case "Out of Service":
        return "bg-zinc-800 text-zinc-100 border border-zinc-900";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const formatDateOrNA = (dateVal) => {
    if (!dateVal) return "N/A";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getInsuranceStyle = (expiry) => {
    if (!expiry) return "text-[#64748B] flex items-center gap-1.5 font-medium";
    const expDate = new Date(expiry);
    if (isNaN(expDate.getTime())) return "text-[#64748B] flex items-center gap-1.5 font-medium";
    const today = new Date();
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-[#EF4444] font-semibold flex items-center gap-1.5";
    if (diffDays <= 30) return "text-[#F59E0B] font-medium flex items-center gap-1.5";
    return "text-[#1E293B] flex items-center gap-1.5";
  };

  return (
    <div className="p-6 lg:p-8 space-y-4 animate-fade-in w-full overflow-hidden">
      <Breadcrumb />

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-4">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Vehicle Management
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">
            Manage, assign and monitor all fleet vehicles across your organization.
          </p>
        </div>

        {/* Header buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#A14000]/10 border border-[#A14000]/30 hover:bg-[#A14000]/20 rounded-xl text-sm font-bold text-[#A14000] transition-all flex items-center gap-2 shadow-xs font-poppins cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#A14000]" />
            <span>Export Vehicles</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-[#A14000] hover:bg-[#853400] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#A14000]/20 font-poppins cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* --- KPI SECTION --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <KPICard
          title="Total Vehicles"
          value={vehiclesLoading ? null : totalVehicles}
          loading={vehiclesLoading}
          subtitle="VS last month"
          icon={<Truck className="w-4 h-4" />}
          variant="blue"
          filledBarsRatio={0.8}
          trendText="+8.4%"
          isTrendUp={true}
        />
        <KPICard
          title="Active Vehicles"
          value={vehiclesLoading ? null : activeVehicles}
          loading={vehiclesLoading}
          subtitle="On duty"
          icon={<Zap className="w-4 h-4" />}
          variant="green"
          filledBarsRatio={Math.max(0.2, (activeVehicles / totalVehicles) || 0.85)}
          trendText="+12.1%"
          isTrendUp={true}
        />
        <KPICard
          title="Idle Vehicles"
          value={vehiclesLoading ? null : idleVehicles}
          loading={vehiclesLoading}
          subtitle="In depot"
          icon={<Clock className="w-4 h-4" />}
          variant="amber"
          filledBarsRatio={Math.max(0.1, (idleVehicles / totalVehicles) || 0.3)}
          trendText="-2.0%"
          isTrendUp={false}
        />
        <KPICard
          title="In Maintenance"
          value={vehiclesLoading ? null : maintVehicles}
          loading={vehiclesLoading}
          subtitle="In workshop"
          icon={<Wrench className="w-4 h-4" />}
          variant="rose"
          filledBarsRatio={Math.max(0.1, (maintVehicles / totalVehicles) || 0.15)}
          trendText="-1.5%"
          isTrendUp={false}
        />
      </div>
      {/* Group Header and Filters inside a wrapper to reduce empty gap */}
      <div className="space-y-3">

            {/* --- ADVANCED FILTER SECTION --- */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">

              {/* Primary search & quick filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Vehicles */}
                <div className="md:col-span-2 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <Search className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search vehicles by name, model, plate, or driver..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#A14000] focus:ring-1 focus:ring-[#A14000] transition-colors"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#A14000] appearance-none"
                  >
                    <option>All Statuses</option>
                    <option>Available</option>
                    <option>On Trip</option>
                    <option>Idle</option>
                    <option>Maintenance</option>
                    <option>Out of Service</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>

                {/* Vehicle Type */}
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#A14000] appearance-none"
                  >
                    <option>All Types</option>
                    <option>Truck</option>
                    <option>Van</option>
                    <option>Tipper</option>
                    <option>Trailer</option>
                    <option>Bus</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Expander Trigger */}
              <div className="flex items-center justify-between border-t border-[#E7EAF0]/60 pt-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMoreFilters(!showMoreFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${showMoreFilters || branchFilter !== "All Branches" || fuelFilter !== "All Fuel Types" || ownershipFilter !== "All Ownerships" || availFilter !== "All Availabilities" || dateAddedFilter
                        ? "bg-[#FDF3EC] text-[#A14000]"
                        : "text-[#64748B] hover:text-[#1E293B]"
                      }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>More Filters</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${showMoreFilters ? "rotate-180" : ""}`} />
                  </button>

                  {(search || statusFilter !== "All Statuses" || typeFilter !== "All Types" || branchFilter !== "All Branches" || fuelFilter !== "All Fuel Types" || ownershipFilter !== "All Ownerships" || availFilter !== "All Availabilities" || dateAddedFilter) && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs text-[#EF4444] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-[#64748B] font-medium font-poppins">
                  {vehiclesLoading ? (
                    <span className="inline-block w-32 h-4 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    <>Showing <span className="font-bold text-[#1E293B]">{filteredVehicles.length}</span> of {vehicles.length} vehicles</>
                  )}
                </div>
              </div>

              {/* Collapsible Additional Filters */}
              {showMoreFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 border-t border-[#E7EAF0]/60 pt-4 animate-fade-in">
                  {/* Branch */}
                  <div className="relative">
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Branch</label>
                    <select
                      value={branchFilter}
                      onChange={(e) => setBranchFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none appearance-none"
                    >
                      <option>All Branches</option>
                      <option>Pune</option>
                      <option>Mumbai</option>
                      <option>Delhi</option>
                      <option>Bengaluru</option>
                      <option>Chennai</option>
                      <option>Hyderabad</option>
                      <option>Ahmedabad</option>
                    </select>
                    <span className="absolute bottom-2.5 right-3 flex items-center pointer-events-none text-[#64748B]">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Fuel Type */}
                  <div className="relative">
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Fuel Type</label>
                    <select
                      value={fuelFilter}
                      onChange={(e) => setFuelFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none appearance-none"
                    >
                      <option>All Fuel Types</option>
                      <option>Diesel</option>
                      <option>CNG</option>
                      <option>Electric</option>
                    </select>
                    <span className="absolute bottom-2.5 right-3 flex items-center pointer-events-none text-[#64748B]">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Ownership */}
                  <div className="relative">
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Ownership</label>
                    <select
                      value={ownershipFilter}
                      onChange={(e) => setOwnershipFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none appearance-none"
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
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Availability</label>
                    <select
                      value={availFilter}
                      onChange={(e) => setAvailFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none appearance-none"
                    >
                      <option>All Availabilities</option>
                      <option>Immediate</option>
                      <option>Scheduled</option>
                    </select>
                    <span className="absolute bottom-2.5 right-3 flex items-center pointer-events-none text-[#64748B]">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Date Added */}
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Date Added</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dateAddedFilter}
                        onChange={(e) => setDateAddedFilter(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- FLEET INVENTORY TABLE --- */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col w-full">
            <div className="px-6 py-5 border-b border-[#E7EAF0] flex items-center justify-between shrink-0">
              <h3 className="font-poppins font-black text-lg text-[#1E293B]">Fleet Inventory</h3>
              <button
                onClick={() => navigate("/manager/vehicles-list")}
                className="text-xs text-[#A14000] hover:text-[#853400] hover:underline font-bold font-poppins flex items-center gap-1 cursor-pointer"
              >
                <span>View All Vehicles</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse text-sm font-nunito">
                <thead>
                  <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                    <th className="py-4 px-6 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap" onClick={() => handleSort("name")}>
                      Vehicle {sortField === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap" onClick={() => handleSort("plateNumber")}>
                      Registration No {sortField === "plateNumber" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap" onClick={() => handleSort("type")}>
                      Type {sortField === "type" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap" onClick={() => handleSort("status")}>
                      Current Status {sortField === "status" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap" onClick={() => handleSort("fastagBalance")}>
                      FASTag Bal. {sortField === "fastagBalance" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap" onClick={() => handleSort("insuranceExpiry")}>
                      Insurance Expiry {sortField === "insuranceExpiry" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="py-4 px-6 whitespace-nowrap">Last Service</th>
                    <th className="py-4 px-6 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]/60">
                  {vehiclesLoading ? (
                    <TableRowSkeleton columns={8} rows={5} />
                  ) : filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400 font-medium font-nunito">
                        No vehicles found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((v) => (
                      <tr key={v._id} className="hover:bg-[#F5F7FB]/50 transition-colors group">
                        {/* Vehicle Card Cell */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#FDF3EC] text-[#A14000] p-2.5 rounded-xl flex items-center justify-center shrink-0 border border-[#FDF3EC]/50">
                              <Truck className="w-5.5 h-5.5" />
                            </div>
                            <div>
                              <p className="font-bold text-[#1E293B] font-poppins text-sm group-hover:text-[#A14000] transition-colors leading-tight whitespace-nowrap">{v.name}</p>
                              <span className="text-[11px] text-[#64748B] font-semibold mt-0.5 block">{v.manufacturer}</span>
                            </div>
                          </div>
                        </td>

                        {/* Registration Number */}
                        <td className="py-4 px-6 font-poppins font-semibold text-xs tracking-wider text-[#1E293B] whitespace-nowrap">
                          {v.plateNumber || v.vehicleNumber}
                        </td>

                        {/* Type */}
                        <td className="py-4 px-6 font-medium text-xs text-[#64748B] whitespace-nowrap">
                          {v.type}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(v.status)}`}>
                            {v.status}
                          </span>
                        </td>

                        {/* FASTag Balance */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${getFASTagStyle(v.fastagBalance)}`}>
                            ₹{v.fastagBalance.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Insurance Expiry */}
                        <td className="py-4 px-6 text-xs font-semibold whitespace-nowrap">
                          <span className={getInsuranceStyle(v.insuranceExpiry)}>
                            {formatDateOrNA(v.insuranceExpiry)}
                          </span>
                        </td>

                        {/* Last Service */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="text-xs font-semibold text-[#1E293B]">
                            {formatDateOrNA(v.lastService)}
                          </p>
                          <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium whitespace-nowrap">
                            Next: {formatDateOrNA(v.nextService)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center select-none whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {/* View Details */}
                            <button
                              onClick={() => navigate(`/manager/vehicle-details/${v._id}`)}
                              title="View details"
                              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => navigate(`/manager/vehicle-edit/${v._id}`)}
                              title="Edit vehicle"
                              className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => openDeleteModal(v)}
                              title="Delete vehicle"
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
                    {/* Quick Analytics Panel removed */}        </div>

          </div>

          {/* --- CHARTS / PERFORMANCE SECTION --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left: Monthly Vehicle Usage (Bar Chart) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 flex flex-col justify-between">
              <div className="shrink-0 mb-4">
                <h3 className="font-poppins font-black text-lg text-[#1E293B]">Monthly Vehicle Usage</h3>
                <span className="text-xs text-[#64748B] font-medium font-nunito mt-1 block">Total mileage run across fleet units in the last 6 months (kilometers)</span>
              </div>

              {/* Flex Grid Bar chart with tooltips */}
              <div className="flex items-end justify-between h-52 pt-6 border-b border-[#E7EAF0]/60 relative select-none gap-2">
                {monthlyUsage.map((m) => (
                  <div key={m.label} className="flex flex-col items-center flex-1 group h-full">
                    {/* Bar Container with concrete height context */}
                    <div className="w-full flex-1 flex items-end relative mb-2">
                      <div
                        style={{ 
                          height: `${Math.max((m.value / maxUsage) * 100, 10)}%`
                        }}
                        className="w-full bg-gradient-to-t from-[#A14000] via-[#853400] to-[#D97706] hover:from-[#853400] hover:via-[#A14000] hover:to-[#853400] rounded-t-lg relative transition-all duration-300 group-hover:shadow-lg origin-bottom cursor-pointer shadow-md"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 font-poppins font-semibold shadow-lg border border-[#475569]">
                          <div className="font-bold">{m.value.toLocaleString("en-IN")} km</div>
                          <div className="text-[10px] text-[#CBD5E1]">{m.label} 2026</div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 bg-[#1E293B] rotate-45" style={{borderBottomColor: '#1E293B'}}></div>
                        </div>
                        
                        {/* Value label inside bar if large enough */}
                        {(m.value / maxUsage) * 100 > 30 && (
                          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            {(m.value / 1000).toFixed(1)}k
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-[#64748B] font-semibold font-poppins shrink-0">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Vehicle Status Distribution (Donut Chart) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 flex flex-col">
              <div className="shrink-0 mb-2">
                <h3 className="font-poppins font-black text-lg text-[#1E293B]">Vehicle Status Distribution</h3>
                <span className="text-xs text-[#64748B] font-medium font-nunito mt-1 block">Operational availability ratio</span>
              </div>

              <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">

                {/* Donut Draw Area */}
                <div className="relative w-40 h-40 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {donutTotal === 0 ? (
                      <circle cx="50" cy="50" r={radius} fill="none" stroke="#E7EAF0" strokeWidth="10" />
                    ) : (
                      donutSegments.map((seg, idx) => (
                        seg.count > 0 && (
                          <circle
                            key={idx}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="11"
                            strokeDasharray={seg.strokeDasharray}
                            strokeDashoffset={seg.strokeDashoffset}
                            transform="rotate(-90 50 50)"
                            className="transition-all duration-500 hover:stroke-[13px] cursor-pointer"
                            title={`${seg.status}: ${seg.count}`}
                          />
                        )
                      ))
                    )}
                  </svg>

                  {/* Center Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-[#1E293B] font-poppins">{donutTotal}</span>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Total</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="flex-1 flex flex-col gap-2.5 w-full select-none">
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const percentage = donutTotal > 0 ? Math.round((count / donutTotal) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: distributionColors[status] }}
                          />
                          <span className="text-[#64748B]">{status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#1E293B]">{count}</span>
                          <span className="text-[10px] text-gray-400 font-medium">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>

          {/* --- ACTIVITIES & ALERTS SECTION --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Recent Vehicle Activities Timeline */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 flex flex-col">
              <h3 className="font-poppins font-black text-lg text-[#1E293B] mb-5 shrink-0">Recent Vehicle Activities</h3>

              <div className="flex-1 space-y-4 overflow-y-auto max-h-80 custom-scrollbar pr-2 select-none">
                {activities.length > 0 ? (
                  activities.map((act) => {
                    const { icon: Icon, color } = getActivityIconAndColor(act);
                    const relativeTime = formatRelativeTime(act.createdAt || act.timestamp);
                    return (
                      <div
                        key={act._id || act.id}
                        onClick={() => handleActivityClick(act)}
                        className="flex gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        {/* Timeline Node */}
                        <div className="relative flex flex-col items-center shrink-0">
                          <div className={`p-2.5 rounded-xl border ${color} flex items-center justify-center z-10 shadow-sm group-hover:scale-105 transition-transform`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          {/* Connecting Line */}
                          <div className="w-[1.5px] bg-[#E7EAF0] flex-1 min-h-[24px] mt-2 last:hidden" />
                        </div>

                        {/* Content */}
                        <div className="py-0.5 flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1E293B] leading-tight group-hover:text-[#A14000] transition-colors">
                            {act.description || act.text || act.title}
                          </p>
                          <span className="text-[10px] text-[#64748B] font-medium block mt-1 font-poppins">
                            {relativeTime}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-xs font-semibold text-[#64748B] py-12">
                    No recent vehicle activities found.
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Compliance & Status Alerts */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 flex flex-col">
              <h3 className="font-poppins font-black text-lg text-[#1E293B] mb-5 shrink-0">Upcoming Alerts</h3>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-80 custom-scrollbar pr-2 select-none">
                {(() => {
                  const dynamicAlerts = [];
                  vehicles.forEach((v) => {
                    if (v.fastagBalance !== undefined && Number(v.fastagBalance) < 1000) {
                      dynamicAlerts.push({
                        id: `fastag-${v.id}`,
                        title: "FASTag Low Balance",
                        message: `${v.name} (${v.plateNumber}) has only ₹${v.fastagBalance} left!`,
                        icon: AlertTriangle,
                        iconColor: "text-[#EF4444] bg-[#EF4444]/10",
                        badge: "Critical",
                        badgeClass: "bg-[#EF4444] text-white",
                        bgClass: "bg-red-50/50 border-red-100"
                      });
                    }

                    if (v.insuranceExpiry) {
                      const expDate = new Date(v.insuranceExpiry);
                      const diffTime = expDate - new Date();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      if (diffDays < 0) {
                        dynamicAlerts.push({
                          id: `ins-exp-${v.id}`,
                          title: "Insurance Expired",
                          message: `${v.name} (${v.plateNumber}) expired on ${expDate.toLocaleDateString()}`,
                          icon: FileText,
                          iconColor: "text-[#EF4444] bg-[#EF4444]/10",
                          badge: "Expired",
                          badgeClass: "bg-[#EF4444] text-white",
                          bgClass: "bg-red-50/50 border-red-100"
                        });
                      } else if (diffDays <= 30) {
                        dynamicAlerts.push({
                          id: `ins-warn-${v.id}`,
                          title: "Insurance Expiring Soon",
                          message: `${v.name} (${v.plateNumber}) expires in ${diffDays} days (${expDate.toLocaleDateString()})`,
                          icon: Calendar,
                          iconColor: "text-[#A14000] bg-[#FDF3EC]",
                          badge: `${diffDays} Days`,
                          badgeClass: "bg-[#A14000] text-white",
                          bgClass: "bg-amber-50/50 border-amber-100"
                        });
                      }
                    }

                    if (v.status === 'Maintenance') {
                      dynamicAlerts.push({
                        id: `maint-${v.id}`,
                        title: "Maintenance Service Due",
                        message: `${v.name} (${v.plateNumber}) is currently in maintenance.`,
                        icon: Wrench,
                        iconColor: "text-[#A14000] bg-[#FDF3EC]",
                        badge: "Due",
                        badgeClass: "bg-amber-100 text-[#A14000]",
                        bgClass: "bg-amber-50/50 border-amber-100"
                      });
                    }
                  });

                  const displayed = dynamicAlerts.slice(0, 4);
                  if (displayed.length === 0) {
                    return (
                      <div className="text-center text-xs text-[#64748B] py-8">
                        All vehicles compliant. No alerts active.
                      </div>
                    );
                  }

                  return displayed.map((alert) => {
                    const AlertIcon = alert.icon;
                    return (
                      <div key={alert.id} className={`flex items-center justify-between p-3.5 border rounded-xl ${alert.bgClass}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${alert.iconColor}`}>
                            <AlertIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold font-poppins text-slate-800">{alert.title}</p>
                            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{alert.message}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-poppins tracking-wider ${alert.badgeClass}`}>
                          {alert.badge}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>



      {/* Floating Add Vehicle Button */}
      {createPortal(
        <button
          onClick={openAddModal}
          title="Add new vehicle"
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#A14000] hover:bg-[#853400] text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-[#A14000]/35 hover:scale-108 transition-all z-30 group cursor-pointer"
        >
          <Plus className="w-7 h-7 transition-transform group-hover:rotate-90" />
        </button>,
        document.body
      )}

      {/* --- ADD / EDIT / DRIVER ASSIGNMENT / DETAILS MODALS --- */}
      {modalType && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">

          {/* Modal Container */}
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 font-nunito border border-[#E7EAF0] relative animate-scale-up">

            {/* Close Button */}
            <button
              onClick={() => { setModalType(null); setSelectedVehicle(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* --- EDIT FORM MODAL --- */}
            {modalType === "edit" && (
              <form onSubmit={handleSaveVehicle} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-poppins text-[#1E293B]">
                    {modalType === "add" ? "Add New Fleet Vehicle" : "Edit Vehicle Details"}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Provide precise vehicle identification, parameters, and service schedule limits.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vehicle Name */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Vehicle Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ashok Leyland 3118"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    />
                  </div>

                  {/* Manufacturer */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Manufacturer *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ashok Leyland"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    />
                  </div>

                  {/* Registration Plate */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Registration No. (Plate) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MH 12 AB 5678"
                      value={formData.plateNumber}
                      onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] uppercase bg-white text-[#1E293B]"
                    />
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Vehicle Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    >
                      <option>Truck</option>
                      <option>Van</option>
                      <option>Tipper</option>
                      <option>Trailer</option>
                      <option>Bus</option>
                    </select>
                  </div>



                  {/* Status */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Current Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    >
                      <option>Available</option>
                      <option>On Trip</option>
                      <option>Idle</option>
                      <option>Maintenance</option>
                      <option>Out of Service</option>
                    </select>
                  </div>



                  {/* FASTag Balance */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">FASTag Balance (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.fastagBalance}
                      onChange={(e) => setFormData({ ...formData, fastagBalance: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Branch</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    >
                      <option>Pune</option>
                      <option>Mumbai</option>
                      <option>Delhi</option>
                      <option>Bengaluru</option>
                      <option>Chennai</option>
                      <option>Hyderabad</option>
                      <option>Ahmedabad</option>
                    </select>
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Fuel Type</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    >
                      <option>Diesel</option>
                      <option>CNG</option>
                      <option>Electric</option>
                    </select>
                  </div>

                  {/* Ownership */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Ownership</label>
                    <select
                      value={formData.ownership}
                      onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    >
                      <option>Owned</option>
                      <option>Leased</option>
                    </select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Availability</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    >
                      <option>Immediate</option>
                      <option>Scheduled</option>
                    </select>
                  </div>

                  {/* Insurance Expiry */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Insurance Expiry Date</label>
                    <input
                      type="date"
                      value={formData.insuranceExpiry}
                      onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    />
                  </div>

                  {/* Last Service */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Last Service Date</label>
                    <input
                      type="date"
                      value={formData.lastService}
                      onChange={(e) => setFormData({ ...formData, lastService: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    />
                  </div>

                  {/* Next Service Due */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Next Service Due</label>
                    <input
                      type="date"
                      value={formData.nextService}
                      onChange={(e) => setFormData({ ...formData, nextService: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                  <button
                    type="button"
                    onClick={() => { setModalType(null); setSelectedVehicle(null); }}
                    className="px-4.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#A14000] hover:bg-[#853400] rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-[#A14000]/20 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}



            {/* --- DELETE CONFIRMATION MODAL --- */}
            {modalType === "delete" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-poppins text-[#1E293B] flex items-center gap-2 text-[#EF4444]">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                    Confirm Deletion
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Are you absolutely sure you want to remove this vehicle from the fleet inventory record? This action cannot be undone.
                  </p>
                </div>

                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 select-none">
                  <div className="bg-red-100 text-[#EF4444] p-2.5 rounded-lg shrink-0">
                    <Truck className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-[#EF4444] font-poppins">{selectedVehicle?.name}</p>
                    <span className="text-[10px] text-red-500 font-semibold tracking-wider block mt-0.5">{selectedVehicle?.plateNumber}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                  <button
                    onClick={() => { setModalType(null); setSelectedVehicle(null); }}
                    className="px-4.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteVehicle}
                    className="px-5 py-2.5 bg-[#EF4444] hover:bg-red-700 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-red-250 cursor-pointer"
                  >
                    Delete Vehicle
                  </button>
                </div>
              </div>
            )}

            {/* --- VEHICLE DETAILS MODAL --- */}
            {modalType === "details" && selectedVehicle && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FDF3EC] text-[#A14000] p-3 rounded-2xl border border-[#FDF3EC]/50 flex items-center justify-center shrink-0">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-poppins text-[#1E293B]">{selectedVehicle.name}</h3>
                    <span className="text-xs font-poppins font-semibold text-[#A14000] tracking-wider mt-0.5 block">{selectedVehicle.plateNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 select-none">
                  {/* Parameter 1 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Manufacturer</span>
                    <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{selectedVehicle.manufacturer}</span>
                  </div>
                  {/* Parameter 2 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Type</span>
                    <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{selectedVehicle.type}</span>
                  </div>
                  {/* Parameter 3 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Branch</span>
                    <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{selectedVehicle.branch}</span>
                  </div>
                  {/* Parameter 4 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Assigned Driver</span>
                    <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{selectedVehicle.driver}</span>
                  </div>
                  {/* Parameter 5 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Status</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1.5 ${getStatusBadge(selectedVehicle.status)}`}>
                      {selectedVehicle.status}
                    </span>
                  </div>

                  {/* Parameter 7 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">FASTag Balance</span>
                    <span className="text-sm font-bold text-[#1E293B] mt-1 block">₹{selectedVehicle.fastagBalance.toLocaleString("en-IN")}</span>
                  </div>
                  {/* Parameter 8 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Fuel Type</span>
                    <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{selectedVehicle.fuelType}</span>
                  </div>
                  {/* Parameter 9 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Ownership</span>
                    <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{selectedVehicle.ownership}</span>
                  </div>
                  {/* Parameter 10 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Availability</span>
                    <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{selectedVehicle.availability}</span>
                  </div>
                  {/* Parameter 11 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Date Added</span>
                    <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{formatDateOrNA(selectedVehicle.dateAdded)}</span>
                  </div>
                  {/* Parameter 12 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Insurance Expiry</span>
                    <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{formatDateOrNA(selectedVehicle.insuranceExpiry)}</span>
                  </div>
                </div>

                <div className="border-t border-[#E7EAF0] pt-5 select-none">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-3.5">Service & Inspection Logs</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Last Serviced</p>
                        <span className="text-xs font-semibold text-[#1E293B] mt-0.5 block">{formatDateOrNA(selectedVehicle.lastService)}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl flex items-center gap-3">
                      <Wrench className="w-5 h-5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Next Service Due</p>
                        <span className="text-xs font-semibold text-[#1E293B] mt-0.5 block">{formatDateOrNA(selectedVehicle.nextService)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                  <button
                    onClick={() => { setModalType(null); setSelectedVehicle(null); }}
                    className="px-5 py-2.5 bg-[#A14000] hover:bg-[#853400] rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-[#A14000]/20 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>,
        document.body
      )}

    </div>
  );
}

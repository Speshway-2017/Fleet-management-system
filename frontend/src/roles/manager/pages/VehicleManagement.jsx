import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../dashboard/Sidebar";
import Header from "../dashboard/Header";
import "../dashboard/manager.css";

const INITIAL_VEHICLES = [
  {
    id: 1,
    name: "Ashok Leyland 3118",
    manufacturer: "Ashok Leyland",
    plateNumber: "MH 12 AB 5678",
    type: "Truck",
    driver: "Rajesh Kumar",
    status: "On Trip",
    fuelLevel: 78,
    fastagBalance: 12450,
    insuranceExpiry: "2027-10-12",
    lastService: "2026-05-10",
    nextService: "2026-11-10",
    branch: "Pune",
    fuelType: "Diesel",
    ownership: "Owned",
    availability: "Immediate",
    dateAdded: "2026-01-15"
  },
  {
    id: 2,
    name: "Tata Ace Gold",
    manufacturer: "Tata",
    plateNumber: "KA 02 AB 1456",
    type: "Van",
    driver: "Ram Kumar",
    status: "Available",
    fuelLevel: 45,
    fastagBalance: 5320,
    insuranceExpiry: "2027-08-15",
    lastService: "2026-04-12",
    nextService: "2026-10-12",
    branch: "Bengaluru",
    fuelType: "CNG",
    ownership: "Leased",
    availability: "Immediate",
    dateAdded: "2026-02-10"
  },
  {
    id: 3,
    name: "Bharat Benz 211",
    manufacturer: "Bharat Benz",
    plateNumber: "AP 39 EP 9465",
    type: "Truck",
    driver: "Eshwar Singh",
    status: "Idle",
    fuelLevel: 12,
    fastagBalance: 1222,
    insuranceExpiry: "2026-11-05",
    lastService: "2026-05-20",
    nextService: "2026-11-20",
    branch: "Hyderabad",
    fuelType: "Diesel",
    ownership: "Owned",
    availability: "Scheduled",
    dateAdded: "2026-01-20"
  },
  {
    id: 4,
    name: "Mahindra Bolero XL",
    manufacturer: "Mahindra",
    plateNumber: "TN 07 EQ 2312",
    type: "Truck",
    driver: "Manish Patel",
    status: "On Trip",
    fuelLevel: 92,
    fastagBalance: 450,
    insuranceExpiry: "2026-07-15",
    lastService: "2026-03-05",
    nextService: "2026-09-05",
    branch: "Chennai",
    fuelType: "Diesel",
    ownership: "Leased",
    availability: "Immediate",
    dateAdded: "2026-03-01"
  },
  {
    id: 5,
    name: "Scania Model X",
    manufacturer: "Scania",
    plateNumber: "MH 12 AB 5679",
    type: "Truck",
    driver: "Ramana",
    status: "Maintenance",
    fuelLevel: 15,
    fastagBalance: 320,
    insuranceExpiry: "2026-01-12",
    lastService: "2026-06-25",
    nextService: "2026-08-25",
    branch: "Mumbai",
    fuelType: "Diesel",
    ownership: "Owned",
    availability: "Scheduled",
    dateAdded: "2026-01-05"
  },
  {
    id: 6,
    name: "Eicher Pro 2049",
    manufacturer: "Eicher",
    plateNumber: "DL 03 EC 9876",
    type: "Tipper",
    driver: "Vijay Kumar",
    status: "Available",
    fuelLevel: 60,
    fastagBalance: 6780,
    insuranceExpiry: "2027-02-18",
    lastService: "2026-05-15",
    nextService: "2026-11-15",
    branch: "Delhi",
    fuelType: "Electric",
    ownership: "Owned",
    availability: "Immediate",
    dateAdded: "2026-04-10"
  },
  {
    id: 7,
    name: "Force Traveller",
    manufacturer: "Force",
    plateNumber: "MH 14 EU 1122",
    type: "Bus",
    driver: "Sanjay Singh",
    status: "Out of Service",
    fuelLevel: 25,
    fastagBalance: 120,
    insuranceExpiry: "2026-05-20",
    lastService: "2026-01-10",
    nextService: "2026-07-10",
    branch: "Pune",
    fuelType: "Diesel",
    ownership: "Leased",
    availability: "Scheduled",
    dateAdded: "2026-01-12"
  },
  {
    id: 8,
    name: "Tata Signa 4825",
    manufacturer: "Tata",
    plateNumber: "GJ 01 ZY 8899",
    type: "Trailer",
    driver: "Unassigned",
    status: "Idle",
    fuelLevel: 55,
    fastagBalance: 14500,
    insuranceExpiry: "2027-05-20",
    lastService: "2026-02-28",
    nextService: "2026-08-28",
    branch: "Ahmedabad",
    fuelType: "Diesel",
    ownership: "Owned",
    availability: "Immediate",
    dateAdded: "2026-02-22"
  }
];

const MOCK_DRIVERS = [
  "Rajesh Kumar",
  "Ram Kumar",
  "Eshwar Singh",
  "Manish Patel",
  "Ramana",
  "Vijay Kumar",
  "Sanjay Singh",
  "Amit Sharma",
  "Unassigned"
];

const MOCK_ACTIVITIES = [
  { id: 1, type: "assign", text: "Vehicle MH 12 AB 5678 assigned to Rajesh Kumar", time: "2 hrs ago", icon: UserCheck, color: "text-amber-600 bg-amber-50 border-amber-100" },
  { id: 2, type: "renew", text: "Insurance policy renewed for Tata Ace Gold (KA 02 AB 1456)", time: "1 day ago", icon: FileText, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { id: 3, type: "repair", text: "Maintenance completed on Scania Model X", time: "2 days ago", icon: Wrench, color: "text-blue-600 bg-blue-50 border-blue-100" },
  { id: 4, type: "fastag", text: "FASTag account auto-recharged for Tata Signa 4825 (+₹5,000)", time: "3 days ago", icon: Wallet, color: "text-purple-600 bg-purple-50 border-purple-100" },
  { id: 5, type: "trip", text: "Trip ID #3021 completed successfully by Eicher Pro 2049", time: "4 days ago", icon: CheckCircle, color: "text-teal-600 bg-teal-50 border-teal-100" }
];

export default function VehicleManagement() {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem("fleet_vehicles");
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

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

  // Sorting
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modals & CRUD UI States
  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'delete' | 'assign' | 'details'
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    plateNumber: "",
    type: "Truck",
    driver: "Unassigned",
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

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem("fleet_vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

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
      v.plateNumber.toLowerCase().includes(query) ||
      (v.driver && v.driver.toLowerCase().includes(query));

    const matchesStatus = statusFilter === "All Statuses" || v.status === statusFilter;
    const matchesType = typeFilter === "All Types" || v.type === typeFilter;
    const matchesBranch = branchFilter === "All Branches" || v.branch === branchFilter;
    const matchesFuel = fuelFilter === "All Fuel Types" || v.fuelType === fuelFilter;
    const matchesOwnership = ownershipFilter === "All Ownerships" || v.ownership === ownershipFilter;
    const matchesAvail = availFilter === "All Availabilities" || v.availability === availFilter;
    const matchesDate = !dateAddedFilter || v.dateAdded === dateAddedFilter;

    return matchesSearch && matchesStatus && matchesType && matchesBranch && matchesFuel && matchesOwnership && matchesAvail && matchesDate;
  }).sort((a, b) => {
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
  const activeVehicles = vehicles.filter(v => v.status === "On Trip" || v.status === "Available").length;
  const idleVehicles = vehicles.filter(v => v.status === "Idle").length;
  const maintVehicles = vehicles.filter(v => v.status === "Maintenance").length;

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

  // Compute status distribution percentages
  const statusCounts = {
    "Available": vehicles.filter(v => v.status === "Available").length,
    "On Trip": vehicles.filter(v => v.status === "On Trip").length,
    "Idle": vehicles.filter(v => v.status === "Idle").length,
    "Maintenance": vehicles.filter(v => v.status === "Maintenance").length,
    "Out of Service": vehicles.filter(v => v.status === "Out of Service").length
  };
  const distributionColors = {
    "Available": "#22C55E",
    "On Trip": "#B45A0A",
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
    const strokeOffset = circumference - currentOffset;
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
    setFormData({ ...vehicle });
    setModalType("edit");
  };

  const openAssignModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({ ...vehicle });
    setModalType("assign");
  };

  const openDetailsModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalType("details");
  };

  const openDeleteModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalType("delete");
  };

  const handleDeleteVehicle = () => {
    const updated = vehicles.filter(v => v.id !== selectedVehicle.id);
    setVehicles(updated);
    setModalType(null);
    setSelectedVehicle(null);
    toast.success("Vehicle deleted successfully");
  };

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.plateNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (modalType === "add") {
      const newVehicle = {
        ...formData,
        id: vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1,
        fuelLevel: Number(formData.fuelLevel),
        fastagBalance: Number(formData.fastagBalance)
      };
      setVehicles([...vehicles, newVehicle]);
      toast.success("New vehicle added successfully!");
    } else if (modalType === "edit") {
      const updated = vehicles.map(v => v.id === selectedVehicle.id ? {
        ...formData,
        fuelLevel: Number(formData.fuelLevel),
        fastagBalance: Number(formData.fastagBalance)
      } : v);
      setVehicles(updated);
      toast.success("Vehicle updated successfully!");
    } else if (modalType === "assign") {
      const updated = vehicles.map(v => v.id === selectedVehicle.id ? { ...v, driver: formData.driver } : v);
      setVehicles(updated);
      toast.success(`Assigned driver ${formData.driver} successfully!`);
    }

    setModalType(null);
    setSelectedVehicle(null);
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
        return "bg-amber-50 text-[#B45A0A] border border-amber-100";
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

  const getInsuranceStyle = (expiry) => {
    const expDate = new Date(expiry);
    const today = new Date();
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-[#EF4444] font-semibold flex items-center gap-1.5";
    if (diffDays <= 30) return "text-[#F59E0B] font-medium flex items-center gap-1.5";
    return "text-[#1E293B] flex items-center gap-1.5";
  };

  return (
    <div className="min-h-screen flex bg-[#F5F7FB] font-nunito text-[#1E293B]">
      {/* Navigation Sidebar */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header (72px) */}
        <Header onMenuToggle={() => setMobileSidebarOpen(true)} showMenuButton={true} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar space-y-8 animate-fade-in">

          {/* --- KPI SECTION --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* KPI Card 1: Total */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Total Vehicles</span>
                  <h3 className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">{totalVehicles}</h3>
                </div>
                <div className="bg-[#FDF3EC] text-[#B45A0A] p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                  <Truck className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-[#22C55E] gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4 Added this month</span>
              </div>
            </div>

            {/* KPI Card 2: Active */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Active Vehicles</span>
                  <h3 className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">{activeVehicles}</h3>
                </div>
                <div className="bg-emerald-50 text-[#22C55E] p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-[#64748B] font-medium">
                Running utility rate: <span className="text-emerald-600 font-bold">{Math.round((activeVehicles / totalVehicles) * 100) || 0}%</span>
              </div>
            </div>

            {/* KPI Card 3: Idle */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Idle Vehicles</span>
                  <h3 className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">{idleVehicles}</h3>
                </div>
                <div className="bg-blue-50 text-[#3B82F6] p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-[#64748B] font-medium">
                Parked in depot: <span className="text-[#3B82F6] font-bold">{idleVehicles} units</span>
              </div>
            </div>

            {/* KPI Card 4: Maintenance */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">In Maintenance</span>
                  <h3 className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">{maintVehicles}</h3>
                </div>
                <div className="bg-red-50 text-[#EF4444] p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-[#EF4444] font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>2 Overdue repairs</span>
              </div>
            </div>

          </div>

          {/* --- PAGE HEADER --- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-6">
            <div>
              <h1 className="font-poppins font-black text-3xl text-[#1E293B] tracking-tight">
                Vehicle Management
              </h1>
              <p className="text-sm text-[#64748B] mt-1 font-medium">
                Manage, assign and monitor all fleet vehicles across your organization.
              </p>
            </div>

            {/* Header buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all flex items-center gap-2 shadow-sm font-poppins cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Vehicles</span>
              </button>

              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 font-poppins cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Add Vehicle</span>
              </button>
            </div>
          </div>

          {/* --- ADVANCED FILTER SECTION --- */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">

            {/* Primary search & quick filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  className="w-full pl-10 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A] transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
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
                  className="w-full px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
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
                      ? "bg-[#FDF3EC] text-[#B45A0A]"
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
                Showing <span className="font-bold text-[#1E293B]">{filteredVehicles.length}</span> of {vehicles.length} vehicles
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

          {/* --- FLEET INVENTORY TABLE --- */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-[#E7EAF0] flex items-center justify-between shrink-0">
              <h3 className="font-poppins font-black text-lg text-[#1E293B]">Fleet Inventory</h3>
              <button
                onClick={() => navigate("/manager/vehicles-list")}
                className="text-xs text-[#B45A0A] hover:text-[#9A4D08] hover:underline font-bold font-poppins flex items-center gap-1 cursor-pointer"
              >
                <span>View All Vehicles</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
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
                    <th className="py-4 px-6 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap" onClick={() => handleSort("driver")}>
                      Assigned Driver {sortField === "driver" && (sortDirection === "asc" ? "▲" : "▼")}
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
                    <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]/60">
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400 font-medium font-nunito">
                        No vehicles found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-[#F5F7FB]/50 transition-colors group">
                        {/* Vehicle Card Cell */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#FDF3EC] text-[#B45A0A] p-2.5 rounded-xl flex items-center justify-center shrink-0 border border-[#FDF3EC]/50">
                              <Truck className="w-5.5 h-5.5" />
                            </div>
                            <div>
                              <p className="font-bold text-[#1E293B] font-poppins text-sm group-hover:text-[#B45A0A] transition-colors leading-tight whitespace-nowrap">{v.name}</p>
                              <span className="text-[11px] text-[#64748B] font-semibold mt-0.5 block">{v.manufacturer}</span>
                            </div>
                          </div>
                        </td>

                        {/* Registration Number */}
                        <td className="py-4 px-6 font-poppins font-semibold text-xs tracking-wider text-[#1E293B] whitespace-nowrap">
                          {v.plateNumber}
                        </td>

                        {/* Type */}
                        <td className="py-4 px-6 font-medium text-xs text-[#64748B] whitespace-nowrap">
                          {v.type}
                        </td>

                        {/* Driver */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {v.driver === "Unassigned" ? (
                            <span className="text-[#EF4444] font-bold text-xs bg-red-50 px-2.5 py-1 rounded-lg border border-red-100 flex items-center w-max gap-1 whitespace-nowrap">
                              <AlertCircle className="w-3 h-3" />
                              Unassigned
                            </span>
                          ) : (
                            <span className="text-[#1E293B] font-medium text-xs">{v.driver}</span>
                          )}
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
                            {new Date(v.insuranceExpiry).toLocaleDateString("en-IN", {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>

                        {/* Last Service */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="text-xs font-semibold text-[#1E293B]">
                            {new Date(v.lastService).toLocaleDateString("en-IN", {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium whitespace-nowrap">
                            Next: {new Date(v.nextService).toLocaleDateString("en-IN", {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right select-none whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Details */}
                            <button
                              onClick={() => navigate(`/manager/vehicle-details/${v.id}`)}
                              title="View details"
                              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => navigate(`/manager/vehicle-edit/${v.id}`)}
                              title="Edit vehicle"
                              className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => openDeleteModal(v)}
                              title="Delete vehicle"
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- QUICK ANALYTICS PANEL --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Analytics Card 1: Value */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Total Fleet Value</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-extrabold text-[#1E293B] font-poppins">₹24.5 Cr</span>
                <span className="text-[10px] font-bold text-[#22C55E] font-poppins">+12.5% YoY</span>
              </div>
              <div className="mt-4">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 15 Q 15 12 30 18 T 60 5 T 100 10" fill="none" stroke="#B45A0A" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 0 15 Q 15 12 30 18 T 60 5 T 100 10 L 100 20 L 0 20 Z" fill="url(#grad1)" opacity="0.1" />
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B45A0A" />
                      <stop offset="100%" stopColor="#B45A0A" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Analytics Card 2: Age */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Average Vehicle Age</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-extrabold text-[#1E293B] font-poppins">3.2 Years</span>
                <span className="text-[10px] font-medium text-[#64748B] font-poppins">Industry: 4.5Y</span>
              </div>
              <div className="mt-4">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 5 Q 20 8 40 4 T 80 16 T 100 14" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 0 5 Q 20 8 40 4 T 80 16 T 100 14 L 100 20 L 0 20 Z" fill="url(#grad2)" opacity="0.1" />
                  <defs>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Analytics Card 3: Fuel */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Fuel Consumption</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-extrabold text-[#1E293B] font-poppins">14,250 L</span>
                <span className="text-[10px] font-bold text-[#EF4444] font-poppins">+4.2% MoM</span>
              </div>
              <div className="mt-4">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 18 Q 25 5 50 12 T 100 2" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 0 18 Q 25 5 50 12 T 100 2 L 100 20 L 0 20 Z" fill="url(#grad3)" opacity="0.1" />
                  <defs>
                    <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Analytics Card 4: Cost */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Maintenance Cost</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-extrabold text-[#1E293B] font-poppins">₹8.4L</span>
                <span className="text-[10px] font-bold text-[#22C55E] font-poppins">-2.1% MoM</span>
              </div>
              <div className="mt-4">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 8 Q 20 18 45 6 T 85 15 T 100 12" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 0 8 Q 20 18 45 6 T 85 15 T 100 12 L 100 20 L 0 20 Z" fill="url(#grad4)" opacity="0.1" />
                  <defs>
                    <linearGradient id="grad4" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

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
                  <div key={m.label} className="flex flex-col items-center flex-1 group">
                    <div
                      style={{ 
                        height: `${Math.max((m.value / maxUsage) * 100, 10)}%`,
                        minHeight: '30px'
                      }}
                      className="w-full bg-gradient-to-t from-[#B45A0A] via-[#C65D0E] to-[#D97706] hover:from-[#9A4D08] hover:via-[#B45A0A] hover:to-[#C65D0E] rounded-t-lg relative transition-all duration-300 group-hover:shadow-lg origin-bottom cursor-pointer shadow-md"
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
                    <span className="text-xs text-[#64748B] font-semibold font-poppins mt-4 font-medium">{m.label}</span>
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

              <div className="flex-1 space-y-5 overflow-y-auto max-h-80 custom-scrollbar pr-2 select-none">
                {MOCK_ACTIVITIES.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="flex gap-4">
                      {/* Timeline Node */}
                      <div className="relative flex flex-col items-center shrink-0">
                        <div className={`p-2.5 rounded-xl border ${act.color} flex items-center justify-center z-10 shadow-sm`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        {/* Connecting Line */}
                        <div className="w-[1.5px] bg-[#E7EAF0] flex-1 min-h-[30px] mt-2 last:hidden" />
                      </div>

                      {/* Content */}
                      <div className="py-1">
                        <p className="text-xs font-bold text-[#1E293B] leading-tight">{act.text}</p>
                        <span className="text-[10px] text-[#64748B] font-medium block mt-1 font-poppins">{act.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Compliance & Status Alerts */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 flex flex-col">
              <h3 className="font-poppins font-black text-lg text-[#1E293B] mb-5 shrink-0">Upcoming Alerts</h3>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-80 custom-scrollbar pr-2 select-none">

                {/* Alert 1 */}
                <div className="flex items-center justify-between p-3.5 bg-red-50/50 border border-red-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-[#EF4444] bg-[#EF4444]/10 p-2 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#EF4444] font-poppins">FASTag Low Balance</p>
                      <span className="text-[10px] text-red-500 font-medium block mt-0.5">Scania Model X (MH 12 AB 5679) has only ₹320 left!</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase bg-[#EF4444] text-white px-2 py-0.5 rounded-full font-poppins tracking-wider">Critical</span>
                </div>

                {/* Alert 2 */}
                <div className="flex items-center justify-between p-3.5 bg-red-50/50 border border-red-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-[#EF4444] bg-[#EF4444]/10 p-2 rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#EF4444] font-poppins">Insurance Expired</p>
                      <span className="text-[10px] text-red-500 font-medium block mt-0.5">Scania Model X (MH 12 AB 5679) expired on 12 Jan 2026</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase bg-[#EF4444] text-white px-2 py-0.5 rounded-full font-poppins tracking-wider">Expired</span>
                </div>

                {/* Alert 3 */}
                <div className="flex items-center justify-between p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-[#B45A0A] bg-[#FDF3EC] p-2 rounded-lg">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#B45A0A] font-poppins">Insurance Expiring Soon</p>
                      <span className="text-[10px] text-[#B45A0A] font-medium block mt-0.5">Mahindra Bolero XL (TN 07 EQ 2312) expires on 15 Jul 2026</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase bg-[#B45A0A] text-white px-2 py-0.5 rounded-full font-poppins tracking-wider">12 Days</span>
                </div>

                {/* Alert 4 */}
                <div className="flex items-center justify-between p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-[#B45A0A] bg-[#FDF3EC] p-2 rounded-lg">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#B45A0A] font-poppins">Maintenance Service Due</p>
                      <span className="text-[10px] text-[#B45A0A] font-medium block mt-0.5">Scania Model X is scheduled for inspection next month.</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase bg-amber-100 text-[#B45A0A] px-2 py-0.5 rounded-full font-poppins">Due</span>
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Floating Add Vehicle Button */}
      <button
        onClick={openAddModal}
        title="Add new vehicle"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-[#B45A0A]/35 hover:scale-108 transition-all z-30 group cursor-pointer"
      >
        <Plus className="w-7 h-7 transition-transform group-hover:rotate-90" />
      </button>

      {/* --- ADD / EDIT / DRIVER ASSIGNMENT / DETAILS MODALS --- */}
      {modalType && (
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
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
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
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
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
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] uppercase bg-white text-[#1E293B]"
                    />
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Vehicle Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                    >
                      <option>Truck</option>
                      <option>Van</option>
                      <option>Tipper</option>
                      <option>Trailer</option>
                      <option>Bus</option>
                    </select>
                  </div>

                  {/* Driver */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Assigned Driver</label>
                    <select
                      value={formData.driver}
                      onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                    >
                      {MOCK_DRIVERS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Current Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
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
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Branch</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
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
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
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
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
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
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
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
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                    />
                  </div>

                  {/* Last Service */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Last Service Date</label>
                    <input
                      type="date"
                      value={formData.lastService}
                      onChange={(e) => setFormData({ ...formData, lastService: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                    />
                  </div>

                  {/* Next Service Due */}
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Next Service Due</label>
                    <input
                      type="date"
                      value={formData.nextService}
                      onChange={(e) => setFormData({ ...formData, nextService: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
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
                    className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-[#B45A0A]/20 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* --- ASSIGN DRIVER QUICK MODAL --- */}
            {modalType === "assign" && (
              <form onSubmit={handleSaveVehicle} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-poppins text-[#1E293B]">
                    Assign Driver to Vehicle
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Select a driver from the roster list. Only available drivers should be scheduled.
                  </p>
                </div>

                <div className="p-4 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl flex items-center gap-3 select-none">
                  <div className="bg-[#FDF3EC] text-[#B45A0A] p-2 rounded-lg border border-[#FDF3EC]/50 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-[#1E293B] font-poppins">{selectedVehicle?.name}</p>
                    <span className="text-[10px] text-[#64748B] font-semibold tracking-wider block mt-0.5">{selectedVehicle?.plateNumber}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Select Driver</label>
                  <select
                    value={formData.driver}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    {MOCK_DRIVERS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
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
                    className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-[#B45A0A]/20 cursor-pointer"
                  >
                    Assign Driver
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
                  <div className="bg-[#FDF3EC] text-[#B45A0A] p-3 rounded-2xl border border-[#FDF3EC]/50 flex items-center justify-center shrink-0">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-poppins text-[#1E293B]">{selectedVehicle.name}</h3>
                    <span className="text-xs font-poppins font-semibold text-[#B45A0A] tracking-wider mt-0.5 block">{selectedVehicle.plateNumber}</span>
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
                    <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{new Date(selectedVehicle.dateAdded).toLocaleDateString("en-IN")}</span>
                  </div>
                  {/* Parameter 12 */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Insurance Expiry</span>
                    <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{new Date(selectedVehicle.insuranceExpiry).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>

                <div className="border-t border-[#E7EAF0] pt-5 select-none">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-3.5">Service & Inspection Logs</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Last Serviced</p>
                        <span className="text-xs font-semibold text-[#1E293B] mt-0.5 block">{new Date(selectedVehicle.lastService).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl flex items-center gap-3">
                      <Wrench className="w-5 h-5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Next Service Due</p>
                        <span className="text-xs font-semibold text-[#1E293B] mt-0.5 block">{new Date(selectedVehicle.nextService).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                  <button
                    onClick={() => { setModalType(null); setSelectedVehicle(null); }}
                    className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-[#B45A0A]/20 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

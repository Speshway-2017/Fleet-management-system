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
  SlidersHorizontal,
  MapPin,
  User,
  Truck
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

const INITIAL_TRIPS = [
  {
    id: "TRP-8841",
    driverName: "Rajesh Kumar",
    driverPhone: "+91 98765 43210",
    vehicleName: "Ashok Leyland 3118",
    vehiclePlate: "MH 12 AB 5678",
    startLocation: "Mumbai, MH",
    endLocation: "Pune, MH",
    departureTime: "2026-07-06T08:15",
    eta: "2026-07-06T20:30",
    status: "On Transit",
    description: "Express Cargo Delivery"
  },
  {
    id: "TRP-8842",
    driverName: "Ram Kumar",
    driverPhone: "+91 87654 32109",
    vehicleName: "Tata Signa 4825",
    vehiclePlate: "KA 02 AB 1456",
    startLocation: "Bengaluru, KA",
    endLocation: "Chennai, TN",
    departureTime: "2026-07-06T09:00",
    eta: "2026-07-07T08:30",
    status: "Delayed",
    description: "Standard Freight Transit"
  },
  {
    id: "TRP-8843",
    driverName: "Vikram Singh",
    driverPhone: "+91 76543 21098",
    vehicleName: "Mahindra Blazo X",
    vehiclePlate: "DL 01 CD 7890",
    startLocation: "Delhi, DL",
    endLocation: "Jaipur, RJ",
    departureTime: "2026-07-07T06:00",
    eta: "2026-07-07T12:30",
    status: "Scheduled",
    description: "Critical Supply Transport"
  },
  {
    id: "TRP-8844",
    driverName: "Vijay Kumar",
    driverPhone: "+91 99887 76655",
    vehicleName: "Eicher Pro 6055",
    vehiclePlate: "DL 03 EC 9876",
    startLocation: "Kolkata, WB",
    endLocation: "Patna, BR",
    departureTime: "2026-07-05T07:30",
    eta: "2026-07-05T19:30",
    status: "Completed",
    description: "General Merchandise Delivery"
  },
  {
    id: "TRP-8845",
    driverName: "Sanjay Singh",
    driverPhone: "+91 88776 65544",
    vehicleName: "BharatBenz 3523",
    vehiclePlate: "MH 14 EU 1122",
    startLocation: "Nashik, MH",
    endLocation: "Nagpur, MH",
    departureTime: "2026-07-06T10:00",
    eta: "2026-07-07T04:00",
    status: "On Transit",
    description: "Heavy Industrial Delivery"
  }
];

export default function TripsManagementPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem("fleet_trips");
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  // Resources list for assignment dropdowns
  const [driversList, setDriversList] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);

  // States
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Trips"); // All Trips, Active, Scheduled, Completed, Delayed
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    driverId: "",
    vehicleId: "",
    startLocation: "",
    endLocation: "",
    departureTime: "",
    eta: "",
    status: "Scheduled",
    description: ""
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("fleet_trips", JSON.stringify(trips));
  }, [trips]);

  // Load driver and vehicle lists for modal selectors
  useEffect(() => {
    const savedDrivers = localStorage.getItem("fleet_drivers");
    if (savedDrivers) {
      setDriversList(JSON.parse(savedDrivers));
    }
    const savedVehicles = localStorage.getItem("fleet_vehicles");
    if (savedVehicles) {
      setVehiclesList(JSON.parse(savedVehicles));
    }
  }, [showCreateModal]);

  const handleResetFilters = () => {
    setSearch("");
    setActiveTab("All Trips");
    toast.success("Filters reset successfully");
  };

  const handleCreateTrip = (e) => {
    e.preventDefault();
    if (!formData.driverId || !formData.vehicleId || !formData.startLocation || !formData.endLocation || !formData.departureTime || !formData.eta) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedDriver = driversList.find(d => d.id === Number(formData.driverId));
    const selectedVehicle = vehiclesList.find(v => v.id === Number(formData.vehicleId));

    if (!selectedDriver || !selectedVehicle) {
      toast.error("Invalid driver or vehicle selected");
      return;
    }

    const newTrip = {
      id: `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
      driverName: selectedDriver.name,
      driverPhone: selectedDriver.phone,
      vehicleName: selectedVehicle.name,
      vehiclePlate: selectedVehicle.plateNumber,
      startLocation: formData.startLocation,
      endLocation: formData.endLocation,
      departureTime: formData.departureTime,
      eta: formData.eta,
      status: formData.status,
      description: formData.description || "General Transport"
    };

    // Update vehicle's driver assignment and status in localStorage
    const updatedVehicles = vehiclesList.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          driver: selectedDriver.name,
          status: formData.status === "On Transit" ? "On Trip" : "Active"
        };
      }
      return v;
    });
    setVehiclesList(updatedVehicles);
    localStorage.setItem("fleet_vehicles", JSON.stringify(updatedVehicles));

    // Update driver's assigned vehicle and status
    const updatedDrivers = driversList.map(d => {
      if (d.id === selectedDriver.id) {
        return {
          ...d,
          assignedVehicle: selectedVehicle.plateNumber,
          status: formData.status === "On Transit" ? "On Trip" : "Available"
        };
      }
      return d;
    });
    setDriversList(updatedDrivers);
    localStorage.setItem("fleet_drivers", JSON.stringify(updatedDrivers));

    setTrips([newTrip, ...trips]);
    setShowCreateModal(false);
    setFormData({
      driverId: "",
      vehicleId: "",
      startLocation: "",
      endLocation: "",
      departureTime: "",
      eta: "",
      status: "Scheduled",
      description: ""
    });
    toast.success("New trip created successfully!");
  };

  const handleDeleteTrip = () => {
    if (!selectedTrip) return;
    const updated = trips.filter(t => t.id !== selectedTrip.id);
    setTrips(updated);
    setShowDeleteConfirm(false);
    setSelectedTrip(null);
    toast.success("Trip record deleted successfully");
  };

  // KPIs Calculations
  const activeTripsCount = trips.filter(t => t.status === "On Transit").length;
  const urgentTripsCount = trips.filter(t => t.status === "Delayed").length;
  const completedTripsCount = trips.filter(t => t.status === "Completed").length;
  // Compute on-time rate based on mock data
  const totalFinished = trips.filter(t => t.status === "Completed" || t.status === "Delayed").length;
  const onTimeRate = totalFinished > 0 
    ? Math.round((trips.filter(t => t.status === "Completed").length / totalFinished) * 100) 
    : 94; // fallback to 94%

  // Tab Filtering
  const getTabFilteredTrips = () => {
    switch (activeTab) {
      case "Active":
        return trips.filter(t => t.status === "On Transit");
      case "Scheduled":
        return trips.filter(t => t.status === "Scheduled");
      case "Completed":
        return trips.filter(t => t.status === "Completed");
      case "Delayed":
        return trips.filter(t => t.status === "Delayed");
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
        t.id.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q) ||
        t.vehicleName.toLowerCase().includes(q) ||
        t.startLocation.toLowerCase().includes(q) ||
        t.endLocation.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  };

  const finalFilteredTrips = getFilteredTrips();

  const currentRows = finalFilteredTrips.slice(0, 5);

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
                <p className="text-3xl font-black text-[#1E293B] mt-2 font-poppins">{trips.length}</p>
                <span className="text-[10px] text-[#64748B] mt-1 block font-medium">All dispatch logs</span>
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

            {/* Card 3: Urgent Trips */}
            <div className="bg-white rounded-xl border-l-4 border-l-red-500 border border-[#E7EAF0] p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider font-poppins">Urgent Trips</p>
                <p className="text-3xl font-black text-red-600 mt-2 font-poppins">{String(urgentTripsCount).padStart(2, '0')}</p>
                <span className="text-[10px] text-red-500 mt-1 block font-semibold">Immediate Action</span>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
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
                    <th className="py-4 px-6 whitespace-nowrap">Driver</th>
                    <th className="py-4 px-6 whitespace-nowrap">Vehicle</th>
                    <th className="py-4 px-6 whitespace-nowrap">Route</th>
                    <th className="py-4 px-6 whitespace-nowrap">Departure</th>
                    <th className="py-4 px-6 whitespace-nowrap">ETA</th>
                    <th className="py-4 px-6 whitespace-nowrap">Status</th>
                    <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]/60">
                  {currentRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400 font-medium font-nunito">
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
                              {t.id}
                            </span>
                            <span className="text-[10px] text-[#64748B] mt-1 block font-semibold max-w-[150px] truncate">
                              {t.description}
                            </span>
                          </div>
                        </td>

                        {/* Driver */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-[#1E293B] font-poppins group-hover:text-[#B45A0A] transition-colors">
                              {t.driverName}
                            </span>
                            <span className="text-[10px] text-[#64748B] mt-0.5 block font-semibold">
                              {t.driverPhone}
                            </span>
                          </div>
                        </td>

                        {/* Vehicle */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-[#1E293B]">
                              {t.vehicleName}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-500 mt-0.5 uppercase tracking-wide block font-poppins">
                              {t.vehiclePlate}
                            </span>
                          </div>
                        </td>

                        {/* Route Map indicator */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <span className="font-bold text-xs text-[#1E293B]">{t.startLocation}</span>
                              <div className="h-2 border-l border-dashed border-gray-300 ml-1.5 my-0.5"></div>
                              <span className="font-bold text-xs text-[#1E293B]">{t.endLocation}</span>
                            </div>
                          </div>
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

                        {/* Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(t.status)}`}>
                            {t.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right select-none whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/manager/trip-details/${t.id}`)}
                              title="View details"
                              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
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
                <h3 className="text-xl font-bold font-poppins text-[#1E293B] flex items-center gap-2 text-[#EF4444]">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                  Cancel Trip Dispatch
                </h3>
                <p className="text-xs text-[#64748B] mt-1 font-medium">
                  Are you sure you want to cancel and delete trip logs for dispatch <strong>{selectedTrip.id}</strong>? This action cannot be undone.
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

    </div>
  );
}

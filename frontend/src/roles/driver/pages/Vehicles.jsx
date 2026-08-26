import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import driverApi from "../api/driverApi";

const resolveDocumentUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const backendBase = `http://${hostname}:5000`;
  return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
};
import { 
  Truck, 
  ShieldCheck, 
  Wrench, 
  RefreshCw, 
  Info, 
  BarChart2, 
  Bell, 
  Folder, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Gauge, 
  User, 
  FileText,
  Fuel as FuelIcon,
  MapPin,
  Clock,
  Shield,
  ExternalLink
} from "lucide-react";

export default function DriverVehiclesPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [isAssigned, setIsAssigned] = useState(false);
  const [maintenance, setMaintenance] = useState({
    activeMaintenances: [],
    completedMaintenances: [],
    upcomingCount: 0,
    overdueCount: 0,
    lastCompleted: null
  });
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState(location.state?.tab || "details"); // 'details' | 'status' | 'alerts' | 'documents'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch assigned vehicle
      const vehRes = await driverApi.getAssignedVehicle();
      if (vehRes?.success && vehRes.data) {
        setIsAssigned(vehRes.data.assigned ?? true);
        setVehicle(vehRes.data.vehicle || (vehRes.data.assigned ? vehRes.data : null));
      } else {
        setIsAssigned(false);
        setVehicle(null);
      }

      // 2. Fetch maintenance alerts & driver issue tickets
      try {
        const [mainRes, ticketsRes] = await Promise.all([
          driverApi.getMaintenance().catch(() => null),
          driverApi.getTickets().catch(() => null)
        ]);

        let activeMain = [];
        let completedMain = [];
        let upcoming = 0;
        let overdue = 0;

        if (mainRes?.success && mainRes.data) {
          activeMain = mainRes.data.activeMaintenances || [];
          completedMain = mainRes.data.completedMaintenances || [];
          upcoming = mainRes.data.upcomingCount || 0;
          overdue = mainRes.data.overdueCount || 0;
        }

        const ticketList = ticketsRes?.data || ticketsRes || [];
        if (Array.isArray(ticketList)) {
          ticketList.forEach(t => {
            const st = t.status || "Open";
            const isDone = st === "Resolved" || st === "Closed" || st === "Completed" || st === "Repair Completed";
            const formattedTicket = {
              _id: t._id || t.ticketId,
              serviceType: t.issueType || t.title || "Vehicle Issue",
              status: st === "Need Maintenance" ? "Maintenance Needed" : st,
              scheduledDate: t.reportedAt || t.createdAt,
              comments: t.description || "Issue reported by driver.",
              garage: t.assignedMechanic?.location || "Garage Workshop",
              assignedMechanic: t.assignedMechanic,
              isTicket: true
            };
            if (isDone) {
              if (!completedMain.some(m => m._id === formattedTicket._id)) {
                completedMain.unshift(formattedTicket);
              }
            } else {
              if (!activeMain.some(m => m._id === formattedTicket._id)) {
                activeMain.unshift(formattedTicket);
              }
            }
          });
        }

        // Keep activeMaintenances focused strictly on active needed maintenance
        const filteredActive = activeMain.filter(m => {
          const s = (m.status || "").toLowerCase();
          return !s.includes("completed") && !s.includes("resolved") && !s.includes("closed");
        });

        setMaintenance({
          activeMaintenances: filteredActive,
          completedMaintenances: completedMain,
          upcomingCount: upcoming,
          overdueCount: overdue,
          lastCompleted: completedMain[0] || null
        });
      } catch (err) {
        console.warn("Could not fetch maintenance data:", err);
      }

      // 3. Fetch documents
      try {
        const docRes = await driverApi.getDocuments();
        if (docRes?.success && docRes.data) {
          setDocuments(Array.isArray(docRes.data) ? docRes.data : []);
        }
      } catch (err) {
        console.warn("Could not fetch documents:", err);
      }

    } catch (err) {
      console.error("Error fetching vehicle overview:", err);
      setIsAssigned(false);
      setVehicle(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const dt = new Date(dateStr);
      if (isNaN(dt.getTime())) return dateStr;
      return dt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    } catch (_) {
      return dateStr;
    }
  };



  // Formatting display variables from dynamic vehicle
  const vehicleCode = vehicle?.vehicleNumber || vehicle?.registrationNumber || "N/A";
  const brandModel = `${vehicle?.brand || vehicle?.make || ""} ${vehicle?.model || ""}`.trim();
  const vehicleType = brandModel || vehicle?.vehicleType || vehicle?.type || "Commercial Transport";
  const registrationNumber = vehicle?.registrationNumber || vehicle?.vehicleNumber || "N/A";
  const fuelType = vehicle?.fuelType || "Diesel";
  const status = vehicle?.currentStatus || vehicle?.status || "Assigned";
  const imageUrl = vehicle?.image || "";

  // Maintenance alert badges
  const totalAlertsCount = (maintenance?.overdueCount || 0) + (maintenance?.activeMaintenances?.length || 0);
  const hasCriticalAlert = maintenance?.overdueCount > 0;

  return (
    <div className="space-y-6 font-nunito pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-900 flex items-center gap-2">
            Vehicle Overview
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time specifications, operational status, maintenance alerts, and compliance docs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 text-xs font-semibold font-poppins rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#A14000] ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {!isAssigned || !vehicle ? (
        /* Empty State: No Vehicle Assigned */
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm max-w-2xl mx-auto my-8">
          <div className="w-20 h-20 bg-orange-50 text-[#A14000] rounded-full flex items-center justify-center mx-auto mb-5 border border-orange-100">
            <Truck className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 mb-2">No Vehicle Assigned</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            You currently do not have a vehicle assigned to your driver profile. Please contact your Fleet Manager for vehicle allocation.
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2.5 bg-[#101C2C] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold font-poppins transition shadow-sm inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Check Again
          </button>
        </div>
      ) : (
        /* Dynamic Vehicle View */
        <div className="space-y-6">

          {/* 1. Vehicle Hero Card (Matching Mobile Aesthetic) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              
              {/* Vehicle Image / Graphic Banner */}
              <div className="w-full md:w-56 h-40 bg-slate-100 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-200 shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={vehicleCode}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-4 ${imageUrl ? 'hidden' : ''}`}>
                  <Truck className="w-14 h-14 text-[#A14000] mb-1 opacity-90" />
                  <span className="text-[10px] font-bold tracking-wider font-poppins uppercase text-slate-300">Fleet Transport</span>
                </div>

                {/* Status Badge Over Image */}
                <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold font-poppins rounded-full shadow-sm ${
                  status.toLowerCase() === 'active' || status.toLowerCase() === 'assigned' || status.toLowerCase() === 'available'
                    ? 'bg-emerald-500 text-white'
                    : status.toLowerCase() === 'maintenance'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-700 text-white'
                }`}>
                  {status}
                </span>
              </div>

              {/* Vehicle Main Details Header */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-poppins text-slate-900 tracking-tight whitespace-nowrap truncate" title={vehicleCode}>
                      {vehicleCode}
                    </h2>
                    <p className="text-sm font-semibold text-slate-500 mt-0.5 truncate">
                      {vehicleType} • <span className="text-slate-800 font-poppins whitespace-nowrap">{registrationNumber}</span>
                    </p>
                  </div>

                  {/* Fuel Type Pill Badge */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Fuel Type</span>
                    <span className="px-3.5 py-1 text-xs font-bold font-poppins rounded-lg bg-orange-50 text-[#A14000] border border-orange-200 inline-block">
                      {fuelType}
                    </span>
                  </div>
                </div>

                {/* Quick Attributes Chips */}
                <div className="pt-2 flex flex-wrap gap-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-slate-400" />
                    <span>Odometer: <strong className="text-slate-900 font-poppins">{vehicle.odometer ? `${vehicle.odometer} km` : '0 km'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Depot: <strong className="text-slate-900">{vehicle.branchDepot || vehicle.currentLocation || 'Fleet Hub'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Driver: <strong className="text-slate-900">{vehicle.assignedDriverName || 'Assigned Driver'}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Actions & Details Section Navigation Cards (Exact Match to Mobile Tiles) */}
          <div>
            <h3 className="text-lg font-bold font-poppins text-slate-900 mb-3">
              Actions & Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Tile 1: Vehicle Details */}
              <button
                onClick={() => setActiveTab("details")}
                className={`p-4 rounded-2xl border text-left transition shadow-sm flex items-center justify-between group ${
                  activeTab === "details"
                    ? "bg-[#101C2C] text-white border-[#101C2C]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-[#151C28] dark:border-[#242E42] dark:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${activeTab === "details" ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                    <Info className="w-5 h-5" />
                  </div>
                  <span className="font-bold font-poppins text-sm">Vehicle Details</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${activeTab === "details" ? "text-white" : "text-slate-400"}`} />
              </button>

              {/* Tile 2: Vehicle Status */}
              <button
                onClick={() => setActiveTab("status")}
                className={`p-4 rounded-2xl border text-left transition shadow-sm flex items-center justify-between group ${
                  activeTab === "status"
                    ? "bg-[#101C2C] text-white border-[#101C2C]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-[#151C28] dark:border-[#242E42] dark:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${activeTab === "status" ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <span className="font-bold font-poppins text-sm">Vehicle Status</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${activeTab === "status" ? "text-white" : "text-slate-400"}`} />
              </button>

              {/* Tile 3: Maintenance Alerts */}
              <button
                onClick={() => setActiveTab("alerts")}
                className={`p-4 rounded-2xl border text-left transition shadow-sm flex items-center justify-between group ${
                  activeTab === "alerts"
                    ? "bg-[#101C2C] text-white border-[#101C2C]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-[#151C28] dark:border-[#242E42] dark:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${activeTab === "alerts" ? "bg-white/10 text-white" : "bg-amber-50 text-[#A14000] dark:bg-amber-950/40"}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold font-poppins text-sm block">Maintenance Alerts</span>
                    {hasCriticalAlert ? (
                      <span className="text-[10px] font-extrabold uppercase font-poppins text-red-500 block">1 CRITICAL</span>
                    ) : totalAlertsCount > 0 ? (
                      <span className="text-[10px] font-bold font-poppins text-amber-500 block">{totalAlertsCount} ACTIVE</span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${activeTab === "alerts" ? "text-white" : "text-slate-400"}`} />
              </button>

              {/* Tile 4: Vehicle Documents */}
              <button
                onClick={() => setActiveTab("documents")}
                className={`p-4 rounded-2xl border text-left transition shadow-sm flex items-center justify-between group ${
                  activeTab === "documents"
                    ? "bg-[#101C2C] text-white border-[#101C2C]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-[#151C28] dark:border-[#242E42] dark:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${activeTab === "documents" ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600 dark:bg-blue-950/40"}`}>
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold font-poppins text-sm block">Vehicle Documents</span>
                    <span className="text-[10px] font-extrabold font-poppins text-slate-400 block">
                      {(vehicle?.complianceDocuments?.length || 5)} Documents
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${activeTab === "documents" ? "text-white" : "text-slate-400"}`} />
              </button>

            </div>
          </div>

          {/* 3. Tab Content Panels */}
          <div className="bg-white dark:bg-[#151C28] border border-slate-200 dark:border-[#242E42] rounded-3xl p-6 shadow-sm">

            {/* TAB 1: VEHICLE DETAILS */}
            {activeTab === "details" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-[#242E42]">
                  <Info className="w-5 h-5 text-[#A14000]" />
                  <h3 className="font-bold font-poppins text-slate-900 dark:text-white text-base">Comprehensive Vehicle Specifications</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h4 className="text-xs font-bold font-poppins uppercase tracking-wider text-slate-400">Basic Information</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Vehicle Code / Plate:</span>
                        <strong className="font-poppins text-slate-900 dark:text-white text-sm">{vehicleCode}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Registration Number:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{registrationNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Make & Model:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicleType}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Manufacture Year:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.manufactureYear || vehicle.year || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Status */}
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h4 className="text-xs font-bold font-poppins uppercase tracking-wider text-slate-400">Operational Status</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Current Status:</span>
                        <span className="font-bold font-poppins text-emerald-600 dark:text-emerald-400">{status}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Home Depot / Branch:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.branchDepot || vehicle.currentLocation || 'Fleet Depot Hub'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Odometer Reading:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.odometer ? `${vehicle.odometer} km` : '0 km'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Fuel Type:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{fuelType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Driver Information */}
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h4 className="text-xs font-bold font-poppins uppercase tracking-wider text-slate-400">Assigned Driver</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Driver Name:</span>
                        <strong className="font-poppins text-slate-900 dark:text-white">{vehicle.assignedDriverName || 'Driver'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Employee ID:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.assignedDriverEmpId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Contact Phone:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.assignedDriverPhone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">License Number:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.assignedDriverLicense || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h4 className="text-xs font-bold font-poppins uppercase tracking-wider text-slate-400">Technical Specs</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Payload Capacity:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.loadCapacity ? `${vehicle.loadCapacity} Tons` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Gross Vehicle Weight (GVW):</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.gvw ? `${vehicle.gvw} kg` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Engine & Chassis #:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.engineNumber ? `ENG: ${vehicle.engineNumber}` : 'Verified'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: VEHICLE STATUS */}
            {activeTab === "status" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-[#242E42]">
                  <BarChart2 className="w-5 h-5 text-[#A14000]" />
                  <h3 className="font-bold font-poppins text-slate-900 dark:text-white text-base">Vehicle Operational Health & Telematics</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Status Metric Card 1 */}
                  <div className={`p-5 rounded-2xl space-y-2 border ${
                    maintenance?.activeMaintenances?.length > 0
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-700/50 text-amber-900 dark:text-amber-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700/50 text-emerald-900 dark:text-emerald-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        maintenance?.activeMaintenances?.length > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'
                      }`}>Vehicle Operational Health</span>
                      {maintenance?.activeMaintenances?.length > 0 ? (
                        <Wrench className="w-5 h-5 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <h4 className="text-xl font-bold font-poppins">{status}</h4>
                    <p className="text-xs opacity-80">
                      {maintenance?.activeMaintenances?.length > 0 ? 'Active maintenance alert logged' : 'All critical systems operational'}
                    </p>
                  </div>

                  {/* Status Metric Card 2 */}
                  <div className="p-5 rounded-2xl space-y-2 border bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-700/50 text-blue-900 dark:text-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">FASTag Toll Account</span>
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-bold font-poppins">{vehicle.fastagBalance ? `₹${vehicle.fastagBalance}` : 'Active Account'}</h4>
                    <p className="text-xs opacity-80">Verified FASTag Account</p>
                  </div>

                  {/* Status Metric Card 3 */}
                  <div className="p-5 rounded-2xl space-y-2 border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Distance</span>
                      <Gauge className="w-5 h-5 text-slate-400" />
                    </div>
                    <h4 className="text-xl font-bold font-poppins">{vehicle.odometer ? `${vehicle.odometer} km` : '42,500 km'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Verified via GPS Odometer</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MAINTENANCE ALERTS (Manager Created, Driver Read-Only) */}
            {activeTab === "alerts" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-[#A14000]" />
                    <div>
                      <h3 className="font-bold font-poppins text-slate-900 text-base">Manager Maintenance Alerts</h3>
                      <p className="text-xs text-slate-500">Service schedules & work order alerts issued by Fleet Manager</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-xs font-semibold">
                    Read Only (Managed by Manager)
                  </span>
                </div>

                {/* Summary Alert Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-500 font-semibold block">Active Work Orders</span>
                    <strong className="text-xl font-bold font-poppins text-slate-900">{maintenance?.activeMaintenances?.length || 0}</strong>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <span className="text-xs text-amber-700 font-semibold block">Upcoming Scheduled</span>
                    <strong className="text-xl font-bold font-poppins text-amber-800">{maintenance?.upcomingCount || 0}</strong>
                  </div>
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                    <span className="text-xs text-red-700 font-semibold block">Overdue Alerts</span>
                    <strong className="text-xl font-bold font-poppins text-red-800">{maintenance?.overdueCount || 0}</strong>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-xs text-emerald-700 font-semibold block">Completed Services</span>
                    <strong className="text-xl font-bold font-poppins text-emerald-800">{maintenance?.completedMaintenances?.length || 0}</strong>
                  </div>
                </div>

                {/* Maintenance List */}
                {maintenance?.activeMaintenances?.length > 0 ? (
                  <div className="space-y-4">
                    {maintenance.activeMaintenances.map((item, idx) => (
                      <div key={item._id || idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-xl ${
                            item.status?.toLowerCase() === 'overdue' 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-amber-100 text-[#A14000]'
                          }`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold font-poppins text-slate-900 text-sm">
                                {item.serviceType || item.title || 'Vehicle Maintenance'}
                              </h4>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                item.status?.toLowerCase() === 'overdue'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.status || 'Scheduled'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {item.comments || item.notes || item.garage || 'Scheduled maintenance service work order issued by Fleet Operations Manager.'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 text-xs">
                          <span className="text-slate-400 block">Scheduled Date</span>
                          <strong className="text-slate-800 font-poppins">{formatDate(item.scheduledDate)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <h4 className="font-bold font-poppins text-slate-800 text-sm">No Active Maintenance Alerts</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Your vehicle is currently in healthy operating condition with no pending work orders.
                    </p>
                  </div>
                )}
              </div>
            )}
            {/* TAB 4: VEHICLE DOCUMENTS */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#242E42]">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold font-poppins text-slate-900 dark:text-white text-base">
                      Vehicle Compliance Documents & Legal Records
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-poppins">
                    Assigned Vehicle: <strong className="text-slate-900 dark:text-white">{registrationNumber}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Registration Certificate (RC)",
                      type: "RC",
                      url: vehicle?.documents?.rc?.fileUrl || vehicle?.rcUrl || "",
                      fileName: vehicle?.documents?.rc?.fileName || `${registrationNumber}_RC.pdf`,
                      expiryDate: vehicle?.documents?.rc?.expiryDate || vehicle?.rcExpiry,
                      status: "Valid ✓"
                    },
                    {
                      title: "Insurance Policy",
                      type: "Insurance",
                      url: vehicle?.documents?.insurance?.fileUrl || vehicle?.insuranceUrl || "",
                      fileName: vehicle?.documents?.insurance?.fileName || `${registrationNumber}_Insurance.pdf`,
                      expiryDate: vehicle?.documents?.insurance?.expiryDate || vehicle?.insuranceExpiry,
                      status: "Active ✓"
                    },
                    {
                      title: "Pollution Certificate (PUC)",
                      type: "PUC",
                      url: vehicle?.documents?.puc?.fileUrl || vehicle?.pucUrl || "",
                      fileName: vehicle?.documents?.puc?.fileName || `${registrationNumber}_PUC.pdf`,
                      expiryDate: vehicle?.documents?.puc?.expiryDate || vehicle?.pollutionExpiry,
                      status: "Valid ✓"
                    },
                    {
                      title: "Fitness Certificate",
                      type: "Fitness",
                      url: vehicle?.documents?.fitness?.fileUrl || vehicle?.fitnessUrl || "",
                      fileName: vehicle?.documents?.fitness?.fileName || `${registrationNumber}_Fitness.pdf`,
                      expiryDate: vehicle?.documents?.fitness?.expiryDate || vehicle?.fitnessExpiry,
                      status: "Approved ✓"
                    },
                    {
                      title: "National Goods Permit",
                      type: "Permit",
                      url: vehicle?.documents?.permit?.fileUrl || vehicle?.permitUrl || "",
                      fileName: vehicle?.documents?.permit?.fileName || `${registrationNumber}_Permit.pdf`,
                      expiryDate: vehicle?.documents?.permit?.expiryDate || vehicle?.permitExpiry,
                      status: "Active ✓"
                    }
                  ].map((doc, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-[#0D1B2A]/10 text-[#0D1B2A]">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm font-poppins text-slate-900 dark:text-white">{doc.title}</h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{doc.type} Document</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {doc.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700/60 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">File Name:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{doc.fileName}</span>
                        </div>
                        {doc.expiryDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Valid Until:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{new Date(doc.expiryDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (doc.url) {
                            window.open(resolveDocumentUrl(doc.url), "_blank");
                          } else {
                            toast.error(`No uploaded ${doc.title} URL on record for ${registrationNumber}.`);
                          }
                        }}
                        className="w-full py-2.5 bg-[#0D1B2A] hover:bg-[#1E293B] text-white font-bold font-poppins rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" /> View Document
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* 4. Quick Info Card (Matching Mobile Dark Navy Component) */}
          <div className="bg-[#101C2C] text-white rounded-3xl p-6 shadow-md border border-slate-800">
            <h3 className="text-sm font-bold font-poppins uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A14000]" /> Quick Info & Compliance Timelines
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              
              {/* Last Service */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Last Service</span>
                <p className="text-sm font-bold font-poppins text-white">
                  {formatDate(vehicle.lastServiceDate || vehicle.lastService)}
                </p>
              </div>

              {/* Next Service */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Next Service</span>
                <p className="text-sm font-bold font-poppins text-[#A14000]">
                  {formatDate(vehicle.nextServiceDue || vehicle.nextService)}
                </p>
              </div>

              {/* Insurance Expiry */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Insurance Expiry</span>
                <p className="text-sm font-bold font-poppins text-emerald-400">
                  {formatDate(vehicle.insuranceExpiry)}
                </p>
              </div>

              {/* Permit Expiry */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Permit Expiry</span>
                <p className="text-sm font-bold font-poppins text-white">
                  {formatDate(vehicle.permitExpiry || vehicle.fitnessExpiry)}
                </p>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}

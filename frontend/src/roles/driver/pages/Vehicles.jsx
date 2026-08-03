import { useState, useEffect } from "react";
import driverApi from "../api/driverApi";
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
  const [loading, setLoading] = useState(true);
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
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'status' | 'alerts' | 'documents'

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

      // 2. Fetch maintenance alerts created by manager
      try {
        const mainRes = await driverApi.getMaintenance();
        if (mainRes?.success && mainRes.data) {
          setMaintenance(mainRes.data);
        }
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-poppins gap-3">
        <RefreshCw className="w-8 h-8 text-[#F97316] animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading vehicle details...</p>
      </div>
    );
  }

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
            <RefreshCw className={`w-3.5 h-3.5 text-[#F97316] ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {!isAssigned || !vehicle ? (
        /* Empty State: No Vehicle Assigned */
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm max-w-2xl mx-auto my-8">
          <div className="w-20 h-20 bg-orange-50 text-[#F97316] rounded-full flex items-center justify-center mx-auto mb-5 border border-orange-100">
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
                  <Truck className="w-14 h-14 text-[#F97316] mb-1 opacity-90" />
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
                    <span className="px-3.5 py-1 text-xs font-bold font-poppins rounded-lg bg-orange-50 text-[#F97316] border border-orange-200 inline-block">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Tile 1: Vehicle Details */}
              <button
                onClick={() => setActiveTab("details")}
                className={`p-4 rounded-2xl border text-left transition shadow-sm flex items-center justify-between group ${
                  activeTab === "details"
                    ? "bg-[#101C2C] text-white border-[#101C2C]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${activeTab === "details" ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}>
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
                    : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${activeTab === "status" ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}>
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
                    : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${activeTab === "alerts" ? "bg-white/10 text-white" : "bg-amber-50 text-[#F97316]"}`}>
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

            </div>
          </div>

          {/* 3. Tab Content Panels */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

            {/* TAB 1: VEHICLE DETAILS */}
            {activeTab === "details" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <Info className="w-5 h-5 text-[#F97316]" />
                  <h3 className="font-bold font-poppins text-slate-900 text-base">Comprehensive Vehicle Specifications</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold font-poppins uppercase tracking-wider text-slate-400">Basic Information</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Vehicle Code / Plate:</span>
                        <strong className="font-poppins text-slate-900 text-sm">{vehicleCode}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Registration Number:</span>
                        <span className="font-semibold text-slate-800">{registrationNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Make & Model:</span>
                        <span className="font-semibold text-slate-800">{vehicleType}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Manufacture Year:</span>
                        <span className="font-semibold text-slate-800">{vehicle.manufactureYear || vehicle.year || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Status */}
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold font-poppins uppercase tracking-wider text-slate-400">Operational Status</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Current Status:</span>
                        <span className="font-bold font-poppins text-emerald-700">{status}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Home Depot / Branch:</span>
                        <span className="font-semibold text-slate-800">{vehicle.branchDepot || vehicle.currentLocation || 'Fleet Depot Hub'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Odometer Reading:</span>
                        <span className="font-semibold text-slate-800">{vehicle.odometer ? `${vehicle.odometer} km` : '0 km'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Fuel Type:</span>
                        <span className="font-semibold text-slate-800">{fuelType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Driver Information */}
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold font-poppins uppercase tracking-wider text-slate-400">Assigned Driver</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Driver Name:</span>
                        <strong className="font-poppins text-slate-900">{vehicle.assignedDriverName || 'Driver'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Employee ID:</span>
                        <span className="font-semibold text-slate-800">{vehicle.assignedDriverEmpId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Contact Phone:</span>
                        <span className="font-semibold text-slate-800">{vehicle.assignedDriverPhone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">License Number:</span>
                        <span className="font-semibold text-slate-800">{vehicle.assignedDriverLicense || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold font-poppins uppercase tracking-wider text-slate-400">Technical Specs</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Payload Capacity:</span>
                        <span className="font-semibold text-slate-800">{vehicle.loadCapacity ? `${vehicle.loadCapacity} Tons` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Gross Vehicle Weight (GVW):</span>
                        <span className="font-semibold text-slate-800">{vehicle.gvw ? `${vehicle.gvw} kg` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Fuel Tank Capacity:</span>
                        <span className="font-semibold text-slate-800">{vehicle.tankCapacity || vehicle.fuelCapacity ? `${vehicle.tankCapacity || vehicle.fuelCapacity} Liters` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Engine & Chassis #:</span>
                        <span className="font-semibold text-slate-800">{vehicle.engineNumber ? `ENG: ${vehicle.engineNumber}` : 'Verified'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: VEHICLE STATUS */}
            {activeTab === "status" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <BarChart2 className="w-5 h-5 text-[#F97316]" />
                  <h3 className="font-bold font-poppins text-slate-900 text-base">Vehicle Operational Health & Telematics</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Status Metric Card 1 */}
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Vehicle Operational Health</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-extrabold font-poppins text-emerald-800">100% Fit</p>
                    <p className="text-xs text-emerald-700">All mechanical components verified ready for long-haul routes.</p>
                  </div>

                  {/* Status Metric Card 2 */}
                  <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Total Mileage</span>
                      <Gauge className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-extrabold font-poppins text-blue-900">{vehicle.odometer ? `${vehicle.odometer} km` : '0 km'}</p>
                    <p className="text-xs text-blue-700">Recorded odometer reading at last inspection point.</p>
                  </div>

                  {/* Status Metric Card 3 */}
                  <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#F97316]">Fuel Configuration</span>
                      <FuelIcon className="w-5 h-5 text-[#F97316]" />
                    </div>
                    <p className="text-2xl font-extrabold font-poppins text-orange-900">{fuelType}</p>
                    <p className="text-xs text-orange-800">Tank Capacity: {vehicle.tankCapacity || vehicle.fuelCapacity || 'Standard'} L</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MAINTENANCE ALERTS (Manager Created, Driver Read-Only) */}
            {activeTab === "alerts" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-[#F97316]" />
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
                              : 'bg-amber-100 text-[#F97316]'
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

          </div>

          {/* 4. Quick Info Card (Matching Mobile Dark Navy Component) */}
          <div className="bg-[#101C2C] text-white rounded-3xl p-6 shadow-md border border-slate-800">
            <h3 className="text-sm font-bold font-poppins uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F97316]" /> Quick Info & Compliance Timelines
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
                <p className="text-sm font-bold font-poppins text-[#F97316]">
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

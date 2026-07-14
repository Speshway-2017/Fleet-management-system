import { formatIFD, formatIFDWithTime } from '@/utils/dateUtils';
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Loader,
  Edit,
  Trash2,
  X,
  Download,
  Eye,
  Calendar
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import ScheduleFromNotificationModal from "@/components/common/ScheduleFromNotificationModal";
import "../dashboard/manager.css";

const INITIAL_WORK_ORDERS = [
  {
    id: "wo1",
    vehicleId: "MH-12-AB-5678",
    vehicleName: "Ashok Leyland 3118",
    serviceType: "Tire Rotation",
    scheduledDate: "2026-07-10",
    status: "Scheduled",
    cost: "₹4,500.00",
    specialist: "Dayanand M",
    garage: "G-Tech Car Care, Pune Bypass"
  },
  {
    id: "wo2",
    vehicleId: "KA-02-AB-1456",
    vehicleName: "Tata Ace Gold",
    serviceType: "Engine Oil Change",
    scheduledDate: "2026-07-12",
    status: "In Progress",
    cost: "₹3,200.00",
    specialist: "Karan Singh",
    garage: "HP garage hub, Mumbai Corridor"
  },
  {
    id: "wo3",
    vehicleId: "AP-39-EP-9465",
    vehicleName: "Bharat Benz 211",
    serviceType: "Brake Inspection",
    scheduledDate: "2026-07-15",
    status: "Scheduled",
    cost: "₹2,800.00",
    specialist: "Ramesh P",
    garage: "Speedway Center, Bangalore road"
  }
];

import { managerApi } from "../api/managerApi";

export default function MaintenanceManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [workOrders, setWorkOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [prefilledData, setPrefilledData] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [isUpdatingId, setIsUpdatingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({
    serviceType: "",
    scheduledDate: "",
    garage: "",
    cost: "",
    comments: ""
  });
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(13); // Default to July 13th
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Helper to generate correct calendar day cells for July 2026
  const getCalendarDays = () => {
    const cells = [];
    // July 1st 2026 is Wednesday (getDay() = 3).
    // In our M-S grid we need Monday (June 29) and Tuesday (June 30) offsets.
    cells.push({ day: 29, isCurrentMonth: false, monthOffset: -1 });
    cells.push({ day: 30, isCurrentMonth: false, monthOffset: -1 });
    
    // July days 1 to 31
    for (let d = 1; d <= 31; d++) {
      cells.push({ day: d, isCurrentMonth: true, monthOffset: 0 });
    }
    
    // August padding to fill 42 cells (6 rows of 7 days)
    for (let d = 1; d <= 9; d++) {
      cells.push({ day: d, isCurrentMonth: false, monthOffset: 1 });
    }
    return cells;
  };

  const fetchWorkOrders = async () => {
    try {
      const response = await managerApi.getMaintenance();
      const result = response.data?.data || response.data;
      if (Array.isArray(result)) {
        setWorkOrders(
          result
            .map(w => ({ ...w, id: w._id }))
            .sort((a, b) => {
              const isCompA = a.status === "Completed";
              const isCompB = b.status === "Completed";
              if (!isCompA && isCompB) return -1;
              if (isCompA && !isCompB) return 1;
              const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
              const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
              return dateB - dateA;
            })
        );
      } else {
        setWorkOrders([]);
      }
    } catch (error) {
      toast.error("Failed to load work orders from database");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Check if navigated from notification with schedule intent
  useEffect(() => {
    if (location.state?.openSchedule) {
      setPrefilledData({
        vehicleNumber: location.state.vehicleNumber || "",
        maintenanceType: location.state.maintenanceType || "General Service",
        dueMileage: location.state.dueMileage || ""
      });
      setShowScheduleModal(true);
      
      // Clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Load from database
  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleStartService = async (orderId, e) => {
    e.stopPropagation();
    setIsUpdatingId(orderId);
    try {
      await managerApi.updateMaintenance(orderId, { status: "In Progress" });
      const updated = workOrders.map(w =>
        w.id === orderId ? { ...w, status: "In Progress" } : w
      );
      setWorkOrders(updated);
      toast.success("Service started at garage!");
      await fetchWorkOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start service.");
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleCompleteOrder = async (orderId, e) => {
    e.stopPropagation();
    setIsUpdatingId(orderId);
    try {
      await managerApi.updateMaintenance(orderId, { status: "Completed" });
      const updated = workOrders.map(w =>
        w.id === orderId ? { ...w, status: "Completed" } : w
      );
      setWorkOrders(updated);
      toast.success("Maintenance work order completed successfully!");
      await fetchWorkOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete order.");
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setIsDeletingId(orderId);
    try {
      await managerApi.deleteMaintenance(orderId);
      const updated = workOrders.filter(w => w.id !== orderId);
      setWorkOrders(updated);
      toast.success("Work order deleted successfully");
      await fetchWorkOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete work order.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    setEditFormData({
      serviceType: order.serviceType || "General Service",
      scheduledDate: order.scheduledDate || "",
      garage: order.garage || "",
      cost: order.cost || "",
      comments: order.comments || ""
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      await managerApi.updateMaintenance(editingOrder.id, editFormData);
      toast.success("Work order updated successfully!");
      setShowEditModal(false);
      setEditingOrder(null);
      fetchWorkOrders();
    } catch (err) {
      toast.error("Failed to update work order");
      console.error(err);
    }
  };

  const handleDownloadInvoice = (w) => {
    const costVal = parseFloat(String(w.cost || 0).replace(/[^\d.]/g, ""));
    const taxVal = costVal * 0.18;
    const totalVal = costVal + taxVal;
    
    const invoiceContent = `==================================================
              FLEET MANAGEMENT SYSTEM
                 MAINTENANCE INVOICE
==================================================
Invoice Date  : ${new Date().toLocaleDateString("en-IN")}
Order ID      : ${w.id.toUpperCase()}
Status        : COMPLETED

--------------------------------------------------
VEHICLE DETAILS
--------------------------------------------------
Vehicle ID    : ${w.vehicleId}
Vehicle Name  : ${w.vehicleName}

--------------------------------------------------
SERVICE DETAILS
--------------------------------------------------
Service Type  : ${w.serviceType}
Scheduled Date: ${formatIFD()}
Garage Name   : ${w.garage || "N/A"}

--------------------------------------------------
COST SUMMARY
--------------------------------------------------
Service Cost  : INR ${costVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Tax (18% GST) : INR ${taxVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
--------------------------------------------------
TOTAL AMOUNT  : INR ${totalVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
--------------------------------------------------

Thank you for your business!
For support, contact: maintenance@fleetmgmt.com
==================================================`;

    const blob = new Blob([invoiceContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice-${w.vehicleId.replace(/\s+/g, "-")}-${w.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded successfully!");
  };

  const filteredOrders = workOrders.filter(w => {
    const q = search.toLowerCase();
    return (
      w.vehicleId.toLowerCase().includes(q) ||
      w.vehicleName.toLowerCase().includes(q) ||
      w.serviceType.toLowerCase().includes(q)
    );
  });

  const inServiceCount = workOrders.filter(w => {
    if (w.status === "Completed") return false;
    if (w.status === "In Progress") return true;
    if (w.status === "Scheduled") {
      const target = new Date(w.scheduledDate);
      target.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return target <= today;
    }
    return false;
  }).length;
  const overdueCount = workOrders.filter(w => new Date(w.scheduledDate) < new Date() && w.status !== "Completed").length;
  const completedCount = workOrders.filter(w => w.status === "Completed").length;
  const upcomingCount = workOrders.filter(w => w.status === "Scheduled").length;

  const selectedDayOrders = workOrders.filter(w => {
    const wDate = new Date(w.scheduledDate);
    return wDate.getFullYear() === 2026 &&
           wDate.getMonth() === 6 &&
           wDate.getDate() === selectedCalendarDay;
  });

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-4 mb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Maintenance Management
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">
            Manage vehicle servicing, schedule garage work orders, and track mechanics logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 select-none">
          <button
            onClick={() => navigate("/manager/maintenance")}
            className="px-4 py-2 bg-[#B45A0A] text-white border border-[#B45A0A] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Overview
          </button>
          <button
            onClick={() => navigate("/manager/maintenance/upcoming")}
            className="px-4 py-2 bg-white text-[#64748B] hover:text-[#1E293B] border border-[#E7EAF0] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Upcoming Services
          </button>
          <button
            onClick={() => navigate("/manager/maintenance/schedule")}
            className="px-4 py-2 bg-white text-[#64748B] border border-[#E7EAF0] hover:text-[#1E293B] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Service</span>
          </button>
        </div>
      </div>

      {/* Stats left columns & Calendar right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm flex flex-col gap-4 hover-card-trigger">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Vehicles In Service</span>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#B45A0A] flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-1">
              <h3 className="text-3xl font-bold text-[#1E293B] font-poppins tracking-tight leading-none">
                {inServiceCount < 10 ? `0${inServiceCount}` : inServiceCount}
              </h3>
            </div>
            <div className="mt-1 flex">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-[#B45A0A] font-nunito">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B45A0A]" />
                <span>{inServiceCount} Active Logs</span>
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm flex flex-col gap-4 hover-card-trigger">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Overdue Service</span>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div className="mt-1">
              <h3 className="text-3xl font-bold text-red-600 font-poppins tracking-tight leading-none">
                {overdueCount < 10 ? `0${overdueCount}` : overdueCount}
              </h3>
            </div>
            <div className="mt-1 flex">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 font-nunito">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Action Required</span>
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm flex flex-col gap-4 hover-card-trigger">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Upcoming Services</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-1">
              <h3 className="text-3xl font-bold text-blue-600 font-poppins tracking-tight leading-none">
                {upcomingCount < 10 ? `0${upcomingCount}` : upcomingCount}
              </h3>
            </div>
            <div className="mt-1 flex">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 font-nunito">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Scheduled Queue</span>
              </span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm flex flex-col gap-4 hover-card-trigger">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Completed Services</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-1">
              <h3 className="text-3xl font-bold text-emerald-600 font-poppins tracking-tight leading-none">
                {completedCount < 10 ? `0${completedCount}` : completedCount}
              </h3>
            </div>
            <div className="mt-1 flex">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 font-nunito">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Compliance Cleared</span>
              </span>
            </div>
          </div>

        </div>

        {/* Calendar widget */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm select-none flex flex-col gap-1">
          <div>
            <div className="flex items-center justify-between border-b border-[#E7EAF0]/60 pb-2 mb-2">
              <span className="text-xs font-bold text-[#1E293B] font-poppins">Service Calendar</span>
              <span className="text-[10px] font-bold text-[#B45A0A] uppercase tracking-wider font-poppins">July 2026</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#64748B] mb-1 font-poppins">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium font-poppins">
              {getCalendarDays().map((cell, idx) => {
                const hasService = cell.isCurrentMonth && workOrders.some(w => {
                  const wDate = new Date(w.scheduledDate);
                  return wDate.getFullYear() === 2026 && wDate.getMonth() === 6 && wDate.getDate() === cell.day;
                });
                
                const isSelected = cell.isCurrentMonth && cell.day === selectedCalendarDay;
                
                return (
                  <button
                    key={`${cell.monthOffset}-${cell.day}-${idx}`}
                    onClick={() => {
                      if (cell.isCurrentMonth) {
                        setSelectedCalendarDay(cell.day);
                      }
                    }}
                    className={`relative w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs transition-all cursor-pointer ${
                      !cell.isCurrentMonth
                        ? "text-gray-200 pointer-events-none"
                        : isSelected
                          ? "bg-[#B45A0A] text-white font-black shadow-md shadow-[#B45A0A]/20"
                          : "text-slate-800 hover:bg-slate-100 font-semibold"
                    }`}
                  >
                    {cell.day}
                    {hasService && !isSelected && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 bg-[#B45A0A] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day scheduled services list */}
          <div className="mt-3 pt-3 border-t border-[#E7EAF0]/60 text-left">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5 font-poppins">
              Scheduled on {selectedCalendarDay} Jul 2026:
            </span>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
              {selectedDayOrders.length === 0 ? (
                <span className="text-[11px] text-[#94A3B8] font-medium font-nunito block py-2">
                  No services scheduled for this date.
                </span>
              ) : (
                selectedDayOrders.map(w => (
                  <div
                    key={w.id}
                    onClick={() => navigate(`/manager/maintenance/details/${w.id}`)}
                    className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col gap-0.5 hover:border-[#B45A0A] hover:bg-[#F1F5F9] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-800 uppercase truncate max-w-[120px] font-poppins">
                        {w.vehicleId}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider scale-90 origin-right ${
                        w.status === "In Progress"
                          ? "bg-amber-50 text-[#B45A0A]"
                          : w.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-blue-600"
                      }`}>
                        {w.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-semibold truncate">
                      {w.vehicleName}
                    </span>
                    <span className="text-[9px] text-[#B45A0A] font-bold truncate">
                      {w.serviceType}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      {/* Schedule Maintenance Modal — triggered from Notifications */}
      {showScheduleModal && prefilledData && (
        <ScheduleFromNotificationModal
          prefilled={prefilledData}
          onClose={() => { setShowScheduleModal(false); setPrefilledData(null); }}
          onScheduled={() => {
            fetchWorkOrders();
          }}
        />
      )}
      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col mt-6">
        <div className="px-6 py-5 border-b border-[#E7EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white">
          <h3 className="font-poppins font-black text-lg text-[#1E293B]">Service History</h3>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search work orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] font-medium w-[220px]"
              />
            </div>

            <button className="px-4 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] flex items-center gap-2 cursor-pointer">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                <th className="py-4 px-6">Vehicle ID</th>
                <th className="py-4 px-6">Vehicle Name</th>
                <th className="py-4 px-6">Service Type</th>
                <th className="py-4 px-6">Scheduled Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium font-nunito">
                    No work orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(w => (
                  <tr
                    key={w.id}
                    className="hover:bg-[#F5F7FB]/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/manager/maintenance/details/${w.id}`)}
                  >
                    <td className="py-4 px-6 font-bold text-xs text-[#1E293B] font-poppins whitespace-nowrap">
                      {w.vehicleId}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#64748B] font-medium whitespace-nowrap">
                      {w.vehicleName}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#1E293B] font-semibold whitespace-nowrap">
                      {w.serviceType}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                      {formatIFD()}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${w.status === "In Progress"
                          ? "bg-amber-50 text-[#B45A0A] border border-amber-100"
                          : w.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2.5">
                        {w.status === "Scheduled" ? (
                          <button
                            onClick={(e) => handleStartService(w.id, e)}
                            disabled={isUpdatingId === w.id}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-[10px] font-black shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 justify-center min-w-fit"
                          >
                            {isUpdatingId === w.id ? (
                              <>
                                <Loader className="w-3.5 h-3.5 animate-spin" />
                                Starting...
                              </>
                            ) : (
                              "Start Service"
                            )}
                          </button>
                        ) : w.status === "In Progress" ? (
                          <button
                            onClick={(e) => handleCompleteOrder(w.id, e)}
                            disabled={isUpdatingId === w.id}
                            className="px-3.5 py-1.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-[10px] font-black shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 justify-center min-w-fit"
                          >
                            {isUpdatingId === w.id ? (
                              <>
                                <Loader className="w-3.5 h-3.5 animate-spin" />
                                Completing...
                              </>
                            ) : (
                              "Complete"
                            )}
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-xs flex items-center justify-end gap-1 select-none">
                            <CheckCircle className="w-4 h-4" />
                            Ready
                          </span>
                        )}

                        {w.status === "Completed" ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setViewingInvoice(w);
                                setShowInvoiceModal(true);
                              }}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="View Invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadInvoice(w)}
                              className="p-1.5 text-[#B45A0A] hover:text-[#9A4D08] hover:bg-[#B45A0A]/5 rounded-lg transition-colors cursor-pointer"
                              title="Download Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(w)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Service"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this work order?")) {
                                  handleDeleteOrder(w.id);
                                }
                              }}
                              disabled={isDeletingId === w.id}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete Service"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#E7EAF0]/60 flex items-center justify-between bg-white shrink-0 select-none">
          <span className="text-xs text-[#64748B] font-medium font-poppins">
            Showing <span className="font-bold text-[#1E293B]">{filteredOrders.length}</span> of {workOrders.length} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button disabled className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-400 font-bold opacity-60">Prev</button>
            <button disabled className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-400 font-bold opacity-60">Next</button>
          </div>
        </div>
      </div>
      {/* Edit Maintenance Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in" onClick={(e) => { e.stopPropagation(); }}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-lg animate-scale-up flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E7EAF0] shrink-0">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#B45A0A]" />
                Edit Maintenance Order
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingOrder(null); }}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 font-nunito text-left overflow-y-auto flex-1 pr-1.5 custom-scrollbar">
              <div className="bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-semibold">Vehicle Number:</span>
                  <span className="font-bold text-[#1E293B] uppercase">{editingOrder.vehicleId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-semibold">Vehicle Name:</span>
                  <span className="font-bold text-[#1E293B]">{editingOrder.vehicleName}</span>
                </div>
              </div>

              {/* Service Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Service Type *</label>
                <select
                  value={editFormData.serviceType}
                  onChange={(e) => setEditFormData({ ...editFormData, serviceType: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] bg-white"
                  required
                >
                  <option value="General Service">General Service</option>
                  <option value="Engine Tune-up">Engine Tune-up</option>
                  <option value="Brake Check">Brake Check</option>
                  <option value="Tire Change">Tire Change</option>
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Scheduled Date *</label>
                <input
                  type="date"
                  value={editFormData.scheduledDate}
                  onChange={(e) => setEditFormData({ ...editFormData, scheduledDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A]"
                  required
                />
              </div>

              {/* Garage */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Garage/Workshop *</label>
                <input
                  type="text"
                  value={editFormData.garage}
                  onChange={(e) => setEditFormData({ ...editFormData, garage: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A]"
                  required
                />
              </div>

              {/* Cost */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Estimated Cost *</label>
                <input
                  type="text"
                  value={editFormData.cost}
                  onChange={(e) => setEditFormData({ ...editFormData, cost: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A]"
                  required
                />
              </div>

              {/* Comments */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Additional Comments</label>
                <textarea
                  value={editFormData.comments}
                  onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
                  className="w-full p-3 border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] h-20 resize-none"
                  placeholder="Add comments..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingOrder(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showInvoiceModal && viewingInvoice && (() => {
        const costVal = parseFloat(String(viewingInvoice.cost || 0).replace(/[^\d.]/g, ""));
        const taxVal = costVal * 0.18;
        const totalVal = costVal + taxVal;
        
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in" onClick={() => { setShowInvoiceModal(false); setViewingInvoice(null); }}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-md animate-scale-up flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 shrink-0">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Invoice Details
                </h3>
                <button
                  onClick={() => { setShowInvoiceModal(false); setViewingInvoice(null); }}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Receipt Area */}
              <div className="overflow-y-auto flex-1 pr-1 space-y-4 font-nunito text-left">
                {/* Receipt Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#B45A0A]/5 rounded-full -mr-8 -mt-8" />
                  
                  <div className="text-center pb-4 border-b border-dashed border-slate-300">
                    <span className="text-xs font-black uppercase tracking-widest text-[#B45A0A] font-poppins">Fleet Management</span>
                    <h4 className="text-sm font-bold text-slate-800 font-poppins mt-0.5">MAINTENANCE RECEIPT</h4>
                    <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase tracking-wider rounded-full">
                      Paid & Completed
                    </span>
                  </div>

                  <div className="py-4 space-y-3 text-xs border-b border-dashed border-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Invoice No:</span>
                      <span className="text-slate-800 font-bold uppercase">{viewingInvoice.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Date:</span>
                      <span className="text-slate-800 font-bold">
                        {formatIFD()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Garage:</span>
                      <span className="text-slate-800 font-bold">{viewingInvoice.garage || "Primary Garage"}</span>
                    </div>
                  </div>

                  {/* Vehicle & Service Info */}
                  <div className="py-4 space-y-3 text-xs border-b border-dashed border-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Vehicle Name:</span>
                      <span className="text-slate-800 font-bold">{viewingInvoice.vehicleName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Plate Number:</span>
                      <span className="text-slate-800 font-bold uppercase">{viewingInvoice.vehicleId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Service Type:</span>
                      <span className="text-slate-800 font-bold text-[#B45A0A]">{viewingInvoice.serviceType}</span>
                    </div>
                  </div>

                  {/* Cost Summary */}
                  <div className="pt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Service Cost:</span>
                      <span className="text-slate-800 font-bold">
                        INR {costVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Tax (18% GST):</span>
                      <span className="text-slate-800 font-bold">
                        INR {taxVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                      <span className="text-slate-800 font-extrabold font-poppins">Total Amount:</span>
                      <span className="text-[#B45A0A] font-black font-poppins">
                        INR {totalVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                {viewingInvoice.comments && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-left">
                    <span className="text-slate-500 font-bold block mb-1">Service Comments:</span>
                    <p className="text-slate-700 font-medium italic">"{viewingInvoice.comments}"</p>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4 shrink-0">
                <button
                  onClick={() => handleDownloadInvoice(viewingInvoice)}
                  className="flex-1 px-4 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#B45A0A]/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Invoice</span>
                </button>
                <button
                  onClick={() => { setShowInvoiceModal(false); setViewingInvoice(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}

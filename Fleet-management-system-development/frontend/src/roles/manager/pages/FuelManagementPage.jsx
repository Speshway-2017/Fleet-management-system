import { useState, useEffect, useMemo } from "react";
import DashboardSkeletonLoader from "@/components/common/DashboardSkeletonLoader";
import {
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  CreditCard,
  Gauge,
  CheckCircle,
  FileText,
  X,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";
import { getSocket } from "@/api/socket";

import TableRowSkeleton from "@/components/common/TableRowSkeleton";
import { fuelSchema, validateForm } from "@/validations";
import { validateSearchQuery } from "@/validations/common.schema.js";
import {
  isEligibleApprovedFuel,
  calculateTotalFuelSpend,
  formatFuelSpendKPI,
  formatPaiseToIndianCurrency,
  parseAmountToPaise
} from "@/utils/fuelCalculations";


export default function FuelManagementPage() {
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    const err = validateSearchQuery(val, 50);
    setSearchError(err);
  };
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [activeBillUrl, setActiveBillUrl] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRecord, setRejectRecord] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApproveBill = async (logId) => {
    if (!logId) return;
    try {
      // 1. Optimistically update local logs immediately so KPI card updates in real-time
      setLogs(prev => prev.map(l => 
        (String(l.id || l._id) === String(logId)) 
          ? { ...l, approvalStatus: "Approved", billStatus: "Approved", status: l.status === "anomaly" ? l.status : "normal" } 
          : l
      ));
      
      // 2. Call backend update
      await managerApi.updateFuelRecord(logId, { approvalStatus: "Approved", billStatus: "Approved" });
      toast.success("Fuel bill approved successfully!");
      
      // 3. Sync latest from backend database
      await fetchRecords();
    } catch (error) {
      toast.error("Failed to approve fuel bill.");
      console.error(error);
      fetchRecords();
    }
  };

  const handleRejectBill = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    const targetId = rejectRecord?.id || rejectRecord?._id;
    if (!targetId) return;
    try {
      // Optimistically update local logs
      setLogs(prev => prev.map(l => 
        (String(l.id || l._id) === String(targetId)) 
          ? { ...l, approvalStatus: "Rejected", billStatus: "Rejected", rejectionReason: rejectReason } 
          : l
      ));
      await managerApi.updateFuelRecord(targetId, {
        approvalStatus: "Rejected",
        billStatus: "Rejected",
        rejectionReason: rejectReason
      });
      toast.success("Fuel bill rejected successfully!");
      setRejectModalOpen(false);
      setRejectRecord(null);
      setRejectReason("");
      await fetchRecords();
    } catch (error) {
      toast.error("Failed to reject fuel bill.");
      console.error(error);
      fetchRecords();
    }
  };

  const handleViewBill = (log) => {
    setSelectedLog(log);
    const url = log?.receiptImage || log?.billUrl || "";
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const baseOrigin = apiBase.replace("/api", "");
    const fullUrl = url && url.startsWith("/uploads") ? `${baseOrigin}${url}` : url;
    setActiveBillUrl(fullUrl);
    setBillModalOpen(true);
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionComment, setResolutionComment] = useState("");

  // Add/Edit Form State
  const [form, setForm] = useState({
    vehicleId: "",
    fuelStation: "",
    amount: "",
    liters: "",
    status: "normal",
    hasReceipt: true
  });

  const fetchRecords = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const response = await managerApi.getFuelRecords();
      const result = response.data?.data || response.data;
      if (Array.isArray(result)) {
        const sorted = [...result].sort((a, b) => {
          const tA = new Date(a.createdAt || a.date || a.timestamp || 0).getTime();
          const tB = new Date(b.createdAt || b.date || b.timestamp || 0).getTime();
          return tB - tA;
        });
        setLogs(sorted.map(l => {
          const rawAmt = l.amount !== undefined && l.amount !== null ? l.amount : (l.totalCost ?? l.cost ?? 0);
          const rawApproval = String(l.approvalStatus || l.billStatus || '').trim().toUpperCase();
          let approvalStatus = 'Pending';
          if (rawApproval === 'APPROVED' || rawApproval === 'VERIFIED' || rawApproval === 'APPROVE') {
            approvalStatus = 'Approved';
          } else if (rawApproval === 'REJECTED' || rawApproval === 'REJECT') {
            approvalStatus = 'Rejected';
          } else if (l.status === 'resolved') {
            approvalStatus = 'Approved';
          }

          const paise = parseAmountToPaise(rawAmt);
          const totalFormatted = formatPaiseToIndianCurrency(paise, true);

          return {
            ...l,
            id: l._id,
            amount: rawAmt,
            vehicleId: l.vehicleId || (l.vehicle && (l.vehicle.vehicleNumber || l.vehicle.registrationNumber || l.vehicle.plateNumber)) || "Unassigned",
            vehicleName: l.vehicleName || (l.vehicle && l.vehicle.name) || "Fleet Vehicle",
            driver: l.driver || (l.driverId && typeof l.driverId === 'object' ? l.driverId.fullName : l.driverId) || "Driver",
            fuelStation: l.fuelStation || l.stationName || l.station || "General Station",
            location: l.location || l.purchaseLocation || l.city || "Live GPS Location",
            odometer: l.odometer || l.odometerReading ? `${l.odometer || l.odometerReading} km` : "N/A",
            qty: `${l.liters || l.quantity || 0} L`,
            total: totalFormatted,
            approvalStatus,
            receiptImage: l.receiptImage || l.billUrl || "",
            billUrl: l.billUrl || l.receiptImage || "",
            timestamp: new Date(l.createdAt || l.dateTime || l.date || Date.now()).toLocaleDateString("en-IN", {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          };
        }));
      } else {
        setLogs([]);
      }
    } catch (error) {
      if (isInitial) toast.error("Failed to load fuel records from database");
      console.error(error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await managerApi.getVehicles();
      const rawVehicles = response.data?.data || response.data || [];
      const mappedVehicles = rawVehicles.map(v => ({
        ...v,
        name: v.vehicleName,
        plateNumber: v.vehicleNumber,
        driver: v.assignedDriver ? v.assignedDriver.fullName : "Unassigned"
      }));
      setVehicles(mappedVehicles);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    }
  };

  useEffect(() => {
    fetchRecords(true);
    fetchVehicles();

    const socket = getSocket();
    let cleanupSocket = () => {};

    if (socket) {
      const handleFuelUpdate = () => {
        fetchRecords(false);
      };
      socket.on("fuel:created", handleFuelUpdate);
      socket.on("fuel:updated", handleFuelUpdate);
      socket.on("fuel:status-updated", handleFuelUpdate);
      socket.on("fuel:deleted", handleFuelUpdate);
      socket.on("dashboard:refresh", handleFuelUpdate);

      cleanupSocket = () => {
        socket.off("fuel:created", handleFuelUpdate);
        socket.off("fuel:updated", handleFuelUpdate);
        socket.off("fuel:status-updated", handleFuelUpdate);
        socket.off("fuel:deleted", handleFuelUpdate);
        socket.off("dashboard:refresh", handleFuelUpdate);
      };
    }

    const interval = setInterval(() => {
      fetchRecords(false);
      fetchVehicles();
    }, 10000);
    return () => {
      clearInterval(interval);
      cleanupSocket();
    };
  }, []);

  const filteredLogs = logs.filter(l => {
    if (searchError) return false;
    const q = search.toLowerCase();
    const vId = l.vehicleId ? l.vehicleId.toLowerCase() : "";
    const driverName = l.driver ? l.driver.toLowerCase() : "";
    const station = l.fuelStation ? l.fuelStation.toLowerCase() : "";
    return (
      vId.includes(q) ||
      driverName.includes(q) ||
      station.includes(q)
    );
  });

  const totalSpend = useMemo(() => {
    return calculateTotalFuelSpend(logs);
  }, [logs]);

  const anomaliesCount = logs.filter(l => l.status === "anomaly").length;

  const handleResolveAnomaly = (log) => {
    setSelectedLog(log);
    setResolutionModalOpen(true);
  };

  const submitResolution = async (e) => {
    e.preventDefault();
    if (!resolutionComment.trim()) {
      toast.error("Please enter a resolution note.");
      return;
    }

    try {
      await managerApi.updateFuelRecord(selectedLog._id, {
        status: "resolved",
        resolutionComment: resolutionComment,
        fuelStation: `Resolved: ${selectedLog.fuelStation}`,
        amount: 0,
        liters: 0
      });

      setResolutionModalOpen(false);
      setSelectedLog(null);
      setResolutionComment("");
      toast.success("Fuel siphoning anomaly marked as resolved!");
      fetchRecords();
    } catch (error) {
      toast.error("Failed to resolve alert");
      console.error(error);
    }
  };

  const handleAddFuel = async (e) => {
    e.preventDefault();
    const result = validateForm(fuelSchema, form);
    if (!result.isValid) {
      const firstError = Object.values(result.errors)[0];
      toast.error(firstError || "Please fill in required fields");
      return;
    }

    if (!form.vehicleId || !form.amount || !form.liters) {
      toast.error("Please fill in required fields");
      return;
    }
    const selectedVehicle = vehicles.find(v => String(v._id) === String(form.vehicleId));
    if (!selectedVehicle) {
      toast.error("Vehicle not found");
      return;
    }

    try {
      await managerApi.createFuelRecord({
        vehicle: selectedVehicle._id,
        vehicleId: selectedVehicle.plateNumber,
        vehicleName: selectedVehicle.name,
        driver: selectedVehicle.driver || "Unassigned",
        fuelStation: form.fuelStation,
        amount: Number(form.amount),
        liters: Number(form.liters),
        status: form.status,
        hasReceipt: form.hasReceipt
      });
      setShowAddModal(false);
      setForm({ vehicleId: "", fuelStation: "", amount: "", liters: "", status: "normal", hasReceipt: true });
      toast.success("Fuel log added successfully");
      fetchRecords();
    } catch (error) {
      toast.error("Failed to add fuel record");
      console.error(error);
    }
  };

  const handleOpenEdit = (log) => {
    setSelectedRecord(log);
    setForm({
      vehicleId: log.vehicle?._id || log.vehicle || "",
      fuelStation: log.fuelStation,
      amount: log.amount,
      liters: log.liters,
      status: log.status,
      hasReceipt: log.hasReceipt
    });
    setShowEditModal(true);
  };

  const handleEditFuel = async (e) => {
    e.preventDefault();
    const selectedVehicle = vehicles.find(v => String(v._id) === String(form.vehicleId));
    try {
      await managerApi.updateFuelRecord(selectedRecord._id, {
        vehicle: selectedVehicle?._id || form.vehicleId,
        vehicleId: selectedVehicle?.plateNumber || selectedRecord.vehicleId,
        vehicleName: selectedVehicle?.name || selectedRecord.vehicleName,
        fuelStation: form.fuelStation,
        amount: Number(form.amount),
        liters: Number(form.liters),
        status: form.status,
        hasReceipt: form.hasReceipt
      });
      setShowEditModal(false);
      setSelectedRecord(null);
      toast.success("Fuel record updated successfully");
      fetchRecords();
    } catch (error) {
      toast.error("Failed to update fuel record");
      console.error(error);
    }
  };

  const handleOpenDelete = (log) => {
    setSelectedRecord(log);
    setShowDeleteConfirm(true);
  };

  const handleDeleteFuel = async () => {
    const targetId = selectedRecord?.id || selectedRecord?._id;
    if (!targetId) return;
    try {
      // Optimistically update local logs immediately so KPI card updates in real-time
      setLogs(prev => prev.filter(l => String(l.id || l._id) !== String(targetId)));
      await managerApi.deleteFuelRecord(targetId);
      setShowDeleteConfirm(false);
      setSelectedRecord(null);
      toast.success("Fuel record deleted successfully");
      fetchRecords();
    } catch (error) {
      toast.error("Failed to delete record");
      console.error(error);
      fetchRecords();
    }
  };

  const handleDownloadReceipt = (log) => {
    const receiptContent = `===========================================
               FLEET FUEL RECEIPT
===========================================
Invoice ID:      INV-${log.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}
Date:            July 06, 2026
Timestamp:       ${log.timestamp}
-------------------------------------------
VEHICLE DETAILS
Vehicle Plate:   ${log.vehicleId}
Model:           ${log.vehicleName}
Driver Assigned: ${log.driver}
-------------------------------------------
TRANSACTION DETAILS
Station Name:    ${log.fuelStation}
Fuel Type:       Diesel
Quantity:        ${log.qty}
Price per Liter: ₹95.00
Total Amount:    ${log.total}
-------------------------------------------
Payment Mode:    FASTag Fleet Wallet Auto-Pay
Status:          PAID & VERIFIED
===========================================
        THANK YOU FOR REFUELLING WITH US!
===========================================`;

    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Fuel_Receipt_${log.vehicleId.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Receipt for ${log.vehicleId} downloaded!`);
  };



  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0D1117] min-h-screen text-[#1E293B] dark:text-white font-nunito">
      <Breadcrumb />
      {/* Page Header */}
      <div className="border-b border-[#E7EAF0] dark:border-[#1E293B] pb-4 mb-6 select-none">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] dark:text-white leading-none">
            Fuel Management
          </h1>
          <p className="text-[16px] text-[#64748B] dark:text-slate-300 mt-2">
            Monitor diesel logs, average fleet efficiency, and resolve fuel siphoning alerts.
          </p>
        </div>
      </div>

      {/* --- KPI SECTION --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* KPI 1: Fuel Spend */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E7EAF0] dark:border-[#1E293B] p-6 shadow-sm flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 tracking-wider uppercase block truncate font-poppins">Total Fuel Spend</span>
              {loading ? (
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-2" />
              ) : (
                <h3 
                  className="text-2xl font-extrabold text-gray-800 dark:text-white mt-2 truncate font-poppins"
                  title={totalSpend?.formattedTotal || "₹0.00"}
                >
                  {totalSpend?.compactFormattedTotal || totalSpend?.formattedTotal || "₹0.00"}
                </h3>
              )}
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 p-3 rounded-xl shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 dark:text-emerald-400 gap-1 font-semibold truncate">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">+22.4% vs last month</span>
          </div>
        </div>

        {/* KPI 2: Anomalies */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E7EAF0] dark:border-[#1E293B] p-6 shadow-sm flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 tracking-wider uppercase block truncate font-poppins">Theft & Anomalies</span>
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-2" />
              ) : (
                <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-2 truncate font-poppins">
                  {anomaliesCount < 10 ? `0${anomaliesCount}` : anomaliesCount}
                </h3>
              )}
            </div>
            <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-3 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-red-500 dark:text-red-400 font-semibold flex items-center gap-1.5 truncate">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{anomaliesCount} High Priority Alerts</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E7EAF0] dark:border-[#1E293B] shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Filter controls */}
        <div className="px-6 py-5 border-b border-[#E7EAF0] dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A]">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white font-poppins">Recent Fuel Entries</h3>

          <div className="flex items-center gap-3">
            {/* Search field */}
            <div className="flex flex-col">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-400" />
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Search vehicle or driver..."
                  value={search}
                  onChange={handleSearchChange}
                  className={`pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none font-medium w-[220px] transition-all bg-white dark:bg-slate-900 text-slate-800 dark:text-white ${
                    searchError
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-200 dark:border-slate-800 focus:border-amber-700"
                  }`}
                />
              </div>
              {searchError && (
                <p className="text-xs text-red-500 mt-1 font-medium font-poppins">{searchError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm font-nunito">
              <thead>
                <tr className="bg-[#F5F7FB] dark:bg-slate-900/60 border-b border-[#E7EAF0] dark:border-[#1E293B] text-[#64748B] dark:text-slate-400 font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                  <th className="py-4 px-6 min-w-[150px]">Vehicle</th>
                  <th className="py-4 px-6 min-w-[130px]">Driver</th>
                  <th className="py-4 px-6 min-w-[180px]">Fuel Station</th>
                  <th className="py-4 px-6 min-w-[120px]">Amount</th>
                  <th className="py-4 px-6 min-w-[100px]">Liters</th>
                  <th className="py-4 px-6 min-w-[130px]">Date</th>
                  <th className="py-4 px-6 min-w-[130px]">Approval Status</th>
                  <th className="py-4 px-6 min-w-[90px] text-center">Receipt</th>
                  <th className="py-4 px-6 min-w-[150px] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF0]/60 dark:divide-slate-800/60">
                {loading ? (
                  <TableRowSkeleton columns={9} rows={5} />
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 dark:text-slate-400 font-medium font-nunito">
                      No fuel logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(l => (
                    <tr
                      key={l.id}
                      className={`hover:bg-[#F5F7FB]/50 dark:hover:bg-slate-800/30 transition-colors ${l.status === "anomaly" ? "bg-red-50/30 dark:bg-red-950/20" : ""}`}
                    >
                      {/* Vehicle */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5 min-w-0 max-w-[180px]">
                          <div className={`w-1 h-8 rounded-full shrink-0 ${l.status === "anomaly"
                            ? "bg-red-500"
                            : l.status === "resolved"
                              ? "bg-green-500"
                              : "bg-amber-700"
                            }`} />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-800 dark:text-white text-xs truncate" title={l.vehicleId}>{l.vehicleId}</p>
                            <span className="text-[10px] text-gray-500 dark:text-slate-400 block mt-0.5 truncate" title={l.vehicleName}>{l.vehicleName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Driver */}
                      <td className="py-4 px-6">
                        <div className="min-w-0 max-w-[150px]">
                          <p className="font-bold text-gray-800 dark:text-white text-xs truncate" title={l.driver}>{l.driver}</p>
                          <span className="text-[10px] text-gray-500 dark:text-slate-400 block mt-0.5 truncate" title={l.driverId || "—"}>{l.driverId || "—"}</span>
                        </div>
                      </td>

                      {/* Fuel Station */}
                      <td className="py-4 px-6">
                        <div className="min-w-0 max-w-[220px]">
                          <p className="font-bold text-gray-800 dark:text-white text-xs truncate" title={l.fuelStation}>{l.fuelStation}</p>
                          <span className="text-[10px] text-gray-500 dark:text-slate-400 block mt-0.5 truncate" title={l.location || "Live GPS Location"}>
                            {l.location || "Live GPS Location"}
                          </span>
                        </div>
                      </td>

                      {/* Total Spend / Amount */}
                      <td className="py-4 px-6">
                        <div className="min-w-0 max-w-[130px]">
                          <span className="text-xs font-black text-gray-900 dark:text-white truncate block font-poppins" title={l.total}>
                            {l.total}
                          </span>
                        </div>
                      </td>

                      {/* Liters */}
                      <td className="py-4 px-6">
                        <div className="min-w-0 max-w-[100px]">
                          <span className="text-xs font-black text-gray-900 dark:text-white truncate block font-poppins" title={l.qty}>
                            {l.qty}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                        {l.timestamp}
                      </td>

                      {/* Approval Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span 
                          title={l.rejectionReason ? `Reason: ${l.rejectionReason}` : ""}
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border select-none ${
                            l.approvalStatus === "Approved" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" :
                            l.approvalStatus === "Rejected" ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800 cursor-help" :
                            "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800"
                          }`}
                        >
                          {l.approvalStatus || "Pending"}
                        </span>
                      </td>

                      {/* Receipt Column */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleViewBill(l)}
                          className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        >
                          View
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {(l.approvalStatus || "Pending") === "Pending" && (
                            <>
                              <button
                                onClick={() => handleApproveBill(l.id || l._id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm shadow-emerald-600/10"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectRecord(l);
                                  setRejectReason("");
                                  setRejectModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm shadow-red-600/10"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(l.approvalStatus || "Pending") !== "Pending" && (
                            <span className="text-xs text-gray-400 dark:text-slate-400 font-medium">
                              {l.approvalStatus}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>

        {/* Table Footer info */}
        <div className="px-6 py-4 border-t border-[#E7EAF0] dark:border-[#1E293B] flex items-center justify-between bg-white dark:bg-[#0F172A] select-none">
          <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
            Showing <span className="font-bold text-gray-800 dark:text-white">{filteredLogs.length}</span> of {logs.length} entries
          </span>
        </div>
      </div>

      {/* Modals removed for manager read-only restriction */}

      {/* Resolution Modal */}
      {resolutionModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] select-none">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-md flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h4 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Resolve Theft Anomaly
              </h4>
              <button
                onClick={() => setResolutionModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-gray-500 space-y-1 font-nunito">
              <p><strong>Vehicle:</strong> {selectedLog.vehicleId} ({selectedLog.vehicleName})</p>
              <p><strong>Driver:</strong> {selectedLog.driver}</p>
              <p><strong>Reported Event:</strong> {selectedLog.fuelStation} ({selectedLog.qty} siphoned)</p>
            </div>

            <form onSubmit={submitResolution} className="space-y-4 font-nunito">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Resolution Action / Comments</label>
                <textarea
                  placeholder="Describe resolution (e.g. Sourced driver logs, fuel loss reimbursed by vendor, sensor recalibrated...)"
                  value={resolutionComment}
                  onChange={(e) => setResolutionComment(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-700 h-24 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setResolutionModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Rejection Modal */}
      {rejectModalOpen && rejectRecord && (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] select-none font-poppins">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-md flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h4 className="font-bold text-sm text-gray-800 flex items-center gap-1.5 font-poppins">
                <X className="w-4 h-4 text-red-600 animate-pulse" />
                Reject Fuel Bill
              </h4>
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectRecord(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-gray-500 space-y-1 font-nunito">
              <p><strong>Vehicle:</strong> {rejectRecord.vehicleId}</p>
              <p><strong>Driver:</strong> {rejectRecord.driver}</p>
              <p><strong>Amount:</strong> {rejectRecord.total}</p>
            </div>

            <form onSubmit={handleRejectBill} className="space-y-4 font-nunito">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Rejection Reason *</label>
                <textarea
                  placeholder="Specify why this fuel bill is being rejected..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-red-500 h-24 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectRecord(null);
                  }}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Reject Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill View & Driver Entry Details Modal */}
      {billModalOpen && (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] select-none font-poppins">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-lg flex flex-col space-y-4 max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 shrink-0">
              <div>
                <h4 className="font-bold text-sm text-gray-800 flex items-center gap-1.5 font-poppins">
                  <FileText className="w-4 h-4 text-amber-700" />
                  Fuel Entry Details & Receipt
                </h4>
                {selectedLog && (
                  <p className="text-[10px] text-gray-400 font-bold font-mono mt-0.5">
                    Log ID: #{selectedLog.id ? String(selectedLog.id).slice(-6).toUpperCase() : "REF-LOG"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setBillModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Itemized Driver-Entered Summary Card */}
              {selectedLog && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5 font-nunito shadow-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500 font-semibold font-poppins">Approval Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      selectedLog.approvalStatus === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      selectedLog.approvalStatus === "Rejected" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {selectedLog.approvalStatus || "Pending"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-poppins">Driver Name</span>
                      <span className="font-bold text-slate-800 break-words" title={selectedLog.driver}>{selectedLog.driver}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-poppins">Vehicle Plate</span>
                      <span className="font-bold text-slate-800 font-mono break-words" title={selectedLog.vehicleId}>{selectedLog.vehicleId}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-poppins">Station Name</span>
                      <span className="font-bold text-slate-800 break-words" title={selectedLog.fuelStation}>{selectedLog.fuelStation}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-poppins">GPS Location</span>
                      <span className="font-bold text-slate-800 break-words" title={selectedLog.location || "Auto-captured via GPS"}>{selectedLog.location || "Auto-captured via GPS"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-white rounded-lg border border-slate-200/80 text-xs">
                    <div className="min-w-0">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold font-poppins truncate">Liters Refueled</span>
                      <span className="font-extrabold text-slate-900 text-sm font-poppins truncate block" title={selectedLog.qty}>{selectedLog.qty}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold font-poppins truncate">Total Amount</span>
                      <span className="font-extrabold text-[#A14000] text-sm font-poppins truncate block" title={selectedLog.total}>{selectedLog.total}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold font-poppins truncate">Odometer</span>
                      <span className="font-bold text-slate-800 text-xs font-poppins mt-0.5 block truncate" title={selectedLog.odometer}>{selectedLog.odometer}</span>
                    </div>
                  </div>

                  {selectedLog.notes && (
                    <div className="pt-2 border-t border-slate-200/60 text-slate-600">
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase font-poppins">Driver Notes:</span>
                      <p className="text-slate-700 italic mt-0.5">{selectedLog.notes}</p>
                    </div>
                  )}

                  {selectedLog.rejectionReason && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px]">
                      <strong>Rejection Reason:</strong> {selectedLog.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              {/* Receipt Image / PDF Viewer */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-center items-center overflow-auto max-h-[50vh]">
                {activeBillUrl ? (
                  activeBillUrl.toLowerCase().endsWith(".pdf") ? (
                    <iframe src={activeBillUrl} className="w-full h-[40vh] border-0 rounded-xl" title="Fuel Bill PDF" />
                  ) : (
                    <a href={activeBillUrl} target="_blank" rel="noreferrer" title="Click to view full photo">
                      <img src={activeBillUrl} alt="Receipt Image" loading="lazy" className="max-w-full max-h-[40vh] object-contain rounded-lg shadow-sm hover:opacity-90 transition-opacity" />
                    </a>
                  )
                ) : (
                  <div className="py-8 text-center text-gray-400 font-medium text-xs">
                    No fuel receipt photo uploaded by driver.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 font-nunito shrink-0 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {selectedLog && (selectedLog.approvalStatus || "Pending") === "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleApproveBill(selectedLog.id || selectedLog._id);
                        setBillModalOpen(false);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectRecord(selectedLog);
                        setRejectReason("");
                        setBillModalOpen(false);
                        setRejectModalOpen(true);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setBillModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
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

export default function FuelManagementPage() {
  const [search, setSearch] = useState("");
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
    try {
      await managerApi.updateFuelRecord(logId, { approvalStatus: "Approved" });
      toast.success("Fuel bill approved successfully!");
      fetchRecords();
    } catch (error) {
      toast.error("Failed to approve fuel bill.");
      console.error(error);
    }
  };

  const handleRejectBill = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    try {
      await managerApi.updateFuelRecord(rejectRecord.id || rejectRecord._id, {
        approvalStatus: "Rejected",
        rejectionReason: rejectReason
      });
      toast.success("Fuel bill rejected successfully!");
      setRejectModalOpen(false);
      setRejectRecord(null);
      setRejectReason("");
      fetchRecords();
    } catch (error) {
      toast.error("Failed to reject fuel bill.");
      console.error(error);
    }
  };

  const handleViewBill = (log) => {
    setSelectedLog(log);
    const url = log?.receiptImage || log?.billUrl || "";
    const fullUrl = url && url.startsWith("/uploads") ? `http://localhost:5000${url}` : url;
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
        setLogs(result.map(l => ({
          ...l,
          id: l._id,
          vehicleId: l.vehicleId || (l.vehicle && (l.vehicle.vehicleNumber || l.vehicle.registrationNumber || l.vehicle.plateNumber)) || "Unassigned",
          vehicleName: l.vehicleName || (l.vehicle && l.vehicle.name) || "Fleet Vehicle",
          qty: `${l.liters} L`,
          total: `₹${(l.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          receiptImage: l.receiptImage || l.billUrl || "",
          billUrl: l.billUrl || l.receiptImage || "",
          timestamp: new Date(l.createdAt).toLocaleDateString("en-IN", {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        })));
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
    const interval = setInterval(() => {
      fetchRecords(false);
      fetchVehicles();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(l => {
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

  const totalSpend = logs
    .filter(l => l.status === "normal" || l.status === "resolved")
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

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
    try {
      await managerApi.deleteFuelRecord(selectedRecord._id);
      setShowDeleteConfirm(false);
      setSelectedRecord(null);
      toast.success("Fuel record deleted successfully");
      fetchRecords();
    } catch (error) {
      toast.error("Failed to delete record");
      console.error(error);
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
    URL.revokeObjectURL(url);

    toast.success(`Receipt for ${log.vehicleId} downloaded!`);
  };

  return (
    <div className="p-8">
      <Breadcrumb />
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Fuel Management
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">
            Monitor diesel logs, average fleet efficiency, and resolve fuel siphoning alerts.
          </p>
        </div>
      </div>

      {/* --- KPI SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* KPI 1: Fuel Spend */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Total Fuel Spend</span>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-2">
                ₹{totalSpend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+22.4% vs last month</span>
          </div>
        </div>

        {/* KPI 3: Anomalies */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Theft & Anomalies</span>
              <h3 className="text-2xl font-extrabold text-red-600 mt-2">
                {anomaliesCount < 10 ? `0${anomaliesCount}` : anomaliesCount}
              </h3>
            </div>
            <div className="bg-red-50 text-red-600 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-red-500 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{anomaliesCount} High Priority Alerts</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col mt-8">
        {/* Table Header Filter controls */}
        <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <h3 className="font-bold text-lg text-gray-800">Recent Fuel Entries</h3>

          <div className="flex items-center gap-3">
            {/* Search field */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search vehicle or driver..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-700 font-medium w-[220px]"
              />
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-gray-400 font-medium">Loading fuel records...</div>
          ) : (
            <table className="w-full text-left border-collapse text-sm font-nunito">
              <thead>
                <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                  <th className="py-4 px-6">Vehicle</th>
                  <th className="py-4 px-6">Driver</th>
                  <th className="py-4 px-6">Fuel Station</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Liters</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Approval Status</th>
                  <th className="py-4 px-6 text-center">Receipt</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF0]/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 font-medium">
                      No fuel records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(l => (
                    <tr
                      key={l.id}
                      className={`hover:bg-[#F5F7FB]/50 transition-colors ${l.status === "anomaly" ? "bg-red-50/30" : ""
                        }`}
                    >
                      {/* Vehicle */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-1 h-8 rounded-full ${l.status === "anomaly"
                            ? "bg-red-500"
                            : l.status === "resolved"
                              ? "bg-green-500"
                              : "bg-amber-700"
                            }`} />
                          <div>
                            <p className="font-bold text-gray-800 text-xs">{l.vehicleId}</p>
                            <span className="text-[10px] text-gray-500 block mt-0.5">{l.vehicleName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Driver */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="font-bold text-gray-800 text-xs">{l.driver}</p>
                        <span className="text-[10px] text-gray-500 block mt-0.5">{l.driverId || "—"}</span>
                      </td>

                      {/* Station */}
                      <td className="py-4 px-6 text-xs text-gray-700 whitespace-nowrap">
                        {l.fuelStation}
                      </td>

                      {/* Total Spend / Amount */}
                      <td className="py-4 px-6 text-xs font-black text-gray-900 whitespace-nowrap">
                        {l.total}
                      </td>

                      {/* Liters */}
                      <td className="py-4 px-6 text-xs font-black text-gray-900 whitespace-nowrap">
                        {l.qty}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                        {l.timestamp}
                      </td>

                      {/* Approval Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span 
                          title={l.rejectionReason ? `Reason: ${l.rejectionReason}` : ""}
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border select-none ${
                            l.approvalStatus === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            l.approvalStatus === "Rejected" ? "bg-red-50 text-red-600 border-red-100 cursor-help" :
                            "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                        >
                          {l.approvalStatus || "Pending"}
                        </span>
                      </td>

                      {/* Receipt Column */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleViewBill(l)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
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
                            <span className="text-xs text-gray-400 font-medium">
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
          )}
        </div>

        {/* Table Footer info */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white select-none">
          <span className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-800">{filteredLogs.length}</span> of {logs.length} entries
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

      {/* Bill View Modal */}
      {billModalOpen && (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] select-none font-poppins">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-lg flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h4 className="font-bold text-sm text-gray-800 flex items-center gap-1.5 font-poppins">
                <FileText className="w-4 h-4 text-amber-700" />
                View Receipt Image
              </h4>
              <button
                onClick={() => setBillModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center items-center overflow-auto max-h-[70vh]">
              {activeBillUrl ? (
                activeBillUrl.toLowerCase().endsWith(".pdf") ? (
                  <iframe src={activeBillUrl} className="w-full h-[50vh] border-0 rounded-xl" title="Fuel Bill PDF" />
                ) : (
                  <img src={activeBillUrl} alt="Receipt Image" className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-sm" />
                )
              ) : (
                <div className="py-12 text-center text-gray-500 font-medium">
                  No receipt uploaded.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 font-nunito">
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
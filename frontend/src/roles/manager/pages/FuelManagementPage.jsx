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

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await managerApi.getFuelRecords();
      const result = response.data?.data || response.data;
      if (Array.isArray(result)) {
        setLogs(result.map(l => ({
          ...l,
          id: l._id,
          vehicleId: l.vehicleId || (l.vehicle && l.vehicle.plateNumber) || "MH-12-AB-5678",
          vehicleName: l.vehicleName || (l.vehicle && l.vehicle.name) || "Fleet Vehicle",
          qty: `${l.liters} L`,
          total: `₹${l.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
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
      toast.error("Failed to load fuel records from database");
      console.error(error);
    } finally {
      setLoading(false);
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
    fetchRecords();
    fetchVehicles();
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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

        {/* KPI 2: Mileage */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Avg Fleet Mileage</span>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-2">4.5 km/l</h3>
            </div>
            <div className="bg-green-50 text-green-600 p-3 rounded-xl">
              <Gauge className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-green-600 font-medium">
            Optimized consumption: <span className="font-bold">-0.8% drop</span>
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

            {/* Log Fuel Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-amber-700/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Fuel</span>
            </button>
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
                  <th className="py-4 px-6">Vehicle ID</th>
                  <th className="py-4 px-6">Driver</th>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Fuel Station</th>
                  <th className="py-4 px-6">Qty (Liters)</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF0]/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                      No fuel logs found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(l => (
                    <tr
                      key={l.id}
                      className={`hover:bg-[#F5F7FB]/50 transition-colors ${l.status === "anomaly" ? "bg-red-50/30" : ""
                        }`}
                    >
                      {/* Vehicle ID cell */}
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
                      <td className="py-4 px-6 font-semibold text-xs text-gray-800 whitespace-nowrap">
                        {l.driver}
                      </td>

                      {/* Timestamp */}
                      <td className={`py-4 px-6 text-xs whitespace-nowrap ${l.status === "anomaly" ? "text-red-500 font-bold" : "text-gray-500"}`}>
                        {l.timestamp}
                      </td>

                      {/* Station */}
                      <td className={`py-4 px-6 text-xs whitespace-nowrap ${l.status === "anomaly" ? "text-red-600 font-bold" : "text-gray-700"}`}>
                        {l.fuelStation}
                      </td>

                      {/* Quantity */}
                      <td className={`py-4 px-6 text-xs font-black whitespace-nowrap ${l.status === "anomaly" ? "text-red-600" : "text-gray-900"}`}>
                        {l.qty}
                      </td>

                      {/* Total Spend */}
                      <td className="py-4 px-6 text-xs font-black text-gray-900 whitespace-nowrap">
                        {l.total}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {l.status === "anomaly" ? (
                            <button
                              onClick={() => handleResolveAnomaly(l)}
                              className="px-3.5 py-1.5 bg-red-500 hover:bg-red-700 text-white rounded-xl text-[10px] font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                            >
                              Resolve
                            </button>
                          ) : l.status === "resolved" ? (
                            <span className="text-green-600 text-xs font-bold flex items-center justify-end gap-1 select-none">
                              <CheckCircle className="w-4 h-4" />
                              Resolved
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleDownloadReceipt(l)}
                                title="Download slip receipt"
                                className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl active:scale-95 transition-all cursor-pointer inline-flex"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(l)}
                                title="Edit Fuel Log"
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer inline-flex"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenDelete(l)}
                                title="Delete Fuel Log"
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl active:scale-95 transition-all cursor-pointer inline-flex"
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
          )}
        </div>

        {/* Table Footer info */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white select-none">
          <span className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-800">{filteredLogs.length}</span> of {logs.length} entries
          </span>
        </div>
      </div>

      {/* --- ADD FUEL RECORD MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-md flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h4 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-700" />
                Log Fuel Entry
              </h4>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFuel} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Vehicle *</label>
                <select
                  required
                  value={form.vehicleId}
                  onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-700 bg-white font-nunito"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.plateNumber} ({v.name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Qty (Liters) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 50"
                    value={form.liters}
                    onChange={(e) => setForm({ ...form, liters: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-700 font-nunito"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Total cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 4750"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-700 font-nunito"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Fuel Station</label>
                <input
                  type="text"
                  placeholder="e.g. IndianOil Station"
                  value={form.fuelStation}
                  onChange={(e) => setForm({ ...form, fuelStation: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-700 font-nunito"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Status Type</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-700 bg-white font-nunito"
                >
                  <option value="normal">Normal Entry</option>
                  <option value="anomaly">Siphoning Alert / Anomaly</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasReceipt"
                  checked={form.hasReceipt}
                  onChange={(e) => setForm({ ...form, hasReceipt: e.target.checked })}
                />
                <label htmlFor="hasReceipt" className="text-xs text-gray-700 select-none cursor-pointer font-nunito">Has slip receipt</label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 font-nunito">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT FUEL RECORD MODAL --- */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-md flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h4 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-blue-600" />
                Edit Fuel Log
              </h4>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditFuel} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Vehicle *</label>
                <select
                  required
                  value={form.vehicleId}
                  onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-700 bg-white font-nunito"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.plateNumber} ({v.name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Qty (Liters) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.liters}
                    onChange={(e) => setForm({ ...form, liters: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-700 font-nunito"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Total cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-700 font-nunito"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Fuel Station</label>
                <input
                  type="text"
                  value={form.fuelStation}
                  onChange={(e) => setForm({ ...form, fuelStation: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-700 font-nunito"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editHasReceipt"
                  checked={form.hasReceipt}
                  onChange={(e) => setForm({ ...form, hasReceipt: e.target.checked })}
                />
                <label htmlFor="editHasReceipt" className="text-xs text-gray-700 select-none cursor-pointer font-nunito">Has slip receipt</label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 font-nunito">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteConfirm && selectedRecord && (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-sm flex flex-col space-y-4 select-none">
            <div className="flex items-center gap-3 text-red-600 border-b border-gray-100 pb-3">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
              <h4 className="font-bold text-sm">Delete Fuel Record</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-nunito">
              Are you sure you want to permanently delete this fuel record for <strong>{selectedRecord.vehicleId}</strong> logged at {selectedRecord.timestamp}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2 font-nunito">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFuel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
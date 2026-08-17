import React, { useState, useEffect, useRef } from "react";
import DashboardSkeletonLoader from "@/components/common/DashboardSkeletonLoader";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Wrench,
  Search,
  Filter,
  AlertTriangle,
  Loader,
  Edit,
  Edit2,
  Eye,
  X,
  Ticket,
  DollarSign,
  Activity,
  Clock,
  ShieldAlert,
  ArrowLeft,
  Cpu,
  MapPin
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";

const resolveVehiclePlate = (t) => {
  if (!t) return "VEH-ASSIGNED";
  if (t.vehiclePlate && t.vehiclePlate !== "VEH-UNKNOWN" && t.vehiclePlate !== "UNKNOWN") {
    return t.vehiclePlate;
  }
  if (t.vehicle) {
    if (typeof t.vehicle === "object") {
      const vNum = t.vehicle.vehicleNumber || t.vehicle.registrationNumber || t.vehicle.plateNumber || t.vehicle.vehicleName;
      if (vNum) return vNum;
    } else if (typeof t.vehicle === "string" && t.vehicle !== "VEH-UNKNOWN" && t.vehicle !== "UNKNOWN") {
      return t.vehicle;
    }
  }
  if (t.trip && typeof t.trip === "object") {
    if (t.trip.vehiclePlate && t.trip.vehiclePlate !== "VEH-UNKNOWN" && t.trip.vehiclePlate !== "UNKNOWN") {
      return t.trip.vehiclePlate;
    }
    if (t.trip.vehicle && typeof t.trip.vehicle === "object") {
      const tvNum = t.trip.vehicle.vehicleNumber || t.trip.vehicle.registrationNumber;
      if (tvNum) return tvNum;
    }
  }
  if (t.driver && typeof t.driver === "object" && t.driver.assignedVehicle && t.driver.assignedVehicle !== "Unassigned") {
    return t.driver.assignedVehicle;
  }
  return "VEH-ASSIGNED";
};

export default function ViewTicketsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedTicketId = searchParams.get("ticketId") || searchParams.get("id");
  const handledTicketIdRef = useRef(null);

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketSearch, setTicketSearch] = useState(highlightedTicketId || "");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("All");
  const [ticketSeverityFilter, setTicketSeverityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [ticketSearch, ticketStatusFilter, ticketSeverityFilter]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // "view" | "edit"
  const [editingTicketData, setEditingTicketData] = useState({
    status: "Open",
    estimatedCost: 0,
    actualCost: 0,
    notes: "",
    mechanicName: "",
    mechanicPhone: "",
    mechanicLocation: "",
    categoryData: {
      assignedTechnicalTeam: "",
      delayReason: "",
      newEta: "",
      customerInformed: false,
      towVehicleRequired: false,
      resolutionComment: ""
    }
  });

  const handleCloseModal = () => {
    setSelectedTicket(null);
    if (searchParams.get("ticketId") || searchParams.get("id")) {
      setSearchParams({}, { replace: true });
    }
  };

  const formatDateSafe = (dateVal, options = { dateStyle: 'medium', timeStyle: 'short' }) => {
    if (!dateVal) return "Recently";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleString('en-IN', options);
    } catch (e) {
      return "Recently";
    }
  };

  const getCategoryKey = (issueTypeStr = '') => {
    const s = issueTypeStr.toString().toLowerCase();
    if (s.includes('accident') || s.includes('emergency')) {
      return 'accident';
    }
    if (s.includes('fuel') || s.includes('payment') || s.includes('amount') || s.includes('receipt')) {
      return 'fuel';
    }
    if (s.includes('gps') || s.includes('app') || s.includes('device') || s.includes('crash') || s.includes('technical')) {
      return 'technical';
    }
    if (s.includes('delay') || s.includes('route') || s.includes('traffic') || s.includes('eta')) {
      return 'delay';
    }
    if (s.includes('mechanic') || s.includes('engine') || s.includes('tyre') || s.includes('brake') || s.includes('breakdown') || s.includes('repair')) {
      return 'mechanic';
    }
    return 'mechanic';
  };

  const renderDynamicCategoryForm = (ticket, data, setData) => {
    if (!ticket) return null;
    const catKey = getCategoryKey(ticket.issueType);

    switch (catKey) {
      case 'fuel':
        return (
          <div className="space-y-3 p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-xl font-nunito">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900 font-poppins">Fuel / Payment Issue Resolution</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                Quick Resolution Decision
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setData(prev => ({ ...prev, status: 'Resolved' }))}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${data.status === 'Resolved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  ✓ Approve & Resolve
                </button>
                <button
                  type="button"
                  onClick={() => setData(prev => ({ ...prev, status: 'Rejected' }))}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${data.status === 'Rejected'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  ✕ Reject Issue
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                Resolution Comment / Verification Details
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Payment verified with fuel station vendor. Amount ₹2,500 credited successfully."
                value={data.categoryData?.resolutionComment || data.notes}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  categoryData: { ...prev.categoryData, resolutionComment: e.target.value },
                  notes: e.target.value
                }))}
                className="w-full p-2.5 bg-white border border-amber-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>
        );

      case 'technical':
        return (
          <div className="space-y-3 p-3.5 bg-indigo-50/60 border border-indigo-200/70 rounded-xl font-nunito">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900 font-poppins">GPS / Technical Support Assignment</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                Assigned Technical Team / IT Specialist
              </label>
              <input
                type="text"
                placeholder="e.g. IT Telematics Team / Rajesh Support"
                value={data.categoryData?.assignedTechnicalTeam || ''}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  categoryData: { ...prev.categoryData, assignedTechnicalTeam: e.target.value }
                }))}
                className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                Technical Resolution & Diagnosis Notes
              </label>
              <textarea
                rows="3"
                placeholder="e.g. GPS telemetry device reset remotely. App sync session restored."
                value={data.categoryData?.resolutionComment || data.notes}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  categoryData: { ...prev.categoryData, resolutionComment: e.target.value },
                  notes: e.target.value
                }))}
                className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-3 p-3.5 bg-purple-50/60 border border-purple-200/70 rounded-xl font-nunito">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-purple-900 font-poppins">Delivery Delay & Route Management</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                  Delay Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traffic Congestion"
                  value={data.categoryData?.delayReason || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    categoryData: { ...prev.categoryData, delayReason: e.target.value }
                  }))}
                  className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                  New Revised ETA
                </label>
                <input
                  type="text"
                  placeholder="e.g. Today, 06:30 PM"
                  value={data.categoryData?.newEta || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    categoryData: { ...prev.categoryData, newEta: e.target.value }
                  }))}
                  className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="customerInformed"
                checked={!!data.categoryData?.customerInformed}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  categoryData: { ...prev.categoryData, customerInformed: e.target.checked }
                }))}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="customerInformed" className="text-xs font-bold text-slate-700 cursor-pointer">
                Customer Informed of Revised ETA
              </label>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                Comments / Route Log
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Customer notified by dispatcher of 2-hour toll congestion."
                value={data.notes}
                onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>
        );

      case 'accident':
        return (
          <div className="space-y-3 p-3.5 bg-red-50/60 border border-red-200/70 rounded-xl font-nunito">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-red-900 font-poppins">Emergency Accident & Towing Assistance</span>
              </div>
              <button
                type="button"
                onClick={() => setData(prev => ({ ...prev, status: 'Cancelled (Accident)' }))}
                className="py-1 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition shadow-sm cursor-pointer"
              >
                🚨 Severe Accident - Cancel Trip
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Mechanic / Rescue Contact Name"
                value={data.mechanicName}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  mechanicName: e.target.value,
                  status: prev.status === 'Open' ? 'Mechanic Assigned' : prev.status
                }))}
                className="w-full p-2 bg-white border border-red-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={data.mechanicPhone}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  mechanicPhone: e.target.value,
                  status: prev.status === 'Open' ? 'Mechanic Assigned' : prev.status
                }))}
                className="w-full p-2 bg-white border border-red-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                  Tow Vehicle Required?
                </label>
                <select
                  value={data.categoryData?.towVehicleRequired ? 'Yes' : 'No'}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    categoryData: { ...prev.categoryData, towVehicleRequired: e.target.value === 'Yes' }
                  }))}
                  className="w-full p-2 bg-white border border-red-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="No">No Towing Required</option>
                  <option value="Yes">Yes - Dispatch Tow Truck</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                  Workshop / Accident Yard Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Highway Police Station / City Bay Yard"
                  value={data.mechanicLocation}
                  onChange={(e) => setData(prev => ({ ...prev, mechanicLocation: e.target.value }))}
                  className="w-full p-2 bg-white border border-red-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                  New Estimated Delivery Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={data.revisedDeliveryDateTime || data.categoryData?.revisedDeliveryDateTime || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    revisedDeliveryDateTime: e.target.value,
                    categoryData: { ...prev.categoryData, revisedDeliveryDateTime: e.target.value, newEta: e.target.value }
                  }))}
                  className="w-full p-2 bg-white border border-red-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">Est. Damage Cost (₹)</label>
                <input
                  type="number"
                  value={data.estimatedCost}
                  onChange={(e) => setData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-red-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">Accident Incident Notes</label>
              <textarea
                rows="2"
                placeholder="Accident details, vehicle damage report, insurance claim notes..."
                value={data.notes}
                onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2.5 bg-white border border-red-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>
        );

      case 'mechanic':
      default:
        return (
          <div className="space-y-3.5 p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl font-nunito">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-900 font-poppins">Vehicle Maintenance & Mechanic Assignment</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">Mechanic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Satya Mechanics"
                  value={data.mechanicName}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    mechanicName: e.target.value,
                    status: prev.status === 'Open' ? 'Mechanic Assigned' : prev.status
                  }))}
                  className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">Mechanic Phone</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={data.mechanicPhone}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    mechanicPhone: e.target.value,
                    status: prev.status === 'Open' ? 'Mechanic Assigned' : prev.status
                  }))}
                  className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">Garage / Workshop Location</label>
              <input
                type="text"
                placeholder="e.g. Sri Durga Auto Service Bay, Bay 4"
                value={data.mechanicLocation}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  mechanicLocation: e.target.value,
                  status: prev.status === 'Open' ? 'Mechanic Assigned' : prev.status
                }))}
                className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-purple-50/80 border border-purple-200/80 rounded-xl space-y-2 font-nunito">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-purple-900 font-poppins">Trip Reschedule & Customer Notification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                    New Estimated Delivery Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={data.revisedDeliveryDateTime || data.categoryData?.revisedDeliveryDateTime || ''}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      revisedDeliveryDateTime: e.target.value,
                      categoryData: { ...prev.categoryData, revisedDeliveryDateTime: e.target.value, newEta: e.target.value }
                    }))}
                    className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1">Est. Repair Cost (₹)</label>
                  <input
                    type="number"
                    value={data.estimatedCost}
                    onChange={(e) => setData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    placeholder="0"
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#1E293B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="customerInformedOfflineCheck"
                  checked={!!(data.customerInformedOffline || data.categoryData?.customerInformedOffline)}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    customerInformedOffline: e.target.checked,
                    categoryData: { ...prev.categoryData, customerInformedOffline: e.target.checked, customerInformed: e.target.checked }
                  }))}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                />
                <label htmlFor="customerInformedOfflineCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Informed Customer Offline (Phone / Call) regarding revised delivery schedule ✓
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1">Breakdown & Repair Notes</label>
              <textarea
                value={data.notes}
                onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Mechanic diagnosis notes, engine/tyre repair details, parts replaced..."
                rows="2"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-[#1E293B] placeholder-gray-400 focus:outline-none"
              ></textarea>
            </div>

            <div className="pt-3 border-t border-blue-200/80 space-y-2 font-nunito">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900 font-poppins">Service Completion Bill & Invoice Receipt</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                    Service Bill / Invoice No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-0803-88"
                    value={data.serviceBillNo || ''}
                    onChange={(e) => setData(prev => ({ ...prev, serviceBillNo: e.target.value }))}
                    className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">
                    Bill Receipt Date
                  </label>
                  <input
                    type="date"
                    value={data.serviceBillDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setData(prev => ({ ...prev, serviceBillDate: e.target.value }))}
                    className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const fetchTickets = async (isInitial = false) => {
    try {
      const res = await managerApi.getVehicleComplaints();
      const data = res.data?.data || res.data;
      let finalTickets = [];

      if (Array.isArray(data)) {
        const sanitized = data.map(t => ({
          ...t,
          vehiclePlate: resolveVehiclePlate(t)
        }));
        finalTickets = sanitized;
        setTickets(sanitized);
      }

      if (highlightedTicketId && finalTickets.length > 0 && handledTicketIdRef.current !== highlightedTicketId) {
        const matched = finalTickets.find(t =>
          String(t._id) === String(highlightedTicketId) ||
          String(t.ticketId || "").toUpperCase() === String(highlightedTicketId).toUpperCase() ||
          String(t.complaintId || "").toUpperCase() === String(highlightedTicketId).toUpperCase()
        );
        if (matched) {
          handledTicketIdRef.current = highlightedTicketId;
          setSelectedTicket(matched);
          setModalMode("view");
        }
      }
    } catch (err) {
      console.warn("Failed to load vehicle complaints from DB:", err);
    } finally {
      if (isInitial) setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets(true);
    const interval = setInterval(() => fetchTickets(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setUpdatingTicketId(selectedTicket._id);

      const updateData = {
        status: editingTicketData.status,
        estimatedCost: Number(editingTicketData.estimatedCost) || 0,
        actualCost: Number(editingTicketData.actualCost) || 0,
        notes: editingTicketData.notes,
        mechanicName: editingTicketData.mechanicName,
        mechanicPhone: editingTicketData.mechanicPhone,
        mechanicLocation: editingTicketData.mechanicLocation,
        categoryData: editingTicketData.categoryData
      };

      if (String(selectedTicket._id).startsWith("mock-")) {
        const localNotifsStr = localStorage.getItem("local_complaints_notifications");
        if (localNotifsStr) {
          const localNotifs = JSON.parse(localNotifsStr);
          const updated = localNotifs.map(n => {
            if (n._id === selectedTicket._id || n.id === selectedTicket._id) {
              const updatedMeta = {
                ...n.metadata,
                status: updateData.status,
                estimatedCost: updateData.estimatedCost,
                actualCost: updateData.actualCost,
                notes: updateData.notes,
                completionDate: (updateData.status === 'Resolved' || updateData.status === 'Closed') ? new Date().toISOString() : undefined
              };
              return {
                ...n,
                isRead: updateData.status === 'Resolved' || updateData.status === 'Closed',
                unread: !(updateData.status === 'Resolved' || updateData.status === 'Closed'),
                metadata: updatedMeta
              };
            }
            return n;
          });
          localStorage.setItem("local_complaints_notifications", JSON.stringify(updated));
        }

        setTickets(prev => prev.map(t =>
          t._id === selectedTicket._id
            ? { ...t, ...updateData, completionDate: (updateData.status === 'Resolved' || updateData.status === 'Closed') ? new Date().toISOString() : undefined }
            : t
        ));

        toast.success("Ticket updated successfully! (Simulation Fallback)");
        handleCloseModal();
      } else {
        await managerApi.updateVehicleComplaint(selectedTicket._id, updateData);
        toast.success("Ticket updated successfully!");
        handleCloseModal();
        await fetchTickets();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update ticket");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const q = ticketSearch.toLowerCase();
    const dName = t.driver?.fullName || t.driverName || "";
    const matchesSearch =
      t.ticketId.toLowerCase().includes(q) ||
      (t.vehiclePlate || resolveVehiclePlate(t)).toLowerCase().includes(q) ||
      dName.toLowerCase().includes(q) ||
      t.issueType.toLowerCase().includes(q);

    let matchesStatus = true;
    if (ticketStatusFilter !== "All") {
      matchesStatus = t.status === ticketStatusFilter;
    }

    let matchesSeverity = true;
    if (ticketSeverityFilter !== "All") {
      matchesSeverity = t.severity === ticketSeverityFilter;
    }

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);



  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0D1117] min-h-screen text-[#1E293B] dark:text-white font-nunito">
      <Breadcrumb />

      {/* Header Row */}
      <div className="border-b border-[#E7EAF0] dark:border-[#1E293B] pb-4 mb-6 select-none">
        <div>
          <h1 className="font-poppins font-bold text-[32px] leading-none text-[#1E293B] dark:text-white">
            Vehicle Issue Tickets
          </h1>
          <p className="text-[16px] text-[#64748B] dark:text-white mt-2">
            Resolve breakdowns, log repair costs, and track reported faults.
          </p>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="p-4 bg-white dark:bg-[#0F172A] border border-[#E7EAF0] dark:border-[#1E293B] rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-[#64748B] dark:text-white font-bold uppercase tracking-wider font-poppins block">Total Tickets</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#1E293B] dark:text-white font-poppins">{tickets.length}</span>
            <span className="text-[10px] text-gray-400 dark:text-white font-medium">overall</span>
          </div>
        </div>

        <div className="p-4 bg-blue-50/30 dark:bg-[#08203B] border border-blue-100/50 dark:border-blue-800/50 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase tracking-wider font-poppins block">Open</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#1E293B] dark:text-white font-poppins">{tickets.filter(t => t.status === "Open").length}</span>
            <span className="text-[10px] text-blue-500 dark:text-blue-300 font-bold">pending</span>
          </div>
        </div>

        <div className="p-4 bg-amber-50/30 dark:bg-[#2A1C06] border border-amber-100/40 dark:border-amber-800/50 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-[#A14000] dark:text-amber-300 font-bold uppercase tracking-wider font-poppins block">In Progress</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#1E293B] dark:text-white font-poppins">{tickets.filter(t => t.status === "In Progress").length}</span>
            <span className="text-[10px] text-amber-500 dark:text-amber-300 font-bold">active</span>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/30 dark:bg-[#06291C] border border-emerald-100/40 dark:border-emerald-800/50 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-bold uppercase tracking-wider font-poppins block">Resolved</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#1E293B] dark:text-white font-poppins">{tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length}</span>
            <span className="text-[10px] text-emerald-500 dark:text-emerald-300 font-bold">solved</span>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/20 dark:bg-[#1E1B4B] border border-indigo-100/30 dark:border-indigo-800/50 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-indigo-650 dark:text-indigo-300 font-bold uppercase tracking-wider font-poppins block">Total Cost</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-650 dark:text-white font-poppins">₹{tickets.reduce((sum, t) => sum + (Number(t.actualCost) || 0), 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="p-4 bg-purple-50/20 dark:bg-[#2E1065] border border-purple-100/30 dark:border-purple-800/50 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-purple-600 dark:text-purple-300 font-bold uppercase tracking-wider font-poppins block">Avg Cost</span>
          <div className="flex items-baseline justify-between">
            {(() => {
              const costList = tickets.filter(t => (Number(t.actualCost) || 0) > 0);
              const avg = costList.length > 0 ? Math.round(costList.reduce((sum, t) => sum + t.actualCost, 0) / costList.length) : 0;
              return <span className="text-2xl font-bold text-purple-700 dark:text-white font-poppins">₹{avg.toLocaleString('en-IN')}</span>;
            })()}
          </div>
        </div>
      </div>

      {/* Main panel card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E7EAF0] dark:border-[#1E293B] p-6 shadow-sm space-y-6">
        {/* Filters & Search Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              placeholder="Search Ticket, Vehicle, Driver..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-[#1E293B] dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-300"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-1 rounded-xl text-xs">
              {["All", "Open", "In Progress", "Need Maintenance", "Resolved", "Closed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setTicketStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${ticketStatusFilter === st
                    ? "bg-white dark:bg-[#A14000] text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-[#A14000]"
                    : "text-[#64748B] dark:text-white hover:text-[#1E293B] dark:hover:text-white"
                    }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Severity Filter Dropdown */}
            <div className="flex items-center gap-1.5 border border-gray-200 dark:border-slate-800 p-1.5 rounded-xl text-xs bg-white dark:bg-slate-900">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={ticketSeverityFilter}
                onChange={(e) => setTicketSeverityFilter(e.target.value)}
                className="bg-transparent font-bold text-[#64748B] dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="All" className="dark:bg-[#0F172A] dark:text-white">All Severities</option>
                <option value="Low" className="dark:bg-[#0F172A] dark:text-white">Low Severity</option>
                <option value="Medium" className="dark:bg-[#0F172A] dark:text-white">Medium Severity</option>
                <option value="High" className="dark:bg-[#0F172A] dark:text-white">High Severity</option>
                <option value="Critical">Critical Severity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          {loadingTickets ? (
            <div className="py-16 text-center text-slate-400 font-medium font-nunito flex flex-col items-center justify-center gap-2">
              <Loader className="w-6 h-6 animate-spin text-indigo-650" />
              <span>Loading tickets...</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium text-xs font-poppins bg-[#F8FAFC]/50">
              No tickets found matching your query or filters.
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs font-nunito bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[9px] tracking-wider select-none whitespace-nowrap">
                    <th className="py-3 px-4">Vehicle Number</th>
                    <th className="py-3 px-4">Driver Name</th>
                    <th className="py-3 px-4">Issue Category</th>
                    <th className="py-3 px-4">Severity Level</th>
                    <th className="py-3 px-4">Reported Date & Time</th>
                    <th className="py-3 px-4">Est. Repair Cost (₹)</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]/40">
                  {paginatedTickets.map((t) => (
                    <tr key={t._id} className="hover:bg-[#F8FAFC]/30 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-indigo-650 bg-indigo-50/55 border border-indigo-150 px-2 py-0.5 rounded uppercase text-[10px] tracking-wide">
                          {resolveVehiclePlate(t)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-bold whitespace-nowrap">{t.driver?.fullName || t.driverName}</td>
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">{t.issueType}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase ${t.severity === 'Critical'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : t.severity === 'High'
                            ? 'bg-orange-50 text-[#A14000] border border-orange-100'
                            : t.severity === 'Medium'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                          {t.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {formatDateSafe(t.reportedAt || t.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-650 whitespace-nowrap">
                        {t.estimatedCost > 0 ? `₹${t.estimatedCost.toLocaleString('en-IN')}` : "-"}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[8px] font-extrabold uppercase ${t.status === 'Resolved' || t.status === 'Completed' || t.status === 'Repair Completed'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : t.status === 'Need Maintenance'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100 font-black'
                            : t.status === 'Mechanic Assigned'
                              ? 'bg-purple-50 text-purple-600 border border-purple-100'
                              : t.status === 'Mechanic Arrived'
                                ? 'bg-sky-50 text-sky-600 border border-sky-100'
                                : t.status === 'Repair In Progress' || t.status === 'In Progress'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-100 font-bold'
                                  : t.status === 'Closed'
                                    ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicket(t);
                              setModalMode("view");
                            }}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg active:scale-95 transition-all cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {t.status !== 'Resolved' && t.status !== 'Completed' && t.status !== 'Closed' && t.status !== 'Repair Completed' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTicket(t);
                                setEditingTicketData({
                                  status: t.status || "Open",
                                  estimatedCost: t.estimatedCost || 0,
                                  actualCost: t.actualCost || 0,
                                  notes: t.notes || "",
                                  mechanicName: t.assignedMechanic?.name || "",
                                  mechanicPhone: t.assignedMechanic?.phone || "",
                                  mechanicLocation: t.assignedMechanic?.location || "",
                                  categoryData: {
                                    assignedTechnicalTeam: t.categoryData?.assignedTechnicalTeam || "",
                                    delayReason: t.categoryData?.delayReason || "",
                                    newEta: t.categoryData?.newEta || "",
                                    customerInformed: t.categoryData?.customerInformed || false,
                                    towVehicleRequired: t.categoryData?.towVehicleRequired || false,
                                    resolutionComment: t.categoryData?.resolutionComment || ""
                                  }
                                });
                                setModalMode("edit");
                              }}
                              className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg active:scale-95 transition-all cursor-pointer"
                              title="Assign Mechanic / Edit Ticket"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Pagination Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4 select-none font-nunito">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium font-poppins">
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredTickets.length === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="font-bold text-slate-900 dark:text-white">{Math.min(startIndex + ITEMS_PER_PAGE, filteredTickets.length)}</span> of{" "}
            <span className="font-bold text-slate-900 dark:text-white">{filteredTickets.length}</span> entries (Page {currentPage} of {totalPages})
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              Prev
            </button>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 px-2">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || filteredTickets.length === 0}
              className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* --- EDIT TICKET SUB-MODAL --- */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col my-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h4 className="font-poppins font-bold text-[#1E293B] text-[14px]">
                  {modalMode === "view" ? "Vehicle Ticket Details" : "Update Issue Ticket"}
                </h4>
                <p className="text-[9px] text-[#A14000] font-bold uppercase tracking-wider mt-0.5">Ticket ID: {selectedTicket.ticketId}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            {modalMode === "view" ? (
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-2.5 font-nunito">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Vehicle Plate:</span>
                    <span className="font-bold text-slate-700 uppercase">{resolveVehiclePlate(selectedTicket)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Driver Name:</span>
                    <span className="font-bold text-slate-700">{selectedTicket.driver?.fullName || selectedTicket.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Issue Category:</span>
                    <span className="font-bold text-slate-700">{selectedTicket.issueType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Severity Level:</span>
                    <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase ${selectedTicket.severity === 'Critical'
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : selectedTicket.severity === 'High'
                        ? 'bg-orange-50 text-[#A14000] border border-orange-100'
                        : selectedTicket.severity === 'Medium'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                      {selectedTicket.severity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 bg-slate-100/70 px-3 rounded-lg border border-slate-200/50">
                    <span className="text-slate-500 font-bold flex items-center gap-1.5 font-poppins">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> Driver Reported Location:
                    </span>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">
                      {selectedTicket.location || selectedTicket.currentLocation || selectedTicket.landmark || "Vijayawada Highway NH-65, Gate 4 (GPS)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Reported Date & Time:</span>
                    <span className="font-bold text-slate-700">
                      {formatDateSafe(selectedTicket.reportedAt || selectedTicket.createdAt, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Current Status:</span>
                    <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[8px] font-extrabold uppercase ${selectedTicket.status === 'Resolved' || selectedTicket.status === 'Completed' || selectedTicket.status === 'Repair Completed'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : selectedTicket.status === 'Need Maintenance'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100 font-black'
                        : selectedTicket.status === 'Mechanic Assigned'
                          ? 'bg-purple-50 text-purple-600 border border-purple-100'
                          : selectedTicket.status === 'Closed'
                            ? 'bg-slate-100 text-slate-500 border border-slate-200'
                            : selectedTicket.status === 'In Progress' || selectedTicket.status === 'Repair In Progress'
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Estimated Repair Cost:</span>
                    <span className="font-bold text-[#1E293B]">
                      {selectedTicket.estimatedCost > 0 ? `₹${selectedTicket.estimatedCost.toLocaleString('en-IN')}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Actual Repair Cost:</span>
                    <span className="font-bold text-indigo-650">
                      {selectedTicket.actualCost > 0 ? `₹${selectedTicket.actualCost.toLocaleString('en-IN')}` : "-"}
                    </span>
                  </div>
                  {selectedTicket.completionDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Completion Date:</span>
                      <span className="font-bold text-slate-700">
                        {formatDateSafe(selectedTicket.completionDate, { dateStyle: 'medium' })}
                      </span>
                    </div>
                  )}

                  {/* Service Completion Bill & Invoice Section */}
                  {(selectedTicket.status === 'Completed' || selectedTicket.status === 'Resolved' || selectedTicket.status === 'Repair Completed') && (
                    <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2 font-nunito mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 font-poppins flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" /> Service Bill & Maintenance Receipt
                        </span>
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">Verified Receipt</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Invoice / Bill No.</span>
                          <span className="font-bold text-slate-800 font-mono">{selectedTicket.serviceBillNo || `INV-2026-${(selectedTicket._id || '0000').slice(-4)}`}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Total Bill Amount</span>
                          <span className="font-bold text-emerald-700 font-poppins text-sm">₹{(selectedTicket.actualCost || selectedTicket.estimatedCost || 2500).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-slate-200/50 mt-2">
                    <span className="text-slate-500 font-semibold block mb-1">Issue Description:</span>
                    <p className="text-slate-700 font-medium whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>
                  <div className="pt-2.5 border-t border-slate-200/50">
                    <span className="text-slate-500 font-semibold block mb-1">Maintenance Notes:</span>
                    <p className="text-slate-700 font-medium whitespace-pre-wrap italic">
                      {selectedTicket.notes || "No maintenance notes added yet."}
                    </p>
                  </div>
                  {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-200/50">
                      <span className="text-slate-500 font-semibold block mb-1.5">Driver Uploaded Photos / Attachments:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url || att}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative block w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm hover:shadow transition-all"
                          >
                            <img
                              src={att.url || att}
                              alt={att.filename || `Attachment ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                              Expand Photo 🔍
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer text-center"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateTicket} className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1.5 font-nunito">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Vehicle Plate:</span>
                    <span className="font-bold text-slate-700 uppercase">{resolveVehiclePlate(selectedTicket)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Driver Name:</span>
                    <span className="font-bold text-slate-700">{selectedTicket.driver?.fullName || selectedTicket.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Reported Issue:</span>
                    <span className="font-bold text-slate-700">{selectedTicket.issueType} ({selectedTicket.severity})</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/50 mt-1.5 text-slate-600 italic">
                    "{selectedTicket.description}"
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1">Ticket Status</label>
                  <select
                    value={editingTicketData.status}
                    onChange={(e) => setEditingTicketData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#1E293B] focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="Mechanic Assigned">Mechanic Assigned</option>
                    {['Mechanic Arrived', 'Repair In Progress', 'Repair Completed'].includes(editingTicketData.status) && (
                      <option value={editingTicketData.status} disabled>
                        Driver Stage: {editingTicketData.status} (Driver App)
                      </option>
                    )}
                    <option value="Resolved">Resolved (Auto Active Vehicle)</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled (Accident)">Cancel Trip (Severe Accident 🚨)</option>
                  </select>
                </div>

                {/* DYNAMIC CATEGORY-BASED FORM SECTION */}
                {renderDynamicCategoryForm(selectedTicket, editingTicketData, setEditingTicketData)}

                {(editingTicketData.status === 'Resolved' || editingTicketData.status === 'Closed') && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-semibold text-emerald-800 flex items-center gap-2 font-nunito">
                    <span>✨ Resolving ticket will set Vehicle Status to <strong>ACTIVE</strong> and send <strong>Continue Trip</strong> alert to driver!</span>
                  </div>
                )}

                {editingTicketData.status === 'Cancelled (Accident)' && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] font-semibold text-red-800 flex items-center gap-2 font-nunito">
                    <span>🚨 Cancelling trip due to severe accident will cancel trip, place vehicle in <strong>MAINTENANCE</strong> status, and free up driver!</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingTicketId === selectedTicket._id}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer text-center"
                  >
                    {updatingTicketId === selectedTicket._id ? "Saving..." : "Save Updates"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

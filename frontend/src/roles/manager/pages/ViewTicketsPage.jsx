import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Cpu
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";

export default function ViewTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("All");
  const [ticketSeverityFilter, setTicketSeverityFilter] = useState("All");
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

  const getCategoryKey = (issueTypeStr = '') => {
    const s = issueTypeStr.toString().toLowerCase();
    if (s.includes('fuel') || s.includes('payment') || s.includes('amount') || s.includes('receipt')) {
      return 'fuel';
    }
    if (s.includes('gps') || s.includes('app') || s.includes('device') || s.includes('crash') || s.includes('technical')) {
      return 'technical';
    }
    if (s.includes('delay') || s.includes('route') || s.includes('traffic') || s.includes('eta')) {
      return 'delay';
    }
    if (s.includes('breakdown') || s.includes('tow') || s.includes('accident')) {
      return 'breakdown';
    }
    return 'maintenance';
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
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    data.status === 'Resolved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ✓ Approve & Resolve
                </button>
                <button
                  type="button"
                  onClick={() => setData(prev => ({ ...prev, status: 'Rejected' }))}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    data.status === 'Rejected'
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

      case 'breakdown':
        return (
          <div className="space-y-3 p-3.5 bg-red-50/60 border border-red-200/70 rounded-xl font-nunito">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-red-900 font-poppins">Emergency Breakdown & Towing Assistance</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Mechanic Name"
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
                  Workshop / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sri Ram Service Bay"
                  value={data.mechanicLocation}
                  onChange={(e) => setData(prev => ({ ...prev, mechanicLocation: e.target.value }))}
                  className="w-full p-2 bg-white border border-red-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">Est. Repair Cost (₹)</label>
                <input
                  type="number"
                  value={data.estimatedCost}
                  onChange={(e) => setData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-red-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">Actual Repair Cost (₹)</label>
                <input
                  type="number"
                  value={data.actualCost}
                  onChange={(e) => setData(prev => ({ ...prev, actualCost: e.target.value }))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-red-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-poppins block mb-1">Breakdown & Repair Notes</label>
              <textarea
                rows="2"
                placeholder="Breakdown cause, towing details, parts replaced..."
                value={data.notes}
                onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2.5 bg-white border border-red-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>
        );

      case 'maintenance':
      default:
        return (
          <div className="space-y-3.5 p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl font-nunito">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-900 font-poppins">Vehicle Maintenance & Offline Mechanic</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Mechanic Name (e.g. Ramesh)"
                value={data.mechanicName}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  mechanicName: e.target.value,
                  status: prev.status === 'Open' ? 'Mechanic Assigned' : prev.status
                }))}
                className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Phone Number (e.g. 9876543210)"
                value={data.mechanicPhone}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  mechanicPhone: e.target.value,
                  status: prev.status === 'Open' ? 'Mechanic Assigned' : prev.status
                }))}
                className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <input
              type="text"
              placeholder="Workshop / Location (e.g. Bay 4 / Near Highway Toll)"
              value={data.mechanicLocation}
              onChange={(e) => setData(prev => ({
                ...prev,
                mechanicLocation: e.target.value,
                status: prev.status === 'Open' ? 'Mechanic Assigned' : prev.status
              }))}
              className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-3 pt-1">
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
              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1">Actual Repair Cost (₹)</label>
                <input
                  type="number"
                  value={data.actualCost}
                  onChange={(e) => setData(prev => ({ ...prev, actualCost: e.target.value }))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#1E293B] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1">Maintenance Notes</label>
              <textarea
                value={data.notes}
                onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Mechanic diagnosis notes, part replacement details..."
                rows="2"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-[#1E293B] placeholder-gray-400 focus:outline-none"
              ></textarea>
            </div>
          </div>
        );
    }
  };

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await managerApi.getVehicleComplaints();
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (err) {
      console.warn("Failed to load vehicle complaints from DB:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
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

      await managerApi.updateVehicleComplaint(selectedTicket._id, updateData);
      toast.success("Ticket updated successfully!");
      setSelectedTicket(null);
      await fetchTickets();
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
      t.vehiclePlate.toLowerCase().includes(q) ||
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

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] min-h-screen text-[#1E293B] font-nunito">
      <Breadcrumb />
      
      {/* Header Row */}
      <div className="border-b border-[#E7EAF0] pb-4 mb-6 select-none">
        <div>
          <h1 className="font-poppins font-bold text-[32px] leading-none text-[#1E293B]">
            Vehicle Issue Tickets
          </h1>
          <p className="text-[16px] text-[#64748B] mt-2">
            Resolve breakdowns, log repair costs, and track reported faults.
          </p>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="p-4 bg-white border border-[#E7EAF0] rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider font-poppins block">Total Tickets</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#1E293B] font-poppins">{tickets.length}</span>
            <span className="text-[10px] text-gray-400 font-medium">overall</span>
          </div>
        </div>

        <div className="p-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider font-poppins block">Open</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#1E293B] font-poppins">{tickets.filter(t => t.status === "Open").length}</span>
            <span className="text-[10px] text-blue-500 font-bold">pending</span>
          </div>
        </div>

        <div className="p-4 bg-amber-50/30 border border-amber-100/40 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-[#B45A0A] font-bold uppercase tracking-wider font-poppins block">In Progress</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#1E293B] font-poppins">{tickets.filter(t => t.status === "In Progress").length}</span>
            <span className="text-[10px] text-amber-500 font-bold">active</span>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/30 border border-emerald-100/40 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider font-poppins block">Resolved</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#1E293B] font-poppins">{tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length}</span>
            <span className="text-[10px] text-emerald-500 font-bold">solved</span>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/20 border border-indigo-100/30 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-indigo-650 font-bold uppercase tracking-wider font-poppins block">Total Cost</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-650 font-poppins">₹{tickets.reduce((sum, t) => sum + (Number(t.actualCost) || 0), 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="p-4 bg-purple-50/20 border border-purple-100/30 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider font-poppins block">Avg Cost</span>
          <div className="flex items-baseline justify-between">
            {(() => {
              const costList = tickets.filter(t => (Number(t.actualCost) || 0) > 0);
              const avg = costList.length > 0 ? Math.round(costList.reduce((sum, t) => sum + t.actualCost, 0) / costList.length) : 0;
              return <span className="text-2xl font-bold text-purple-700 font-poppins">₹{avg.toLocaleString('en-IN')}</span>;
            })()}
          </div>
        </div>
      </div>

      {/* Main panel card */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-6">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-indigo-300"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl text-xs">
              {["All", "Open", "In Progress", "Resolved", "Closed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setTicketStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    ticketStatusFilter === st
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                      : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Severity Filter Dropdown */}
            <div className="flex items-center gap-1.5 border border-gray-200 p-1.5 rounded-xl text-xs bg-white">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={ticketSeverityFilter}
                onChange={(e) => setTicketSeverityFilter(e.target.value)}
                className="bg-transparent font-bold text-[#64748B] focus:outline-none"
              >
                <option value="All">All Severities</option>
                <option value="Low">Low Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="High">High Severity</option>
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
                    <th className="py-3 px-4">Actual Repair Cost (₹)</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]/40">
                  {filteredTickets.map((t) => (
                    <tr key={t._id} className="hover:bg-[#F8FAFC]/30 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-indigo-650 bg-indigo-50/55 border border-indigo-150 px-2 py-0.5 rounded uppercase text-[10px] tracking-wide">
                          {t.vehiclePlate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-bold whitespace-nowrap">{t.driver?.fullName || t.driverName}</td>
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">{t.issueType}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase ${
                          t.severity === 'Critical'
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : t.severity === 'High'
                              ? 'bg-orange-50 text-orange-600 border border-orange-100'
                              : t.severity === 'Medium'
                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {t.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(t.reportedAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-650 whitespace-nowrap">
                        {t.actualCost > 0 ? `₹${t.actualCost.toLocaleString('en-IN')}` : "-"}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[8px] font-extrabold uppercase ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : t.status === 'Closed'
                              ? 'bg-slate-100 text-slate-500 border border-slate-200'
                              : t.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- EDIT TICKET SUB-MODAL --- */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-poppins font-bold text-[#1E293B] text-[14px]">
                  {modalMode === "view" ? "Vehicle Ticket Details" : "Update Issue Ticket"}
                </h4>
                <p className="text-[9px] text-[#B45A0A] font-bold uppercase tracking-wider mt-0.5">Ticket ID: {selectedTicket.ticketId}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            {modalMode === "view" ? (
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-2.5 font-nunito">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Vehicle Plate:</span>
                    <span className="font-bold text-slate-700 uppercase">{selectedTicket.vehiclePlate}</span>
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
                    <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase ${
                      selectedTicket.severity === 'Critical'
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : selectedTicket.severity === 'High'
                          ? 'bg-orange-50 text-orange-600 border border-orange-100'
                          : selectedTicket.severity === 'Medium'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {selectedTicket.severity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Reported Date & Time:</span>
                    <span className="font-bold text-slate-700">
                      {new Date(selectedTicket.reportedAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Current Status:</span>
                    <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[8px] font-extrabold uppercase ${
                      selectedTicket.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : selectedTicket.status === 'Closed'
                          ? 'bg-slate-100 text-slate-500 border border-slate-200'
                          : selectedTicket.status === 'In Progress'
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
                        {new Date(selectedTicket.completionDate).toLocaleDateString('en-IN')}
                      </span>
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
                    onClick={() => setSelectedTicket(null)}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer text-center"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateTicket} className="p-6 space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1.5 font-nunito">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Vehicle Plate:</span>
                    <span className="font-bold text-slate-700 uppercase">{selectedTicket.vehiclePlate}</span>
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
                  </select>
                </div>

                {/* DYNAMIC CATEGORY-BASED FORM SECTION */}
                {renderDynamicCategoryForm(selectedTicket, editingTicketData, setEditingTicketData)}

                {(editingTicketData.status === 'Resolved' || editingTicketData.status === 'Closed') && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-semibold text-emerald-800 flex items-center gap-2 font-nunito">
                    <span>✨ Resolving ticket will set Vehicle Status to <strong>ACTIVE</strong> and send <strong>Continue Trip</strong> alert to driver!</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
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

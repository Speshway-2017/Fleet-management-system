import { useState } from "react";
import { Wrench, CheckCircle2, Clock, Image, Phone, MapPin, User, AlertTriangle, ChevronRight, Check } from "lucide-react";
import driverApi from "../api/driverApi";
import { toast } from "react-hot-toast";

export default function IssueCard({ ticket, onStatusUpdated }) {
  const [localStatus, setLocalStatus] = useState(ticket.status || "Open");
  const [updating, setUpdating] = useState(false);

  if (!ticket) return null;

  const currentStatus = localStatus || ticket.status || "Open";
  const priorityStr = ticket.severity || ticket.priority || "MEDIUM";

  const getPriorityBadge = (priority) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
      case "URGENT":
      case "CRITICAL":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-poppins">HIGH</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-poppins">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-poppins">LOW</span>;
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase() || "";
    if (s === "RESOLVED" || s === "COMPLETED" || s === "CLOSED") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-poppins">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolved
        </span>
      );
    }
    if (s === "CANCELLED (ACCIDENT)") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 font-poppins">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Cancelled (Accident)
        </span>
      );
    }
    if (s === "MECHANIC ASSIGNED" || s === "MECHANIC ARRIVED" || s === "REPAIR IN PROGRESS" || s === "REPAIR COMPLETED" || s === "IN_PROGRESS") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-poppins">
          <Wrench className="w-3.5 h-3.5 text-blue-600 animate-spin" /> {status}
        </span>
      );
    }
    if (s === "NEED MAINTENANCE") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1 font-poppins">
          <Wrench className="w-3.5 h-3.5 text-orange-600" /> Maintenance Needed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 font-poppins">
        <Clock className="w-3.5 h-3.5 text-amber-600" /> Open / Review
      </span>
    );
  };

  const handleUpdateStatus = async (newStatus) => {
    const prevStatus = currentStatus;
    try {
      setUpdating(true);
      setLocalStatus(newStatus);
      const res = await driverApi.updateTicketStatus(ticket._id || ticket.ticketId, newStatus);
      if (res?.success) {
        toast.success(`Status updated to "${newStatus}"`);
        if (onStatusUpdated) onStatusUpdated(res.data || { ...ticket, status: newStatus });
      } else {
        setLocalStatus(prevStatus);
      }
    } catch (err) {
      setLocalStatus(prevStatus);
      toast.error(err.response?.data?.message || "Failed to update ticket status");
    } finally {
      setUpdating(false);
    }
  };

  const mechanic = ticket.assignedMechanic;
  const hasMechanic = mechanic && (mechanic.name || mechanic.phone);
  const attachments = ticket.attachments || [];
  const photoUrl = ticket.photoUrl || (attachments.length > 0 ? attachments[0].url : null);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition shadow-sm hover:shadow-md flex flex-col justify-between font-nunito space-y-4">
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900 text-sm font-poppins">{ticket.issueType || ticket.title || "Vehicle Issue"}</h3>
                {getPriorityBadge(priorityStr)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">#{ticket.ticketId || ticket.ticketNumber || ticket._id?.slice(-6)}</p>
            </div>
          </div>
          {getStatusBadge(currentStatus)}
        </div>

        {/* Vehicle & Trip Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-3 px-1">
          <span>Vehicle: <strong className="text-slate-800 uppercase font-mono">{ticket.vehiclePlate || "VEH-ASSIGNED"}</strong></span>
          <span>Date: <strong className="text-slate-700">{ticket.reportedAt || ticket.createdAt ? new Date(ticket.reportedAt || ticket.createdAt).toLocaleDateString() : "Recently"}</strong></span>
        </div>

        {/* Issue Description */}
        <p className="text-xs text-slate-700 my-3 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
          {ticket.description || "No detailed description provided."}
        </p>

        {/* Condition Banners */}
        {currentStatus === "Resolved" || currentStatus === "Closed" ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ticket Resolved! Vehicle is Active. Continue your trip safely 🚚</span>
          </div>
        ) : currentStatus === "Cancelled (Accident)" ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Trip Cancelled due to Severe Accident 🚨 Contact dispatcher.</span>
          </div>
        ) : null}

        {/* Mechanic Card snippet */}
        {hasMechanic && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-xs my-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1 font-poppins">
                <User className="w-3.5 h-3.5 text-blue-600" /> Mechanic: {mechanic.name || "Assigned"}
              </span>
              {mechanic.phone && (
                <a
                  href={`tel:${mechanic.phone}`}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <Phone className="w-3 h-3" /> Call
                </a>
              )}
            </div>
            {mechanic.location && (
              <p className="text-slate-600 text-[11px] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-500 shrink-0" /> {mechanic.location}
              </p>
            )}
          </div>
        )}

        {/* Driver Progress Buttons */}
        {currentStatus === "Mechanic Assigned" && (
          <button
            onClick={() => handleUpdateStatus("Mechanic Arrived")}
            disabled={updating}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-poppins transition shadow-sm flex items-center justify-center gap-1 cursor-pointer my-2"
          >
            {updating ? "Updating..." : "Mechanic Arrived 📍"}
          </button>
        )}

        {currentStatus === "Mechanic Arrived" && (
          <button
            onClick={() => handleUpdateStatus("Repair In Progress")}
            disabled={updating}
            className="w-full py-2 px-3 bg-[#B45A0A] hover:bg-[#9A4D08] disabled:opacity-50 text-white rounded-xl text-xs font-bold font-poppins transition shadow-sm flex items-center justify-center gap-1 cursor-pointer my-2"
          >
            {updating ? "Updating..." : "Start Repair 🔧"}
          </button>
        )}

        {currentStatus === "Repair In Progress" && (
          <div className="space-y-2 my-2">
            <button
              onClick={() => handleUpdateStatus("Repair Completed")}
              disabled={updating}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-poppins transition shadow-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              {updating ? "Updating..." : "Mark Repair Completed ✅"}
            </button>
            <button
              onClick={() => handleUpdateStatus("Need Maintenance")}
              disabled={updating}
              className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              Need Full Maintenance Escalation 🛠️
            </button>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Timeline: {ticket.repairTimeline?.length || 1} logs</span>
        {photoUrl && (
          <a
            href={photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B45A0A] hover:underline flex items-center gap-1 font-semibold"
          >
            <Image className="w-3.5 h-3.5" /> View Photo
          </a>
        )}
      </div>
    </div>
  );
}

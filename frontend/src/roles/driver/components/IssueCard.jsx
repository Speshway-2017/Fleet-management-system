import { useState, useEffect, useRef } from "react";
import { Wrench, CheckCircle2, Clock, Image, Phone, MapPin, User, AlertTriangle, FileText, X } from "lucide-react";
import driverApi from "../api/driverApi";
import { toast } from "react-hot-toast";

export default function IssueCard({ ticket, onStatusUpdated, highlighted = false }) {
  const [localStatus, setLocalStatus] = useState(ticket.status || "Open");
  const [updating, setUpdating] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  // Modal State for Resolving & Uploading Service Bill
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [billFile, setBillFile] = useState(null);
  const [actualCost, setActualCost] = useState(ticket.actualCost || "");
  const [resolveNotes, setResolveNotes] = useState("");
  const [resolving, setResolving] = useState(false);

  // Modal State for Viewing Uploaded Bills & Photos
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [zoomMedia, setZoomMedia] = useState(null);

  if (!ticket) return null;

  const currentStatus = localStatus || ticket.status || "Open";
  const priorityStr = ticket.severity || ticket.priority || "MEDIUM";

  const getMediaFiles = () => {
    const files = [];
    const seen = new Set();

    const add = (url, typeLabel, originalName) => {
      if (!url || typeof url !== "string") return;
      const clean = url.trim();
      if (!clean || seen.has(clean)) return;
      seen.add(clean);

      const lower = clean.toLowerCase();
      const isPdf = lower.endsWith(".pdf") || lower.includes("/pdf") || lower.includes(".pdf?");

      files.push({
        url: clean,
        typeLabel: typeLabel || "Uploaded File",
        filename: originalName || (isPdf ? "Document.pdf" : "Attachment.jpg"),
        isPdf
      });
    };

    // 1. Service Bill / Invoice
    if (ticket.serviceBillUrl) add(ticket.serviceBillUrl, "Service Bill / Receipt");
    if (ticket.billUrl) add(ticket.billUrl, "Service Bill / Receipt");
    if (ticket.invoiceUrl) add(ticket.invoiceUrl, "Service Bill / Receipt");

    // 2. Attachments
    if (Array.isArray(ticket.attachments)) {
      ticket.attachments.forEach((att, idx) => {
        const u = typeof att === "string" ? att : att?.url;
        const fn = typeof att === "object" ? att?.filename : "";
        let label = fn || `Attachment #${idx + 1}`;
        if (u === ticket.serviceBillUrl || u === ticket.billUrl) {
          label = "Service Bill / Receipt";
        } else if (u === ticket.photoUrl) {
          label = "Issue Photo";
        }
        add(u, label, fn);
      });
    }

    // 3. Photo URL (issue photo)
    if (ticket.photoUrl) add(ticket.photoUrl, "Issue Photo");

    // 4. Timeline logs
    if (Array.isArray(ticket.repairTimeline)) {
      ticket.repairTimeline.forEach((log) => {
        if (log.billUrl) add(log.billUrl, "Service Bill / Receipt");
        if (log.photoUrl) add(log.photoUrl, "Repair Photo");
        if (Array.isArray(log.attachments)) {
          log.attachments.forEach((att) => {
            const u = typeof att === "string" ? att : att?.url;
            add(u, "Timeline Attachment");
          });
        }
      });
    }

    return files;
  };

  const mediaFiles = getMediaFiles();

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
    if (s === "RESOLVED" || s === "COMPLETED" || s === "CLOSED" || s === "REPAIR COMPLETED" || s === "REPAIR_COMPLETED") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-poppins">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {status === "Repair Completed" ? "Repair Completed" : "Resolved"}
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
    if (s === "NEED MAINTENANCE") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1 font-poppins animate-pulse">
          <Wrench className="w-3.5 h-3.5 text-[#A14000]" /> Maintenance Needed
        </span>
      );
    }
    if (s === "MECHANIC ASSIGNED" || s === "MECHANIC ARRIVED" || s === "REPAIR IN PROGRESS" || s === "IN_PROGRESS") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-poppins">
          <Wrench className="w-3.5 h-3.5 text-blue-600 animate-spin" /> {status}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 font-poppins">
        <Clock className="w-3.5 h-3.5 text-amber-600" /> Open / Review
      </span>
    );
  };

  const handleUpdateStatus = async (newStatus, notes = "") => {
    const prevStatus = currentStatus;
    try {
      setUpdating(true);
      setLocalStatus(newStatus);
      const res = await driverApi.updateTicketStatus(ticket._id || ticket.ticketId, { status: newStatus, notes });
      if (res?.success) {
        if (newStatus === "Need Maintenance") {
          toast.success(`Need Maintenance flag sent! Manager notified. 🚨`);
        } else {
          toast.success(`Status updated to "${newStatus}"`);
        }
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

  const handleResolveWithBill = async (e) => {
    e.preventDefault();
    if (!billFile) {
      toast.error("Please upload the Service Bill / Invoice receipt file");
      return;
    }

    setResolving(true);
    try {
      const formData = new FormData();
      formData.append("status", "Resolved");
      formData.append("file", billFile);
      if (actualCost) formData.append("actualCost", actualCost);
      if (resolveNotes) formData.append("notes", resolveNotes);

      const ticketIdentifier = ticket._id || ticket.ticketId;
      const res = await driverApi.resolveTicket(ticketIdentifier, formData);

      if (res?.success) {
        toast.success("Ticket Resolved & Service Bill uploaded! Manager notified. ✅");
        setLocalStatus("Resolved");
        setShowResolveModal(false);
        setBillFile(null);
        setActualCost("");
        setResolveNotes("");
        if (onStatusUpdated) onStatusUpdated(res.data || { ...ticket, status: "Resolved" });
      } else {
        toast.error(res?.message || "Failed to resolve ticket");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload service bill and resolve ticket");
    } finally {
      setResolving(false);
    }
  };

  const mechanic = ticket.assignedMechanic;
  const hasMechanic = mechanic && (mechanic.name || mechanic.phone);
  const attachments = ticket.attachments || [];
  const photoUrl = ticket.photoUrl || (attachments.length > 0 ? attachments[0].url : null);
  const sUpper = currentStatus?.toUpperCase() || "";
  const isResolvedOrCompleted = sUpper === "RESOLVED" || sUpper === "COMPLETED" || sUpper === "CLOSED" || sUpper === "REPAIR COMPLETED" || sUpper === "REPAIR_COMPLETED";
  const isNeedMaintenance = sUpper === "NEED MAINTENANCE" || sUpper === "NEED_MAINTENANCE";

  return (
    <div
      ref={cardRef}
      className={`bg-white border rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between font-nunito space-y-4 relative ${
        highlighted
          ? "border-amber-500 ring-4 ring-amber-500/40 shadow-2xl scale-[1.02] bg-amber-50/20"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      }`}
    >
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
              <p className="text-xs text-slate-400 mt-0.5 font-mono">#{ticket.ticketId || ticket.ticketNumber || (ticket._id ? ticket._id.slice(-6) : "TKT")}</p>
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
        {isResolvedOrCompleted ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ticket Resolved & Service Bill Attached! Vehicle Active. 🚚</span>
          </div>
        ) : currentStatus === "Cancelled (Accident)" ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Trip Cancelled due to Severe Accident 🚨 Contact dispatcher.</span>
          </div>
        ) : isNeedMaintenance ? (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs font-semibold text-orange-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#A14000] shrink-0" />
            <span>Vehicle repair incomplete / needs maintenance! Manager notified. Upload bill to resolve.</span>
          </div>
        ) : null}

        {/* Mechanic Card snippet */}
        {hasMechanic && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-xs my-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1 font-poppins">
                <User className="w-3.5 h-3.5 text-blue-600" /> Mechanic: {mechanic.name || "Assigned"}
              </span>
              {mechanic.phone && !isResolvedOrCompleted && (
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

        {/* Driver Progress Action Buttons */}
        {isResolvedOrCompleted ? (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 font-poppins my-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Service Completed & Resolved ✅</span>
          </div>
        ) : isNeedMaintenance ? (
          <div className="space-y-2 my-2">
            <button
              onClick={() => setShowResolveModal(true)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-poppins transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Resolved & Upload Service Bill 📄</span>
            </button>
          </div>
        ) : !hasMechanic ? (
          (currentStatus === "Open" || currentStatus === "OPEN") ? (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs font-medium text-amber-900 space-y-1 my-2">
              <div className="flex items-center gap-2 font-bold font-poppins text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Awaiting Manager Mechanic Assignment ⏳</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Manager has been notified. Options will unlock once a mechanic is assigned and arrives.
              </p>
            </div>
          ) : null
        ) : currentStatus !== "Mechanic Arrived" && currentStatus !== "Repair In Progress" && currentStatus !== "In Progress" ? (
          /* Stage 1: Mechanic assigned by manager, waiting for driver to mark Mechanic Arrived */
          <div className="space-y-2 my-2">
            <button
              onClick={() => handleUpdateStatus("Mechanic Arrived")}
              disabled={updating}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-poppins transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>{updating ? "Updating..." : "Mechanic Arrived 📍"}</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Click when mechanic reaches the vehicle location to unlock service actions.
            </p>
          </div>
        ) : (
          /* Stage 2: Driver has marked Mechanic Arrived -> NOW display Service Complete & Need Maintenance buttons */
          <div className="space-y-2 my-2">
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 flex items-center justify-center gap-1.5 font-poppins">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Mechanic On-Site / Service Active 📍</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowResolveModal(true)}
                disabled={updating}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-poppins transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Service Complete</span>
              </button>

              <button
                onClick={() => handleUpdateStatus("Need Maintenance", "Vehicle is not repaired yet. Further maintenance required.")}
                disabled={updating}
                className="py-2.5 px-3 bg-[#A14000] hover:bg-[#853400] disabled:opacity-50 text-white rounded-xl text-xs font-bold font-poppins transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Need Maintenance</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Timeline: {ticket.repairTimeline?.length || 1} logs</span>
        {mediaFiles.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMediaModal(true)}
            className="text-[#A14000] hover:text-[#8a4406] hover:underline flex items-center gap-1.5 font-bold cursor-pointer transition text-xs"
          >
            <Image className="w-4 h-4 text-[#A14000]" />
            <span>View Bill / Photo {mediaFiles.length > 1 ? `(${mediaFiles.length})` : ""}</span>
          </button>
        )}
      </div>

      {/* Modal: View All Ticket Bills & Uploaded Photos */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative font-nunito flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-bold font-poppins text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#A14000]" />
                  Uploaded Bills & Photos
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  Ticket <span className="font-bold text-slate-700">#{ticket.ticketId || ticket._id}</span> • {ticket.issueType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mediaFiles.map((file, index) => {
                  const isBill = file.typeLabel.toLowerCase().includes("bill") || file.typeLabel.toLowerCase().includes("receipt") || file.typeLabel.toLowerCase().includes("invoice");
                  return (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 hover:bg-white hover:border-[#A14000]/40 transition shadow-sm flex flex-col justify-between group"
                    >
                      <div>
                        {/* Type Badge Header */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border font-poppins flex items-center gap-1.5 ${
                              isBill
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {isBill ? <FileText className="w-3.5 h-3.5 text-emerald-600" /> : <Image className="w-3.5 h-3.5 text-amber-600" />}
                            {file.typeLabel}
                          </span>
                        </div>

                        {/* File Preview */}
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900/5 h-44 flex items-center justify-center">
                          {file.isPdf ? (
                            <div className="text-center p-4">
                              <FileText className="w-12 h-12 text-rose-500 mx-auto mb-2" />
                              <span className="text-xs font-bold text-slate-700 block truncate max-w-[200px]">
                                {file.filename}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-1">PDF Document</span>
                            </div>
                          ) : (
                            <img
                              src={file.url}
                              alt={file.typeLabel}
                              className="w-full h-full object-contain bg-slate-950/20 cursor-pointer group-hover:scale-105 transition-transform duration-200"
                              onClick={() => setZoomMedia(file)}
                            />
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        {!file.isPdf && (
                          <button
                            type="button"
                            onClick={() => setZoomMedia(file)}
                            className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            🔍 Zoom
                          </button>
                        )}
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#A14000] hover:underline font-bold flex items-center gap-1 ml-auto text-xs"
                        >
                          Open Original ↗
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-poppins rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom View for selected image */}
      {zoomMedia && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setZoomMedia(null)}
              className="absolute -top-12 right-0 text-white bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <span className="text-white text-xs font-bold font-poppins mb-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur">
              {zoomMedia.typeLabel}
            </span>
            <img
              src={zoomMedia.url}
              alt={zoomMedia.typeLabel}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <a
              href={zoomMedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-[#A14000] text-white rounded-xl text-xs font-bold shadow hover:bg-[#8c4506] transition flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              Open Full Resolution Image ↗
            </a>
          </div>
        </div>
      )}

      {/* Modal: Resolve Ticket & Upload Service Bill */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl relative font-nunito">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold font-poppins text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" /> Resolve Ticket & Upload Bill
              </h3>
              <button
                onClick={() => setShowResolveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveWithBill} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">
                  Service Bill / Repair Invoice Receipt <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => setBillFile(e.target.files[0])}
                  className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">Upload workshop bill image or PDF receipt.</p>
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">
                  Actual Repair Cost (₹)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="e.g. 1500"
                    className="block w-full pl-7 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">
                  Resolution Notes / Repairs Done
                </label>
                <textarea
                  rows={3}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="e.g. Brake pads replaced at Sai Garage. Vehicle tested and road ready."
                  className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold font-poppins rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-poppins rounded-xl disabled:opacity-50 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {resolving ? "Uploading..." : "Submit Resolution & Bill ✅"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


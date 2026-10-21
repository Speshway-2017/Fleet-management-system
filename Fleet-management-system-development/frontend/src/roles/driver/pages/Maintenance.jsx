import { useState, useEffect } from "react";
import DashboardSkeletonLoader from "@/components/common/DashboardSkeletonLoader";
import { useSearchParams } from "react-router-dom";
import driverApi from "../api/driverApi";
import IssueCard from "../components/IssueCard";
import { toast } from "react-hot-toast";
import { Wrench, Plus, X, RefreshCw, AlertTriangle } from "lucide-react";

import { useDriverSocket } from "../hooks/useDriverSocket";

export default function DriverMaintenancePage() {
  const [searchParams] = useSearchParams();
  const highlightedTicketId = searchParams.get("ticketId") || searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [assignedVehicleInfo, setAssignedVehicleInfo] = useState(null);
  const [hasVehicle, setHasVehicle] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [issueType, setIssueType] = useState("Tyre / Brake Issue");
  const [customIssue, setCustomIssue] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [activeTrip, setActiveTrip] = useState(null);
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (field, value, type = issueType) => {
    if (field === "description") {
      const val = (value || "").trim();
      if (!val) return "Description is required.";
      if (val.length < 5) return "Description must be at least 5 characters.";
      if (val.length > 500) return "Description cannot exceed 500 characters.";
      if (/^\d+$/.test(val)) return "Description must contain valid text (cannot be only numbers).";
      if (/(.)\1{4,}/i.test(val)) return "Description cannot contain repeated characters.";
      if (/^(asdf|qwer|zxcv|test|dummy|abc|xyz)/i.test(val.replace(/[\s.'-]+/g, ""))) {
        return "Description cannot be meaningless text.";
      }
      return "";
    }
    if (field === "customIssue") {
      if (type !== "Other / Custom Issue") return "";
      const val = (value || "").trim();
      if (!val) return "Please specify the custom issue.";
      if (val.length < 3) return "Custom issue must be at least 3 characters.";
      if (val.length > 60) return "Custom issue cannot exceed 60 characters.";
      if (/^\d+$/.test(val)) return "Custom issue must contain valid text (cannot be only numbers).";
      if (/(.)\1{3,}/i.test(val)) return "Custom issue cannot contain repeated characters.";
      return "";
    }
    return "";
  };

  const handleFieldChange = (field, value) => {
    if (field === "description") setDescription(value);
    if (field === "customIssue") setCustomIssue(value);
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleFieldBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  useEffect(() => {
    fetchTickets();
    fetchAssignedVehicle();
    fetchActiveTrip();

    const interval = setInterval(() => {
      fetchTickets(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchActiveTrip = async () => {
    try {
      const res = await driverApi.getCurrentTrip();
      if (res?.success && res.data) {
        setActiveTrip(res.data);
      } else {
        setActiveTrip(null);
      }
    } catch (err) {
      console.warn("Failed to fetch active trip for maintenance check:", err);
    }
  };

  const fetchAssignedVehicle = async () => {
    try {
      const res = await driverApi.getAssignedVehicle();
      if (res?.success) {
        setAssignedVehicleInfo(res.data);
        const isAssigned = Boolean(res.data?.assigned && res.data?.vehicle);
        setHasVehicle(isAssigned);
      }
    } catch (err) {
      console.warn("Failed to check assigned vehicle:", err);
    }
  };

  const vehObj = assignedVehicleInfo?.vehicle || assignedVehicleInfo;
  const isPermanentVehicleAssigned = Boolean(
    (assignedVehicleInfo?.assigned && vehObj) ||
      (vehObj &&
        (vehObj._id || vehObj.id || vehObj.vehicleNumber) &&
        vehObj.vehicleNumber !== "Unassigned" &&
        vehObj.vehicleNumber !== "No Vehicle Assigned")
  );
  const isTripAccepted = Boolean(
    activeTrip &&
      (activeTrip.status === "ACCEPTED" ||
        activeTrip.status === "IN_PROGRESS" ||
        activeTrip.status === "ON_TRIP" ||
        activeTrip.acceptStatus === "ACCEPTED")
  );
  const isMaintenanceEnabled = isPermanentVehicleAssigned || isTripAccepted;

  // Listen for real-time manager updates so page updates automatically without manual refresh
  useDriverSocket({
    onTicketStatusUpdated: () => {
      fetchTickets(true);
    },
    onTripStatusUpdated: () => {
      fetchTickets(true);
      fetchAssignedVehicle();
      fetchActiveTrip();
    },
    onNotification: (notif) => {
      toast(notif.title || "Ticket Update Received", { icon: "🔧" });
      fetchTickets(true);
    }
  });

  const fetchTickets = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await driverApi.getTickets();
      if (res?.success && Array.isArray(res.data)) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleOpenReportModal = () => {
    if (!isMaintenanceEnabled) {
      toast.error("Maintenance reporting is locked. Requires an assigned vehicle or an active trip.");
      return;
    }
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!isMaintenanceEnabled) {
      toast.error("Maintenance reporting is locked. Requires an assigned vehicle or an active trip.");
      return;
    }

    const descErr = validateField("description", description);
    const customErr = validateField("customIssue", customIssue);

    setTouched({ description: true, customIssue: true });
    setErrors({ description: descErr, customIssue: customErr });

    if (descErr || customErr) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    const finalIssueType = issueType === "Other / Custom Issue" ? (customIssue.trim() || "Custom Driver Issue") : issueType;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("issueType", finalIssueType);
      formData.append("severity", priority);
      formData.append("priority", priority);
      formData.append("description", description);
      if (photoFile) formData.append("file", photoFile);

      const res = await driverApi.createTicket(formData);
      if (res?.success) {
        toast.success("Issue ticket created successfully! Manager notified.");
        setShowModal(false);
        setIssueType("Tyre / Brake Issue");
        setCustomIssue("");
        setPriority("MEDIUM");
        setDescription("");
        setPhotoFile(null);
        setErrors({});
        setTouched({});
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit issue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-nunito pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-rose-600" />
            Vehicle Maintenance & Issue Tickets
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Report breakdown, tyre, electrical, or engine issues directly to your fleet manager.
          </p>
        </div>

        <button
          onClick={handleOpenReportModal}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-poppins flex items-center justify-center gap-2 transition shadow-sm ${
            isMaintenanceEnabled
              ? "bg-[#A14000] hover:bg-[#853400] text-white cursor-pointer"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Report New Vehicle Issue</span>
        </button>
      </div>

      {/* Unassigned Vehicle Warning Banner */}
      {!hasVehicle && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 font-nunito">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm font-poppins text-amber-900">No Vehicle Assigned</h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              You currently have no vehicle assigned to your driver account. Maintenance reporting and new issue tickets are only available when a vehicle is assigned. You can still view your previously reported issue tickets below.
            </p>
          </div>
        </div>
      )}

      {/* Ticket Cards Grid */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center font-poppins">
          <RefreshCw className="w-8 h-8 text-[#A14000] animate-spin" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => {
            const isMatch = highlightedTicketId && (
              String(ticket._id) === String(highlightedTicketId) ||
              String(ticket.id) === String(highlightedTicketId) ||
              String(ticket.ticketId || "").toUpperCase() === String(highlightedTicketId).toUpperCase() ||
              String(ticket.complaintId || "").toUpperCase() === String(highlightedTicketId).toUpperCase()
            );
            return (
              <IssueCard
                key={ticket._id || ticket.id}
                ticket={ticket}
                highlighted={Boolean(isMatch)}
                onStatusUpdated={() => fetchTickets(true)}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Wrench className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-slate-800 font-semibold font-poppins text-base">No Issues Reported</h3>
          <p className="text-slate-500 text-xs mt-1">Click "Report New Vehicle Issue" to notify fleet manager of any vehicle breakdown.</p>
        </div>
      )}

      {/* Modal: Create Issue Ticket */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl relative font-nunito">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold font-poppins text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-600" /> Report Issue Ticket
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Category / Issue Type</label>
                <select
                  value={issueType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setIssueType(newType);
                    if (newType === "Other / Custom Issue") {
                      const err = validateField("customIssue", customIssue, newType);
                      setErrors(prev => ({ ...prev, customIssue: err }));
                    } else {
                      setErrors(prev => ({ ...prev, customIssue: "" }));
                    }
                  }}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none"
                >
                  <option value="Tyre / Brake Issue">Tyre / Brake Issue (Puncture, Air Pressure, Brakes)</option>
                  <option value="Mechanic / Engine Breakdown">Mechanic / Engine Breakdown (Overheating, Gearbox)</option>
                  <option value="Severe Accident / Emergency">Severe Accident / Emergency Breakdown</option>
                  <option value="Fuel / Payment Issue">Fuel / Payment Issue (Fuel Station, Card Glitch)</option>
                  <option value="Electrical / Battery Issue">Electrical / Battery Issue (Headlight, Battery Dead)</option>
                  <option value="Other / Custom Issue">Other / Custom Issue (Specify Below)</option>
                </select>
              </div>

              {issueType === "Other / Custom Issue" && (
                <div>
                  <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">
                    Specify Custom Issue <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customIssue}
                    onChange={(e) => handleFieldChange("customIssue", e.target.value)}
                    onBlur={(e) => handleFieldBlur("customIssue", e.target.value)}
                    placeholder="e.g., Steering vibration, Windshield crack..."
                    className={`mt-1 block w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 text-xs focus:outline-none transition-all ${
                      touched.customIssue && errors.customIssue
                        ? "border-rose-500 bg-rose-50/20 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-300 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                    }`}
                  />
                  {touched.customIssue && errors.customIssue && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1 font-poppins flex items-center gap-1">
                      • {errors.customIssue}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none"
                >
                  <option value="LOW">LOW - Minor / Informational</option>
                  <option value="MEDIUM">MEDIUM - Standard Repair</option>
                  <option value="HIGH">HIGH - Urgent Breakdown</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">
                    Detailed Description <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-semibold ${description.length > 500 ? "text-rose-500 font-bold" : "text-slate-400"}`}>
                    {description.length} / 500
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  maxLength={500}
                  value={description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  onBlur={(e) => handleFieldBlur("description", e.target.value)}
                  placeholder="Describe the noise, warning light, or failure..."
                  className={`mt-1 block w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-all ${
                    touched.description && errors.description
                      ? "border-rose-500 bg-rose-50/20 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-300 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                  }`}
                />
                {touched.description && errors.description && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1 font-poppins flex items-center gap-1">
                    • {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Photo / Evidence Attachment</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#A14000] hover:file:bg-amber-100 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold font-poppins rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#A14000] hover:bg-[#853400] text-white text-xs font-bold font-poppins rounded-xl disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

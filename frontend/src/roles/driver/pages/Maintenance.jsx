import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import driverApi from "../api/driverApi";
import IssueCard from "../components/IssueCard";
import { toast } from "react-hot-toast";
import { Wrench, Plus, X, RefreshCw } from "lucide-react";

import { useDriverSocket } from "../hooks/useDriverSocket";

export default function DriverMaintenancePage() {
  const [searchParams] = useSearchParams();
  const highlightedTicketId = searchParams.get("ticketId") || searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [issueType, setIssueType] = useState("Tyre / Brake Issue");
  const [customIssue, setCustomIssue] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchTickets();

    const interval = setInterval(() => {
      fetchTickets(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Listen for real-time manager updates so page updates automatically without manual refresh
  useDriverSocket({
    onTicketStatusUpdated: () => {
      fetchTickets(true);
    },
    onTripStatusUpdated: () => {
      fetchTickets(true);
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

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!description) {
      toast.error("Please provide a description of the issue");
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
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white font-bold font-poppins rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Vehicle Issue</span>
        </button>
      </div>

      {/* Ticket Cards Grid */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center font-poppins">
          <RefreshCw className="w-8 h-8 text-[#B45A0A] animate-spin" />
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
                  onChange={(e) => setIssueType(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
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
                  <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Specify Custom Issue</label>
                  <input
                    type="text"
                    required
                    value={customIssue}
                    onChange={(e) => setCustomIssue(e.target.value)}
                    placeholder="e.g., Steering vibration, Windshield crack..."
                    className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
                >
                  <option value="LOW">LOW - Minor / Informational</option>
                  <option value="MEDIUM">MEDIUM - Standard Repair</option>
                  <option value="HIGH">HIGH - Urgent Breakdown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the noise, warning light, or failure..."
                  className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Photo / Evidence Attachment</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#B45A0A] hover:file:bg-amber-100 cursor-pointer"
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
                  className="px-4 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] text-white text-xs font-bold font-poppins rounded-xl disabled:opacity-50 shadow-sm"
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

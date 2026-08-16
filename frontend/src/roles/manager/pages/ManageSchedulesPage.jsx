import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Clock, Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { managerApi } from "../api/managerApi";

const INITIAL_SCHEDULES = [
  { id: 1, name: "Weekly Driver Log Sheets", type: "Operational", frequency: "Weekly", day: "Monday", time: "09:00", format: "CSV", recipients: "ops-team@fleet.com", status: "Active" },
  { id: 2, name: "Monthly Fuel Cost Report", type: "Financial", frequency: "Monthly", day: "1st", time: "08:00", format: "PDF", recipients: "finance@fleet.com", status: "Active" },
  { id: 3, name: "Q3 Compliance Audit", type: "Compliance", frequency: "Quarterly", day: "1st", time: "10:00", format: "PDF", recipients: "compliance@fleet.com", status: "Paused" },
  { id: 4, name: "Daily Fleet Uptime Summary", type: "Operational", frequency: "Daily", day: "Every day", time: "07:00", format: "CSV", recipients: "manager@fleet.com", status: "Active" },
  { id: 5, name: "Safety Incident Weekly Log", type: "Safety", frequency: "Weekly", day: "Friday", time: "17:00", format: "PDF", recipients: "safety@fleet.com", status: "Active" },
];

const TYPE_COLORS = {
  Financial:   "bg-red-100 text-red-700",
  Operational: "bg-green-100 text-green-700",
  Compliance:  "bg-blue-100 text-blue-700",
  Safety:      "bg-purple-100 text-purple-700",
};

const FREQ_COLORS = {
  Daily:     "bg-gray-100 text-gray-600",
  Weekly:    "bg-amber-100 text-amber-700",
  Monthly:   "bg-blue-50 text-blue-600",
  Quarterly: "bg-purple-50 text-purple-600",
};

const BLANK = { name: "", type: "Operational", frequency: "Weekly", day: "Monday", time: "09:00", format: "PDF", recipients: "", status: "Active" };

export default function ManageSchedulesPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = new, id = edit
  const [form, setForm] = useState(BLANK);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await managerApi.getReports();
      const result = response.data?.data || response.data;
      if (Array.isArray(result)) {
        setSchedules(result.map(s => ({ ...s, id: s._id })));
      } else {
        setSchedules([]);
      }
    } catch (error) {
      toast.error("Failed to load schedules from database");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const totalPages = Math.ceil(schedules.length / PAGE_SIZE);
  const paginated = schedules.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openNew = () => {
    setEditing(null);
    setForm(BLANK);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s.id);
    setForm({ ...s });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Schedule name is required"); return; }
    if (!form.recipients.trim()) { toast.error("Recipients field is required"); return; }

    try {
      if (editing) {
        await managerApi.updateReport(editing, {
          name: form.name,
          type: form.type,
          frequency: form.frequency,
          day: form.day,
          time: form.time,
          format: form.format,
          recipients: form.recipients,
          status: form.status
        });
        toast.success("Schedule updated!");
      } else {
        await managerApi.createReport({
          name: form.name,
          type: form.type,
          frequency: form.frequency,
          day: form.day,
          time: form.time,
          format: form.format,
          recipients: form.recipients,
          status: form.status
        });
        toast.success("Schedule created!");
      }
      setShowModal(false);
      fetchSchedules();
    } catch (error) {
      toast.error("Failed to save schedule");
      console.error(error);
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await managerApi.deleteReport(id);
      toast.success(`"${name}" schedule deleted`);
      fetchSchedules();
    } catch (error) {
      toast.error("Failed to delete schedule");
      console.error(error);
    }
  };

  const toggleStatus = async (id) => {
    const matched = schedules.find(s => s.id === id);
    if (!matched) return;
    const nextStatus = matched.status === "Active" ? "Paused" : "Active";
    try {
      await managerApi.updateReport(id, { status: nextStatus });
      toast.success(`Schedule delivery ${nextStatus === 'Active' ? 'activated' : 'paused'}!`);
      fetchSchedules();
    } catch (error) {
      toast.error("Failed to toggle status");
      console.error(error);
    }
  };

  return (
    <div className="w-full px-6 md:px-8 py-8 min-h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/manager/reports")}
            className="p-2 bg-white border border-[#E7EAF0] rounded-xl text-[#64748B] hover:bg-gray-50 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-poppins font-black text-2xl text-[#1E293B] tracking-tight">
              Manage Schedules
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5 font-nunito">
              Configure automated report delivery schedules
            </p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#A14000] text-white rounded-xl text-xs font-bold hover:bg-[#853400] transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          New Schedule
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0]">
                {["Schedule Name", "Type", "Frequency", "Next Run", "Format", "Recipients", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#94A3B8] text-sm font-medium">
                    No schedules yet. Create your first one.
                  </td>
                </tr>
              ) : (
                paginated.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F5F7FB]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#A14000] shrink-0" />
                        <span className="font-semibold text-sm text-[#1E293B] font-poppins">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${TYPE_COLORS[s.type] || "bg-gray-100 text-gray-600"}`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${FREQ_COLORS[s.frequency] || "bg-gray-100 text-gray-600"}`}>
                        {s.frequency}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#64748B] font-medium whitespace-nowrap">
                      {s.day} · {s.time}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#64748B] font-medium">{s.format}</td>
                    <td className="px-5 py-4 text-xs text-[#64748B] font-medium max-w-[160px] truncate">{s.recipients}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(s.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          s.status === "Active"
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {s.status}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-[#E7EAF0] flex items-center justify-between bg-white">
          <span className="text-xs text-[#64748B] font-medium font-poppins">
            Showing <span className="font-bold text-[#1E293B]">{paginated.length}</span> of {schedules.length} schedules
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center border border-[#E7EAF0] rounded bg-white text-[#64748B] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold border transition-colors ${
                  p === page ? "bg-[#1E293B] text-white border-[#1E293B]" : "border-[#E7EAF0] text-[#64748B] hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="w-7 h-7 flex items-center justify-center border border-[#E7EAF0] rounded bg-white text-[#64748B] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <h2 className="font-poppins font-black text-lg text-[#1E293B] mb-5">
              {editing ? "Edit Schedule" : "New Schedule"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1.5">Schedule Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Weekly Driver Log Sheets"
                  className="w-full px-3 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] font-nunito"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] font-nunito bg-white"
                  >
                    {["Operational", "Financial", "Compliance", "Safety"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1.5">Format</label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] font-nunito bg-white"
                  >
                    {["PDF", "CSV", "XLSX"].map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1.5">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] font-nunito bg-white"
                  >
                    {["Daily", "Weekly", "Monthly", "Quarterly"].map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1.5">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] font-nunito"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1.5">Day / Date</label>
                <input
                  type="text"
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  placeholder="e.g. Monday or 1st"
                  className="w-full px-3 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] font-nunito"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins block mb-1.5">Recipients (email)</label>
                <input
                  type="text"
                  value={form.recipients}
                  onChange={(e) => setForm({ ...form, recipients: e.target.value })}
                  placeholder="e.g. team@company.com"
                  className="w-full px-3 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] font-nunito"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-[#A14000] text-white rounded-xl text-xs font-bold hover:bg-[#853400] transition-colors"
              >
                {editing ? "Save Changes" : "Create Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

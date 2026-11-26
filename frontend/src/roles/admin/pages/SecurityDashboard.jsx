import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { formatIFDWithTime } from "@/utils/dateUtils";
import { adminApi } from "@/api/adminApi";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import toast from "react-hot-toast";

const CATEGORY_OPTIONS = [
  "ALL",
  "BRUTE_FORCE",
  "ACCOUNT_LOCKOUT",
  "AUTH_FAILURE",
  "NOSQL_INJECTION",
  "XSS_ATTEMPT",
  "COMMAND_INJECTION",
  "PATH_TRAVERSAL",
  "MALICIOUS_UPLOAD",
  "CSRF_VIOLATION",
  "CORS_VIOLATION",
  "CSP_VIOLATION",
  "RATE_LIMIT",
  "PRIVILEGE_ESCALATION",
  "UNUSUAL_API_ACTIVITY",
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SecurityDashboard() {
  const [events, setEvents] = useState([]);
  const [activeLockouts, setActiveLockouts] = useState([]);
  const [summary, setSummary] = useState({
    totalEvents: 0,
    blockedCount: 0,
    allowedCount: 0,
    monitoredCount: 0,
    highCriticalCount: 0,
    activeLockoutCount: 0,
    cspMode: "enforce",
    byCategory: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, total: 0 });
  const debouncedSearch = useDebounce(searchTerm, 400);

  const fetchSecurityData = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const params = { page: targetPage, limit: 20 };
      if (debouncedSearch.trim().length >= 2) params.search = debouncedSearch.trim();
      if (categoryFilter !== "ALL") params.category = categoryFilter;
      if (severityFilter !== "ALL") params.severity = severityFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;

      const response = await adminApi.getSecurityEvents(params);
      const data = response.data?.data || {};
      setEvents(data.events || []);
      setActiveLockouts(data.activeLockouts || []);
      if (data.summary) setSummary(data.summary);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load security telemetry");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoryFilter, severityFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
    fetchSecurityData(1);
  }, [fetchSecurityData]);

  const handleUnlock = async (id) => {
    try {
      await adminApi.clearSecurityLockout(id);
      toast.success("Temporary login lockout cleared");
      fetchSecurityData(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear lockout");
    }
  };

  const handleExport = () => {
    if (events.length === 0) return toast.error("No security events to export");
    const headers = ["Timestamp", "Category", "Severity", "Status", "Source IP", "Method", "Path", "Actor", "Reason"];
    const rows = events.map((ev) =>
      `"${ev.timestamp}","${ev.category}","${ev.severity}","${ev.status}","${ev.ipAddress}","${ev.method}","${ev.path}","${ev.actor}","${String(ev.reason || "").replace(/"/g, '""')}"`
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "security_events.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Critical": return "bg-rose-100 text-rose-700 border border-rose-200";
      case "High": return "bg-red-50 text-red-600 border border-red-200";
      case "Medium": return "bg-amber-50 text-amber-700 border border-amber-200";
      default: return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Blocked": return "bg-red-50 text-red-700";
      case "Allowed": return "bg-green-50 text-green-700";
      default: return "bg-blue-50 text-blue-700";
    }
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="security" />

      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Security & Attack Defense" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar space-y-6">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex sm:inline-flex items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <span className="px-5 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-full shadow-sm">
                Attack Detection
              </span>
              <Link to="/admin/audit-logs" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Audit Logs
              </Link>
              <Link to="/admin/settings/security" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Security Settings
              </Link>
            </div>

            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
              CSP Mode: {String(summary.cspMode || "enforce").toUpperCase()}
            </span>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Events</span>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">{summary.totalEvents}</div>
              <p className="text-xs text-slate-500 mt-1">Real persisted telemetry events</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Blocked Attacks</span>
                <ShieldAlert className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-extrabold text-red-600 mt-2">{summary.blockedCount}</div>
              <p className="text-xs text-slate-500 mt-1">Rejected by defense middleware</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">High / Critical</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-amber-600 mt-2">{summary.highCriticalCount}</div>
              <p className="text-xs text-slate-500 mt-1">Injection, XSS, brute-force alerts</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Active Lockouts</span>
                <Lock className="w-4 h-4 text-[#A14000]" />
              </div>
              <div className="text-2xl font-extrabold text-[#A14000] mt-2">{summary.activeLockoutCount}</div>
              <p className="text-xs text-slate-500 mt-1">Temporary brute-force throttles</p>
            </div>
          </div>

          {/* Active Lockouts Panel */}
          {activeLockouts.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                Active Temporary Login Lockouts
              </h2>
              <div className="divide-y divide-slate-100">
                {activeLockouts.map((lock) => (
                  <div key={lock._id} className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{lock.identifier || "Unknown"}</span>
                      <span className="text-slate-500 ml-2">IP: {lock.ipAddress}</span>
                      <span className="text-slate-500 ml-2">Attempts: {lock.attempts}</span>
                      <span className="text-slate-500 ml-2">Until: {formatIFDWithTime(lock.lockedUntil)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnlock(lock._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      Unlock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Events Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search IP, path, category, actor..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#A14000]"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat === "ALL" ? "All Categories" : cat}</option>
                  ))}
                </select>

                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                >
                  <option value="ALL">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                >
                  <option value="ALL">All Status</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Allowed">Allowed</option>
                  <option value="Monitored">Monitored</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchSecurityData(page)}
                  className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Severity</th>
                    <th className="py-3.5 px-4">Source IP</th>
                    <th className="py-3.5 px-4">Endpoint</th>
                    <th className="py-3.5 px-4">Reason</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {!loading && events.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                        No security events recorded for the current filter.
                      </td>
                    </tr>
                  ) : (
                    events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{formatIFDWithTime(ev.timestamp)}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{ev.category}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getSeverityBadge(ev.severity)}`}>
                            {ev.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{ev.ipAddress}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{ev.method} {ev.path}</td>
                        <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={ev.reason}>{ev.reason}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getStatusBadge(ev.status)}`}>
                            {ev.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} events)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => { const p = page - 1; setPage(p); fetchSecurityData(p); }}
                  className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => { const p = page + 1; setPage(p); fetchSecurityData(p); }}
                  className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


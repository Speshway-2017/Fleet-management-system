import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Download, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { formatIFDWithTime } from "@/utils/dateUtils";
import { adminApi } from "@/api/adminApi";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import toast from "react-hot-toast";

// Custom useDebounce hook to replace lodash
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });

  const fetchLogs = async (page, search) => {
    setLoading(true);
    try {
      const response = await adminApi.getAuditLogs({ page, limit: pagination.limit, search });
      const { logs, pagination: pagData } = response.data.data;
      setLogs(logs);
      setPagination(pagData);
    } catch (error) {
      toast.error("Failed to load audit logs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // When search changes, reset to page 1
    fetchLogs(1, debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    // Normal fetch when page changes (search is already debounced, we skip if searchTerm changed recently)
    fetchLogs(pagination.page, searchTerm);
  }, [pagination.page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Success": return "bg-green-50 text-green-600";
      case "Warning": return "bg-orange-50 text-orange-600";
      case "Failed": return "bg-red-50 text-red-600";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  const handleExport = () => {
    if (logs.length === 0) return toast.error("No logs to export");

    const headers = ["Timestamp", "User", "Action", "Organization", "IP Address", "Status"];
    const csvContent = [
      headers.join(","),
      ...logs.map(log => 
        `"${log.timestamp}","${log.user}","${log.action}","${log.organization}","${log.ip}","${log.status}"`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "audit_logs.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="analytics" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Audit Logs" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
          
          {/* Tabs */}
          <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <Link to="/admin/analytics" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Analytics</span>
              <span className="hidden sm:inline">Platform Analytics</span>
            </Link>
            <Link to="/admin/system-health" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Health</span>
              <span className="hidden sm:inline">System Health</span>
            </Link>
            <button className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap">
              <span className="sm:hidden">Logs</span>
              <span className="hidden sm:inline">Audit Logs</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[500px]">
            {/* Header / Controls */}
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs by user, action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => fetchLogs(pagination.page, searchTerm)} 
                  className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto relative">
              {loading && logs.length === 0 && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-0">
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Action</th>
                    <th className="py-4 px-6">Organization</th>
                    <th className="py-4 px-6">IP Address</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!loading && logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                        {searchTerm ? `No audit logs found matching "${searchTerm}".` : "No audit logs have been recorded yet."}
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group text-[13px] font-medium text-slate-600">
                        <td className="py-4 px-6 text-slate-500">{formatIFDWithTime(log.timestamp)}</td>
                        <td className="py-4 px-6">{log.user}</td>
                        <td className="py-4 px-6 text-slate-800">{log.action}</td>
                        <td className="py-4 px-6">{log.organization}</td>
                        <td className="py-4 px-6 text-slate-500">{log.ip}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {!loading && logs.length > 0 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Showing <span className="font-bold text-slate-700">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-bold text-slate-700">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-bold text-slate-700">{pagination.total}</span> logs
                </span>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-bold text-slate-700 px-2">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

          </div>
          
        </main>
      </div>
    </div>
  );
}

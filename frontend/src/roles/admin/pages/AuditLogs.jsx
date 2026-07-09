import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Download } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

const mockAuditLogs = [
  { id: 1, timestamp: "2024-06-01 10:30", user: "admin@fleet.com", action: "Organization Created", organization: "ABC Logistics", ip: "192.168.1.1", status: "Success" },
  { id: 2, timestamp: "2024-06-01 11:20", user: "admin@fleet.com", action: "Fleet Manager Added", organization: "XYZ Transport", ip: "192.168.1.1", status: "Success" },
  { id: 3, timestamp: "2024-06-01 12:45", user: "system", action: "Auto-activation", organization: "VRL Freight", ip: "10.0.0.1", status: "Success" },
  { id: 4, timestamp: "2024-06-01 14:00", user: "admin@fleet.com", action: "Subscription Updated", organization: "Swift Cargo", ip: "192.168.1.1", status: "Success" },
  { id: 5, timestamp: "2024-06-01 15:30", user: "admin@fleet.com", action: "Organization Suspended", organization: "Peak Logistics", ip: "192.168.1.1", status: "Warning" },
  { id: 6, timestamp: "2024-06-01 16:00", user: "system", action: "Failed Login Attempt", organization: "—", ip: "203.0.113.0", status: "Failed" },
  { id: 7, timestamp: "2024-06-01 15:30", user: "admin@fleet.com", action: "Organization Suspended", organization: "Peak Logistics", ip: "192.168.1.1", status: "Warning" },
  { id: 8, timestamp: "2024-06-01 15:30", user: "admin@fleet.com", action: "Organization Suspended", organization: "Peak Logistics", ip: "192.168.1.1", status: "Warning" },
  { id: 9, timestamp: "2024-06-01 15:30", user: "admin@fleet.com", action: "Organization Suspended", organization: "Peak Logistics", ip: "192.168.1.1", status: "Warning" },
  { id: 10, timestamp: "2024-06-01 14:00", user: "admin@fleet.com", action: "Subscription Updated", organization: "Swift Cargo", ip: "192.168.1.1", status: "Success" },
  { id: 11, timestamp: "2024-06-01 14:00", user: "admin@fleet.com", action: "Subscription Updated", organization: "Swift Cargo", ip: "192.168.1.1", status: "Success" },
  { id: 12, timestamp: "2024-06-01 14:00", user: "admin@fleet.com", action: "Subscription Updated", organization: "Swift Cargo", ip: "192.168.1.1", status: "Success" },
];

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status) => {
    switch (status) {
      case "Success": return "bg-green-50 text-green-600";
      case "Warning": return "bg-orange-50 text-orange-600";
      case "Failed": return "bg-red-50 text-red-600";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  const filteredLogs = mockAuditLogs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const headers = ["Timestamp", "User", "Action", "Organization", "IP Address", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => 
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
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
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

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header / Controls */}
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                />
              </div>
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Action</th>
                    <th className="py-4 px-6">Organization</th>
                    <th className="py-4 px-6">IP Address</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                        No audit logs found matching "{searchTerm}".
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group text-[13px] font-medium text-slate-600">
                        <td className="py-4 px-6 text-slate-500">{log.timestamp}</td>
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
            
          </div>
          
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { Globe, Database, Server, Activity, HardDrive, Cpu, BarChart2, CheckCircle2 } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import toast from "react-hot-toast";

// Helper Component for Status Cards
function StatusCard({ title, value, status, statusColor, icon: Icon, iconColor, iconBg }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 h-full hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{title}</h3>
          <div className="text-sm sm:text-base font-semibold text-slate-700 truncate">{value}</div>
        </div>
      </div>
      <div className="mt-1 sm:mt-0">
        <span className={`text-[9px] sm:text-[11px] font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full tracking-wide ${statusColor} inline-block`}>
          {status}
        </span>
      </div>
    </div>
  );
}

export default function SystemHealth() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);

  const fetchHealthData = async () => {
    try {
      const response = await adminApi.getSystemHealth();
      const result = response.data?.data || response.data;
      if (result) {
        setHealthData(result);
      }
    } catch (error) {
      toast.error("Failed to load system health data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !healthData) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center font-sans">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Fallback in case fetch failed completely and we have no data
  const data = healthData || {
    api: { status: 'Unknown', value: 'N/A' },
    database: { status: 'Unknown', value: 'N/A' },
    server: { status: 'Unknown', value: 'N/A' },
    responseTime: { status: 'Unknown', value: 'N/A' },
    storage: { status: 'Unknown', value: 'N/A' },
    cpu: { status: 'Unknown', value: 'N/A' },
    memory: { status: 'Unknown', value: 'N/A' },
    uptime: { status: 'Unknown', value: 'N/A' }
  };

  // Status color logic based on API returns
  const getStatusColor = (status) => {
    if (status === 'Operational' || status === 'Normal' || status === 'Healthy') return 'bg-green-50 text-green-600';
    if (status === 'High' || status === 'Warning') return 'bg-orange-50 text-orange-600';
    if (status === 'Down' || status === 'Critical') return 'bg-red-50 text-red-600';
    return 'bg-slate-50 text-slate-600';
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="analytics" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="System Health" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
          
          {/* Tabs */}
          <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <Link to="/admin/analytics" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Analytics</span>
              <span className="hidden sm:inline">Platform Analytics</span>
            </Link>
            <button className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap">
              <span className="sm:hidden">Health</span>
              <span className="hidden sm:inline">System Health</span>
            </button>
            <Link to="/admin/audit-logs" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Logs</span>
              <span className="hidden sm:inline">Audit Logs</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10">
            
            {/* SERVICES Section */}
            <div>
              <h2 className="text-sm font-extrabold text-slate-500 mb-5 tracking-widest uppercase">Services</h2>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-4">
                <StatusCard 
                  title="API Status" 
                  value={data.api.value} 
                  status={data.api.status}
                  statusColor={getStatusColor(data.api.status)}
                  icon={Globe}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                />
                <StatusCard 
                  title="Database Status" 
                  value={data.database.value} 
                  status={data.database.status}
                  statusColor={getStatusColor(data.database.status)}
                  icon={Database}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                />
                <StatusCard 
                  title="Server Status" 
                  value={data.server.value} 
                  status={data.server.status}
                  statusColor={getStatusColor(data.server.status)}
                  icon={Server}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                />
                <StatusCard 
                  title="Response Time" 
                  value={data.responseTime.value} 
                  status={data.responseTime.status}
                  statusColor={getStatusColor(data.responseTime.status)}
                  icon={Activity}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-500"
                />
              </div>
            </div>

            {/* RESOURCES Section */}
            <div>
              <h2 className="text-sm font-extrabold text-slate-500 mb-5 tracking-widest uppercase">Resources</h2>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-4">
                <StatusCard 
                  title="Storage Usage" 
                  value={data.storage.value} 
                  status={data.storage.status}
                  statusColor={getStatusColor(data.storage.status)}
                  icon={HardDrive}
                  iconBg="bg-orange-50"
                  iconColor="text-orange-500"
                />
                <StatusCard 
                  title="CPU Usage" 
                  value={data.cpu.value} 
                  status={data.cpu.status}
                  statusColor={getStatusColor(data.cpu.status)}
                  icon={Cpu}
                  iconBg={data.cpu.status === 'High' ? "bg-orange-50" : "bg-green-50"}
                  iconColor={data.cpu.status === 'High' ? "text-orange-600" : "text-green-600"}
                />
                <StatusCard 
                  title="Memory Usage" 
                  value={data.memory.value} 
                  status={data.memory.status}
                  statusColor={getStatusColor(data.memory.status)}
                  icon={BarChart2}
                  iconBg={data.memory.status === 'High' ? "bg-orange-50" : "bg-green-50"}
                  iconColor={data.memory.status === 'High' ? "text-orange-600" : "text-green-600"}
                />
                <StatusCard 
                  title="Uptime" 
                  value={data.uptime.value} 
                  status={data.uptime.status}
                  statusColor={getStatusColor(data.uptime.status)}
                  icon={CheckCircle2}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                />
              </div>
            </div>
            
          </div>
          
        </main>
      </div>
    </div>
  );
}

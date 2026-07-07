import { Link } from "react-router-dom";
import { Globe, Database, Server, Activity, HardDrive, Cpu, BarChart2, CheckCircle2 } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

// Helper Component for Status Cards
function StatusCard({ title, value, status, statusColor, icon: Icon, iconColor, iconBg }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</h3>
          <div className="text-2xl font-extrabold text-slate-800">{value}</div>
        </div>
      </div>
      <div>
        <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wide ${statusColor}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

export default function SystemHealth() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="analytics" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="System Health" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <Link to="/admin/analytics" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Platform Analytics</Link>
            <button className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-bold rounded-full shadow-sm">System Health</button>
            <Link to="/admin/audit-logs" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Audit Logs</Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10">
            
            {/* SERVICES Section */}
            <div>
              <h2 className="text-sm font-extrabold text-slate-500 mb-5 tracking-widest uppercase">Services</h2>
              <div className="space-y-4">
                <StatusCard 
                  title="API Status" 
                  value="99.9%" 
                  status="Operational"
                  statusColor="bg-green-50 text-green-600"
                  icon={Globe}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                />
                <StatusCard 
                  title="Database Status" 
                  value="Healthy" 
                  status="Operational"
                  statusColor="bg-green-50 text-green-600"
                  icon={Database}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                />
                <StatusCard 
                  title="Server Status" 
                  value="Online" 
                  status="Operational"
                  statusColor="bg-green-50 text-green-600"
                  icon={Server}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                />
                <StatusCard 
                  title="Response Time" 
                  value="142ms" 
                  status="Normal"
                  statusColor="bg-green-50 text-green-600"
                  icon={Activity}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-500"
                />
              </div>
            </div>

            {/* RESOURCES Section */}
            <div>
              <h2 className="text-sm font-extrabold text-slate-500 mb-5 tracking-widest uppercase">Resources</h2>
              <div className="space-y-4">
                <StatusCard 
                  title="Storage Usage" 
                  value="62%" 
                  status="Normal"
                  statusColor="bg-green-50 text-green-600"
                  icon={HardDrive}
                  iconBg="bg-orange-50"
                  iconColor="text-orange-500"
                />
                <StatusCard 
                  title="CPU Usage" 
                  value="34%" 
                  status="Normal"
                  statusColor="bg-green-50 text-green-600"
                  icon={Cpu}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                />
                <StatusCard 
                  title="Memory Usage" 
                  value="58%" 
                  status="Normal"
                  statusColor="bg-green-50 text-green-600"
                  icon={BarChart2}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                />
                <StatusCard 
                  title="Uptime" 
                  value="99.97%" 
                  status="Operational"
                  statusColor="bg-green-50 text-green-600"
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

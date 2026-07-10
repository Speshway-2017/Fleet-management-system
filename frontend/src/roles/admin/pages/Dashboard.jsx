import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { adminApi } from "@/api/adminApi";
import {
  Building2,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  UserCheck,
  Plus,
  TrendingUp,
  Users,
  BarChart3
} from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import KPICard from "@/components/common/KPICard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import toast from "react-hot-toast";
import { format } from "date-fns";

function Dashboard() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    statistics: {
      totalOrganizations: 0,
      activeOrganizations: 0,
      fleetManagers: 0,
      activeVehicles: 0,
      revenue: 0,
      pendingRequests: 0,
    },
    recentActivities: [],
    chartData: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminApi.getDashboard();
        // Extract data assuming standard { data: { data: ... } } from axios and sendSuccess
        const result = response.data?.data || response.data;
        if (result) {
          setData(result);
        }
      } catch (error) {
        toast.error("Failed to fetch dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Auto-refresh the dashboard every 30 seconds
    const intervalId = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const { statistics, recentActivities, chartData } = data;

  // Transform data for pie chart
  const pendingOrgs = statistics.pendingRequests || 0; // fallback if needed
  const activeOrgs = statistics.activeOrganizations;
  const suspendedOrgs = statistics.totalOrganizations - activeOrgs - pendingOrgs;
  
  const orgStatusData = [
    { name: "Active", value: activeOrgs, color: "#22c55e" }, // green-500
    { name: "Pending", value: pendingOrgs, color: "#f97316" }, // orange-500
    { name: "Suspended", value: Math.max(0, suspendedOrgs), color: "#ef4444" }, // red-500
  ];

  // Transform data for bar chart
  const fleetManagerData = [
    { name: "Total", value: statistics.fleetManagers, fill: "#3b82f6" },
  ];

  // Helper to format time for recent activities
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'hh:mm a');
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-orange-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center font-sans">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="dashboard" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Dashboard" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-6">
            <KPICard 
              title="Total Organizations" 
              value={statistics.totalOrganizations.toString()} 
              subtitle="All registered orgs"
              icon={<Building2 className="w-4 h-4 text-slate-600" />}
              iconBg="bg-slate-100"
            />
            <KPICard 
              title="Active Organizations" 
              value={statistics.activeOrganizations.toString()} 
              subtitle={`${statistics.totalOrganizations > 0 ? Math.round((statistics.activeOrganizations / statistics.totalOrganizations) * 100) : 0}% of total`}
              icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
              iconBg="bg-green-50 border border-green-100"
            />
            <KPICard 
              title="Total Fleet Managers" 
              value={statistics.fleetManagers.toString()} 
              subtitle="All managers"
              icon={<Users className="w-4 h-4 text-slate-600" />}
              iconBg="bg-slate-100"
            />
            <KPICard 
              title="Active Vehicles" 
              value={statistics.activeVehicles.toString()} 
              subtitle="Currently operating"
              icon={<UserCheck className="w-4 h-4 text-blue-500" />}
              iconBg="bg-blue-50 border border-blue-100"
            />
            <KPICard 
              title="Total Revenue" 
              value={`$${statistics.revenue.toLocaleString()}`} 
              subtitle="All time"
              icon={<TrendingUp className="w-4 h-4 text-orange-500" />}
              iconBg="bg-orange-50 border border-orange-100"
            />
            <KPICard 
              title="Platform Health" 
              value="99.9%" 
              subtitle="All systems operational"
              icon={<Activity className="w-4 h-4 text-green-500" />}
              iconBg="bg-green-50 border border-green-100"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            
            {/* Revenue Trend */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm lg:col-span-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 text-sm">Revenue Trend</h3>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Org Status */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm lg:col-span-1 flex flex-col">
              <h3 className="font-bold text-slate-800 text-sm mb-2">Organization Status</h3>
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orgStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {orgStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="w-full mt-2 space-y-2 px-6">
                  {orgStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-500 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fleet Manager Status */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm lg:col-span-1">
              <h3 className="font-bold text-slate-800 text-sm mb-6">Fleet Manager Status</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fleetManagerData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {fleetManagerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Recent Activities */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="font-bold text-slate-800 text-sm">Recent Activities (Trips)</h3>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
                      <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity</th>
                      <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {recentActivities.map((act, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px] whitespace-nowrap">{formatTime(act.createdAt)}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(act.status)}`}></span>
                            <span className="font-medium text-slate-700 text-[13px]">Trip {act.status}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 text-[13px]">
                          Trip #{act.tripNumber} - Vehicle: {act.vehicle?.vehicleNumber || 'N/A'} - Driver: {act.driver?.name || 'N/A'}
                        </td>
                      </tr>
                    ))}
                    {recentActivities.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-6 px-5 text-center text-slate-400 text-xs">No recent activities found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1a2332] rounded-xl p-6 lg:col-span-1 flex flex-col">
              <h3 className="font-bold text-white text-sm mb-5">Quick Actions</h3>
              
              <div className="space-y-3.5 flex-1">
                <Link to="/admin/organizations/add" className="w-full bg-[#252f3f] hover:bg-[#2d3748] transition-colors rounded-xl p-4 flex items-center gap-4 text-left group border border-transparent hover:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-[13px]">Add Organization</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">Onboard a new enterprise partner</div>
                  </div>
                </Link>
                
                <Link to="/admin/fleet-managers/add" className="w-full bg-[#252f3f] hover:bg-[#2d3748] transition-colors rounded-xl p-4 flex items-center gap-4 text-left group border border-transparent hover:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-[13px]">Invite Fleet Manager</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">Assign a new manager to an org</div>
                  </div>
                </Link>
                
                <Link to="/admin/analytics" className="w-full bg-[#252f3f] hover:bg-[#2d3748] transition-colors rounded-xl p-4 flex items-center gap-4 text-left group border border-transparent hover:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-[13px]">View Analytics</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">Global performance overview</div>
                  </div>
                </Link>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;

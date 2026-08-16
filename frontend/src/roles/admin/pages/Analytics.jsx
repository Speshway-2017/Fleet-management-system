import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { 
  Building2, Users, Activity, TrendingUp, CheckCircle2, 
  Wrench, Droplets, MapPin 
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import toast from "react-hot-toast";

function KPICard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="overflow-hidden">
          <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 truncate" title={title}>{title}</h3>
          <div className="text-xl font-black text-slate-900 truncate" title={value}>{value}</div>
        </div>
        <div className="w-8 h-8 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [filter, setFilter] = useState('today'); // 'today', 'week', 'month', 'year'
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    kpis: {
      totalOrganizations: 0,
      fleetManagers: 0,
      vehicles: 0,
      drivers: 0,
      activeTrips: 0,
      completedTrips: 0,
      maintenanceCount: 0,
      fuelUsage: 0
    },
    charts: {
      orgGrowthData: [],
      managerGrowthData: [],
      subscriptionData: [],
      loginActivityData: []
    }
  });

  const fetchAnalytics = async (selectedFilter) => {
    setLoading(true);
    try {
      const response = await adminApi.getAnalytics(selectedFilter);
      const result = response.data?.data || response.data;
      if (result) {
        setAnalyticsData(result);
      }
    } catch (error) {
      toast.error("Failed to load analytics data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(filter);
  }, [filter]);

  const { kpis, charts } = analyticsData;

  const filters = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="analytics" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Platform Analytics" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
               <div className="animate-spin w-8 h-8 border-4 border-[#A14000] border-t-transparent rounded-full"></div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            {/* Tabs */}
            <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <button className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap">
                <span className="sm:hidden">Analytics</span>
                <span className="hidden sm:inline">Platform Analytics</span>
              </button>
              <Link to="/admin/system-health" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
                <span className="sm:hidden">Health</span>
                <span className="hidden sm:inline">System Health</span>
              </Link>
              <Link to="/admin/audit-logs" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
                <span className="sm:hidden">Logs</span>
                <span className="hidden sm:inline">Audit Logs</span>
              </Link>
            </div>

            {/* Filter Dropdown/ButtonGroup */}
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    filter === f.value 
                      ? 'bg-orange-50 text-[#A14000] shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-8">
            <KPICard title="Organizations" value={kpis?.organizations?.total || 0} icon={Building2} />
            <KPICard title="Fleet Managers" value={kpis?.managers?.total || 0} icon={Users} />
            <KPICard title="Active Trips" value={kpis?.activeTrips ?? 0} icon={MapPin} />
            <KPICard title="Completed Trips" value={kpis?.completedTrips ?? 0} icon={CheckCircle2} />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Organization Growth */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 mb-6 tracking-wide">Organization Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts?.orgGrowthData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="value" stroke="#b45309" strokeWidth={3} dot={{ r: 5, fill: '#b45309', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fleet Manager Growth */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 mb-6 tracking-wide">Fleet Manager Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts?.managerGrowthData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={3} dot={{ r: 5, fill: '#0f172a', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Activity */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 mb-6 tracking-wide">System Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.loginActivityData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" fill="#b45309" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subscription Distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 mb-6 tracking-wide">Subscription Distribution</h3>
              <div className="h-auto sm:h-64 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 pr-0 sm:pr-8">
                <div className="w-full sm:w-[45%] h-48 sm:h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.subscriptionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        stroke="none"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {charts?.subscriptionData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend */}
                <div className="w-full sm:w-[55%] space-y-5">
                  {charts?.subscriptionData?.map((item, index) => {
                    const total = charts.subscriptionData.reduce((sum, curr) => sum + (curr.value || 0), 0);
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    return (
                      <div key={index} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-[13.5px] font-medium text-slate-600">{item.name}</span>
                          </div>
                          <span className="text-[13.5px] font-bold text-slate-800">{item.value}</span>
                        </div>
                        {/* Progress Bar relative to text (pl-5.5 ≈ 22px offset) */}
                        <div className="pl-[22px]">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ backgroundColor: item.color, width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}

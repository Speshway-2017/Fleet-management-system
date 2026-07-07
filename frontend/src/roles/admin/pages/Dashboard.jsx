import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

// --- Mock Data ---

const orgGrowthData = [
  { name: "Jan", value: 85 },
  { name: "Feb", value: 95 },
  { name: "Mar", value: 105 },
  { name: "Apr", value: 110 },
  { name: "May", value: 120 },
  { name: "Jun", value: 130 },
];

const orgStatusData = [
  { name: "Active", value: 94, color: "#22c55e" }, // green-500
  { name: "Pending", value: 23, color: "#f97316" }, // orange-500
  { name: "Suspended", value: 11, color: "#ef4444" }, // red-500
];

const fleetManagerData = [
  { name: "Active", value: 36, fill: "#22c55e" },
  { name: "Inactive", value: 12, fill: "#475569" },
  { name: "Invited", value: 6, fill: "#3b82f6" },
];

const recentActivities = [
  { time: "10:30 AM", activity: "Organization Created", org: "ABC Logistics", color: "bg-green-500" },
  { time: "11:20 AM", activity: "Fleet Manager Added", org: "XYZ Transport", color: "bg-blue-500" },
  { time: "12:45 PM", activity: "Organization Activated", org: "VRL Freight", color: "bg-green-500" },
  { time: "01:15 PM", activity: "Organization Updated", org: "Swift Cargo", color: "bg-orange-500" },
  { time: "02:30 PM", activity: "Fleet Manager Invited", org: "Peak Logistics", color: "bg-purple-500" },
  { time: "03:10 PM", activity: "Subscription Changed", org: "Rapid Transport", color: "bg-orange-500" },
];

// --- Components ---

// --- Main Page ---

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="dashboard" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Dashboard" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
            <KPICard 
              title="Total Organizations" 
              value="128" 
              subtitle="vs last month"
              trendText="+12%"
              trendColor="text-green-500"
              isTrendUp={true}
              icon={<Building2 className="w-4 h-4 text-slate-600" />}
              iconBg="bg-slate-100"
            />
            <KPICard 
              title="Active Organizations" 
              value="94" 
              subtitle="73% of total"
              icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
              iconBg="bg-green-50 border border-green-100"
            />
            <KPICard 
              title="Total Fleet Managers" 
              value="48" 
              subtitle="vs last month"
              trendText="+8%"
              trendColor="text-green-500"
              isTrendUp={true}
              icon={<Users className="w-4 h-4 text-slate-600" />}
              iconBg="bg-slate-100"
            />
            <KPICard 
              title="Active Fleet Managers" 
              value="36" 
              subtitle="75% of total"
              icon={<UserCheck className="w-4 h-4 text-blue-500" />}
              iconBg="bg-blue-50 border border-blue-100"
            />
            <KPICard 
              title="New Organizations" 
              value="12" 
              subtitle="This month"
              trendText="+3 orgs"
              trendColor="text-green-500"
              isTrendUp={true}
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
            
            {/* Org Growth */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm lg:col-span-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 text-sm">Organization Growth</h3>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">+12% YTD</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orgGrowthData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="value" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
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
                <h3 className="font-bold text-slate-800 text-sm">Recent Activities</h3>
                <Link to="/admin/organizations" className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
                      <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity</th>
                      <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Organization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {recentActivities.map((act, i) => (
                      <tr key={i} onClick={() => navigate('/admin/organizations/details')} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px] whitespace-nowrap">{act.time}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${act.color}`}></span>
                            <span className="font-medium text-slate-700 text-[13px]">{act.activity}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 text-[13px]">{act.org}</td>
                      </tr>
                    ))}
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
                
                <Link to="/admin/fleet-managers" className="w-full bg-[#252f3f] hover:bg-[#2d3748] transition-colors rounded-xl p-4 flex items-center gap-4 text-left group border border-transparent hover:border-slate-700">
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

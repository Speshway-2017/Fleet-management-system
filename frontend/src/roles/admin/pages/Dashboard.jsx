import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  UserCheck,
  Plus
} from "lucide-react";
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

function Sidebar() {
  return (
    <div className="w-[260px] bg-[#1a2332] text-slate-300 flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo Area */}
      <div className="p-6 pb-4 border-b border-[#2a3241]/50">
        <div className="flex items-center gap-3 mb-1">
          <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full bg-white p-1" />
          <span className="font-bold text-white text-lg tracking-tight">Fleet Management</span>
        </div>
        <div className="text-[11px] text-slate-400 pl-12 font-medium">Super Admin</div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 space-y-1">
        <p className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
        
        <Link to="/admin/dashboard" className="flex items-center gap-3 px-8 py-3.5 bg-[#252f3f] text-[#f97316] font-semibold border-l-[3px] border-[#f97316] transition-colors">
          <LayoutDashboard className="w-[18px] h-[18px]" />
          Dashboard
        </Link>
        
        <Link to="#" className="flex items-center gap-3 px-8 py-3.5 text-slate-400 hover:bg-[#252f3f] hover:text-white transition-colors border-l-[3px] border-transparent">
          <Building2 className="w-[18px] h-[18px]" />
          Organizations
        </Link>
        
        <Link to="#" className="flex items-center gap-3 px-8 py-3.5 text-slate-400 hover:bg-[#252f3f] hover:text-white transition-colors border-l-[3px] border-transparent">
          <Users className="w-[18px] h-[18px]" />
          Fleet Managers
        </Link>
        
        <Link to="#" className="flex items-center gap-3 px-8 py-3.5 text-slate-400 hover:bg-[#252f3f] hover:text-white transition-colors border-l-[3px] border-transparent">
          <BarChart3 className="w-[18px] h-[18px]" />
          Analytics
        </Link>
        
        <Link to="#" className="flex items-center gap-3 px-8 py-3.5 text-slate-400 hover:bg-[#252f3f] hover:text-white transition-colors border-l-[3px] border-transparent">
          <Settings className="w-[18px] h-[18px]" />
          Settings
        </Link>
      </div>

      {/* Logout */}
      <div className="p-4 mb-4">
        <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-[#252f3f] hover:text-white transition-colors">
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </Link>
      </div>
    </div>
  );
}

function TopNav() {
  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
      
      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-[22px] h-[22px]" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-[#1a2332] text-white flex items-center justify-center font-bold text-xs">
            SA
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">Super Admin</span>
            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-0.5">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function KPICard({ title, value, subtitle, icon, iconBg, trendText, trendColor, isTrendUp }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{title}</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-auto">
        {trendText && (
          <>
            <span className={`text-[11px] font-bold flex items-center gap-0.5 ${trendColor}`}>
              {isTrendUp ? <ArrowUpRight className="w-3 h-3" /> : null}
              {trendText}
            </span>
            <span className="text-[11px] text-slate-400">{subtitle}</span>
          </>
        )}
        {!trendText && subtitle && (
          <span className="text-[11px] text-slate-400">{subtitle}</span>
        )}
      </div>
    </div>
  );
}

// --- Main Page ---

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        
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
                <button className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">View All</button>
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
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
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
                <button className="w-full bg-[#252f3f] hover:bg-[#2d3748] transition-colors rounded-xl p-4 flex items-center gap-4 text-left group border border-transparent hover:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-[13px]">Add Organization</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">Onboard a new enterprise partner</div>
                  </div>
                </button>
                
                <button className="w-full bg-[#252f3f] hover:bg-[#2d3748] transition-colors rounded-xl p-4 flex items-center gap-4 text-left group border border-transparent hover:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-[13px]">Invite Fleet Manager</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">Assign a new manager to an org</div>
                  </div>
                </button>
                
                <button className="w-full bg-[#252f3f] hover:bg-[#2d3748] transition-colors rounded-xl p-4 flex items-center gap-4 text-left group border border-transparent hover:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-[13px]">View Analytics</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">Global performance overview</div>
                  </div>
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;

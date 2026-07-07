import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, Activity, TrendingUp } from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

// Mock Data
const orgGrowthData = [
  { name: 'Jan', value: 80 },
  { name: 'Feb', value: 90 },
  { name: 'Mar', value: 95 },
  { name: 'Apr', value: 105 },
  { name: 'May', value: 115 },
  { name: 'Jun', value: 128 },
];

const managerGrowthData = [
  { name: 'Jan', value: 30 },
  { name: 'Feb', value: 35 },
  { name: 'Mar', value: 38 },
  { name: 'Apr', value: 42 },
  { name: 'May', value: 45 },
  { name: 'Jun', value: 48 },
];

const loginActivityData = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 140 },
  { name: 'Wed', value: 130 },
  { name: 'Thu', value: 160 },
  { name: 'Fri', value: 175 },
  { name: 'Sat', value: 85 },
  { name: 'Sun', value: 60 },
];

const subscriptionData = [
  { name: 'Enterprise', value: 42, color: '#0f172a' },
  { name: 'Professional', value: 55, color: '#b45309' },
  { name: 'Standard', value: 31, color: '#cbd5e1' },
];

// Helper Component for KPI Cards
function KPICard({ title, value, increase, icon: Icon }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</h3>
          <div className="text-3xl font-extrabold text-slate-800">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-xs font-bold text-green-600 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {increase}
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="analytics" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Platform Analytics" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <button className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-bold rounded-full shadow-sm">Platform Analytics</button>
            <Link to="/admin/system-health" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">System Health</Link>
            <Link to="/admin/audit-logs" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Audit Logs</Link>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard title="Organizations" value="128" increase="+12%" icon={Building2} />
            <KPICard title="Fleet Managers" value="48" increase="+8%" icon={Users} />
            <KPICard title="Daily Active Users" value="312" increase="+5%" icon={Activity} />
            <KPICard title="Monthly Growth" value="6.2%" increase="+1.4%" icon={TrendingUp} />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Organization Growth */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 mb-6 tracking-wide">Organization Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orgGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} ticks={[0, 35, 70, 105, 140]} />
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
                  <LineChart data={managerGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} ticks={[0, 15, 30, 45, 60]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={3} dot={{ r: 5, fill: '#0f172a', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Login Activity */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 mb-6 tracking-wide">Login Activity (This Week)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={loginActivityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} ticks={[0, 45, 90, 135, 180]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" fill="#b45309" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subscription Distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 mb-6 tracking-wide">Subscription Distribution</h3>
              <div className="h-64 flex items-center justify-between gap-4 pr-8">
                <div className="w-[45%] h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        stroke="none"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend */}
                <div className="w-[55%] space-y-5">
                  {subscriptionData.map((item, index) => {
                    const total = subscriptionData.reduce((sum, curr) => sum + curr.value, 0);
                    const percentage = (item.value / total) * 100;
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
                              className="h-full rounded-full" 
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

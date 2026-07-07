import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Plus,
  Eye,
  Pencil
} from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import KPICard from "@/components/common/KPICard";

// --- Mock Data ---

const organizations = [
  { id: 1, name: "ABC Logistics", industry: "Freight", managers: 4, plan: "Enterprise", status: "Active", date: "Jan 15, 2024" },
  { id: 2, name: "XYZ Transport", industry: "Transportation", managers: 2, plan: "Professional", status: "Active", date: "Feb 3, 2024" },
  { id: 3, name: "VRL Freight", industry: "Logistics", managers: 6, plan: "Enterprise", status: "Pending", date: "Mar 22, 2024" },
  { id: 4, name: "Swift Cargo", industry: "Courier", managers: 3, plan: "Standard", status: "Active", date: "Jun 10, 2024" },
  { id: 5, name: "Peak Logistics", industry: "Freight", managers: 5, plan: "Professional", status: "Suspended", date: "May 1, 2024" },
  { id: 6, name: "Rapid Transport", industry: "Transportation", managers: 2, plan: "Standard", status: "Active", date: "May 18, 2024" },
  { id: 7, name: "Global Express", industry: "Courier", managers: 3, plan: "Enterprise", status: "Active", date: "Jun 2, 2024" },
  { id: 8, name: "Global Express", industry: "Courier", managers: 3, plan: "Enterprise", status: "Active", date: "Jun 2, 2024" },
  { id: 9, name: "Global Express", industry: "Courier", managers: 3, plan: "Enterprise", status: "Active", date: "Jun 2, 2024" },
];

function StatusBadge({ status }) {
  if (status === "Active") {
    return <span className="text-[11px] font-bold text-green-600 tracking-wide">Active</span>;
  }
  if (status === "Pending") {
    return <span className="text-[11px] font-bold text-orange-500 tracking-wide">Pending</span>;
  }
  if (status === "Suspended") {
    return <span className="text-[11px] font-bold text-red-500 tracking-wide">Suspended</span>;
  }
  return <span className="text-[11px] font-bold text-slate-500 tracking-wide">{status}</span>;
}

export default function OrganizationList() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="organizations" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Organizations" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="flex items-center gap-6 mb-8 border-b border-slate-200 pb-4">
            <button className="px-5 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm">Organization List</button>
            <Link to="/admin/organizations/add" className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors">Add Organization</Link>
            <Link to="/admin/organizations/details" className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors">Organization Details</Link>
            <Link to="/admin/organizations/edit" className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors">Edit Organization</Link>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <KPICard 
              title="Total Organizations" 
              value="128" 
              icon={<Building2 className="w-5 h-5 text-slate-600" />}
              iconBg="bg-slate-100"
            />
            <KPICard 
              title="Active" 
              value="94" 
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              iconBg="bg-green-50"
            />
            <KPICard 
              title="Pending Approval" 
              value="23" 
              icon={<Clock className="w-5 h-5 text-orange-500" />}
              iconBg="bg-orange-50"
            />
            <KPICard 
              title="Suspended" 
              value="11" 
              icon={<XCircle className="w-5 h-5 text-red-500" />}
              iconBg="bg-red-50"
            />
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search organizations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                />
              </div>
              <Link to="/admin/organizations/add" className="flex items-center justify-center gap-2 bg-[#A14000] hover:bg-[#8a3700] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap">
                <Plus className="w-4 h-4" />
                Add Organization
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Organization</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Industry</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fleet Managers</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Created Date</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {organizations
                    .filter(org => org.name.toLowerCase().includes(searchTerm.toLowerCase()) || org.industry.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                            {org.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{org.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium">{org.industry}</td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium">{org.managers}</td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium">{org.plan}</td>
                      <td className="py-4 px-6">
                        <StatusBadge status={org.status} />
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium">{org.date}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link to="/admin/organizations/details" className="text-slate-400 hover:text-slate-600 transition-colors" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link to="/admin/organizations/edit" className="text-slate-400 hover:text-[#A14000] transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}

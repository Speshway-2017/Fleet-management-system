import { useState } from "react";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import KPICard from "@/components/common/KPICard";
import OrganizationTabs from "@/components/admin/OrganizationTabs";

// --- Mock Data Removed ---

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
  const { organizations, fetchOrganizations } = useAdmin();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;
    try {
      await adminApi.deleteOrganization(id);
      toast.success("Organization deleted successfully");
      if (fetchOrganizations) await fetchOrganizations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete organization");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="organizations" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Organizations" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <button className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap">
              <span className="sm:hidden">List</span>
              <span className="hidden sm:inline">Organization List</span>
            </button>
            <Link to="/admin/organizations/add" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Add Org</span>
              <span className="hidden sm:inline">Add Organization</span>
            </Link>
            <Link to="/admin/organizations/details" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Details</span>
              <span className="hidden sm:inline">Organization Details</span>
            </Link>
            <Link to="/admin/organizations/edit" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Edit Org</span>
              <span className="hidden sm:inline">Edit Organization</span>
            </Link>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-8">
            <KPICard 
              title="Total Organizations" 
              value={organizations.length} 
              icon={<Building2 className="w-5 h-5 text-slate-600" />}
              iconBg="bg-slate-100"
            />
            <KPICard 
              title="Active" 
              value={organizations.filter(o => o.status === "Active").length} 
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              iconBg="bg-green-50"
            />
            <KPICard 
              title="Pending Approval" 
              value={organizations.filter(o => o.status === "Pending").length} 
              icon={<Clock className="w-5 h-5 text-orange-500" />}
              iconBg="bg-orange-50"
            />
            <KPICard 
              title="Suspended" 
              value={organizations.filter(o => o.status === "Suspended").length} 
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
              <Link to="/admin/organizations/add" className="flex items-center w-full sm:w-auto justify-center gap-2 bg-[#A14000] hover:bg-[#8a3700] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap">
                <Plus className="w-4 h-4" />
                Add Organization
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-center border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Organization</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Industry</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Fleet Managers</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Plan</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Created Date</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {organizations
                    .filter(org => 
                      org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      org.industry.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap text-left">
                        <div className="flex items-center justify-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                            {org.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{org.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap text-center">{org.industry}</td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap text-center">{org.activeManagers}</td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap text-center">{org.subscription}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        <StatusBadge status={org.status} />
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap text-center">{org.createdAt}</td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-3 flex-nowrap w-max mx-auto">
                          <Link to={`/admin/organizations/details/${org.id}`} className="text-slate-400 hover:text-slate-600 transition-colors" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link to={`/admin/organizations/edit/${org.id}`} className="text-slate-400 hover:text-[#A14000] transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(org.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

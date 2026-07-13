import { useState } from "react";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { Link } from "react-router-dom";
import {
  Users,
  CheckCircle2,
  Mail,
  XCircle,
  Search,
  UserPlus,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import KPICard from "@/components/common/KPICard";

// --- Mock Data Removed ---

function StatusBadge({ status }) {
  if (status === "Active") {
    return <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full tracking-wide">Active</span>;
  }
  if (status === "Invited") {
    return <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full tracking-wide">Invited</span>;
  }
  if (status === "Inactive") {
    return <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full tracking-wide">Inactive</span>;
  }
  return <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full tracking-wide">{status}</span>;
}

export default function FleetManagerList() {
  const [searchTerm, setSearchTerm] = useState("");
  const { fleetManagers, fetchFleetManagers } = useAdmin();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fleet manager?")) return;
    try {
      await adminApi.deleteFleetManager(id);
      toast.success("Fleet manager deleted successfully");
      if (fetchFleetManagers) await fetchFleetManagers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete fleet manager");
    }
  };

  const filteredManagers = fleetManagers.filter(manager => 
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    manager.org.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="fleet-managers" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Fleet Managers" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <Link to="/admin/fleet-managers" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap">
              <span className="sm:hidden">List</span>
              <span className="hidden sm:inline">Fleet Manager List</span>
            </Link>
            <Link to="/admin/fleet-managers/add" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Add Mgr</span>
              <span className="hidden sm:inline">Add Fleet Manager</span>
            </Link>
            <Link to="/admin/fleet-managers/details" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Details</span>
              <span className="hidden sm:inline">Manager Details</span>
            </Link>
            <Link to="/admin/fleet-managers/edit" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Edit Mgr</span>
              <span className="hidden sm:inline">Edit Manager</span>
            </Link>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-8">
            <KPICard 
              title="TOTAL MANAGERS" 
              value={fleetManagers.length} 
              icon={<Users className="w-5 h-5 text-slate-600" />}
              iconBg="bg-slate-100"
            />
            <KPICard 
              title="ACTIVE" 
              value={fleetManagers.filter(m => m.status === "Active").length} 
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              iconBg="bg-green-50 border border-green-100"
            />
            <KPICard 
              title="INVITED" 
              value={fleetManagers.filter(m => m.status === "Invited").length} 
              icon={<Mail className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-50 border border-blue-100"
            />
            <KPICard 
              title="INACTIVE" 
              value={fleetManagers.filter(m => m.status === "Inactive").length} 
              icon={<XCircle className="w-5 h-5 text-slate-400" />}
              iconBg="bg-slate-100"
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
                  placeholder="Search managers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                />
              </div>
              <Link to="/admin/fleet-managers/add" className="flex items-center w-full sm:w-auto justify-center gap-2 bg-[#A14000] hover:bg-[#8a3700] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap">
                <UserPlus className="w-4 h-4" />
                Add Fleet Manager
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-center border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Name</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Organization</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Email</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Phone</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Last Login</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredManagers.map((manager) => (
                    <tr key={manager.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap text-left">
                        <div className="flex items-center justify-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                            {manager.initials}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{manager.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap text-center">{manager.org}</td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap text-center">{manager.email}</td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap text-center">{manager.phone}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        <StatusBadge status={manager.status} />
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap text-center">{manager.lastLogin}</td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-3 flex-nowrap w-max mx-auto">
                          <Link to={`/admin/fleet-managers/details/${manager.id}`} className="text-slate-400 hover:text-slate-600 transition-colors" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link to={`/admin/fleet-managers/edit/${manager.id}`} className="text-slate-400 hover:text-[#A14000] transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(manager.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
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

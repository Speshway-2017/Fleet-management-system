import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function ManagerDetails() {
  const { id } = useParams();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManager = async () => {
      try {
        const res = await adminApi.getFleetManagerById(id);
        const data = res.data?.data || res.data;
        setManager(data);
      } catch (error) {
        toast.error("Failed to load fleet manager details");
      } finally {
        setLoading(false);
      }
    };
    fetchManager();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="fleet-managers" />
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Fleet Manager Details" />
        <main className="flex-1 flex items-center justify-center">
           <div className="animate-spin w-8 h-8 border-4 border-[#A14000] border-t-transparent rounded-full"></div>
        </main>
      </div>
    </div>
  );

  if (!manager) return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="fleet-managers" />
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Fleet Manager Details" />
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar flex items-center justify-center">
           <div className="text-slate-500 font-bold text-lg">Manager not found.</div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="fleet-managers" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Fleet Manager Details" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <Link to="/admin/fleet-managers" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">List</span>
              <span className="hidden sm:inline">Fleet Manager List</span>
            </Link>
            <Link to="/admin/fleet-managers/add" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Add Mgr</span>
              <span className="hidden sm:inline">Add Fleet Manager</span>
            </Link>
            <button className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap">
              <span className="sm:hidden">Details</span>
              <span className="hidden sm:inline">Manager Details</span>
            </button>
            <Link to={`/admin/fleet-managers/edit/${id}`} className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Edit Mgr</span>
              <span className="hidden sm:inline">Edit Manager</span>
            </Link>
          </div>

          {/* Breadcrumb & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center text-sm font-bold text-slate-500">
              <ChevronLeft className="w-4 h-4 mr-1" />
              <Link to="/admin/fleet-managers" className="hover:text-slate-800 transition-colors">Fleet Managers</Link>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-800">{manager.name}</span>
            </div>
            <div className="flex flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
              <Link to="/admin/fleet-managers" className="flex-1 sm:flex-none flex items-center justify-center px-2 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#A14000] border border-[#A14000] bg-transparent hover:bg-[#A14000]/10 rounded-lg transition-colors text-center truncate">
                Back to List
              </Link>
              <Link to={`/admin/fleet-managers/edit/${id}`} className="flex-[2] sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors text-center truncate">
                <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                Edit Manager
              </Link>
            </div>
          </div>

          {/* Content Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Card: Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-[#0f172a] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
                  {manager.initials}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{manager.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-slate-500 font-medium">{manager.role || "Fleet Manager"}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide ${manager.status === 'Active' ? 'text-green-600 bg-green-50' : manager.status === 'Invited' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 bg-slate-100'}`}>{manager.status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-sm font-bold text-slate-500">Email</span>
                  <span className="text-sm font-bold text-slate-800">{manager.email}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-sm font-bold text-slate-500">Phone</span>
                  <span className="text-sm font-bold text-slate-800">{manager.phone || "—"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-sm font-bold text-slate-500">Organization</span>
                  <span className="text-sm font-bold text-slate-800">{manager.org}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-sm font-bold text-slate-500">Last Login</span>
                  <span className="text-sm font-bold text-slate-800">{manager.lastLogin}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-sm font-bold text-slate-500">Created</span>
                  <span className="text-sm font-bold text-slate-800">{manager.created || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Permission Level</span>
                  <span className="text-sm font-bold text-slate-800">Standard</span>
                </div>
              </div>
            </div>

            {/* Right Card: Login Activity */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-[15px] font-extrabold text-slate-800 mb-6 tracking-wide">Recent Login Activity</h3>
              
              <div className="space-y-4">
                {/* Activity 1 */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="text-sm font-bold text-slate-800 mb-1">2024-06-01 10:30</div>
                    <div className="text-xs font-semibold text-slate-500">Chrome / macOS • 192.168.1.1</div>
                  </div>
                  <span className="text-[11px] font-bold text-green-600 tracking-wide">Success</span>
                </div>
                
                {/* Activity 2 */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="text-sm font-bold text-slate-800 mb-1">2024-05-31 14:15</div>
                    <div className="text-xs font-semibold text-slate-500">Safari / iOS • 192.168.1.5</div>
                  </div>
                  <span className="text-[11px] font-bold text-green-600 tracking-wide">Success</span>
                </div>

                {/* Activity 3 */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="text-sm font-bold text-slate-800 mb-1">2024-05-30 09:00</div>
                    <div className="text-xs font-semibold text-slate-500">Chrome / macOS • 192.168.1.1</div>
                  </div>
                  <span className="text-[11px] font-bold text-green-600 tracking-wide">Success</span>
                </div>

                {/* Activity 4 */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="text-sm font-bold text-slate-800 mb-1">2024-05-28 17:45</div>
                    <div className="text-xs font-semibold text-slate-500">Firefox / Windows • 10.0.0.5</div>
                  </div>
                  <span className="text-[11px] font-bold text-[#e11d48] tracking-wide">Failed</span>
                </div>
              </div>
            </div>

          </div>
          
        </main>
      </div>
    </div>
  );
}

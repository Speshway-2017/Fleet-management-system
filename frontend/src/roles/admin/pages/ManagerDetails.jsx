import { Link } from "react-router-dom";
import { ChevronLeft, Pencil } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function ManagerDetails() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="fleet-managers" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Fleet Manager Details" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <Link to="/admin/fleet-managers" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Fleet Manager List</Link>
            <Link to="/admin/fleet-managers/add" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Add Fleet Manager</Link>
            <button className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-bold rounded-full shadow-sm">Manager Details</button>
            <Link to="/admin/fleet-managers/edit" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Edit Manager</Link>
          </div>

          {/* Breadcrumb & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center text-sm font-bold text-slate-500">
              <ChevronLeft className="w-4 h-4 mr-1" />
              <Link to="/admin/fleet-managers" className="hover:text-slate-800 transition-colors">Fleet Managers</Link>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-800">James Carter</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin/fleet-managers" className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                Back to List
              </Link>
              <Link to="/admin/fleet-managers/edit" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors">
                <Pencil className="w-4 h-4" />
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
                  JC
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">James Carter</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-slate-500 font-medium">Senior Manager</span>
                    <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full tracking-wide">Active</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-sm font-bold text-slate-500">Email</span>
                  <span className="text-sm font-bold text-slate-800">j.carter@abclogistics.com</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-sm font-bold text-slate-500">Phone</span>
                  <span className="text-sm font-bold text-slate-800">+1 555-0101</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-sm font-bold text-slate-500">Organization</span>
                  <span className="text-sm font-bold text-slate-800">ABC Logistics</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-sm font-bold text-slate-500">Last Login</span>
                  <span className="text-sm font-bold text-slate-800">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-sm font-bold text-slate-500">Created</span>
                  <span className="text-sm font-bold text-slate-800">Jan 15, 2024</span>
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

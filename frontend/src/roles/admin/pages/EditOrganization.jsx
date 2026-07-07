import { Link } from "react-router-dom";
import { ChevronLeft, Upload } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function EditOrganization() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="organizations" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Edit Organization" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="flex items-center gap-6 mb-8 border-b border-slate-200 pb-4">
            <Link to="/admin/organizations" className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors">Organization List</Link>
            <Link to="/admin/organizations/add" className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors">Add Organization</Link>
            <Link to="/admin/organizations/details" className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors">Organization Details</Link>
            <button className="px-5 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm">Edit Organization</button>
          </div>

          {/* Header area below tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center text-sm">
              <Link to="/admin/organizations" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Organizations
              </Link>
              <span className="text-slate-300 mx-2">/</span>
              <span className="text-slate-800 font-bold">Edit ABC Logistics</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin/organizations" className="px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                Cancel
              </Link>
              <button type="button" className="px-5 py-2 bg-[#A14000] text-white rounded-lg text-sm font-bold hover:bg-[#8a3700] transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Organization Information</h2>
            
            <form className="space-y-6">
              
              {/* Logo Upload Section */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Organization Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                    <span className="text-xs font-bold text-slate-400">LOGO</span>
                  </div>
                  <label className="cursor-pointer px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Organization Name</label>
                <input 
                  type="text" 
                  defaultValue="ABC Logistics"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                  placeholder="e.g. ABC Logistics"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                  <input 
                    type="text" 
                    defaultValue="Freight"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="contact@abclogistics.com"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                    placeholder="contact@organization.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div></div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                <input 
                  type="text" 
                  defaultValue="123 Freight Lane, Suite 100"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                  <input 
                    type="text" 
                    defaultValue="Chicago"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
                  <input 
                    type="text" 
                    defaultValue="IL"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                  <input 
                    type="text" 
                    defaultValue="United States"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Subscription Plan</label>
                  <input 
                    type="text" 
                    defaultValue="Enterprise"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                  <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all text-slate-700" defaultValue="Active">
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

            </form>
          </div>
          
        </main>
      </div>
    </div>
  );
}

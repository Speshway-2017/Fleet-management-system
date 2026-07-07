import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function OrganizationDetails() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="organizations" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Organization Details" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="flex items-center gap-6 mb-8 border-b border-slate-200 pb-4">
            <Link to="/admin/organizations" className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors px-5 py-2 hover:bg-slate-100/50 rounded-lg">Organization List</Link>
            <Link to="/admin/organizations/add" className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors px-5 py-2 hover:bg-slate-100/50 rounded-lg">Add Organization</Link>
            <button className="px-5 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm">Organization Details</button>
            <Link to="/admin/organizations/edit" className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors px-5 py-2 hover:bg-slate-100/50 rounded-lg">Edit Organization</Link>
          </div>

          {/* Breadcrumb & Actions */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Link to="/admin/organizations" className="text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Organizations
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800">ABC Logistics</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/admin/organizations" className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-700 transition-colors">
                Back to List
              </Link>
              <Link to="/admin/organizations/edit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#A14000] border border-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors">
                Edit Organization
              </Link>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Company Information */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-6">Company Information</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Name</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">ABC Logistics</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Industry</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">Freight & Logistics</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Email</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">contact@abclogistics.com</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Phone</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">+1 555-0100</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Address</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0 max-w-[200px]">123 Main St, New York, NY</span>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-6">Subscription Details</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Plan</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">Enterprise</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Status</span>
                  <span className="text-sm font-bold text-green-600 sm:text-right mt-1 sm:mt-0">Active</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Billing</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">Annual</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Renewal</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">Jan 15, 2025</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Created</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">Jan 15, 2024</span>
                </div>
              </div>
            </div>

          </div>

          {/* Statistics */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Statistics</h3>
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              <div className="flex flex-col items-center justify-center p-4 w-full">
                <span className="text-3xl font-black text-slate-800 mb-1">12</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fleet Managers</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 w-full">
                <span className="text-3xl font-black text-slate-800 mb-1">—</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Vehicles</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 w-full">
                <span className="text-3xl font-black text-slate-800 mb-1">—</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trips</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 w-full">
                <span className="text-3xl font-black text-slate-800 mb-1">—</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Cost</span>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
